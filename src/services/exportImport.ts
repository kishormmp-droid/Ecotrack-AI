import { ActivityRecord, OnboardingData, UserEcoState } from '../engine/types';
import { 
  getStoredActivities, 
  getStoredOnboarding, 
  getStoredEcoState, 
  saveActivityRecord, 
  saveStoredOnboarding, 
  saveStoredEcoState 
} from './storage';
import { EMISSION_FACTOR_VERSION } from '../data/emissionFactors';
import { getTodayString } from '../lib/dateUtils';

export interface EcoTrackExportData {
  version: string;
  factorVersion: string;
  exportDate: string;
  onboarding: OnboardingData;
  activities: ActivityRecord[];
  ecoState: UserEcoState;
}

export function exportDataAsJSON(): void {
  const data: EcoTrackExportData = {
    version: '1.0',
    factorVersion: EMISSION_FACTOR_VERSION,
    exportDate: new Date().toISOString(),
    onboarding: getStoredOnboarding(),
    activities: getStoredActivities(),
    ecoState: getStoredEcoState(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ecotrack-ai-backup-${getTodayString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportActivitiesAsCSV(): void {
  const activities = getStoredActivities();
  const headers = ['Date', 'Category', 'Activity Type', 'Quantity', 'Unit', 'Emission (kg CO2e)', 'Source', 'Notes'];

  const rows = activities.map(a => [
    `"${a.date}"`,
    `"${a.category}"`,
    `"${a.activityType}"`,
    a.quantity,
    `"${a.unit}"`,
    a.emissionKgCO2e,
    `"${a.source}"`,
    `"${(a.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ecotrack-activities-${getTodayString()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ImportResult {
  success: boolean;
  message: string;
  importedCount?: number;
}

export function validateAndImportJSON(jsonText: string): ImportResult {
  try {
    const data = JSON.parse(jsonText);

    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid JSON file structure.' };
    }

    if (!Array.isArray(data.activities)) {
      return { success: false, message: 'Missing or invalid "activities" list in import payload.' };
    }

    // Validate activities structure
    const validActivities: ActivityRecord[] = [];
    for (const item of data.activities) {
      if (
        item &&
        typeof item.id === 'string' &&
        typeof item.category === 'string' &&
        typeof item.activityType === 'string' &&
        typeof item.quantity === 'number' &&
        typeof item.date === 'string'
      ) {
        validActivities.push({
          id: item.id,
          category: item.category,
          activityType: item.activityType,
          quantity: item.quantity,
          unit: item.unit || '',
          date: item.date,
          notes: item.notes || '',
          source: item.source || 'manual',
          emissionKgCO2e: typeof item.emissionKgCO2e === 'number' ? item.emissionKgCO2e : 0,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        });
      }
    }

    // Restore Onboarding if present
    if (data.onboarding && typeof data.onboarding === 'object') {
      saveStoredOnboarding(data.onboarding);
    }

    // Restore EcoState if present
    if (data.ecoState && typeof data.ecoState === 'object') {
      saveStoredEcoState(data.ecoState);
    }

    // Restore activities
    for (const act of validActivities) {
      saveActivityRecord(act);
    }

    return {
      success: true,
      message: `Successfully imported ${validActivities.length} activities and restored user profile.`,
      importedCount: validActivities.length,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown parsing error';
    return { success: false, message: `Failed to parse JSON file: ${errorMessage}` };
  }
}
