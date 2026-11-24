import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Leaf, 
  Sparkles, 
  AlertCircle, 
  Shield, 
  TrendingDown, 
  Info,
  Zap,
  Car,
  Trash2,
  Lock
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Toggle } from '../../components/ui/Toggle';
import { OnboardingData, BaselineProfile } from '../../engine/types';
import { getStoredOnboarding, saveStoredOnboarding } from '../../services/storage';
import { calculateBaselineProfile, estimateElectricityMonthlyKwh } from '../../engine/calculator';
import { formatCO2 } from '../../lib/utils';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  // Load stored onboarding or defaults
  const [formData, setFormData] = useState<OnboardingData>(() => getStoredOnboarding());
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isBuildingProfile, setIsBuildingProfile] = useState<boolean>(false);
  const [calculatedProfile, setCalculatedProfile] = useState<BaselineProfile | null>(null);

  // Autosave to storage on any change
  useEffect(() => {
    saveStoredOnboarding(formData);
  }, [formData]);

  const updateField = <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updatePermissions = (field: keyof OnboardingData['permissions'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [field]: value,
      },
    }));
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => {
      const current = prev.goals || [];
      const updated = current.includes(goal)
        ? current.filter(g => g !== goal)
        : [...current, goal];
      return { ...prev, goals: updated };
    });
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) errs.name = 'Please provide your name or nickname.';
      if (!formData.city.trim()) errs.city = 'Please enter your city/region.';
    }

    if (step === 2) {
      if (formData.avgKmPerDay < 0 || isNaN(formData.avgKmPerDay)) {
        errs.avgKmPerDay = 'Average km per day must be 0 or greater.';
      }
    }

    if (step === 3) {
      if (formData.householdSize < 1 || isNaN(formData.householdSize)) {
        errs.householdSize = 'Household size must be at least 1.';
      }
      if (formData.dailyAcHours < 0 || formData.dailyAcHours > 24) {
        errs.dailyAcHours = 'AC hours must be between 0 and 24.';
      }
      if (formData.dailyLightingHours < 0 || formData.dailyLightingHours > 24) {
        errs.dailyLightingHours = 'Lighting hours must be between 0 and 24.';
      }
      if (formData.knowsMonthlyKwh && (formData.monthlyKwh < 0 || isNaN(formData.monthlyKwh))) {
        errs.monthlyKwh = 'Please enter a valid monthly kWh figure.';
      }
    }

    if (step === 5) {
      if (!formData.goals || formData.goals.length === 0) {
        errs.goals = 'Please select at least one environmental goal.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === 6) {
      // Transition to Step 7 (Profile Generation)
      setCurrentStep(7);
      setIsBuildingProfile(true);

      const profile = calculateBaselineProfile(formData);
      setCalculatedProfile(profile);

      // Simulate a brief calculation delay for polish
      setTimeout(() => {
        setIsBuildingProfile(false);
        saveStoredOnboarding({
          ...formData,
          completed: true,
          completedAt: new Date().toISOString(),
        });
      }, 1200);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/welcome');
    }
  };

  const handleFinishToDashboard = () => {
    navigate('/dashboard');
  };

  // Electricity estimate helper for step 3
  const elecEstimate = estimateElectricityMonthlyKwh(
    formData.dailyAcHours,
    formData.dailyLightingHours,
    formData.householdSize
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto w-full">
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-eco-600 text-white flex items-center justify-center">
              <Leaf className="w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">EcoTrack AI</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Step {currentStep} of 7
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={7}>
          <div
            className="bg-eco-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          />
        </div>

        {/* Questionnaire Card */}
        <Card className="shadow-card border-slate-200/80 dark:border-slate-800">
          {/* STEP 1: ABOUT YOU */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle>About You</CardTitle>
                <CardDescription>
                  Tell us a bit about yourself so we can calibrate regional grid factors and urban profiles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Your Name or Alias *"
                  value={formData.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder="e.g. Priya"
                  error={errors.name}
                />
                <Input
                  label="City / District *"
                  value={formData.city}
                  onChange={e => updateField('city', e.target.value)}
                  placeholder="e.g. Bengaluru, New Delhi, Pune"
                  error={errors.city}
                  helperText="Used to contextualize grid carbon intensity and regional transit benchmarks."
                />
                <Select
                  label="Age Group"
                  value={formData.ageGroup}
                  onChange={e => updateField('ageGroup', e.target.value as OnboardingData['ageGroup'])}
                  options={[
                    { value: 'Under 18', label: 'Under 18' },
                    { value: '18-25', label: '18–25' },
                    { value: '26-40', label: '26–40' },
                    { value: '41-60', label: '41–60' },
                    { value: '60+', label: '60+' },
                  ]}
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Area Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Urban', 'Suburban', 'Rural'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateField('areaType', type)}
                        className={`p-3 text-xs font-medium rounded-lg border text-center transition-all ${
                          formData.areaType === type
                            ? 'border-eco-600 bg-eco-50 dark:bg-eco-950/70 text-eco-700 dark:text-eco-300 font-semibold ring-1 ring-eco-600'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* STEP 2: TRANSPORTATION */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle>Transportation Profile</CardTitle>
                <CardDescription>
                  Mobility represents a key portion of personal emissions. Select your routine transit pattern.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Primary Daily Mode of Commute
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {(['Walking', 'Cycling', 'Two-wheeler', 'Car', 'Bus', 'Train'] as const).map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => updateField('primaryTransport', mode)}
                        className={`p-3 text-xs font-medium rounded-lg border text-left flex items-center justify-between transition-all ${
                          formData.primaryTransport === mode
                            ? 'border-eco-600 bg-eco-50 dark:bg-eco-950/70 text-eco-700 dark:text-eco-300 font-semibold ring-1 ring-eco-600'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{mode}</span>
                        {formData.primaryTransport === mode && <Check className="w-3.5 h-3.5 text-eco-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label="Average Distance Traveled Per Day (km)"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.avgKmPerDay}
                  onChange={e => updateField('avgKmPerDay', parseFloat(e.target.value) || 0)}
                  error={errors.avgKmPerDay}
                  helperText="Include two-way commute and general neighborhood errands."
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Public Transport Frequency (Bus, Metro, Train)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(['Never', 'Rarely', 'Weekly', 'Several times a week', 'Daily'] as const).map(freq => (
                      <label
                        key={freq}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          formData.publicTransportFreq === freq
                            ? 'border-eco-600 bg-eco-50 dark:bg-eco-950/60 text-eco-900 dark:text-eco-200 font-medium'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="publicTransportFreq"
                          checked={formData.publicTransportFreq === freq}
                          onChange={() => updateField('publicTransportFreq', freq)}
                          className="text-eco-600 focus:ring-eco-500"
                        />
                        <span>{freq}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* STEP 3: ELECTRICITY */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle>Home Electricity Profile</CardTitle>
                <CardDescription>
                  Grid electricity is allocated per household size. You can enter your monthly kWh or let us estimate it transparently.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Daily AC Hours"
                    type="number"
                    min="0"
                    max="24"
                    value={formData.dailyAcHours}
                    onChange={e => updateField('dailyAcHours', parseFloat(e.target.value) || 0)}
                    error={errors.dailyAcHours}
                  />
                  <Input
                    label="Daily Lighting Hours"
                    type="number"
                    min="0"
                    max="24"
                    value={formData.dailyLightingHours}
                    onChange={e => updateField('dailyLightingHours', parseFloat(e.target.value) || 0)}
                    error={errors.dailyLightingHours}
                  />
                  <Input
                    label="Household Size"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.householdSize}
                    onChange={e => updateField('householdSize', parseInt(e.target.value, 10) || 1)}
                    error={errors.householdSize}
                    helperText="Number of occupants"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Do you know your monthly electricity consumption (kWh)?
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="knowsKwh"
                          checked={formData.knowsMonthlyKwh}
                          onChange={() => updateField('knowsMonthlyKwh', true)}
                          className="text-eco-600 focus:ring-eco-500"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="knowsKwh"
                          checked={!formData.knowsMonthlyKwh}
                          onChange={() => updateField('knowsMonthlyKwh', false)}
                          className="text-eco-600 focus:ring-eco-500"
                        />
                        <span>No, estimate it</span>
                      </label>
                    </div>
                  </div>

                  {formData.knowsMonthlyKwh ? (
                    <Input
                      label="Monthly Electricity Bill Units (kWh)"
                      type="number"
                      min="0"
                      value={formData.monthlyKwh}
                      onChange={e => updateField('monthlyKwh', parseFloat(e.target.value) || 0)}
                      error={errors.monthlyKwh}
                      helperText="Check your electricity bill for total units consumed (kWh)."
                    />
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2">
                      <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-warning-500" />
                          Estimated Monthly Household Usage:
                        </span>
                        <span className="text-eco-600 dark:text-eco-400 font-bold text-sm">
                          {elecEstimate.monthlyKwh} kWh / month
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                        <p className="font-medium text-slate-700 dark:text-slate-300">Calculation breakdown:</p>
                        <p>• AC runtime ({formData.dailyAcHours} hrs/day × 1.2 kW × 30 days): {elecEstimate.breakdown.acKwh} kWh</p>
                        <p>• Lighting ({formData.dailyLightingHours} hrs/day × 0.04 kW × 30 days): {elecEstimate.breakdown.lightingKwh} kWh</p>
                        <p>• Household baseline (refrigerator, fans, standby): {elecEstimate.breakdown.baselineAppliancesKwh} kWh</p>
                        <p className="pt-1 text-[10px] text-slate-500 italic">
                          Per-person share: {(elecEstimate.monthlyKwh / Math.max(1, formData.householdSize)).toFixed(1)} kWh/month based on your household size of {formData.householdSize}.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </>
          )}

          {/* STEP 4: WASTE AND LIFESTYLE */}
          {currentStep === 4 && (
            <>
              <CardHeader>
                <CardTitle>Waste & Diet Patterns</CardTitle>
                <CardDescription>
                  Solid waste disposal methods and dietary profiles influence lifecycle methane and agricultural impacts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Household Waste Handling Method
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(['Mixed', 'Segregated', 'Composted', 'Recycled regularly'] as const).map(method => (
                      <label
                        key={method}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          formData.wasteMethod === method
                            ? 'border-eco-600 bg-eco-50 dark:bg-eco-950/60 text-eco-900 dark:text-eco-200 font-medium'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="wasteMethod"
                          checked={formData.wasteMethod === method}
                          onChange={() => updateField('wasteMethod', method)}
                          className="text-eco-600 focus:ring-eco-500"
                        />
                        <span>{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Single-Use Plastic Frequency (Bags, Cups, Packaging)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Daily', 'Weekly', 'Rarely', 'Never'] as const).map(freq => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => updateField('singleUsePlasticFreq', freq)}
                        className={`p-2.5 text-xs font-medium rounded-lg border text-center transition-all ${
                          formData.singleUsePlasticFreq === freq
                            ? 'border-eco-600 bg-eco-50 dark:bg-eco-950/70 text-eco-700 dark:text-eco-300 font-semibold ring-1 ring-eco-600'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    General Food Preference
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(['Vegetarian', 'Non-vegetarian', 'Mixed'] as const).map(pref => (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => updateField('foodPreference', pref)}
                        className={`p-3 text-xs font-medium rounded-lg border text-center transition-all ${
                          formData.foodPreference === pref
                            ? 'border-eco-600 bg-eco-50 dark:bg-eco-950/70 text-eco-700 dark:text-eco-300 font-semibold ring-1 ring-eco-600'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* STEP 5: GOALS */}
          {currentStep === 5 && (
            <>
              <CardHeader>
                <CardTitle>What are your sustainability goals?</CardTitle>
                <CardDescription>
                  Select the target areas where you want to focus your reductions and earn eco-points.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: 'reduce carbon footprint', label: 'Reduce Overall Carbon Footprint', desc: 'Lower net monthly GHG emissions systematically' },
                  { id: 'save electricity', label: 'Save Electricity', desc: 'Cut cooling and appliance power wastage' },
                  { id: 'reduce plastic', label: 'Reduce Single-Use Plastic', desc: 'Eliminate disposable takeaway and polymer packaging' },
                  { id: 'adopt sustainable transport', label: 'Adopt Sustainable Transport', desc: 'Prioritize walking, cycling, bus, and metro' },
                  { id: 'track environmental impact', label: 'Track Environmental Impact', desc: 'Maintain clean, data-driven activity history' },
                  { id: 'join eco challenges', label: 'Join Eco Challenges', desc: 'Compete in daily goals and unlock achievement badges' },
                ].map(goal => {
                  const isChecked = formData.goals.includes(goal.id);
                  return (
                    <label
                      key={goal.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'border-eco-600 bg-eco-50 dark:bg-eco-950/70 text-slate-900 dark:text-white ring-1 ring-eco-600'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleGoal(goal.id)}
                        className="mt-0.5 rounded text-eco-600 focus:ring-eco-500"
                      />
                      <div>
                        <span className="font-semibold block">{goal.label}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{goal.desc}</span>
                      </div>
                    </label>
                  );
                })}
                {errors.goals && (
                  <p className="text-xs text-danger-600 dark:text-danger-400 font-medium">{errors.goals}</p>
                )}
              </CardContent>
            </>
          )}

          {/* STEP 6: PERMISSIONS */}
          {currentStep === 6 && (
            <>
              <CardHeader>
                <CardTitle>Permissions & Data Privacy</CardTitle>
                <CardDescription>
                  EcoTrack AI respects your privacy. All data is saved strictly inside your browser unless Supabase cloud sync is configured.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Toggle
                  checked={formData.permissions.locationAccess}
                  onChange={c => updatePermissions('locationAccess', c)}
                  label="Location Access (City & Regional Insights)"
                  description="Allows the app to automatically detect your local region for satellite indicators. Manual city selection is always supported."
                />
                <Toggle
                  checked={formData.permissions.gpsTracking}
                  onChange={c => updatePermissions('gpsTracking', c)}
                  label="GPS Trip Distance Tracking"
                  description="Optionally measure walking, cycling, or transit trip distance using device geolocation. Never runs in the background."
                />
                <Toggle
                  checked={formData.permissions.saveLocally}
                  onChange={c => updatePermissions('saveLocally', c)}
                  label="Save Activity Ledger in LocalStorage"
                  description="Stores your onboarding answers and activity records safely in your browser storage so they survive refreshes."
                />

                <div className="p-4 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-start gap-3 mt-4">
                  <Shield className="w-5 h-5 text-eco-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Plain-Language Privacy Commitment
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      EcoTrack AI does not have an authentication server or backend database. We do not sell data, track your IP, or collect telemetry. Manual entry is always available, and you can export or delete your entire ledger at any time in Settings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* STEP 7: PROFILE GENERATION */}
          {currentStep === 7 && (
            <>
              {isBuildingProfile ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-eco-100 dark:bg-eco-950 flex items-center justify-center text-eco-600 dark:text-eco-400 animate-pulse shadow-md">
                    <Sparkles className="w-7 h-7 animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Building your carbon profile...
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Synthesizing transportation patterns, grid factor coefficients, and baseline reduction opportunities.
                  </p>
                </div>
              ) : calculatedProfile ? (
                <div className="space-y-6">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-eco-600 dark:text-eco-400 font-semibold text-xs mb-1">
                      <Check className="w-4 h-4" /> Baseline Calibrated Successfully
                    </div>
                    <CardTitle>Your Estimated Baseline Carbon Footprint</CardTitle>
                    <CardDescription>
                      Calculated from your lifestyle responses using CEA & IPCC emission standards.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Big Metric Display */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                      <div className="p-4 rounded-xl bg-eco-50 dark:bg-eco-950/60 border border-eco-200 dark:border-eco-900">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Daily Baseline</span>
                        <span className="text-xl font-bold text-eco-700 dark:text-eco-300">
                          {calculatedProfile.dailyBaselineKgCO2e} <span className="text-xs font-normal">kg CO2e</span>
                        </span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Monthly Baseline</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                          {calculatedProfile.monthlyBaselineKgCO2e} <span className="text-xs font-normal">kg CO2e</span>
                        </span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Yearly Projected</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                          {formatCO2(calculatedProfile.yearlyBaselineKgCO2e)}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown by Category */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                        Monthly Footprint Breakdown
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Car className="w-3.5 h-3.5 text-sky-500" /> Transportation
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {calculatedProfile.breakdown.transportation} kg CO2e
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-sky-500 h-full rounded-full" 
                            style={{ width: `${Math.min(100, (calculatedProfile.breakdown.transportation / calculatedProfile.monthlyBaselineKgCO2e) * 100)}%` }} 
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Zap className="w-3.5 h-3.5 text-warning-500" /> Electricity & Cooling
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {calculatedProfile.breakdown.electricity} kg CO2e
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-warning-500 h-full rounded-full" 
                            style={{ width: `${Math.min(100, (calculatedProfile.breakdown.electricity / calculatedProfile.monthlyBaselineKgCO2e) * 100)}%` }} 
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Trash2 className="w-3.5 h-3.5 text-eco-500" /> Waste & Lifestyle
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {calculatedProfile.breakdown.waste_lifestyle} kg CO2e
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-eco-500 h-full rounded-full" 
                            style={{ width: `${Math.min(100, (calculatedProfile.breakdown.waste_lifestyle / calculatedProfile.monthlyBaselineKgCO2e) * 100)}%` }} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Starter Recommendations (Labelled "General starter tip") */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Starter Recommendations
                        </h4>
                        <Badge variant="info" size="sm">General starter tip</Badge>
                      </div>
                      <div className="space-y-2">
                        {calculatedProfile.starterRecommendations.map(rec => (
                          <div
                            key={rec.id}
                            className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {rec.title}
                              </span>
                              <span className="text-[11px] font-semibold text-eco-600 dark:text-eco-400">
                                -{rec.estimatedMonthlyReductionKgCO2e} kg/mo
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {rec.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </div>
              ) : null}
            </>
          )}

          {/* Navigation Footer */}
          <CardFooter className="flex items-center justify-between pt-4">
            {currentStep < 7 ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  size="sm"
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  {currentStep === 1 ? 'Cancel' : 'Back'}
                </Button>
                <Button
                  onClick={handleNext}
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {currentStep === 6 ? 'Generate Profile' : 'Next'}
                </Button>
              </>
            ) : !isBuildingProfile && calculatedProfile ? (
              <Button
                onClick={handleFinishToDashboard}
                size="md"
                className="w-full text-sm font-semibold"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Go to Dashboard
              </Button>
            ) : null}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
