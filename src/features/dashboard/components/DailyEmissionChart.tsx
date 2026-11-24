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
import { Sparkles } from 'lucide-react';

interface DailySeriesPoint {
  date: string;
  displayDate: string;
  transportation: number;
  electricity: number;
  waste_lifestyle: number;
  total: number;
}

interface DailyEmissionChartProps {
  data: DailySeriesPoint[];
  isDemo: boolean;
}

export const DailyEmissionChart: React.FC<DailyEmissionChartProps> = ({
  data,
  isDemo,
}) => {
  const totalInPeriod = data.reduce((sum, d) => sum + d.total, 0);
  const avgDaily = data.length > 0 ? (totalInPeriod / data.length).toFixed(2) : '0';

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle>Daily Carbon Footprint (Past 7 Days)</CardTitle>
          <CardDescription>
            Stacked emission totals categorized across transportation, power, and lifestyle.
          </CardDescription>
        </div>
        {isDemo && (
          <Badge variant="warning" size="sm" className="gap-1 shrink-0">
            <Sparkles className="w-3 h-3" /> Sample data
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {/* Accessible text summary for screen readers */}
        <p className="sr-only" aria-live="polite">
          Carbon footprint over the past 7 days. Total emissions: {totalInPeriod.toFixed(2)} kilograms CO2 equivalent. Daily average is {avgDaily} kilograms CO2 equivalent.
        </p>

        <div className="h-64 w-full" aria-label="Stacked Bar Chart of daily emissions for the past 7 days" role="img">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800/80" />
              <XAxis 
                dataKey="displayDate" 
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
                    const total = payload.reduce((acc, p) => acc + (Number(p.value) || 0), 0);
                    return (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg shadow-lg text-xs space-y-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{label}</p>
                        {payload.map((entry, index) => (
                          <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              {entry.name}:
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {Number(entry.value).toFixed(2)} kg
                            </span>
                          </div>
                        ))}
                        <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-slate-100">
                          <span>Total:</span>
                          <span>{total.toFixed(2)} kg CO2e</span>
                        </div>
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
              <Bar dataKey="transportation" name="Transport" stackId="a" fill="#0284c7" radius={[0, 0, 0, 0]} />
              <Bar dataKey="electricity" name="Electricity" stackId="a" fill="#d97706" radius={[0, 0, 0, 0]} />
              <Bar dataKey="waste_lifestyle" name="Waste & Diet" stackId="a" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Text summary below chart */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>7-Day Aggregated Total: <strong className="text-slate-800 dark:text-slate-200">{totalInPeriod.toFixed(2)} kg CO2e</strong></span>
          <span>Daily Mean: <strong className="text-slate-800 dark:text-slate-200">{avgDaily} kg/day</strong></span>
        </div>
      </CardContent>
    </Card>
  );
};
