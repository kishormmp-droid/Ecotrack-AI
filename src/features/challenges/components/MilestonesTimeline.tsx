import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { CheckCircle2, Circle, Clock, Flame, Flag } from 'lucide-react';
import { formatCO2 } from '../../../lib/utils';

interface MilestonesTimelineProps {
  totalReductionKg: number;
  activeStreakDays: number;
}

interface Milestone {
  id: string;
  title: string;
  targetReductionKg: number;
  description: string;
}

const MILESTONES: Milestone[] = [
  {
    id: 'm1',
    title: 'Seedling: First 10 kg CO2e Avoided',
    targetReductionKg: 10,
    description: 'Equivalent to preventing ~70 km of personal car travel or saving 14 kWh of coal-fired grid energy.',
  },
  {
    id: 'm2',
    title: 'Sapling: 25 kg CO2e Avoided',
    targetReductionKg: 25,
    description: 'Equivalent to planting one mature native tree and letting it sequester carbon for an entire year.',
  },
  {
    id: 'm3',
    title: 'Grove: 50 kg CO2e Avoided',
    targetReductionKg: 50,
    description: 'Equivalent to turning off a 1.5-ton split AC for 60 consecutive days.',
  },
  {
    id: 'm4',
    title: 'Forest Canopy: 100 kg CO2e Avoided',
    targetReductionKg: 100,
    description: 'Major personal milestone: 1/10th of a metric ton of atmospheric greenhouse gases eliminated.',
  },
];

export const MilestonesTimeline: React.FC<MilestonesTimelineProps> = ({
  totalReductionKg,
  activeStreakDays,
}) => {
  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-eco-600" /> Carbon Reduction Timeline & Milestones
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
            <Flame className="w-4 h-4 fill-current" />
            <span>{activeStreakDays} Day Streak</span>
          </div>
        </div>
        <CardDescription>
          Cumulative impact milestones tracking total CO2e prevented through active conservation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {MILESTONES.map((m) => {
            const isReached = totalReductionKg >= m.targetReductionKg;

            return (
              <div key={m.id} className="relative flex items-start gap-3 text-xs">
                {/* Milestone Node */}
                <div className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                  isReached
                    ? 'bg-eco-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}>
                  {isReached ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-2.5 h-2.5" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-bold ${isReached ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}>
                      {m.title}
                    </span>
                    <Badge variant={isReached ? 'success' : 'default'} size="sm">
                      {isReached ? 'Achieved' : `${totalReductionKg.toFixed(1)} / ${m.targetReductionKg} kg`}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {m.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
