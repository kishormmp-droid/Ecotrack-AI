import { ActivityRecord, OnboardingData } from '../engine/types';
import { getTodayString, getDaysAgo } from '../lib/dateUtils';

export const SAMPLE_ONBOARDING_DATA: OnboardingData = {
  name: 'Aarav Patel',
  city: 'Bengaluru',
  ageGroup: '26-40',
  areaType: 'Urban',
  primaryTransport: 'Car',
  avgKmPerDay: 14,
  publicTransportFreq: 'Weekly',
  dailyAcHours: 4,
  dailyLightingHours: 6,
  householdSize: 2,
  knowsMonthlyKwh: true,
  monthlyKwh: 220,
  wasteMethod: 'Segregated',
  singleUsePlasticFreq: 'Rarely',
  foodPreference: 'Mixed',
  goals: [
    'reduce carbon footprint',
    'save electricity',
    'adopt sustainable transport',
    'track environmental impact',
  ],
  permissions: {
    locationAccess: true,
    gpsTracking: false,
    saveLocally: true,
  },
  completed: true,
  completedAt: new Date().toISOString(),
};

/**
 * Sample activities generated for Demo Mode.
 * Exact prompt constraint:
 * Sample values: total 2.4 kg CO2e; transport 1.8 kg; electricity 0.4 kg; other 0.2 kg.
 */
export function getSampleActivities(): ActivityRecord[] {
  const today = getTodayString();
  const d1 = getDaysAgo(1);
  const d2 = getDaysAgo(2);
  const d3 = getDaysAgo(3);
  const d4 = getDaysAgo(4);
  const d5 = getDaysAgo(5);
  const d6 = getDaysAgo(6);

  return [
    // Today's target exact values: total 2.4 kg (1.8 transport, 0.4 elec, 0.2 other)
    {
      id: 'sample-today-trans',
      category: 'transportation',
      activityType: 'car',
      quantity: 12.86,
      unit: 'km',
      date: today,
      notes: 'Morning office commute in personal car',
      source: 'manual',
      emissionKgCO2e: 1.80, // 1.8 kg
      createdAt: `${today}T09:30:00.000Z`,
      updatedAt: `${today}T09:30:00.000Z`,
    },
    {
      id: 'sample-today-elec',
      category: 'electricity',
      activityType: 'electricity_kwh',
      quantity: 1.12, // 1.12 kWh allocated / 2 = 0.56 kWh * 0.716 = 0.40 kg
      unit: 'kWh',
      date: today,
      notes: 'Daytime home office power & lighting',
      source: 'manual',
      emissionKgCO2e: 0.40, // 0.4 kg
      createdAt: `${today}T14:15:00.000Z`,
      updatedAt: `${today}T14:15:00.000Z`,
    },
    {
      id: 'sample-today-waste',
      category: 'waste_lifestyle',
      activityType: 'waste_segregated',
      quantity: 1.33,
      unit: 'kg',
      date: today,
      notes: 'Segregated wet kitchen waste & coffee cup',
      source: 'manual',
      emissionKgCO2e: 0.20, // 0.2 kg
      createdAt: `${today}T19:00:00.000Z`,
      updatedAt: `${today}T19:00:00.000Z`,
    },

    // Prior 6 days for rich chart history in Demo Mode
    {
      id: 'sample-d1-trans',
      category: 'transportation',
      activityType: 'bus',
      quantity: 20,
      unit: 'km',
      date: d1,
      notes: 'Metropolitan bus commute',
      source: 'manual',
      emissionKgCO2e: 0.76,
      createdAt: `${d1}T08:45:00.000Z`,
      updatedAt: `${d1}T08:45:00.000Z`,
    },
    {
      id: 'sample-d1-elec',
      category: 'electricity',
      activityType: 'ac_hours',
      quantity: 3,
      unit: 'hours',
      date: d1,
      notes: 'Evening AC at 25°C',
      source: 'manual',
      emissionKgCO2e: 1.29,
      createdAt: `${d1}T21:00:00.000Z`,
      updatedAt: `${d1}T21:00:00.000Z`,
    },
    {
      id: 'sample-d2-trans',
      category: 'transportation',
      activityType: 'train',
      quantity: 25,
      unit: 'km',
      date: d2,
      notes: 'Namma Metro transit',
      source: 'manual',
      emissionKgCO2e: 0.63,
      createdAt: `${d2}T09:00:00.000Z`,
      updatedAt: `${d2}T09:00:00.000Z`,
    },
    {
      id: 'sample-d2-waste',
      category: 'waste_lifestyle',
      activityType: 'diet_veg',
      quantity: 1,
      unit: 'days',
      date: d2,
      notes: 'Plant-based vegetarian meal day',
      source: 'manual',
      emissionKgCO2e: 1.10,
      createdAt: `${d2}T20:00:00.000Z`,
      updatedAt: `${d2}T20:00:00.000Z`,
    },
    {
      id: 'sample-d3-trans',
      category: 'transportation',
      activityType: 'walking',
      quantity: 4.5,
      unit: 'km',
      date: d3,
      notes: 'Walk to local market & park',
      source: 'gps',
      emissionKgCO2e: 0.00,
      createdAt: `${d3}T11:00:00.000Z`,
      updatedAt: `${d3}T11:00:00.000Z`,
    },
    {
      id: 'sample-d3-elec',
      category: 'electricity',
      activityType: 'lighting_hours',
      quantity: 6,
      unit: 'hours',
      date: d3,
      notes: 'Low energy LED home lighting',
      source: 'manual',
      emissionKgCO2e: 0.09,
      createdAt: `${d3}T22:00:00.000Z`,
      updatedAt: `${d3}T22:00:00.000Z`,
    },
    {
      id: 'sample-d4-trans',
      category: 'transportation',
      activityType: 'two_wheeler',
      quantity: 15,
      unit: 'km',
      date: d4,
      notes: 'Scooter ride for errands',
      source: 'manual',
      emissionKgCO2e: 0.53,
      createdAt: `${d4}T16:00:00.000Z`,
      updatedAt: `${d4}T16:00:00.000Z`,
    },
    {
      id: 'sample-d5-trans',
      category: 'transportation',
      activityType: 'cycling',
      quantity: 8.0,
      unit: 'km',
      date: d5,
      notes: 'Morning neighborhood cycle workout',
      source: 'gps',
      emissionKgCO2e: 0.00,
      createdAt: `${d5}T07:15:00.000Z`,
      updatedAt: `${d5}T07:15:00.000Z`,
    },
    {
      id: 'sample-d6-elec',
      category: 'electricity',
      activityType: 'electricity_kwh',
      quantity: 4.5,
      unit: 'kWh',
      date: d6,
      notes: 'Weekend laundry and home appliance load',
      source: 'manual',
      emissionKgCO2e: 1.61,
      createdAt: `${d6}T15:30:00.000Z`,
      updatedAt: `${d6}T15:30:00.000Z`,
    },
  ];
}
