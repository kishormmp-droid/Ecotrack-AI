import { describe, it, expect } from 'vitest';
import { 
  calculateActivityEmission, 
  estimateElectricityMonthlyKwh, 
  calculateBaselineProfile,
  calculateSummary 
} from '../engine/calculator';
import { OnboardingData, ActivityRecord } from '../engine/types';

describe('Calculator Engine - calculateActivityEmission', () => {
  it('returns zero emissions for zero or negative quantities', () => {
    expect(calculateActivityEmission('car', 0)).toBe(0);
    expect(calculateActivityEmission('car', -10)).toBe(0);
    expect(calculateActivityEmission('ac_hours', 0, 2)).toBe(0);
    expect(calculateActivityEmission('ac_hours', -5, 2)).toBe(0);
    expect(calculateActivityEmission('electricity_kwh', 0)).toBe(0);
  });

  it('calculates zero emission for active transport (walking and cycling)', () => {
    expect(calculateActivityEmission('walking', 10)).toBe(0);
    expect(calculateActivityEmission('cycling', 25)).toBe(0);
  });

  it('calculates motorized transport emissions accurately', () => {
    // Car: 0.140 kg CO2e / km
    expect(calculateActivityEmission('car', 10)).toBeCloseTo(1.4, 2);
    // Two wheeler: 0.035 kg CO2e / km
    expect(calculateActivityEmission('two_wheeler', 20)).toBeCloseTo(0.7, 2);
    // Bus: 0.038 kg CO2e / km
    expect(calculateActivityEmission('bus', 15)).toBeCloseTo(0.57, 2);
    // Train: 0.025 kg CO2e / km
    expect(calculateActivityEmission('train', 40)).toBeCloseTo(1.0, 2);
  });

  it('correctly allocates household electricity and never double counts', () => {
    const singlePersonAc = calculateActivityEmission('ac_hours', 4, 1);
    const twoPersonAc = calculateActivityEmission('ac_hours', 4, 2);
    const fourPersonAc = calculateActivityEmission('ac_hours', 4, 4);

    // Two person household gets half per-capita emission of single person household
    expect(twoPersonAc).toBeCloseTo(singlePersonAc / 2, 3);
    // Four person household gets quarter per-capita emission
    expect(fourPersonAc).toBeCloseTo(singlePersonAc / 4, 3);

    // Direct kWh allocation
    const gridKwhSingle = calculateActivityEmission('electricity_kwh', 10, 1);
    const gridKwhThree = calculateActivityEmission('electricity_kwh', 10, 3);
    expect(gridKwhThree).toBeCloseTo(gridKwhSingle / 3, 3);
  });

  it('gracefully handles invalid or negative household sizes by defaulting to at least 1', () => {
    const defaultVal = calculateActivityEmission('electricity_kwh', 10, 1);
    const zeroHh = calculateActivityEmission('electricity_kwh', 10, 0);
    const negHh = calculateActivityEmission('electricity_kwh', 10, -3);

    expect(zeroHh).toBe(defaultVal);
    expect(negHh).toBe(defaultVal);
  });
});

describe('Calculator Engine - estimateElectricityMonthlyKwh', () => {
  it('estimates household monthly kWh with clear breakdown and assumptions', () => {
    const est = estimateElectricityMonthlyKwh(4, 6, 2);
    // AC: 4 * 1.2 * 30 = 144 kWh
    expect(est.breakdown.acKwh).toBe(144);
    // Lighting: 6 * 0.04 * 30 = 7.2 kWh
    expect(est.breakdown.lightingKwh).toBe(7.2);
    // Baseline fridge/fans: 180 kWh
    expect(est.breakdown.baselineAppliancesKwh).toBe(180);
    expect(est.monthlyKwh).toBe(331.2);
    expect(est.assumptions.length).toBeGreaterThan(0);
  });
});

describe('Calculator Engine - calculateBaselineProfile', () => {
  const mockOnboarding: OnboardingData = {
    name: 'Priya Sharma',
    city: 'New Delhi',
    ageGroup: '26-40',
    areaType: 'Urban',
    primaryTransport: 'Car',
    avgKmPerDay: 20,
    publicTransportFreq: 'Rarely',
    dailyAcHours: 4,
    dailyLightingHours: 6,
    householdSize: 2,
    knowsMonthlyKwh: true,
    monthlyKwh: 240,
    wasteMethod: 'Mixed',
    singleUsePlasticFreq: 'Daily',
    foodPreference: 'Non-vegetarian',
    goals: ['reduce carbon footprint', 'save electricity'],
    permissions: {
      locationAccess: true,
      gpsTracking: false,
      saveLocally: true,
    },
    completed: true,
  };

  it('generates daily, monthly, and yearly baseline totals and categories', () => {
    const profile = calculateBaselineProfile(mockOnboarding);

    expect(profile.dailyBaselineKgCO2e).toBeGreaterThan(0);
    expect(profile.monthlyBaselineKgCO2e).toBeCloseTo(profile.dailyBaselineKgCO2e * 30, 1);
    expect(profile.yearlyBaselineKgCO2e).toBeCloseTo(profile.dailyBaselineKgCO2e * 365, 1);

    expect(profile.breakdown.transportation).toBeGreaterThan(0);
    expect(profile.breakdown.electricity).toBeGreaterThan(0);
    expect(profile.breakdown.waste_lifestyle).toBeGreaterThan(0);

    expect(profile.topEmissionAreas.length).toBe(3);
    expect(profile.starterRecommendations.length).toBe(3);
    expect(profile.starterRecommendations[0].type).toBe('starter');
  });
});

describe('Calculator Engine - calculateSummary', () => {
  it('aggregates activities into today, this week, this month, and categories', () => {
    const today = '2026-11-24';
    const records: ActivityRecord[] = [
      {
        id: '1',
        category: 'transportation',
        activityType: 'car',
        quantity: 10,
        unit: 'km',
        date: today,
        source: 'manual',
        emissionKgCO2e: 1.4,
        createdAt: `${today}T10:00:00Z`,
        updatedAt: `${today}T10:00:00Z`,
      },
      {
        id: '2',
        category: 'electricity',
        activityType: 'electricity_kwh',
        quantity: 2,
        unit: 'kWh',
        date: today,
        source: 'manual',
        emissionKgCO2e: 1.43,
        createdAt: `${today}T12:00:00Z`,
        updatedAt: `${today}T12:00:00Z`,
      },
    ];

    const summary = calculateSummary(records, today);
    expect(summary.totalKgCO2e).toBe(2.83);
    expect(summary.todayKgCO2e).toBe(2.83);
    expect(summary.activityCount).toBe(2);
    expect(summary.categoryBreakdown.transportation).toBe(1.4);
    expect(summary.categoryBreakdown.electricity).toBe(1.43);
  });
});
