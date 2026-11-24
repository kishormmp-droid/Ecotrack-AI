import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EvaluatedChallenge } from '../../../engine/challenges';
import { CheckCircle, Clock, Coins, Sparkles, Check } from 'lucide-react';

interface ChallengeCardProps {
  challenge: EvaluatedChallenge;
  onCompleteManually?: (challenge: EvaluatedChallenge) => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onCompleteManually,
}) => {
  return (
    <Card className={`border-slate-200/80 dark:border-slate-800 transition-all ${
      challenge.isCompleted ? 'bg-eco-50/30 dark:bg-eco-950/20 border-eco-200 dark:border-eco-900/60' : ''
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 mb-1">
          <Badge variant={challenge.period === 'daily' ? 'info' : 'default'} size="sm">
            {challenge.period === 'daily' ? 'Daily Challenge' : 'Weekly Goal'}
          </Badge>
          <span className="flex items-center gap-1 font-bold text-eco-600 dark:text-eco-400 text-xs">
            <Coins className="w-3.5 h-3.5" /> +{challenge.points} pts
          </span>
        </div>
        <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
          <span>{challenge.title}</span>
          {challenge.isCompleted && (
            <span className="text-eco-600 dark:text-eco-400 text-xs flex items-center gap-1">
              <CheckCircle className="w-4 h-4 fill-current text-white dark:text-slate-900" /> Done
            </span>
          )}
        </CardTitle>
        <CardDescription className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          {challenge.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pt-1">
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850/80 border border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
            How to achieve:
          </span>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            {challenge.actionHint}
          </p>
        </div>

        {/* Progress bar for auto-evaluated challenges */}
        {challenge.evaluationType === 'automatic' && (
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>Automatic Tracker</span>
              <span>{challenge.progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-eco-600 h-full rounded-full transition-all"
                style={{ width: `${challenge.progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          {challenge.evaluationType === 'automatic' ? 'Activity-evaluated' : 'Self-affirmation'}
        </span>

        {challenge.isCompleted ? (
          <Badge variant="success" size="sm" className="gap-1">
            <Check className="w-3 h-3" /> Completed
          </Badge>
        ) : challenge.canCompleteManually && onCompleteManually ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCompleteManually(challenge)}
            className="text-xs h-7 px-3 border-eco-500 text-eco-600 hover:bg-eco-50"
          >
            Mark Done
          </Button>
        ) : (
          <span className="text-[11px] text-slate-400 italic">In progress</span>
        )}
      </CardFooter>
    </Card>
  );
};
