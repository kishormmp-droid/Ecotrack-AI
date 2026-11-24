import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Lightbulb, 
  Trophy, 
  Satellite, 
  Calculator, 
  Settings, 
  Leaf,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { isDemoModeActive } from '../../services/storage';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/activities', label: 'Activities', icon: PlusCircle },
  { path: '/recommendations', label: 'Recommendations', icon: Lightbulb },
  { path: '/challenges', label: 'Challenges', icon: Trophy },
  { path: '/satellite', label: 'Satellite Insights', icon: Satellite },
  { path: '/how-we-calculate', label: 'How We Calculate', icon: Calculator },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const isDemo = isDemoModeActive();

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-eco-600 text-white shadow-sm shadow-eco-600/30">
            <Leaf className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                EcoTrack
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-eco-100 text-eco-800 dark:bg-eco-950 dark:text-eco-300">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              Carbon Intelligence
            </p>
          </div>
        </div>

        {isDemo && (
          <div className="mt-3">
            <Badge variant="warning" size="sm" className="w-full justify-center gap-1">
              <Sparkles className="w-3 h-3" /> Demo Mode Active
            </Badge>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Main Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group",
                  isActive
                    ? "bg-eco-50 dark:bg-eco-950/70 text-eco-700 dark:text-eco-300 font-semibold shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors shrink-0",
                      isActive
                        ? "text-eco-600 dark:text-eco-400"
                        : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Mission */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          Your Impact Matters
        </p>
        <p className="mt-0.5 text-[10px] leading-relaxed text-slate-400 dark:text-slate-500">
          Measure Your Impact. Understand Your Footprint. Build a Greener Future.
        </p>
      </div>
    </aside>
  );
};
