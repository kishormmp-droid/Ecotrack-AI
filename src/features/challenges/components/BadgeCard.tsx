import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge as UiBadge } from '../../../components/ui/Badge';
import { EvaluatedBadge } from '../../../engine/challenges';
import { 
  Award, 
  Flame, 
  Bike, 
  ShieldCheck, 
  TrendingDown, 
  Zap, 
  Trophy, 
  Footprints,
  Lock
} from 'lucide-react';

interface BadgeCardProps {
  badge: EvaluatedBadge;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  const getIcon = () => {
    switch (badge.iconName) {
      case 'Footprints':
        return <Footprints className="w-5 h-5" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-amber-500" />;
      case 'Bike':
        return <Bike className="w-5 h-5 text-sky-500" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-eco-500" />;
      case 'TrendingDown':
        return <TrendingDown className="w-5 h-5 text-eco-600" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      default:
        return <Award className="w-5 h-5 text-eco-500" />;
    }
  };

  return (
    <Card className={`p-4 border transition-all ${
      badge.isEarned
        ? 'border-eco-200 dark:border-eco-900 bg-eco-50/20 dark:bg-eco-950/20 shadow-subtle'
        : 'border-slate-200/60 dark:border-slate-800 opacity-60 bg-slate-50/50 dark:bg-slate-900/40'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          badge.isEarned
            ? 'bg-eco-100 dark:bg-eco-900/60 text-eco-700 dark:text-eco-300 shadow-xs'
            : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
        }`}>
          {badge.isEarned ? getIcon() : <Lock className="w-4 h-4 text-slate-400" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {badge.title}
            </h4>
            <UiBadge variant={badge.isEarned ? 'success' : 'default'} size="sm">
              {badge.isEarned ? 'Unlocked' : 'Locked'}
            </UiBadge>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mb-2">
            {badge.description}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-1.5">
            <span>Progress</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {badge.progressText}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
