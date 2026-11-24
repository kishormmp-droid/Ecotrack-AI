import { describe, it, expect } from 'vitest';
import { recommendationEngine } from '../engine/recommendations';
import { OnboardingData, ActivityRecord } from '../engine/types';

describe('Recommendation Engine (Rule-Based)', () => {
  const baseOnboarding: OnboardingData = {
    name: 'Test User',
    city: 'Mumbai',
    ageGroup: '18-25',
    areaType: 'Urban',
    primaryTransport: 'Walking',
    avgKmPerDay: 5,
    publicTransportFreq: 'Daily',
    dailyAcHours: 1,
    dailyLightingHours: 4,
    householdSize: 2,
    knowsMonthlyKwh: false,
    monthlyKwh: 100,
    wasteMethod: 'Segregated',
    singleUsePlasticFreq: 'Never',
    foodPreference: 'Vegetarian',
    goals: ['reduce carbon footprint'],
    permissions: {
      locationAccess: false,
      gpsTracking: false,
      saveLocally: true,
    },
    completed: true,
  };

  it('is explicitly declared as rule-based', () => {
    expect(recommendationEngine.isRuleBased).toBe(true);
    expect(recommendationEngine.name).toContain('Rule-Based');
  });

  it('returns general starter tips when no activity history exists', () => {
    const recs = recommendationEngine.generateRecommendations({
      onboarding: baseOnboarding,
      activities: [],
    });

    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every(r => r.type === 'starter')).toBe(true);
  });

  it('triggers car-reduction recommendations when high car distance is logged', () => {
    const carActivities: ActivityRecord[] = [
      {
        id: 'act-1',
        category: 'transportation',
        activityType: 'car',
        quantity: 45,
        unit: 'km',
        date: '2026-11-24',
        source: 'manual',
        emissionKgCO2e: 6.3,
        createdAt: '2026-11-24T10:00:00Z',
        updatedAt: '2026-11-24T10:00:00Z',
      },
    ];

    const recs = recommendationEngine.generateRecommendations({
      onboarding: baseOnboarding,
      activities: carActivities,
    });

    const hasPublicTransitRec = recs.some(r => r.id === 'rule_car_to_public_transit');
    expect(hasPublicTransitRec).toBe(true);
  });

  it('triggers AC and electricity efficiency rules when AC hours are high', () => {
    const acActivities: ActivityRecord[] = [
      {
        id: 'act-2',
        category: 'electricity',
        activityType: 'ac_hours',
        quantity: 10,
        unit: 'hours',
        date: '2026-11-24',
        source: 'manual',
        emissionKgCO2e: 4.29,
        createdAt: '2026-11-24T10:00:00Z',
        updatedAt: '2026-11-24T10:00:00Z',
      },
    ];

    const recs = recommendationEngine.generateRecommendations({
      onboarding: baseOnboarding,
      activities: acActivities,
    });

    const hasAcRec = recs.some(r => r.id === 'rule_ac_optimization');
    expect(hasAcRec).toBe(true);
  });

  it('ranks goal-matched recommendations higher than un-targeted recommendations', () => {
    const mixedActivities: ActivityRecord[] = [
      {
        id: 'act-1',
        category: 'transportation',
        activityType: 'car',
        quantity: 30,
        unit: 'km',
        date: '2026-11-24',
        source: 'manual',
        emissionKgCO2e: 4.2,
        createdAt: '2026-11-24T10:00:00Z',
        updatedAt: '2026-11-24T10:00:00Z',
      },
      {
        id: 'act-2',
        category: 'electricity',
        activityType: 'ac_hours',
        quantity: 12,
        unit: 'hours',
        date: '2026-11-24',
        source: 'manual',
        emissionKgCO2e: 5.15,
        createdAt: '2026-11-24T10:00:00Z',
        updatedAt: '2026-11-24T10:00:00Z',
      },
    ];

    const onboardingWithElecGoal: OnboardingData = {
      ...baseOnboarding,
      goals: ['save electricity'], // Focused on electricity
    };

    const recs = recommendationEngine.generateRecommendations({
      onboarding: onboardingWithElecGoal,
      activities: mixedActivities,
    });

    // The top recommendation should match the 'save electricity' goal
    expect(recs[0].category).toBe('electricity');
  });
});
