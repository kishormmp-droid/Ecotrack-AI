import { ActivityRecord, OnboardingData, UserEcoState } from '../engine/types';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  ONBOARDING: 'ecotrack_onboarding_v1',
  ACTIVITIES: 'ecotrack_activities_v1',
  ECO_STATE: 'ecotrack_user_state_v1',
  THEME: 'ecotrack_theme_v1',
  TARGET: 'ecotrack_monthly_target_v1',
} as const;

export const DEFAULT_ONBOARDING: OnboardingData = {
  name: '',
  city: '',
  ageGroup: '18-25',
  areaType: 'Urban',
  primaryTransport: 'Two-wheeler',
  avgKmPerDay: 10,
  publicTransportFreq: 'Rarely',
  dailyAcHours: 2,
  dailyLightingHours: 6,
  householdSize: 3,
  knowsMonthlyKwh: false,
  monthlyKwh: 150,
  wasteMethod: 'Mixed',
  singleUsePlasticFreq: 'Weekly',
  foodPreference: 'Mixed',
  goals: ['reduce carbon footprint'],
  permissions: {
    locationAccess: false,
    gpsTracking: false,
    saveLocally: true,
  },
  completed: false,
};

export const DEFAULT_ECO_STATE: UserEcoState = {
  points: 50, // initial welcome starter bonus
  monthlyTargetKgCO2e: 80, // Default sensible target
  streakDays: 1,
  lastActiveDate: undefined,
  earnedBadgeIds: [],
  completedChallengeRecords: [],
  demoMode: false,
};

// Custom event dispatcher for immediate state sync across components
const STORAGE_EVENT = 'ecotrack_storage_sync';

function notifyStorageChange(detailKey: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key: detailKey } }));
  }
}

export function subscribeToStorage(callback: (key?: string) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    callback(custom.detail?.key);
  };
  window.addEventListener(STORAGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(STORAGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

// --- Onboarding Storage ---
export function getStoredOnboarding(): OnboardingData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ONBOARDING);
    if (!raw) return { ...DEFAULT_ONBOARDING };
    return { ...DEFAULT_ONBOARDING, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_ONBOARDING };
  }
}

export function saveStoredOnboarding(data: Partial<OnboardingData>): OnboardingData {
  const current = getStoredOnboarding();
  const updated: OnboardingData = { ...current, ...data };
  try {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(updated));
    notifyStorageChange(STORAGE_KEYS.ONBOARDING);

    // Optional Supabase cloud mirror if enabled
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      client?.from('user_profiles').upsert([{ id: 'local_user', profile: updated }]).then();
    }
  } catch (e) {
    console.error('Failed to save onboarding data to localStorage:', e);
  }
  return updated;
}

// --- Activity Records Storage ---
export function getStoredActivities(): ActivityRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveActivityRecord(record: ActivityRecord): ActivityRecord[] {
  const current = getStoredActivities();
  const existingIdx = current.findIndex(r => r.id === record.id);
  let updated: ActivityRecord[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...record, updatedAt: new Date().toISOString() };
  } else {
    updated = [record, ...current];
  }

  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
    notifyStorageChange(STORAGE_KEYS.ACTIVITIES);

    // Optional Supabase sync
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      client?.from('activities').upsert([record]).then();
    }
  } catch (e) {
    console.error('Failed to save activity record:', e);
  }

  return updated;
}

export function deleteActivityRecord(id: string): { updated: ActivityRecord[]; deleted: ActivityRecord | null } {
  const current = getStoredActivities();
  const toDelete = current.find(r => r.id === id) || null;
  const updated = current.filter(r => r.id !== id);

  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
    notifyStorageChange(STORAGE_KEYS.ACTIVITIES);

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      client?.from('activities').delete().eq('id', id).then();
    }
  } catch (e) {
    console.error('Failed to delete activity record:', e);
  }

  return { updated, deleted: toDelete };
}

// --- User Eco State & Gamification Storage ---
export function getStoredEcoState(): UserEcoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ECO_STATE);
    if (!raw) return { ...DEFAULT_ECO_STATE };
    return { ...DEFAULT_ECO_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_ECO_STATE };
  }
}

export function saveStoredEcoState(state: Partial<UserEcoState>): UserEcoState {
  const current = getStoredEcoState();
  const updated: UserEcoState = { ...current, ...state };
  try {
    localStorage.setItem(STORAGE_KEYS.ECO_STATE, JSON.stringify(updated));
    notifyStorageChange(STORAGE_KEYS.ECO_STATE);
  } catch (e) {
    console.error('Failed to save eco state:', e);
  }
  return updated;
}

export function awardPoints(pointsToAdd: number): number {
  if (pointsToAdd <= 0) return getStoredEcoState().points;
  const current = getStoredEcoState();
  const newPoints = current.points + pointsToAdd;
  saveStoredEcoState({ points: newPoints });
  return newPoints;
}

export function recordChallengeCompletion(challengeId: string, periodKey: string): boolean {
  const current = getStoredEcoState();
  const alreadyDone = current.completedChallengeRecords.some(
    r => r.challengeId === challengeId && r.periodKey === periodKey
  );
  if (alreadyDone) return false;

  const records = [
    ...current.completedChallengeRecords,
    {
      challengeId,
      completedDate: new Date().toISOString(),
      periodKey,
    },
  ];

  saveStoredEcoState({
    completedChallengeRecords: records,
  });
  return true;
}

export function awardBadge(badgeId: string): boolean {
  const current = getStoredEcoState();
  if (current.earnedBadgeIds.includes(badgeId)) return false;

  saveStoredEcoState({
    earnedBadgeIds: [...current.earnedBadgeIds, badgeId],
    points: current.points + 100, // 100 bonus pts for badge
  });
  return true;
}

// --- Demo Mode ---
export function isDemoModeActive(): boolean {
  return getStoredEcoState().demoMode;
}

export function setDemoModeActive(enabled: boolean): void {
  saveStoredEcoState({ demoMode: enabled });
}

// --- Purge & Reset ---
export function clearActivitiesOnly(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    notifyStorageChange(STORAGE_KEYS.ACTIVITIES);
  } catch (e) {
    console.error('Failed to clear activities:', e);
  }
}

export function resetAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.ECO_STATE);
    localStorage.removeItem(STORAGE_KEYS.TARGET);
    notifyStorageChange('ALL');
  } catch (e) {
    console.error('Failed to reset all data:', e);
  }
}
