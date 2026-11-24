import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Sparkles, 
  Target, 
  HelpCircle, 
  Lightbulb, 
  Trophy, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { 
  getStoredActivities, 
  getStoredOnboarding, 
  getStoredEcoState, 
  isDemoModeActive, 
  setDemoModeActive,
  saveStoredOnboarding,
  saveActivityRecord,
  subscribeToStorage 
} from '../../services/storage';
import { 
  calculateSummary, 
  buildDailyTrendSeries, 
  calculateBaselineProfile 
} from '../../engine/calculator';
import { getTodayString } from '../../lib/dateUtils';
import { SummaryCards } from './components/SummaryCards';
import { DailyEmissionChart } from './components/DailyEmissionChart';
import { WeeklyComparisonChart } from './components/WeeklyComparisonChart';
import { CategoryDonutChart } from './components/CategoryDonutChart';
import { TargetProgressCard } from './components/TargetProgressCard';
import { SAMPLE_ONBOARDING_DATA, getSampleActivities } from '../../data/sampleData';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState(() => getStoredActivities());
  const [onboarding, setOnboarding] = useState(() => getStoredOnboarding());
  const [ecoState, setEcoState] = useState(() => getStoredEcoState());
  const [timeView, setTimeView] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'transportation' | 'electricity' | 'waste_lifestyle'>('all');

  const isDemo = isDemoModeActive();

  useEffect(() => {
    const sync = () => {
      setActivities(getStoredActivities());
      setOnboarding(getStoredOnboarding());
      setEcoState(getStoredEcoState());
    };
    return subscribeToStorage(sync);
  }, []);

  const todayStr = getTodayString();
  const baseline = useMemo(() => calculateBaselineProfile(onboarding), [onboarding]);

  // If user has not completed onboarding and has no activities, redirect or prompt
  const hasData = activities.length > 0;

  // Active records: filter by selected category if user has picked one
  const activeRecords = useMemo(() => {
    if (selectedCategory === 'all') return activities;
    return activities.filter(a => a.category === selectedCategory);
  }, [activities, selectedCategory]);

  const summary = useMemo(() => calculateSummary(activeRecords, todayStr), [activeRecords, todayStr]);
  const dailySeries = useMemo(() => buildDailyTrendSeries(activeRecords, 7, todayStr), [activeRecords, todayStr]);

  const handleEnableDemo = () => {
    setDemoModeActive(true);
    saveStoredOnboarding(SAMPLE_ONBOARDING_DATA);
    for (const act of getSampleActivities()) {
      saveActivityRecord(act);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Hero Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Carbon Footprint Overview
            </h2>
            {isDemo && (
              <Badge variant="warning" size="sm" className="gap-1">
                <Sparkles className="w-3 h-3" /> Sample Data
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time carbon emissions accounting for {onboarding.name || 'Your Profile'} ({onboarding.city || 'National Benchmark'}).
          </p>
        </div>

        {/* Dashboard Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-900 text-xs font-medium">
            <button
              onClick={() => setTimeView('weekly')}
              className={`px-3 py-1 rounded-md transition-all ${
                timeView === 'weekly'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeView('monthly')}
              className={`px-3 py-1 rounded-md transition-all ${
                timeView === 'monthly'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Monthly
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => navigate('/activities')}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Log Activity
          </Button>
        </div>
      </div>

      {/* If No Data & Not Demo Mode: Show Empty State */}
      {!hasData && !isDemo ? (
        <Card className="p-8 text-center border-dashed border-2 border-slate-200 dark:border-slate-800">
          <EmptyState
            icon={<Activity className="w-8 h-8 text-eco-600" />}
            title="Log Your First Activity"
            description="You don't have any carbon footprint records saved yet. Track your vehicle commute, household electricity, or waste to generate real-time charts."
            actionLabel="Log First Activity"
            onAction={() => navigate('/activities')}
          />
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2">
            <span className="text-xs text-slate-500">Or want to preview the dashboard with sample data?</span>
            <button
              onClick={handleEnableDemo}
              className="text-xs font-semibold text-eco-600 dark:text-eco-400 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-warning-500" />
              Load Sample Data
            </button>
          </div>
        </Card>
      ) : (
        <>
          {/* 1. Summary Cards Strip */}
          <SummaryCards
            summary={summary}
            baseline={baseline}
            ecoPoints={ecoState.points}
            isDemo={isDemo}
          />

          {/* 2. Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
            <span className="text-slate-500 mr-1 text-[11px]">Filter Charts:</span>
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'transportation', label: 'Transportation' },
              { id: 'electricity', label: 'Electricity' },
              { id: 'waste_lifestyle', label: 'Waste & Diet' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1 rounded-full border transition-all text-xs ${
                  selectedCategory === cat.id
                    ? 'border-eco-600 bg-eco-50 dark:bg-eco-950/70 text-eco-800 dark:text-eco-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 3. Primary Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Daily Footprint Chart */}
            <DailyEmissionChart data={dailySeries} isDemo={isDemo} />

            {/* Weekly Comparison Chart */}
            <WeeklyComparisonChart
              thisWeekTotal={summary.thisWeekKgCO2e}
              lastWeekTotal={summary.lastWeekKgCO2e}
              categoryBreakdownThisWeek={summary.categoryBreakdown}
              isDemo={isDemo}
            />
          </div>

          {/* 4. Secondary Grid: Donut Breakdown + Target Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Category Donut Chart */}
            <CategoryDonutChart
              breakdown={summary.categoryBreakdown}
              isDemo={isDemo}
            />

            {/* Target Reduction Progress */}
            <TargetProgressCard
              monthlyEmissions={summary.thisMonthKgCO2e}
              monthlyTargetKg={ecoState.monthlyTargetKgCO2e || 80}
              baselineMonthlyKg={baseline.monthlyBaselineKgCO2e}
            />
          </div>

          {/* 5. Quick Action Links Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              to="/recommendations"
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-card transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-eco-100 dark:bg-eco-950/80 flex items-center justify-center text-eco-600 dark:text-eco-400">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-eco-600 dark:group-hover:text-eco-400 transition-colors">
                    Rule-Based Insights
                  </h4>
                  <p className="text-[11px] text-slate-500">View tailored reduction actions</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/challenges"
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-card transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-eco-100 dark:bg-eco-950/80 flex items-center justify-center text-eco-600 dark:text-eco-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-eco-600 dark:group-hover:text-eco-400 transition-colors">
                    Eco Challenges
                  </h4>
                  <p className="text-[11px] text-slate-500">Complete tasks & earn points</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/satellite"
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-card transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-eco-100 dark:bg-eco-950/80 flex items-center justify-center text-eco-600 dark:text-eco-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-eco-600 dark:group-hover:text-eco-400 transition-colors">
                    Satellite Earth Data
                  </h4>
                  <p className="text-[11px] text-slate-500">Regional vegetation & context</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
};
