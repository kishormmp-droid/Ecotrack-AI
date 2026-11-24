import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, Sparkles, ShieldCheck, Compass, BarChart3, Award } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { setDemoModeActive, saveStoredOnboarding, saveActivityRecord } from '../../services/storage';
import { SAMPLE_ONBOARDING_DATA, getSampleActivities } from '../../data/sampleData';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartOnboarding = () => {
    navigate('/onboarding');
  };

  const handleEnterDemoMode = () => {
    // Populate sample data
    setDemoModeActive(true);
    saveStoredOnboarding(SAMPLE_ONBOARDING_DATA);
    const sampleActs = getSampleActivities();
    for (const act of sampleActs) {
      saveActivityRecord(act);
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-eco-50/50 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Navbar */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-eco-600 text-white shadow-md shadow-eco-600/30">
            <Leaf className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                EcoTrack
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-eco-100 text-eco-800 dark:bg-eco-950 dark:text-eco-300">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Carbon Intelligence Platform
            </p>
          </div>
        </div>

        <button
          onClick={handleEnterDemoMode}
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-eco-600 dark:hover:text-eco-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-eco-300"
        >
          <Sparkles className="w-3.5 h-3.5 text-warning-500" />
          <span>Explore Demo</span>
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto w-full my-auto text-center py-10 sm:py-16">
        {/* Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-eco-100/80 dark:bg-eco-950/80 border border-eco-200 dark:border-eco-800 text-eco-800 dark:text-eco-300 text-xs font-semibold mb-6 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Leaf className="w-3.5 h-3.5" />
          <span>Your Activities. Your Carbon Footprint. Your Impact.</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-6">
          Measure Your Impact. <br />
          <span className="bg-gradient-to-r from-eco-600 to-teal-500 bg-clip-text text-transparent">
            Understand Your Footprint.
          </span> <br />
          Build a Greener Future.
        </h1>

        {/* Value Proposition */}
        <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          EcoTrack AI delivers precision personal carbon auditing backed by official Indian CEA and IPCC emission models. Track transport, energy, and consumption without accounts, ads, or data tracking.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-12">
          <Button
            size="lg"
            onClick={handleStartOnboarding}
            className="w-full sm:w-auto text-base px-8 h-12 shadow-lg shadow-eco-600/25"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleEnterDemoMode}
            className="w-full sm:w-auto text-sm h-12 border-slate-300 dark:border-slate-700"
            leftIcon={<Sparkles className="w-4 h-4 text-warning-500" />}
          >
            Skip for now and explore with sample data
          </Button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
          <Card className="p-4 border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-eco-100 dark:bg-eco-950/80 flex items-center justify-center text-eco-600 dark:text-eco-400 mb-3">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Transparent Math
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every kg CO2e is tied directly to verified public datasets from CEA, BEE, and CPCB.
            </p>
          </Card>

          <Card className="p-4 border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-eco-100 dark:bg-eco-950/80 flex items-center justify-center text-eco-600 dark:text-eco-400 mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Privacy First
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              100% client-side storage. No account creation, no password, no tracking telemetry.
            </p>
          </Card>

          <Card className="p-4 border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-eco-100 dark:bg-eco-950/80 flex items-center justify-center text-eco-600 dark:text-eco-400 mb-3">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Actionable Guidance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Rule-based recommendations and eco-challenges designed for realistic Indian lifestyles.
            </p>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full py-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <p>© 2026 EcoTrack AI. Open carbon accounting for conscious living.</p>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-eco-600" />
            WCAG AA Compliant
          </span>
          <span>•</span>
          <span>Zero Server Overhead</span>
        </div>
      </footer>
    </div>
  );
};
