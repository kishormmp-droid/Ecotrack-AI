import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Recommendation } from '../../../engine/types';
import { Car, Zap, Trash2, ArrowRight, CheckCircle2, TrendingDown } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAdoptAction?: (rec: Recommendation) => void;
  isAdopted?: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onAdoptAction,
  isAdopted = false,
}) => {
  const getCategoryIcon = () => {
    switch (recommendation.category) {
      case 'transportation':
        return <Car className="w-4 h-4 text-sky-500" />;
      case 'electricity':
        return <Zap className="w-4 h-4 text-warning-500" />;
      case 'waste_lifestyle':
        return <Trash2 className="w-4 h-4 text-eco-500" />;
    }
  };

  const getDifficultyBadge = () => {
    switch (recommendation.difficulty) {
      case 'Easy':
        return <Badge variant="success" size="sm">Easy</Badge>;
      case 'Medium':
        return <Badge variant="info" size="sm">Medium</Badge>;
      case 'Hard':
        return <Badge variant="warning" size="sm">Challenging</Badge>;
    }
  };

  return (
    <Card className="flex flex-col justify-between hover:shadow-card transition-all border-slate-200/80 dark:border-slate-800">
      <div>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              {getCategoryIcon()}
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {recommendation.category.replace('_', ' & ')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {recommendation.type === 'starter' && (
                <Badge variant="info" size="sm">General starter tip</Badge>
              )}
              {getDifficultyBadge()}
            </div>
          </div>
          <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {recommendation.title}
          </CardTitle>
          <CardDescription className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {recommendation.explanation}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pt-1">
          {/* Action Callout */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850/80 border border-slate-100 dark:border-slate-800 text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">
              Suggested Action:
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {recommendation.suggestedAction}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 text-[11px]">Related Activity:</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {recommendation.relatedActivity}
            </span>
          </div>
        </CardContent>
      </div>

      <CardFooter className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-2">
        <div className="flex items-center gap-1 text-eco-600 dark:text-eco-400 font-bold text-xs">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>-{recommendation.estimatedMonthlyReductionKgCO2e} kg CO2e / mo</span>
        </div>

        {onAdoptAction && (
          <Button
            size="sm"
            variant={isAdopted ? 'secondary' : 'primary'}
            onClick={() => onAdoptAction(recommendation)}
            disabled={isAdopted}
            leftIcon={isAdopted ? <CheckCircle2 className="w-3.5 h-3.5 text-eco-600" /> : undefined}
          >
            {isAdopted ? 'Committed' : 'Commit to Action'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
