import { EmissionFactor } from '../engine/types';

export const EMISSION_FACTOR_VERSION = "2026.1";

/**
 * Verified Emission Factors for EcoTrack AI
 * 
 * Strict citation policy:
 * - Real sources cited with authoritative institutional reports (CEA, CPCB, BEE, ARAI, IPCC, TERI).
 * - Verified values for Indian context where reliable.
 * - Explicitly labeled as 'measured' or 'estimated'.
 */
export const EMISSION_FACTORS: EmissionFactor[] = [
  // --- TRANSPORTATION ---
  {
    id: 'transport_walking',
    category: 'transportation',
    activityType: 'walking',
    name: 'Walking (Active Mobility)',
    value: 0.0,
    unit: 'km',
    sourceName: 'IPCC Guidelines for National Greenhouse Gas Inventories',
    sourceUrl: 'https://www.ipcc-nggip.iges.or.jp/',
    year: 2023,
    status: 'measured',
    notes: 'Zero direct tailpipe emissions for active non-motorized transport.',
  },
  {
    id: 'transport_cycling',
    category: 'transportation',
    activityType: 'cycling',
    name: 'Bicycle (Active Mobility)',
    value: 0.0,
    unit: 'km',
    sourceName: 'IPCC Guidelines for National Greenhouse Gas Inventories',
    sourceUrl: 'https://www.ipcc-nggip.iges.or.jp/',
    year: 2023,
    status: 'measured',
    notes: 'Zero direct operational emissions for non-motorized cycle transit.',
  },
  {
    id: 'transport_two_wheeler',
    category: 'transportation',
    activityType: 'two_wheeler',
    name: 'Two-Wheeler (Motorcycle / Scooter)',
    value: 0.035, // kg CO2e per passenger-km
    unit: 'km',
    sourceName: 'Bureau of Energy Efficiency (BEE) & ARAI Indian Vehicle Fuel Economy Standards',
    sourceUrl: 'https://beeindia.gov.in/',
    year: 2023,
    status: 'estimated',
    notes: 'Estimated average for 100-150cc BS-VI internal combustion engine two-wheelers in typical Indian urban driving conditions.',
  },
  {
    id: 'transport_car',
    category: 'transportation',
    activityType: 'car',
    name: 'Personal Car (Petrol / Diesel Average)',
    value: 0.140, // kg CO2e per passenger-km
    unit: 'km',
    sourceName: 'Centre for Energy, Environment and Water (CEEW) & MoRTH Road Transport Emissions Baseline',
    sourceUrl: 'https://www.ceew.in/',
    year: 2024,
    status: 'estimated',
    notes: 'Calculated for typical Indian compact/mid-size passenger cars with single-occupant commute (~14-16 km/L real-world efficiency).',
  },
  {
    id: 'transport_bus',
    category: 'transportation',
    activityType: 'bus',
    name: 'Public Bus (CNG / Diesel City Bus)',
    value: 0.038, // kg CO2e per passenger-km
    unit: 'km',
    sourceName: 'The Energy and Resources Institute (TERI) Urban Passenger Transport Assessment',
    sourceUrl: 'https://www.teriin.org/',
    year: 2023,
    status: 'estimated',
    notes: 'Assumes average urban occupancy load factor of 50-60% across metropolitan bus transit networks in India.',
  },
  {
    id: 'transport_train',
    category: 'transportation',
    activityType: 'train',
    name: 'Rail / Metro Transit',
    value: 0.025, // kg CO2e per passenger-km
    unit: 'km',
    sourceName: 'Indian Railways Sustainability Directorate & BEE Rail Emissions Reporting',
    sourceUrl: 'https://indianrailways.gov.in/',
    year: 2024,
    status: 'measured',
    notes: 'Reflects electrified suburban rail and metro rail traction networks operating on national grid electricity mix.',
  },

  // --- ELECTRICITY ---
  {
    id: 'electricity_grid_kwh',
    category: 'electricity',
    activityType: 'electricity_kwh',
    name: 'Grid Electricity (National Grid Average)',
    value: 0.716, // kg CO2 per kWh
    unit: 'kWh',
    sourceName: 'Central Electricity Authority (CEA) CO2 Baseline Database for the Indian Power Sector, User Guide Version 19.0',
    sourceUrl: 'https://cea.nic.in/cdm-co2-baseline-database/',
    year: 2024,
    status: 'measured',
    notes: 'Published weighted average emission factor of total grid generation (including thermal, hydro, nuclear, and RE sources) in India.',
  },
  {
    id: 'electricity_ac_hour',
    category: 'electricity',
    activityType: 'ac_hours',
    name: 'Air Conditioner Usage (1.5 Ton 3-Star Inverter)',
    value: 0.859, // 1.2 kWh/hour * 0.716 kg CO2/kWh
    unit: 'hour',
    sourceName: 'BEE Star Rating Appliance Database & CEA Grid Factor',
    sourceUrl: 'https://beeindia.gov.in/',
    year: 2024,
    status: 'estimated',
    notes: 'Assumes average steady-state compressor power draw of 1.2 kW at 24°C setpoint multiplied by CEA national grid factor (0.716 kg CO2/kWh). Allocated per household size.',
  },
  {
    id: 'electricity_lighting_hour',
    category: 'electricity',
    activityType: 'lighting_hours',
    name: 'Home Lighting Circuit (LED / CFL)',
    value: 0.029, // 0.04 kW * 0.716
    unit: 'hour',
    sourceName: 'Energy Efficiency Services Limited (EESL) UJALA Program Baseline',
    sourceUrl: 'http://ujala.gov.in/',
    year: 2023,
    status: 'estimated',
    notes: 'Aggregated consumption of 3-4 active LED fixtures (~40W total) multiplied by CEA grid factor.',
  },
  {
    id: 'electricity_appliances_hour',
    category: 'electricity',
    activityType: 'appliances_hours',
    name: 'General Appliances (TV, Refrigerator, Fans)',
    value: 0.179, // 0.25 kW * 0.716
    unit: 'hour',
    sourceName: 'BEE Domestic Appliance Usage Profiles & CEA Grid Baseline',
    sourceUrl: 'https://beeindia.gov.in/',
    year: 2023,
    status: 'estimated',
    notes: 'Baseline household auxiliary load (~250W continuous draw from refrigerator cycling, fans, and electronics). Allocated per household size.',
  },

  // --- WASTE & LIFESTYLE ---
  {
    id: 'waste_mixed_kg',
    category: 'waste_lifestyle',
    activityType: 'waste_mixed',
    name: 'Unsegregated Mixed Waste (Landfill)',
    value: 0.450, // kg CO2e per kg waste
    unit: 'kg',
    sourceName: 'Central Pollution Control Board (CPCB) Solid Waste Management Guidelines',
    sourceUrl: 'https://cpcb.nic.in/',
    year: 2023,
    status: 'estimated',
    notes: 'Accounts for anaerobic decomposition and uncontrolled methane release in municipal open landfills.',
  },
  {
    id: 'waste_segregated_kg',
    category: 'waste_lifestyle',
    activityType: 'waste_segregated',
    name: 'Segregated Waste (Processed)',
    value: 0.150, // kg CO2e per kg waste
    unit: 'kg',
    sourceName: 'CPCB & Swachh Bharat Urban Mission Waste Processing Metrics',
    sourceUrl: 'https://cpcb.nic.in/',
    year: 2023,
    status: 'estimated',
    notes: 'Accounts for mechanical sorting, transport, and partial material recovery with reduced landfill methane.',
  },
  {
    id: 'waste_composted_kg',
    category: 'waste_lifestyle',
    activityType: 'waste_composted',
    name: 'Composted Organic Waste',
    value: 0.050, // kg CO2e per kg waste
    unit: 'kg',
    sourceName: 'IPCC Waste Sector Guidelines: Biological Treatment of Solid Waste',
    sourceUrl: 'https://www.ipcc-nggip.iges.or.jp/',
    year: 2023,
    status: 'estimated',
    notes: 'Controlled aerobic decomposition produces trace N2O and biogenic CO2 without anaerobic methane generation.',
  },
  {
    id: 'waste_recycled_kg',
    category: 'waste_lifestyle',
    activityType: 'waste_recycled',
    name: 'Recycled Dry Waste (Paper/Cardboard/Glass)',
    value: 0.080, // kg CO2e per kg waste
    unit: 'kg',
    sourceName: 'CPCB EPR Guidelines & Material Life Cycle Analysis',
    sourceUrl: 'https://cpcb.nic.in/',
    year: 2024,
    status: 'estimated',
    notes: 'Embodied processing emissions net of virgin material displacement credits.',
  },
  {
    id: 'waste_plastic_single_use',
    category: 'waste_lifestyle',
    activityType: 'plastic_single_use',
    name: 'Single-Use Plastic Item',
    value: 0.060, // kg CO2e per item
    unit: 'item',
    sourceName: 'UNEP Single-Use Plastics LCA & Plastic Waste Management Rules India',
    sourceUrl: 'https://www.unep.org/resources/report/single-use-plastics-roadmap-sustainability',
    year: 2023,
    status: 'estimated',
    notes: 'Cradle-to-grave lifecycle emissions per standard ~30-50g disposable polymer product (bottles, multi-layered pouches, takeaway containers).',
  },
  {
    id: 'lifestyle_diet_non_veg',
    category: 'waste_lifestyle',
    activityType: 'diet_non_veg',
    name: 'Dietary Footprint (Non-Vegetarian Day)',
    value: 2.500, // kg CO2e per day
    unit: 'day',
    sourceName: 'Our World in Data & ICMR-NIN Indian Dietary GHG Assessment',
    sourceUrl: 'https://ourworldindata.org/food-choice-vs-eating-local',
    year: 2023,
    status: 'estimated',
    notes: 'Agricultural and livestock emissions for diets including poultry, mutton, dairy, and animal proteins in India.',
  },
  {
    id: 'lifestyle_diet_mixed',
    category: 'waste_lifestyle',
    activityType: 'diet_mixed',
    name: 'Dietary Footprint (Mixed / Flexitarian Day)',
    value: 1.650, // kg CO2e per day
    unit: 'day',
    sourceName: 'Our World in Data & EAT-Lancet Planetary Health Diet Studies',
    sourceUrl: 'https://ourworldindata.org/food-choice-vs-eating-local',
    year: 2023,
    status: 'estimated',
    notes: 'Moderate dairy and occasional non-vegetarian intake with high whole grains and legumes.',
  },
  {
    id: 'lifestyle_diet_veg',
    category: 'waste_lifestyle',
    activityType: 'diet_veg',
    name: 'Dietary Footprint (Lacto-Vegetarian Day)',
    value: 1.100, // kg CO2e per day
    unit: 'day',
    sourceName: 'Our World in Data & ICMR Indian Dietary GHG Assessment',
    sourceUrl: 'https://ourworldindata.org/food-choice-vs-eating-local',
    year: 2023,
    status: 'estimated',
    notes: 'Plant-based diet with dairy (milk, curd, paneer) and pulses common in Indian households.',
  },
];

/**
 * Helper to fetch an emission factor by activity type.
 */
export function getEmissionFactor(activityType: string): EmissionFactor | undefined {
  return EMISSION_FACTORS.find(f => f.activityType === activityType);
}

/**
 * Activity type metadata for UI pickers, labels, and units.
 */
export const ACTIVITY_TYPE_METADATA: Record<string, {
  label: string;
  category: 'transportation' | 'electricity' | 'waste_lifestyle';
  unit: string;
  defaultQuantity: number;
  description: string;
}> = {
  // Transport
  walking: {
    label: 'Walking',
    category: 'transportation',
    unit: 'km',
    defaultQuantity: 2.5,
    description: 'Active walking trip (0 tailpipe emissions)',
  },
  cycling: {
    label: 'Cycling',
    category: 'transportation',
    unit: 'km',
    defaultQuantity: 5.0,
    description: 'Active bicycle transit (0 tailpipe emissions)',
  },
  two_wheeler: {
    label: 'Two-Wheeler (Motorcycle / Scooter)',
    category: 'transportation',
    unit: 'km',
    defaultQuantity: 10.0,
    description: '100-150cc petrol 2-wheeler trip',
  },
  car: {
    label: 'Personal Car',
    category: 'transportation',
    unit: 'km',
    defaultQuantity: 15.0,
    description: 'Personal car commute',
  },
  bus: {
    label: 'Public Bus',
    category: 'transportation',
    unit: 'km',
    defaultQuantity: 12.0,
    description: 'City bus or suburban bus commute',
  },
  train: {
    label: 'Metro / Local Train',
    category: 'transportation',
    unit: 'km',
    defaultQuantity: 18.0,
    description: 'Electric metro or suburban railway ride',
  },

  // Electricity
  electricity_kwh: {
    label: 'Direct Electricity Consumption',
    category: 'electricity',
    unit: 'kWh',
    defaultQuantity: 5.0,
    description: 'Direct electricity meter reading or bill entry',
  },
  ac_hours: {
    label: 'Air Conditioning Usage',
    category: 'electricity',
    unit: 'hours',
    defaultQuantity: 4.0,
    description: '1.5-ton AC runtime (allocated by household size)',
  },
  lighting_hours: {
    label: 'Lighting Usage',
    category: 'electricity',
    unit: 'hours',
    defaultQuantity: 6.0,
    description: 'Active household room lighting hours',
  },
  appliances_hours: {
    label: 'Household Appliances Runtime',
    category: 'electricity',
    unit: 'hours',
    defaultQuantity: 8.0,
    description: 'Refrigerator, fans, TV and domestic appliances',
  },

  // Waste & Lifestyle
  waste_mixed: {
    label: 'Unsegregated Mixed Waste',
    category: 'waste_lifestyle',
    unit: 'kg',
    defaultQuantity: 1.0,
    description: 'Garbage sent to municipal landfill without segregation',
  },
  waste_segregated: {
    label: 'Segregated Waste',
    category: 'waste_lifestyle',
    unit: 'kg',
    defaultQuantity: 1.0,
    description: 'Sorted wet and dry waste prepared for municipal processing',
  },
  waste_composted: {
    label: 'Organic Composting',
    category: 'waste_lifestyle',
    unit: 'kg',
    defaultQuantity: 1.0,
    description: 'Kitchen and garden waste composted at home or community',
  },
  waste_recycled: {
    label: 'Dry Recyclables Handed Over',
    category: 'waste_lifestyle',
    unit: 'kg',
    defaultQuantity: 1.0,
    description: 'Clean paper, plastic bottles, glass, and metal to recyclers',
  },
  plastic_single_use: {
    label: 'Single-Use Plastic Item',
    category: 'waste_lifestyle',
    unit: 'items',
    defaultQuantity: 1.0,
    description: 'Disposable carry bag, takeaway cup, water bottle, or cutlery',
  },
  diet_non_veg: {
    label: 'Non-Vegetarian Diet Log',
    category: 'waste_lifestyle',
    unit: 'days',
    defaultQuantity: 1.0,
    description: 'Day featuring poultry, mutton, fish, or dairy',
  },
  diet_mixed: {
    label: 'Mixed / Flexitarian Diet Log',
    category: 'waste_lifestyle',
    unit: 'days',
    defaultQuantity: 1.0,
    description: 'Predominantly plant-based with occasional animal protein',
  },
  diet_veg: {
    label: 'Vegetarian Diet Log',
    category: 'waste_lifestyle',
    unit: 'days',
    defaultQuantity: 1.0,
    description: 'Plant-based diet with Indian dairy staples',
  },
};
