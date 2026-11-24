import { 
  ActivityRecord, 
  ActivityType, 
  BaselineProfile, 
  OnboardingData, 
  Recommendation,
  ActivityCategory 
} from './types';
import { getEmissionFactor, EMISSION_FACTORS } from '../data/emissionFactors';

/**
 * Calculates emission in kg CO2e for a single activity.
 * Strict rules:
 * - Pure TypeScript function with zero UI dependencies.
 * - Non-negative validation (negative quantities return 0).
 * - Household electricity is allocated by householdSize: never double count.
 */
export function calculateActivityEmission(
  activityType: ActivityType,
  quantity: number,
  householdSize: number = 1
): number {
  if (quantity <= 0 || isNaN(quantity)) {
    return 0;
  }

  const validHouseholdSize = Math.max(1, Math.round(householdSize || 1));
  const factor = getEmissionFactor(activityType);

  if (!factor) {
    return 0;
  }

  // Handle electricity household allocation
  if (factor.category === 'electricity') {
    // If entered as direct kWh, or appliance/ac/lighting hours, allocate per person in household
    const rawEmission = quantity * factor.value;
    return Number((rawEmission / validHouseholdSize).toFixed(4));
  }

  // Transport and waste/lifestyle are direct personal activities
  const emission = quantity * factor.value;
  return Number(emission.toFixed(4));
}

/**
 * Estimates monthly household electricity consumption (kWh) when the user does not know their bill.
 * Transparent assumptions:
 * - 1.5-ton 3-star inverter AC: ~1.2 kW draw
 * - Household LED/CFL lighting circuit: ~0.04 kW
 * - Auxiliary household baseline (refrigerator, fans, standby): ~6 kWh/day baseline
 */
export function estimateElectricityMonthlyKwh(
  dailyAcHours: number,
  dailyLightingHours: number,
  _householdSize: number
): {
  monthlyKwh: number;
  breakdown: {
    acKwh: number;
    lightingKwh: number;
    baselineAppliancesKwh: number;
  };
  assumptions: string[];
} {
  const safeAcHours = Math.max(0, dailyAcHours || 0);
  const safeLightingHours = Math.max(0, dailyLightingHours || 0);

  // 30 days in a standard estimation month
  const acKwh = Number((safeAcHours * 1.2 * 30).toFixed(1));
  const lightingKwh = Number((safeLightingHours * 0.04 * 30).toFixed(1));
  const baselineAppliancesKwh = 180; // ~6 kWh/day for typical Indian household fridge + fans + TV

  const totalMonthlyKwh = Number((acKwh + lightingKwh + baselineAppliancesKwh).toFixed(1));

  const assumptions = [
    '1.5-Ton 3-star inverter AC draws approx. 1.2 kW in steady state at 24°C',
    'Active household LED/CFL lighting estimated at 0.04 kW (40W total draw)',
    'Continuous household base load (refrigerator cycling, fans, TV) estimated at ~6 kWh/day (~180 kWh/month)',
    'National grid carbon factor: 0.716 kg CO2/kWh (CEA CO2 Baseline Database v19)',
    'Allocated proportionally among household members'
  ];

  return {
    monthlyKwh: totalMonthlyKwh,
    breakdown: {
      acKwh,
      lightingKwh,
      baselineAppliancesKwh,
    },
    assumptions,
  };
}

/**
 * Calculates the baseline carbon profile from onboarding answers.
 */
export function calculateBaselineProfile(data: OnboardingData): BaselineProfile {
  const householdSize = Math.max(1, data.householdSize || 1);

  // 1. Transportation daily kg CO2e
  let transportFactor = 0;
  switch (data.primaryTransport) {
    case 'Walking':
    case 'Cycling':
      transportFactor = 0;
      break;
    case 'Two-wheeler':
      transportFactor = 0.035;
      break;
    case 'Car':
      transportFactor = 0.140;
      break;
    case 'Bus':
      transportFactor = 0.038;
      break;
    case 'Train':
      transportFactor = 0.025;
      break;
    default:
      transportFactor = 0.035;
  }

  const dailyTransportKm = Math.max(0, data.avgKmPerDay || 0);
  const dailyTransportKg = Number((dailyTransportKm * transportFactor).toFixed(3));

  // 2. Electricity daily kg CO2e
  let monthlyKwh = data.monthlyKwh;
  if (!data.knowsMonthlyKwh || monthlyKwh <= 0) {
    const est = estimateElectricityMonthlyKwh(data.dailyAcHours, data.dailyLightingHours, householdSize);
    monthlyKwh = est.monthlyKwh;
  }
  const perCapitaDailyKwh = (monthlyKwh / 30) / householdSize;
  const gridFactor = 0.716; // CEA baseline
  const dailyElectricityKg = Number((perCapitaDailyKwh * gridFactor).toFixed(3));

  // 3. Waste and lifestyle daily kg CO2e
  let dailyDietKg = 1.65; // default mixed
  if (data.foodPreference === 'Vegetarian') dailyDietKg = 1.10;
  else if (data.foodPreference === 'Non-vegetarian') dailyDietKg = 2.50;

  let dailyWasteKg = 0.45; // ~1kg mixed waste
  if (data.wasteMethod === 'Segregated') dailyWasteKg = 0.15;
  else if (data.wasteMethod === 'Composted') dailyWasteKg = 0.05;
  else if (data.wasteMethod === 'Recycled regularly') dailyWasteKg = 0.08;

  let plasticPerDay = 0.06; // 1 item
  if (data.singleUsePlasticFreq === 'Daily') plasticPerDay = 0.18; // ~3 items
  else if (data.singleUsePlasticFreq === 'Weekly') plasticPerDay = 0.025;
  else if (data.singleUsePlasticFreq === 'Rarely') plasticPerDay = 0.008;
  else if (data.singleUsePlasticFreq === 'Never') plasticPerDay = 0.0;

  const dailyWasteLifestyleKg = Number((dailyDietKg + dailyWasteKg + plasticPerDay).toFixed(3));

  // Totals
  const dailyTotalKg = Number((dailyTransportKg + dailyElectricityKg + dailyWasteLifestyleKg).toFixed(2));
  const monthlyBaselineKg = Number((dailyTotalKg * 30).toFixed(2));
  const yearlyBaselineKg = Number((dailyTotalKg * 365).toFixed(2));

  // Breakdown
  const breakdown = {
    transportation: Number((dailyTransportKg * 30).toFixed(2)),
    electricity: Number((dailyElectricityKg * 30).toFixed(2)),
    waste_lifestyle: Number((dailyWasteLifestyleKg * 30).toFixed(2)),
  };

  // Top high-emission areas
  const areas = [
    { area: 'Daily Commute & Travel', category: 'transportation' as ActivityCategory, amountKgCO2e: breakdown.transportation },
    { area: 'Home Electricity & AC', category: 'electricity' as ActivityCategory, amountKgCO2e: breakdown.electricity },
    { area: 'Diet & Household Waste', category: 'waste_lifestyle' as ActivityCategory, amountKgCO2e: breakdown.waste_lifestyle },
  ];
  areas.sort((a, b) => b.amountKgCO2e - a.amountKgCO2e);

  const totalMonthly = Math.max(0.1, breakdown.transportation + breakdown.electricity + breakdown.waste_lifestyle);
  const topEmissionAreas = areas.map(a => ({
    ...a,
    percentage: Math.round((a.amountKgCO2e / totalMonthly) * 100),
  }));

  // Three starter recommendations labeled "General starter tip"
  const starterRecommendations: Recommendation[] = [
    {
      id: 'starter_transport',
      title: 'Adopt Low-Carbon Commute for Trips Under 3 km',
      explanation: 'Short car or motorized two-wheeler trips produce higher per-km emissions due to cold engine starts. Walking or cycling eliminates tailpipe emissions completely.',
      relatedActivity: 'Walking or Cycling',
      estimatedMonthlyReductionKgCO2e: Number(Math.min(25, dailyTransportKg * 30 * 0.25).toFixed(1)) || 12.5,
      difficulty: 'Easy',
      suggestedAction: 'Replace 2 short vehicle trips each week with walking or bicycling.',
      type: 'starter',
      category: 'transportation',
    },
    {
      id: 'starter_electricity',
      title: 'Optimize Air Conditioner to 24°C',
      explanation: 'Every 1°C increase in AC thermostat setting reduces electricity consumption by approximately 6%, saving power and cutting power plant load.',
      relatedActivity: 'Air Conditioner',
      estimatedMonthlyReductionKgCO2e: Number((dailyElectricityKg * 30 * 0.18).toFixed(1)) || 15.0,
      difficulty: 'Easy',
      suggestedAction: 'Keep AC temperature at Bureau of Energy Efficiency recommended 24°C with ceiling fan on.',
      type: 'starter',
      category: 'electricity',
    },
    {
      id: 'starter_waste',
      title: 'Segregate Wet & Dry Household Waste',
      explanation: 'Organic waste dumped in anaerobic open landfills produces methane (CH4), a greenhouse gas ~28 times more potent than carbon dioxide.',
      relatedActivity: 'Waste Segregation',
      estimatedMonthlyReductionKgCO2e: 8.5,
      difficulty: 'Easy',
      suggestedAction: 'Separate organic kitchen waste into a green bin for composting or municipal biogas processing.',
      type: 'starter',
      category: 'waste_lifestyle',
    },
  ];

  return {
    dailyBaselineKgCO2e: dailyTotalKg,
    monthlyBaselineKgCO2e: monthlyBaselineKg,
    yearlyBaselineKgCO2e: yearlyBaselineKg,
    breakdown,
    topEmissionAreas,
    starterRecommendations,
  };
}

/**
 * Filter activities by date range.
 */
export function filterActivitiesByDate(
  records: ActivityRecord[],
  startDate?: string,
  endDate?: string
): ActivityRecord[] {
  return records.filter(r => {
    if (startDate && r.date < startDate) return false;
    if (endDate && r.date > endDate) return false;
    return true;
  });
}

/**
 * Summary statistics from recorded activities.
 */
export interface EmissionSummary {
  totalKgCO2e: number;
  todayKgCO2e: number;
  thisWeekKgCO2e: number;
  thisMonthKgCO2e: number;
  lastWeekKgCO2e: number;
  categoryBreakdown: {
    transportation: number;
    electricity: number;
    waste_lifestyle: number;
  };
  activityBreakdown: Record<string, number>;
  activityCount: number;
}

export function calculateSummary(records: ActivityRecord[], todayStr: string): EmissionSummary {
  let total = 0;
  let today = 0;
  let thisWeek = 0;
  let lastWeek = 0;
  let thisMonth = 0;

  const categoryBreakdown = {
    transportation: 0,
    electricity: 0,
    waste_lifestyle: 0,
  };

  const activityBreakdown: Record<string, number> = {};

  const todayDate = new Date(todayStr);
  const currentYear = todayDate.getFullYear();
  const currentMonth = todayDate.getMonth();

  // Week calculation (Sunday to Saturday)
  const currentDayOfWeek = todayDate.getDay();
  const startOfThisWeek = new Date(todayDate);
  startOfThisWeek.setDate(todayDate.getDate() - currentDayOfWeek);
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

  const endOfLastWeek = new Date(startOfThisWeek);
  endOfLastWeek.setMilliseconds(-1);

  for (const record of records) {
    const val = record.emissionKgCO2e || 0;
    total += val;

    // By category
    if (categoryBreakdown[record.category] !== undefined) {
      categoryBreakdown[record.category] += val;
    }

    // By activity type
    activityBreakdown[record.activityType] = (activityBreakdown[record.activityType] || 0) + val;

    // By date
    if (record.date === todayStr) {
      today += val;
    }

    const recDate = new Date(record.date);
    if (recDate >= startOfThisWeek && recDate <= todayDate) {
      thisWeek += val;
    } else if (recDate >= startOfLastWeek && recDate <= endOfLastWeek) {
      lastWeek += val;
    }

    if (recDate.getFullYear() === currentYear && recDate.getMonth() === currentMonth) {
      thisMonth += val;
    }
  }

  return {
    totalKgCO2e: Number(total.toFixed(2)),
    todayKgCO2e: Number(today.toFixed(2)),
    thisWeekKgCO2e: Number(thisWeek.toFixed(2)),
    thisMonthKgCO2e: Number(thisMonth.toFixed(2)),
    lastWeekKgCO2e: Number(lastWeek.toFixed(2)),
    categoryBreakdown: {
      transportation: Number(categoryBreakdown.transportation.toFixed(2)),
      electricity: Number(categoryBreakdown.electricity.toFixed(2)),
      waste_lifestyle: Number(categoryBreakdown.waste_lifestyle.toFixed(2)),
    },
    activityBreakdown,
    activityCount: records.length,
  };
}

/**
 * Builds daily trend data for Recharts (past N days).
 */
export function buildDailyTrendSeries(
  records: ActivityRecord[],
  daysCount: number = 7,
  endDateStr: string
): { date: string; displayDate: string; transportation: number; electricity: number; waste_lifestyle: number; total: number }[] {
  const result = [];
  const endDate = new Date(endDateStr);

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(endDate.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const displayDate = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

    let trans = 0;
    let elec = 0;
    let waste = 0;

    for (const r of records) {
      if (r.date === dateStr) {
        if (r.category === 'transportation') trans += r.emissionKgCO2e;
        else if (r.category === 'electricity') elec += r.emissionKgCO2e;
        else if (r.category === 'waste_lifestyle') waste += r.emissionKgCO2e;
      }
    }

    result.push({
      date: dateStr,
      displayDate,
      transportation: Number(trans.toFixed(2)),
      electricity: Number(elec.toFixed(2)),
      waste_lifestyle: Number(waste.toFixed(2)),
      total: Number((trans + elec + waste).toFixed(2)),
    });
  }

  return result;
}
