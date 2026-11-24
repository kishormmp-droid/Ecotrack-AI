export type ActivityCategory = 'transportation' | 'electricity' | 'waste_lifestyle';

export type TransportActivityType = 
  | 'walking'
  | 'cycling'
  | 'two_wheeler'
  | 'car'
  | 'bus'
  | 'train';

export type ElectricityActivityType = 
  | 'ac_hours'
  | 'lighting_hours'
  | 'appliances_hours'
  | 'electricity_kwh';

export type WasteActivityType = 
  | 'waste_mixed'
  | 'waste_segregated'
  | 'waste_composted'
  | 'waste_recycled'
  | 'plastic_single_use'
  | 'diet_non_veg'
  | 'diet_mixed'
  | 'diet_veg';

export type ActivityType = TransportActivityType | ElectricityActivityType | WasteActivityType;

export type ActivitySource = 'manual' | 'gps' | 'estimated';

export interface ActivityRecord {
  id: string;
  category: ActivityCategory;
  activityType: ActivityType;
  quantity: number;
  unit: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  source: ActivitySource;
  emissionKgCO2e: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmissionFactor {
  id: string;
  category: ActivityCategory;
  activityType: ActivityType;
  name: string;
  value: number; // in kg CO2e per unit
  unit: string;
  sourceName: string;
  sourceUrl: string;
  year: number;
  status: 'measured' | 'estimated';
  notes: string;
}

export interface OnboardingData {
  // Step 1: About you
  name: string;
  city: string;
  ageGroup: 'Under 18' | '18-25' | '26-40' | '41-60' | '60+';
  areaType: 'Urban' | 'Suburban' | 'Rural';
  
  // Step 2: Transportation
  primaryTransport: 'Walking' | 'Cycling' | 'Two-wheeler' | 'Car' | 'Bus' | 'Train';
  avgKmPerDay: number;
  publicTransportFreq: 'Never' | 'Rarely' | 'Weekly' | 'Several times a week' | 'Daily';

  // Step 3: Electricity
  dailyAcHours: number;
  dailyLightingHours: number;
  householdSize: number;
  knowsMonthlyKwh: boolean;
  monthlyKwh: number;

  // Step 4: Waste and lifestyle
  wasteMethod: 'Mixed' | 'Segregated' | 'Composted' | 'Recycled regularly';
  singleUsePlasticFreq: 'Daily' | 'Weekly' | 'Rarely' | 'Never';
  foodPreference: 'Vegetarian' | 'Non-vegetarian' | 'Mixed';

  // Step 5: Goals
  goals: string[];

  // Step 6: Permissions
  permissions: {
    locationAccess: boolean;
    gpsTracking: boolean;
    saveLocally: boolean;
  };

  completed: boolean;
  completedAt?: string;
}

export interface BaselineProfile {
  dailyBaselineKgCO2e: number;
  monthlyBaselineKgCO2e: number;
  yearlyBaselineKgCO2e: number;
  breakdown: {
    transportation: number;
    electricity: number;
    waste_lifestyle: number;
  };
  topEmissionAreas: {
    area: string;
    category: ActivityCategory;
    amountKgCO2e: number;
    percentage: number;
  }[];
  starterRecommendations: Recommendation[];
}

export interface Recommendation {
  id: string;
  title: string;
  explanation: string;
  relatedActivity: string;
  estimatedMonthlyReductionKgCO2e: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  suggestedAction: string;
  type: 'starter' | 'data_driven';
  category: ActivityCategory;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  period: 'daily' | 'weekly';
  points: number;
  evaluationType: 'automatic' | 'manual';
  actionHint: string;
  checkRuleId?: string; // identifier for auto-check
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  criteria: string;
}

export interface UserEcoState {
  points: number;
  monthlyTargetKgCO2e: number;
  streakDays: number;
  lastActiveDate?: string;
  earnedBadgeIds: string[];
  completedChallengeRecords: {
    challengeId: string;
    completedDate: string;
    periodKey: string; // e.g. "2026-11-24" or "2026-W47"
  }[];
  demoMode: boolean;
}
