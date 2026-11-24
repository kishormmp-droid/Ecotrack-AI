import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Sparkles, Coins, HelpCircle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { 
  getStoredEcoState, 
  isDemoModeActive, 
  setDemoModeActive, 
  subscribeToStorage 
} from '../../services/storage';
import { Button } from '../ui/Button';

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Carbon Dashboard', subtitle: 'Real-time footprint breakdown & reduction metrics' },
  '/activities': { title: 'Activity Ledger', subtitle: 'Log, track, and audit personal carbon activities' },
  '/recommendations': { title: 'Action Recommendations', subtitle: 'Rule-based carbon reduction strategies' },
  '/challenges': { title: 'Eco Challenges & Badges', subtitle: 'Earn points and complete milestones' },
  '/satellite': { title: 'Satellite Earth Insights', subtitle: 'Regional context & environmental indicators' },
  '/how-we-calculate': { title: 'How We Calculate', subtitle: 'Transparent emission factors and methodologies' },
  '/settings': { title: 'Settings & Profile', subtitle: 'Data privacy, targets, and export/import' },
};

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [ecoPoints, setEcoPoints] = useState(0);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const update = () => {
      const state = getStoredEcoState();
      setEcoPoints(state.points);
      setIsDemo(isDemoModeActive());
    };
    update();
    return subscribeToStorage(update);
  }, []);

  const routeInfo = ROUTE_TITLES[location.pathname] || {
    title: 'EcoTrack AI',
    subtitle: 'Measure Your Impact. Understand Your Footprint.',
  };

  const handleToggleDemo = () => {
    if (isDemo) {
      setDemoModeActive(false);
      navigate('/dashboard');
    } else {
      setDemoModeActive(true);
      navigate('/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      <div>
        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
          {routeInfo.title}
        </h1>
        <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 font-normal">
          {routeInfo.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Demo Mode Pill */}
        {isDemo ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning-100 dark:bg-warning-950/70 border border-warning-300 dark:border-warning-800 text-[11px] font-semibold text-warning-800 dark:text-warning-300 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Sample Data Active</span>
            <button
              onClick={handleToggleDemo}
              className="ml-1 text-[10px] underline hover:text-warning-900 dark:hover:text-warning-100 cursor-pointer"
              title="Exit Demo Mode"
            >
              Exit
            </button>
          </div>
        ) : null}

        {/* Eco Points Pill */}
        <Link
          to="/challenges"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-eco-50 dark:bg-eco-950/70 border border-eco-200 dark:border-eco-800/80 text-eco-800 dark:text-eco-300 text-xs font-semibold hover:bg-eco-100 dark:hover:bg-eco-900/60 transition-colors"
          title="View Eco Points and Challenges"
        >
          <Coins className="w-3.5 h-3.5 text-eco-600 dark:text-eco-400" />
          <span>{ecoPoints}</span>
          <span className="hidden sm:inline text-[10px] text-eco-600 dark:text-eco-400">pts</span>
        </Link>

        {/* Method link */}
        <Link
          to="/how-we-calculate"
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="How We Calculate"
        >
          <HelpCircle className="w-4 h-4" />
        </Link>

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          className="w-8 h-8 p-0 rounded-lg text-slate-600 dark:text-slate-300"
        >
          {isDark ? <Sun className="w-4 h-4 text-warning-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </Button>
      </div>
    </header>
  );
};
