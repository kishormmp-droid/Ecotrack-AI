import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Sparkles, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface WeeklyComparisonChartProps {
  thisWeekTotal: number;
  lastWeekTotal: number;
  categoryBreakdownThisWeek: {
    transportation: number;
    electricity: number;
    waste_lifestyle: number;
  };
  isDemo: boolean;
}

export const WeeklyComparisonChart: React.FC<WeeklyComparisonChartProps> = ({
  thisWeekTotal,
  lastWeekTotal,
  categoryBreakdownThisWeek,
  isDemo,
}) => {
  // Approximate last week's category split proportionally or baseline for comparison
  const comparisonData = [
    {
      category: 'Transport',
      thisWeek: categoryBreakdownThisWeek.transportation,
      lastWeek: Number((categoryBreakdownThisWeek.transportation * (lastWeekTotal > 0 ? lastWeekTotal / Math.max(1, thisWeekTotal) : 1.15)).toFixed(2)),
    },
    {
      category: 'Electricity',
      thisWeek: categoryBreakdownThisWeek.electricity,
      lastWeek: Number((categoryBreakdownThisWeek.electricity * (lastWeekTotal > 0 ? lastWeekTotal / Math.max(1, thisWeekTotal) : 1.1)).toFixed(2)),
    },
    {
      category: 'Waste',
      thisWeek: categoryBreakdownThisWeek.waste_lifestyle,
      lastWeek: Number((categoryBreakdownThisWeek.waste_lifestyle * (lastWeekTotal > 0 ? lastWeekTotal / Math.max(1, thisWeekTotal) : 1.05)).toFixed(2)),
    },
  ];

  const diff = Number((thisWeekTotal - lastWeekTotal).toFixed(2));
  const isLower = diff <= 0;

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle>Weekly Comparison</CardTitle>
          <CardDescription>
            This week's carbon impact compared directly with previous 7-day period.
          </CardDescription>
        </div>
        {isDemo && (
          <Badge variant="warning" size="sm" className="gap-1 shrink-0">
            <Sparkles className="w-3 h-3" /> Sample data
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {/* Screen reader text */}
        <p className="sr-only">
          Weekly carbon comparison: This week produced {thisWeekTotal.toFixed(2)} kilograms CO2 equivalent, compared to {lastWeekTotal.toFixed(2)} kilograms last week.
        </p>

        <div className="h-64 w-full" aria-label="Comparison chart of this week vs last week" role="img">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800/80" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 11, fill: 'currentColor' }} 
                className="text-slate-500 dark:text-slate-400"
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: 'currentColor' }} 
                className="text-slate-500 dark:text-slate-400"
                tickLine={false}
                axisLine={false}
                unit="kg"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg shadow-lg text-xs space-y-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{label}</p>
                        {payload.map((entry, index) => (
                          <div key={`entry-${index}`} className="flex items-center justify-between gap-4 text-[11px]">
                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              {entry.name}:
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {Number(entry.value).toFixed(2)} kg CO2e
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top" 
                align="right"
                iconType="circle" 
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} 
              />
              <Bar dataKey="thisWeek" name="This Week" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lastWeek" name="Last Week" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison takeaway */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium">
            {isLower ? (
              <span className="text-eco-600 dark:text-eco-400 flex items-center gap-1">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {Math.abs(diff)} kg CO2e reduction achieved
              </span>
            ) : (
              <span className="text-warning-600 dark:text-warning-400 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{diff} kg CO2e higher than last week
              </span>
            )}
          </div>
          <span className="text-slate-500 text-[11px]">
            This Week: <strong>{thisWeekTotal.toFixed(2)} kg</strong>
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
