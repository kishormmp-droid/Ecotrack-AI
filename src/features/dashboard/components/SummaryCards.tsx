import React from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  Award, 
  CloudRain, 
  Coins, 
  Sparkles,
  ArrowDownRight
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { formatCO2 } from '../../../lib/utils';
import { EmissionSummary } from '../../../engine/calculator';
import { BaselineProfile } from '../../../engine/types';

interface SummaryCardsProps {
  summary: EmissionSummary;
  baseline: BaselineProfile;
  ecoPoints: number;
  isDemo: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  baseline,
  ecoPoints,
  isDemo,
}) => {
  // Estimated reduction vs monthly baseline
  // baseline.monthlyBaselineKgCO2e vs current month's projected footprint
  const daysInCurrentMonth = new Date().getDate();
  const currentDailyRate = daysInCurrentMonth > 0 ? summary.thisMonthKgCO2e / daysInCurrentMonth : 0;
  const projectedMonthEmission = currentDailyRate * 30;
  const reductionKg = Number((baseline.monthlyBaselineKgCO2e - projectedMonthEmission).toFixed(1));
  const reductionPercentage = baseline.monthlyBaselineKgCO2e > 0
    ? Math.round((reductionKg / baseline.monthlyBaselineKgCO2e) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Total Estimated Emissions */}
      <Card className="p-3.5 space-y-1.5 border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-[11px] font-medium">Total Lifetime</span>
          <CloudRain className="w-3.5 h-3.5 text-eco-600" />
        </div>
        <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {formatCO2(summary.totalKgCO2e)}
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          All recorded activities
        </p>
      </Card>

      {/* 2. Today's Emissions */}
      <Card className="p-3.5 space-y-1.5 border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-[11px] font-medium">Today</span>
          <span className="text-[10px] font-semibold text-eco-600 dark:text-eco-400">Live</span>
        </div>
        <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {formatCO2(summary.todayKgCO2e)}
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          Daily baseline: {baseline.dailyBaselineKgCO2e} kg
        </p>
      </Card>

      {/* 3. This Week */}
      <Card className="p-3.5 space-y-1.5 border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-[11px] font-medium">This Week</span>
          <Calendar className="w-3.5 h-3.5 text-sky-500" />
        </div>
        <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {formatCO2(summary.thisWeekKgCO2e)}
        </div>
        <div className="flex items-center text-[10px]">
          {summary.lastWeekKgCO2e > 0 ? (
            summary.thisWeekKgCO2e <= summary.lastWeekKgCO2e ? (
              <span className="text-eco-600 dark:text-eco-400 flex items-center font-medium">
                <ArrowDownRight className="w-3 h-3" /> Lower than last wk
              </span>
            ) : (
              <span className="text-warning-600 dark:text-warning-400 flex items-center font-medium">
                +{Math.round(((summary.thisWeekKgCO2e - summary.lastWeekKgCO2e) / summary.lastWeekKgCO2e) * 100)}% vs last wk
              </span>
            )
          ) : (
            <span className="text-slate-400">Current 7-day span</span>
          )}
        </div>
      </Card>

      {/* 4. This Month */}
      <Card className="p-3.5 space-y-1.5 border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-[11px] font-medium">This Month</span>
          <Calendar className="w-3.5 h-3.5 text-purple-500" />
        </div>
        <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {formatCO2(summary.thisMonthKgCO2e)}
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          Month-to-date total
        </p>
      </Card>

      {/* 5. Reduction vs Baseline */}
      <Card className="p-3.5 space-y-1.5 border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-[11px] font-medium">Vs Baseline</span>
          <TrendingDown className="w-3.5 h-3.5 text-eco-600" />
        </div>
        <div className="text-lg sm:text-xl font-extrabold text-eco-600 dark:text-eco-400 tracking-tight">
          {reductionKg > 0 ? `-${reductionKg} kg` : `${Math.abs(reductionKg)} kg`}
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          {reductionPercentage > 0 ? `${reductionPercentage}% lower trend` : 'Tracking pace'}
        </p>
      </Card>

      {/* 6. Eco Points */}
      <Card className="p-3.5 space-y-1.5 border-slate-200/80 dark:border-slate-800 bg-eco-50/40 dark:bg-eco-950/30">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-[11px] font-medium text-eco-900 dark:text-eco-200">Eco Points</span>
          <Coins className="w-3.5 h-3.5 text-eco-600" />
        </div>
        <div className="text-lg sm:text-xl font-extrabold text-eco-700 dark:text-eco-300 tracking-tight">
          {ecoPoints} <span className="text-xs font-semibold">pts</span>
        </div>
        <p className="text-[10px] text-eco-600/80 dark:text-eco-400/80">
          Gamified rewards
        </p>
      </Card>
    </div>
  );
};
