import { ActivityRecord, Challenge, Badge, UserEcoState } from './types';
import { getTodayString, getDaysAgo, isDateInThisWeek } from '../lib/dateUtils';
import { SYSTEM_CHALLENGES } from '../data/challenges';
import { SYSTEM_BADGES } from '../data/badges';

export interface EvaluatedChallenge extends Challenge {
  isCompleted: boolean;
  canCompleteManually: boolean;
  progressPercent: number;
}

export interface EvaluatedBadge extends Badge {
  isEarned: boolean;
  progressText: string;
}

export function evaluateChallenges(
  records: ActivityRecord[],
  ecoState: UserEcoState
): EvaluatedChallenge[] {
  const today = getTodayString();
  const weekStart = getDaysAgo(7);

  // Group today's records
  const todayRecords = records.filter(r => r.date === today);
  const thisWeekRecords = records.filter(r => r.date >= weekStart);

  return SYSTEM_CHALLENGES.map(ch => {
    // Current period key
    const periodKey = ch.period === 'daily' ? today : `W-${today.substring(0, 7)}`;
    const isAlreadyCompleted = ecoState.completedChallengeRecords.some(
      r => r.challengeId === ch.id && r.periodKey === periodKey
    );

    if (isAlreadyCompleted) {
      return {
        ...ch,
        isCompleted: true,
        canCompleteManually: false,
        progressPercent: 100,
      };
    }

    // Auto-check evaluation
    let autoCompleted = false;
    let progress = 0;

    if (ch.evaluationType === 'automatic' && ch.checkRuleId) {
      switch (ch.checkRuleId) {
        case 'check_walk_or_cycle_recorded': {
          const walkOrCycleKm = todayRecords
            .filter(r => r.activityType === 'walking' || r.activityType === 'cycling')
            .reduce((sum, r) => sum + r.quantity, 0);
          progress = Math.min(100, Math.round((walkOrCycleKm / 1.5) * 100));
          autoCompleted = walkOrCycleKm >= 1.5;
          break;
        }

        case 'check_ac_under_target': {
          const acToday = todayRecords
            .filter(r => r.activityType === 'ac_hours')
            .reduce((sum, r) => sum + r.quantity, 0);
          const hasAcLogged = todayRecords.some(r => r.activityType === 'ac_hours');
          if (hasAcLogged && acToday <= 4) {
            autoCompleted = true;
            progress = 100;
          } else if (hasAcLogged) {
            progress = 50;
          }
          break;
        }

        case 'check_three_categories_logged': {
          const hasTrans = todayRecords.some(r => r.category === 'transportation');
          const hasElec = todayRecords.some(r => r.category === 'electricity');
          const hasWaste = todayRecords.some(r => r.category === 'waste_lifestyle');
          const count = (hasTrans ? 1 : 0) + (hasElec ? 1 : 0) + (hasWaste ? 1 : 0);
          progress = Math.round((count / 3) * 100);
          autoCompleted = count === 3;
          break;
        }

        case 'check_public_transit_three_times': {
          const transitTrips = thisWeekRecords.filter(
            r => r.activityType === 'bus' || r.activityType === 'train'
          ).length;
          progress = Math.min(100, Math.round((transitTrips / 3) * 100));
          autoCompleted = transitTrips >= 3;
          break;
        }

        case 'check_electricity_logged_5_days': {
          const distinctDays = new Set(
            thisWeekRecords
              .filter(r => r.category === 'electricity')
              .map(r => r.date)
          ).size;
          progress = Math.min(100, Math.round((distinctDays / 5) * 100));
          autoCompleted = distinctDays >= 5;
          break;
        }
      }
    }

    return {
      ...ch,
      isCompleted: autoCompleted,
      canCompleteManually: ch.evaluationType === 'manual' && !isAlreadyCompleted,
      progressPercent: progress,
    };
  });
}

export function evaluateBadges(
  records: ActivityRecord[],
  ecoState: UserEcoState,
  monthlyBaselineKg: number = 80
): EvaluatedBadge[] {
  const earnedSet = new Set(ecoState.earnedBadgeIds);

  // Distinct active days
  const activeDays = new Set(records.map(r => r.date)).size;

  // Active green transit km
  const greenTransitKm = records
    .filter(r => ['walking', 'cycling', 'train', 'bus'].includes(r.activityType))
    .reduce((sum, r) => sum + r.quantity, 0);

  // Current month emissions
  const thisMonthEmissions = records
    .filter(r => isDateInThisWeek(r.date))
    .reduce((sum, r) => sum + r.emissionKgCO2e, 0);

  return SYSTEM_BADGES.map(badge => {
    let earned = earnedSet.has(badge.id);
    let progressText = '';

    switch (badge.id) {
      case 'badge_first_log':
        earned = earned || records.length >= 1;
        progressText = `${Math.min(1, records.length)} / 1 log`;
        break;

      case 'badge_streak_7':
        earned = earned || activeDays >= 7;
        progressText = `${activeDays} / 7 days active`;
        break;

      case 'badge_car_free':
        earned = earned || greenTransitKm >= 25;
        progressText = `${greenTransitKm.toFixed(1)} / 25 km logged`;
        break;

      case 'badge_plastic_free':
        const plasticChallengesCompleted = ecoState.completedChallengeRecords.filter(
          r => r.challengeId === 'daily_skip_plastic'
        ).length;
        earned = earned || plasticChallengesCompleted >= 7;
        progressText = `${plasticChallengesCompleted} / 7 days plastic-free`;
        break;

      case 'badge_halfway_target':
        earned = earned || (records.length >= 3 && thisMonthEmissions <= monthlyBaselineKg * 0.5);
        progressText = earned ? 'Achieved' : 'In progress';
        break;

      case 'badge_energy_saver':
        const elecDays = new Set(records.filter(r => r.category === 'electricity').map(r => r.date)).size;
        earned = earned || elecDays >= 5;
        progressText = `${elecDays} / 5 days monitored`;
        break;

      case 'badge_eco_champion':
        earned = earned || ecoState.points >= 500;
        progressText = `${ecoState.points} / 500 points`;
        break;

      default:
        progressText = earned ? 'Earned' : 'Locked';
    }

    return {
      ...badge,
      isEarned: earned,
      progressText,
    };
  });
}
