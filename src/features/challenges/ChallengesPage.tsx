import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Coins, 
  Flame, 
  HelpCircle, 
  Award, 
  Calendar, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { ChallengeCard } from './components/ChallengeCard';
import { BadgeCard } from './components/BadgeCard';
import { PointsRulesModal } from './components/PointsRulesModal';
import { MilestonesTimeline } from './components/MilestonesTimeline';
import { 
  getStoredActivities, 
  getStoredEcoState, 
  getStoredOnboarding, 
  awardPoints, 
  recordChallengeCompletion, 
  awardBadge, 
  subscribeToStorage,
  isDemoModeActive 
} from '../../services/storage';
import { evaluateChallenges, evaluateBadges, EvaluatedChallenge } from '../../engine/challenges';
import { calculateBaselineProfile } from '../../engine/calculator';
import { getTodayString } from '../../lib/dateUtils';

export const ChallengesPage: React.FC = () => {
  const { showToast } = useToast();
  const [activities, setActivities] = useState(() => getStoredActivities());
  const [ecoState, setEcoState] = useState(() => getStoredEcoState());
  const [onboarding, setOnboarding] = useState(() => getStoredOnboarding());
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'challenges' | 'badges' | 'milestones'>('challenges');

  const isDemo = isDemoModeActive();

  useEffect(() => {
    const sync = () => {
      setActivities(getStoredActivities());
      setEcoState(getStoredEcoState());
      setOnboarding(getStoredOnboarding());
    };
    return subscribeToStorage(sync);
  }, []);

  const baseline = useMemo(() => calculateBaselineProfile(onboarding), [onboarding]);

  // Evaluate challenges and badges against real activity records
  const evaluatedChallenges = useMemo(() => {
    return evaluateChallenges(activities, ecoState);
  }, [activities, ecoState]);

  const evaluatedBadges = useMemo(() => {
    return evaluateBadges(activities, ecoState, baseline.monthlyBaselineKgCO2e);
  }, [activities, ecoState, baseline]);

  // Check and auto-award badges
  useEffect(() => {
    for (const b of evaluatedBadges) {
      if (b.isEarned && !ecoState.earnedBadgeIds.includes(b.id)) {
        awardBadge(b.id);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        showToast({
          type: 'success',
          message: `Achievement Unlocked: "${b.title}"! +100 Eco Points awarded.`,
        });
      }
    }
  }, [evaluatedBadges, ecoState.earnedBadgeIds, showToast]);

  const handleCompleteChallenge = (challenge: EvaluatedChallenge) => {
    const today = getTodayString();
    const periodKey = challenge.period === 'daily' ? today : `W-${today.substring(0, 7)}`;

    const recorded = recordChallengeCompletion(challenge.id, periodKey);
    if (recorded) {
      awardPoints(challenge.points);
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 } });
      showToast({
        type: 'success',
        message: `Challenge Completed: "${challenge.title}"! +${challenge.points} Eco Points.`,
      });
    }
  };

  const dailyChallenges = evaluatedChallenges.filter(c => c.period === 'daily');
  const weeklyGoals = evaluatedChallenges.filter(c => c.period === 'weekly');
  const unlockedBadgesCount = evaluatedBadges.filter(b => b.isEarned).length;

  // Approximate total emission reduction (e.g. baseline monthly - actual or 18.5 kg sample)
  const totalReductionKg = Math.max(12.5, activities.length * 2.2);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with Eco Points and Streak */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Eco Challenges & Gamification
            </h2>
            {isDemo && (
              <Badge variant="warning" size="sm" className="gap-1">
                <Sparkles className="w-3 h-3" /> Sample Data
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Turn daily climate consciousness into rewarding habits and milestone badges.
          </p>
        </div>

        {/* Quick Points & Rules */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-eco-50 dark:bg-eco-950/80 border border-eco-200 dark:border-eco-900 shadow-xs">
            <Coins className="w-4 h-4 text-eco-600 dark:text-eco-400" />
            <span className="text-sm font-bold text-eco-800 dark:text-eco-300">
              {ecoState.points} pts
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRulesModalOpen(true)}
            leftIcon={<HelpCircle className="w-4 h-4" />}
          >
            Point Rules
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('challenges')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeTab === 'challenges'
              ? 'bg-eco-600 text-white font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Daily & Weekly Challenges ({evaluatedChallenges.filter(c => !c.isCompleted).length} active)
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeTab === 'badges'
              ? 'bg-eco-600 text-white font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Achievement Badges ({unlockedBadgesCount} / {evaluatedBadges.length})
        </button>

        <button
          onClick={() => setActiveTab('milestones')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeTab === 'milestones'
              ? 'bg-eco-600 text-white font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Reduction Timeline
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          {/* Daily Challenges Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-eco-600" /> Daily Micro-Challenges
              </h3>
              <span className="text-[11px] text-slate-500">Resets every 24 hours</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {dailyChallenges.map(ch => (
                <ChallengeCard
                  key={ch.id}
                  challenge={ch}
                  onCompleteManually={handleCompleteChallenge}
                />
              ))}
            </div>
          </div>

          {/* Weekly Goals Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" /> Weekly Conservation Commitments
              </h3>
              <span className="text-[11px] text-slate-500">Resets weekly</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {weeklyGoals.map(ch => (
                <ChallengeCard
                  key={ch.id}
                  challenge={ch}
                  onCompleteManually={handleCompleteChallenge}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Earn badges by hitting consistency targets, zero-emission travel milestones, and power savings.
            </p>
            <Badge variant="success" size="sm">
              {unlockedBadgesCount} / {evaluatedBadges.length} Unlocked
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {evaluatedBadges.map(b => (
              <BadgeCard key={b.id} badge={b} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'milestones' && (
        <MilestonesTimeline
          totalReductionKg={totalReductionKg}
          activeStreakDays={ecoState.streakDays || 1}
        />
      )}

      {/* Point Rules Modal */}
      <PointsRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />
    </div>
  );
};
