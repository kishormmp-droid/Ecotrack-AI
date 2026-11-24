import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lightbulb, 
  Cpu, 
  Filter, 
  TrendingDown, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { RecommendationCard } from './components/RecommendationCard';
import { 
  getStoredActivities, 
  getStoredOnboarding, 
  awardPoints, 
  subscribeToStorage,
  isDemoModeActive 
} from '../../services/storage';
import { recommendationEngine } from '../../engine/recommendations';
import { Recommendation } from '../../engine/types';

export const RecommendationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [activities, setActivities] = useState(() => getStoredActivities());
  const [onboarding, setOnboarding] = useState(() => getStoredOnboarding());
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'transportation' | 'electricity' | 'waste_lifestyle'>('all');
  const [adoptedIds, setAdoptedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('ecotrack_adopted_recs_v1') || '[]');
    } catch {
      return [];
    }
  });

  const isDemo = isDemoModeActive();

  useEffect(() => {
    const sync = () => {
      setActivities(getStoredActivities());
      setOnboarding(getStoredOnboarding());
    };
    return subscribeToStorage(sync);
  }, []);

  // Generate recommendations using the rule-based engine
  const allRecommendations = useMemo(() => {
    return recommendationEngine.generateRecommendations({
      onboarding,
      activities,
    });
  }, [onboarding, activities]);

  const filteredRecommendations = useMemo(() => {
    if (selectedFilter === 'all') return allRecommendations;
    return allRecommendations.filter(r => r.category === selectedFilter);
  }, [allRecommendations, selectedFilter]);

  const handleAdoptAction = (rec: Recommendation) => {
    if (adoptedIds.includes(rec.id)) return;
    const updated = [...adoptedIds, rec.id];
    setAdoptedIds(updated);
    try {
      localStorage.setItem('ecotrack_adopted_recs_v1', JSON.stringify(updated));
    } catch {}

    // Reward points for committing to sustainable action
    awardPoints(25);
    showToast({
      type: 'success',
      message: `Committed to: "${rec.title}"! +25 Eco Points awarded.`,
    });
  };

  const totalPotentialSavings = allRecommendations.reduce(
    (sum, r) => sum + r.estimatedMonthlyReductionKgCO2e,
    0
  );

  const hasActivityData = activities.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Action Recommendations
            </h2>
            <Badge variant="info" size="sm" className="gap-1 font-mono">
              <Cpu className="w-3 h-3" /> Rule-Based Engine
            </Badge>
            {isDemo && (
              <Badge variant="warning" size="sm" className="gap-1">
                <Sparkles className="w-3 h-3" /> Sample Data
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Deterministic carbon reduction strategies calculated from your travel, power, and waste logs.
          </p>
        </div>

        {/* Total potential savings badge */}
        <div className="p-2.5 px-3.5 rounded-xl bg-eco-50 dark:bg-eco-950/60 border border-eco-200 dark:border-eco-900 flex items-center gap-2 text-xs">
          <TrendingDown className="w-4 h-4 text-eco-600 dark:text-eco-400" />
          <span className="text-slate-600 dark:text-slate-300">
            Total Potential Impact: <strong className="text-eco-700 dark:text-eco-300 font-bold">-{totalPotentialSavings.toFixed(1)} kg CO2e / mo</strong>
          </span>
        </div>
      </div>

      {/* Engine Architecture Clarification Banner */}
      <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            Transparent Rule-Based Model (No LLM or Black-Box Calls)
          </p>
          <p className="text-[11px] leading-relaxed">
            All suggestions below are synthesized by our open-source deterministic rule engine in pure TypeScript. Each emission reduction figure is mathematically calculated using your activity quantities multiplied by published BEE, CEA, and CPCB emission factors.
          </p>
        </div>
      </div>

      {/* If No Activities Logged: Notice that tips are General Starter Tips */}
      {!hasActivityData && (
        <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-900/60 text-xs text-sky-800 dark:text-sky-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="info" size="sm">General starter tips</Badge>
            <span>You haven't logged personalized activities yet. Displaying initial starter recommendations.</span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 mr-1 text-[11px] flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filter by:
        </span>
        {[
          { id: 'all', label: 'All Recommendations' },
          { id: 'transportation', label: 'Transportation' },
          { id: 'electricity', label: 'Electricity & Cooling' },
          { id: 'waste_lifestyle', label: 'Waste & Diet' },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id as any)}
            className={`px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
              selectedFilter === filter.id
                ? 'border-eco-600 bg-eco-50 dark:bg-eco-950/70 text-eco-800 dark:text-eco-200 font-semibold'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecommendations.map(rec => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onAdoptAction={handleAdoptAction}
            isAdopted={adoptedIds.includes(rec.id)}
          />
        ))}
      </div>
    </div>
  );
};
