import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Target, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { formatCO2 } from '../../../lib/utils';

interface TargetProgressCardProps {
  monthlyEmissions: number;
  monthlyTargetKg: number;
  baselineMonthlyKg: number;
}

export const TargetProgressCard: React.FC<TargetProgressCardProps> = ({
  monthlyEmissions,
  monthlyTargetKg,
  baselineMonthlyKg,
}) => {
  const percentUsed = monthlyTargetKg > 0 ? Math.min(150, Math.round((monthlyEmissions / monthlyTargetKg) * 100)) : 0;
  const remainingBudget = Math.max(0, monthlyTargetKg - monthlyEmissions);
  const isOverBudget = monthlyEmissions > monthlyTargetKg;

  // Day of month pacing
  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const expectedPacePct = Math.round((currentDay / daysInMonth) * 100);
  const isPacingFast = percentUsed > expectedPacePct + 15;

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-eco-600" /> Monthly Target Progress
          </CardTitle>
          <CardDescription>
            Monitoring emissions against your {monthlyTargetKg} kg CO2e monthly carbon ceiling.
          </CardDescription>
        </div>
        <Badge
          variant={isOverBudget ? 'danger' : isPacingFast ? 'warning' : 'success'}
          size="sm"
        >
          {isOverBudget ? 'Target Exceeded' : isPacingFast ? 'Pacing Fast' : 'On Track'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Current Month: {monthlyEmissions.toFixed(2)} kg CO2e
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {percentUsed}% of target ({monthlyTargetKg} kg)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverBudget
                  ? 'bg-danger-600'
                  : isPacingFast
                  ? 'bg-warning-500'
                  : 'bg-eco-600'
              }`}
              style={{ width: `${Math.min(100, percentUsed)}%` }}
            />
          </div>
        </div>

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block">Remaining Allowance</span>
            <span className={`text-sm font-bold ${isOverBudget ? 'text-danger-600' : 'text-slate-800 dark:text-slate-200'}`}>
              {isOverBudget ? '0.0 kg' : `${remainingBudget.toFixed(1)} kg`}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block">Initial Baseline</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {baselineMonthlyKg.toFixed(1)} kg
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block">Target vs Baseline</span>
            <span className="text-sm font-bold text-eco-600 dark:text-eco-400">
              -{Math.round(((baselineMonthlyKg - monthlyTargetKg) / Math.max(1, baselineMonthlyKg)) * 100)}%
            </span>
          </div>
        </div>

        {/* Warning or Affirmation Banner */}
        {isOverBudget ? (
          <div className="p-3 rounded-lg bg-danger-50 dark:bg-danger-950/60 border border-danger-200 dark:border-danger-900/60 flex items-start gap-2 text-xs text-danger-800 dark:text-danger-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-danger-600" />
            <p>
              Emissions have surpassed your monthly carbon target. Review Recommendations to identify high-impact transport and electricity savings.
            </p>
          </div>
        ) : isPacingFast ? (
          <div className="p-3 rounded-lg bg-warning-50 dark:bg-warning-950/60 border border-warning-200 dark:border-warning-900/60 flex items-start gap-2 text-xs text-warning-800 dark:text-warning-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-warning-600" />
            <p>
              Usage is tracking ahead of the monthly timeline. Consider adopting low-carbon transit for upcoming errands to stay within target.
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-eco-50 dark:bg-eco-950/60 border border-eco-200 dark:border-eco-900/60 flex items-start gap-2 text-xs text-eco-800 dark:text-eco-300">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-eco-600" />
            <p>
              Great pacing! You are on track to meet your carbon reduction target for this month.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
