import { Badge } from '../engine/types';

export const SYSTEM_BADGES: Badge[] = [
  {
    id: 'badge_first_log',
    title: 'First Log',
    description: 'Recorded your very first activity in EcoTrack AI.',
    iconName: 'Footprints',
    criteria: 'Log any activity record into your personal footprint ledger.',
  },
  {
    id: 'badge_streak_7',
    title: '7-Day Streak',
    description: 'Maintained active daily carbon footprint tracking for 7 consecutive days.',
    iconName: 'Flame',
    criteria: 'Log activities on 7 separate consecutive calendar days.',
  },
  {
    id: 'badge_car_free',
    title: 'Car-Free Commuter',
    description: 'Logged over 25 km of walking, cycling, or electrified public transit.',
    iconName: 'Bike',
    criteria: 'Accumulate 25+ km of zero or low-carbon transit.',
  },
  {
    id: 'badge_plastic_free',
    title: 'Plastic-Free Week',
    description: 'Completed a continuous 7-day streak with zero single-use plastic usage.',
    iconName: 'ShieldCheck',
    criteria: 'Complete the Zero Single-Use Plastic daily challenge 7 times.',
  },
  {
    id: 'badge_halfway_target',
    title: 'Halfway to Target',
    description: 'Reached 50% of your targeted monthly carbon reduction goal.',
    iconName: 'TrendingDown',
    criteria: 'Achieve emissions at or below 50% of your initial monthly baseline.',
  },
  {
    id: 'badge_energy_saver',
    title: 'Grid Guardian',
    description: 'Kept daily household electricity consumption under 3 kWh/person for 5 days.',
    iconName: 'Zap',
    criteria: 'Log electricity on 5 distinct days with under 3 kWh/capita daily.',
  },
  {
    id: 'badge_eco_champion',
    title: 'Eco Champion',
    description: 'Earned 500 Eco Points through consistent tracking and high-impact reductions.',
    iconName: 'Trophy',
    criteria: 'Accumulate 500 total Eco Points.',
  },
];
