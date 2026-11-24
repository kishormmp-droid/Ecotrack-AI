import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Sparkles } from 'lucide-react';

interface CategoryDonutChartProps {
  breakdown: {
    transportation: number;
    electricity: number;
    waste_lifestyle: number;
  };
  isDemo: boolean;
}

const COLORS = ['#0284c7', '#d97706', '#16a34a'];

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  breakdown,
  isDemo,
}) => {
  // If demo mode or matching sample values, ensure exact values:
  // Prompt exact constraint: Sample values: total 2.4 kg CO2e; transport 1.8 kg; electricity 0.4 kg; other 0.2 kg.
  const data = [
    { name: 'Transportation', value: breakdown.transportation || 0 },
    { name: 'Electricity', value: breakdown.electricity || 0 },
    { name: 'Other (Waste & Diet)', value: breakdown.waste_lifestyle || 0 },
  ].filter(d => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle>Emission Share by Category</CardTitle>
          <CardDescription>
            Proportional split of greenhouse emissions across activity pillars.
          </CardDescription>
        </div>
        {isDemo && (
          <Badge variant="warning" size="sm" className="gap-1 shrink-0">
            <Sparkles className="w-3 h-3" /> Sample data
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <p className="sr-only">
          Emission distribution: Transportation {breakdown.transportation.toFixed(2)} kg, Electricity {breakdown.electricity.toFixed(2)} kg, Other {breakdown.waste_lifestyle.toFixed(2)} kg. Total: {total.toFixed(2)} kg CO2 equivalent.
        </p>

        {total === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-xs text-slate-400">
            <p>No activity logged to display category distribution.</p>
          </div>
        ) : (
          <div className="h-64 w-full relative" aria-label="Donut chart showing emissions by category" role="img">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0];
                      const val = Number(item.value);
                      const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                      return (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg shadow-lg text-xs space-y-1">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
                          <p className="text-slate-600 dark:text-slate-400">
                            {val.toFixed(2)} kg CO2e ({pct}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle" 
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Donut Total */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Total</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {total.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">kg</span>
              </span>
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Transport</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">{breakdown.transportation.toFixed(2)} kg</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Electricity</span>
            <span className="font-bold text-warning-600 dark:text-warning-400">{breakdown.electricity.toFixed(2)} kg</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Other</span>
            <span className="font-bold text-eco-600 dark:text-eco-400">{breakdown.waste_lifestyle.toFixed(2)} kg</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
