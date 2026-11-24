import { 
  ActivityRecord, 
  OnboardingData, 
  Recommendation,
  ActivityCategory 
} from './types';
import { calculateActivityEmission } from './calculator';

export interface RecommendationContext {
  onboarding: OnboardingData;
  activities: ActivityRecord[];
  daysHistory?: number;
}

/**
 * Interface to allow pluggable recommendation providers.
 * Currently backed by RuleBasedRecommendationProvider.
 * An LLM or AI provider can implement this interface in the future.
 */
export interface IRecommendationProvider {
  name: string;
  isRuleBased: boolean;
  generateRecommendations(context: RecommendationContext): Recommendation[];
}

/**
 * Rule-Based Recommendation Engine
 * Pure TypeScript implementation without external AI or network calls.
 */
export class RuleBasedRecommendationProvider implements IRecommendationProvider {
  name = 'EcoTrack Rule-Based Engine v1.0';
  isRuleBased = true;

  generateRecommendations(context: RecommendationContext): Recommendation[] {
    const { onboarding, activities } = context;

    // If no activities have been logged yet, return onboarding general starter tips
    if (!activities || activities.length === 0) {
      return this.getStarterTips(onboarding);
    }

    // Analyze recorded activities
    let totalEmission = 0;
    let carKm = 0;
    let twoWheelerKm = 0;
    let publicTransitKm = 0;
    let activeMobilityKm = 0;

    let acHours = 0;
    let directKwh = 0;
    let lightingHours = 0;

    let mixedWasteKg = 0;
    let singleUsePlasticCount = 0;
    let nonVegDays = 0;

    for (const record of activities) {
      totalEmission += record.emissionKgCO2e || 0;

      if (record.activityType === 'car') carKm += record.quantity;
      if (record.activityType === 'two_wheeler') twoWheelerKm += record.quantity;
      if (record.activityType === 'bus' || record.activityType === 'train') publicTransitKm += record.quantity;
      if (record.activityType === 'walking' || record.activityType === 'cycling') activeMobilityKm += record.quantity;

      if (record.activityType === 'ac_hours') acHours += record.quantity;
      if (record.activityType === 'electricity_kwh') directKwh += record.quantity;
      if (record.activityType === 'lighting_hours') lightingHours += record.quantity;

      if (record.activityType === 'waste_mixed') mixedWasteKg += record.quantity;
      if (record.activityType === 'plastic_single_use') singleUsePlasticCount += record.quantity;
      if (record.activityType === 'diet_non_veg') nonVegDays += record.quantity;
    }

    const candidateRecommendations: Recommendation[] = [];

    // --- RULE 1: High Car Share ---
    // Trigger: car km > 20 km or car emission comprises significant part
    if (carKm > 15 || onboarding.primaryTransport === 'Car') {
      // Estimated monthly benefit: shifting 30% of car trips to bus/train
      const carEmissionMonthly = calculateActivityEmission('car', Math.max(carKm, 50));
      const busEquivalent = calculateActivityEmission('bus', Math.max(carKm, 50));
      const netSavings = Math.max(5.0, Number((carEmissionMonthly - busEquivalent).toFixed(1)));

      candidateRecommendations.push({
        id: 'rule_car_to_public_transit',
        title: 'Shift 2 Weekly Car Commutes to Metro / Bus',
        explanation: `You have logged ${carKm.toFixed(1)} km in personal car trips. Electrified metro or urban bus transit produces up to 73% lower carbon per passenger-km compared to single-occupant passenger cars.`,
        relatedActivity: 'Public Bus or Metro',
        estimatedMonthlyReductionKgCO2e: netSavings,
        difficulty: 'Medium',
        suggestedAction: 'Take the local train or bus for regular weekday commutes twice a week.',
        type: 'data_driven',
        category: 'transportation',
      });

      // Carpooling / active mobility for short journeys
      candidateRecommendations.push({
        id: 'rule_short_trips_active',
        title: 'Walk or Cycle for Errands Under 2 km',
        explanation: 'Cold engine starts in personal vehicles consume excess fuel for short neighborhood trips. Walking or cycling has zero tailpipe emissions.',
        relatedActivity: 'Walking or Cycling',
        estimatedMonthlyReductionKgCO2e: Number((calculateActivityEmission('car', 15) * 4).toFixed(1)) || 8.4,
        difficulty: 'Easy',
        suggestedAction: 'Switch local market visits and grocery runs to bicycle or walking.',
        type: 'data_driven',
        category: 'transportation',
      });
    }

    // --- RULE 2: High Electricity / AC Usage ---
    if (acHours >= 8 || directKwh > 50 || onboarding.dailyAcHours >= 4) {
      // Estimated savings of raising AC temp by 2C (approx 12% energy reduction)
      const acSavingsMonthly = Number((calculateActivityEmission('ac_hours', 60, onboarding.householdSize) * 0.12).toFixed(1)) || 14.2;

      candidateRecommendations.push({
        id: 'rule_ac_optimization',
        title: 'Calibrate AC to 24°C with Ceiling Fan',
        explanation: 'Each 1°C increase in air conditioning setpoint cuts compressor electrical consumption by ~6%. Running ceiling fans alongside allows comfortable cooling at 24°C-25°C.',
        relatedActivity: 'Air Conditioning',
        estimatedMonthlyReductionKgCO2e: acSavingsMonthly,
        difficulty: 'Easy',
        suggestedAction: 'Lock AC thermostat at 24°C and clean the front dust filter monthly for 10% airflow efficiency.',
        type: 'data_driven',
        category: 'electricity',
      });

      candidateRecommendations.push({
        id: 'rule_standby_power',
        title: 'Eliminate Phantom Standby Appliance Draw',
        explanation: 'Appliances on standby mode (TV consoles, microwave clocks, set-top boxes) draw 5-10% of idle household power continuously.',
        relatedActivity: 'Household Appliances',
        estimatedMonthlyReductionKgCO2e: 6.8,
        difficulty: 'Easy',
        suggestedAction: 'Switch off wall socket plugs for entertainment systems and chargers when not actively in use.',
        type: 'data_driven',
        category: 'electricity',
      });
    }

    // --- RULE 3: High Waste or Plastic ---
    if (mixedWasteKg > 3 || singleUsePlasticCount >= 3 || onboarding.wasteMethod === 'Mixed') {
      candidateRecommendations.push({
        id: 'rule_waste_segregation',
        title: 'Segregate Biodegradable Kitchen Organics',
        explanation: 'Unsegregated waste decomposing anaerobically in open municipal landfills generates high-potency methane gas. Composting aerobiotic waste cuts footprint by ~85%.',
        relatedActivity: 'Waste Segregation & Composting',
        estimatedMonthlyReductionKgCO2e: 12.0,
        difficulty: 'Easy',
        suggestedAction: 'Keep a separate green bin for fruit/vegetable peels and tea leaves; compost at home or handover to wet-waste collection.',
        type: 'data_driven',
        category: 'waste_lifestyle',
      });
    }

    if (singleUsePlasticCount > 0 || onboarding.singleUsePlasticFreq === 'Daily' || onboarding.singleUsePlasticFreq === 'Weekly') {
      candidateRecommendations.push({
        id: 'rule_single_use_plastic_elimination',
        title: 'Carry a Reusable Bottle & Cloth Carry Bag',
        explanation: `Single-use plastic bottles and polythene packaging require high fossil-fuel refining energy and persist for centuries in ecosystems.`,
        relatedActivity: 'Single-Use Plastic',
        estimatedMonthlyReductionKgCO2e: 5.4,
        difficulty: 'Easy',
        suggestedAction: 'Stash a foldable canvas tote bag and refillable stainless steel bottle in your daily travel bag.',
        type: 'data_driven',
        category: 'waste_lifestyle',
      });
    }

    // --- RULE 4: Diet Impact ---
    if (nonVegDays > 2 || onboarding.foodPreference === 'Non-vegetarian') {
      candidateRecommendations.push({
        id: 'rule_plant_rich_plate',
        title: 'Adopt "Green Mondays" (Plant-Rich Day)',
        explanation: 'Lacto-vegetarian and pulse-based meals have less than half the greenhouse footprint of ruminant and poultry meat per nutritional calorie.',
        relatedActivity: 'Dietary Choices',
        estimatedMonthlyReductionKgCO2e: 11.2,
        difficulty: 'Medium',
        suggestedAction: 'Choose delicious legume, dal, and vegetable-centered meals 1-2 days per week.',
        type: 'data_driven',
        category: 'waste_lifestyle',
      });
    }

    // Goal-matched recommendations rank higher
    const userGoals = onboarding.goals || [];
    candidateRecommendations.sort((a, b) => {
      const aMatchesGoal = this.matchesUserGoals(a, userGoals);
      const bMatchesGoal = this.matchesUserGoals(b, userGoals);
      if (aMatchesGoal && !bMatchesGoal) return -1;
      if (!aMatchesGoal && bMatchesGoal) return 1;
      // Secondary sort: estimated benefit descending
      return b.estimatedMonthlyReductionKgCO2e - a.estimatedMonthlyReductionKgCO2e;
    });

    // If still empty (e.g. user only logged zero-emission walks), provide positive reinforcement tips
    if (candidateRecommendations.length === 0) {
      return this.getStarterTips(onboarding);
    }

    return candidateRecommendations;
  }

  private matchesUserGoals(rec: Recommendation, goals: string[]): boolean {
    const goalsLower = goals.map(g => g.toLowerCase());
    if (rec.category === 'transportation' && goalsLower.some(g => g.includes('transport'))) return true;
    if (rec.category === 'electricity' && goalsLower.some(g => g.includes('electricity') || g.includes('power'))) return true;
    if (rec.category === 'waste_lifestyle' && goalsLower.some(g => g.includes('plastic') || g.includes('waste'))) return true;
    if (goalsLower.some(g => g.includes('carbon footprint'))) return true;
    return false;
  }

  private getStarterTips(onboarding: OnboardingData): Recommendation[] {
    return [
      {
        id: 'starter_transport_metro',
        title: 'Choose Metro or Bus for Long Commutes',
        explanation: 'General starter tip: Commuter rail and bus transit significantly reduce per-capita fossil fuel consumption compared to individual driving.',
        relatedActivity: 'Public Transport',
        estimatedMonthlyReductionKgCO2e: 18.0,
        difficulty: 'Medium',
        suggestedAction: 'Plan your route on local transit maps for 2 trips this week.',
        type: 'starter',
        category: 'transportation',
      },
      {
        id: 'starter_ac_setpoint',
        title: 'Set AC to 24°C Comfort Baseline',
        explanation: 'General starter tip: Bureau of Energy Efficiency tests show 24°C provides the ideal balance between human thermal comfort and energy efficiency.',
        relatedActivity: 'Air Conditioning',
        estimatedMonthlyReductionKgCO2e: 14.5,
        difficulty: 'Easy',
        suggestedAction: 'Keep the thermostat set at 24°C instead of 18-20°C.',
        type: 'starter',
        category: 'electricity',
      },
      {
        id: 'starter_waste_segregation',
        title: 'Begin Wet and Dry Waste Separation',
        explanation: 'General starter tip: Separating organic food scraps from dry recyclables prevents methane emissions at city dumpsites.',
        relatedActivity: 'Waste Management',
        estimatedMonthlyReductionKgCO2e: 9.0,
        difficulty: 'Easy',
        suggestedAction: 'Use two distinct bins at home: green for food waste, blue for dry packaging.',
        type: 'starter',
        category: 'waste_lifestyle',
      },
    ];
  }
}

// Default exported engine instance
export const recommendationEngine = new RuleBasedRecommendationProvider();
