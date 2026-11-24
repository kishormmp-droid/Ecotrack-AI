import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Toggle } from '../../components/ui/Toggle';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { 
  getStoredOnboarding, 
  saveStoredOnboarding, 
  getStoredEcoState, 
  saveStoredEcoState, 
  resetAllData, 
  clearActivitiesOnly, 
  subscribeToStorage 
} from '../../services/storage';
import { OnboardingData, UserEcoState } from '../../engine/types';
import { EMISSION_FACTOR_VERSION } from '../../data/emissionFactors';
import { 
  exportDataAsJSON, 
  exportActivitiesAsCSV, 
  validateAndImportJSON 
} from '../../services/exportImport';
import { 
  Settings, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  ShieldAlert, 
  Target, 
  Save, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [onboarding, setOnboarding] = useState<OnboardingData>(() => getStoredOnboarding());
  const [ecoState, setEcoState] = useState<UserEcoState>(() => getStoredEcoState());
  const [monthlyTargetInput, setMonthlyTargetInput] = useState<number>(ecoState.monthlyTargetKgCO2e || 80);

  // Modals state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [isDisableSaveModalOpen, setIsDisableSaveModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => {
      setOnboarding(getStoredOnboarding());
      const state = getStoredEcoState();
      setEcoState(state);
      setMonthlyTargetInput(state.monthlyTargetKgCO2e || 80);
    };
    return subscribeToStorage(sync);
  }, []);

  const handleSaveOnboarding = () => {
    saveStoredOnboarding(onboarding);
    showToast({
      type: 'success',
      message: 'Profile settings updated successfully.',
    });
  };

  const handleSaveTarget = () => {
    if (monthlyTargetInput <= 0 || isNaN(monthlyTargetInput)) {
      showToast({ type: 'danger', message: 'Target must be greater than 0 kg CO2e.' });
      return;
    }
    saveStoredEcoState({ monthlyTargetKgCO2e: monthlyTargetInput });
    showToast({
      type: 'success',
      message: `Monthly carbon target updated to ${monthlyTargetInput} kg CO2e.`,
    });
  };

  const handleToggleSaveLocally = (enabled: boolean) => {
    if (!enabled) {
      // Prompt confirmation before turning off saveLocally
      setIsDisableSaveModalOpen(true);
    } else {
      setOnboarding(prev => {
        const next = { ...prev, permissions: { ...prev.permissions, saveLocally: true } };
        saveStoredOnboarding(next);
        return next;
      });
      showToast({ type: 'info', message: 'Local storage saving enabled.' });
    }
  };

  const confirmDisableSaving = () => {
    clearActivitiesOnly();
    setOnboarding(prev => {
      const next = { ...prev, permissions: { ...prev.permissions, saveLocally: false } };
      saveStoredOnboarding(next);
      return next;
    });
    setIsDisableSaveModalOpen(false);
    showToast({
      type: 'warning',
      message: 'Local saving disabled and stored activity records purged.',
    });
  };

  const confirmResetAll = () => {
    resetAllData();
    setIsResetModalOpen(false);
    showToast({
      type: 'info',
      message: 'All application data has been reset to defaults.',
    });
    navigate('/welcome');
  };

  const confirmRegenerateProfile = () => {
    setIsRegenerateModalOpen(false);
    navigate('/onboarding');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = validateAndImportJSON(content);
      if (res.success) {
        showToast({
          type: 'success',
          message: res.message,
        });
      } else {
        showToast({
          type: 'danger',
          message: res.message,
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Settings & Privacy
            </h2>
            <Badge variant="default" size="sm">
              Factor v{EMISSION_FACTOR_VERSION}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your personal profile, monthly targets, backup exports, and browser permissions.
          </p>
        </div>
      </div>

      {/* 1. Monthly Reduction Target */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-eco-600" /> Monthly Carbon Target
          </CardTitle>
          <CardDescription>
            Set the monthly greenhouse emission ceiling (kg CO2e) for your reduction progress card.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 max-w-sm">
            <Input
              label="Target Limit (kg CO2e / month)"
              type="number"
              min="1"
              value={monthlyTargetInput}
              onChange={e => setMonthlyTargetInput(parseFloat(e.target.value) || 0)}
              rightAddon="kg"
            />
            <Button size="sm" onClick={handleSaveTarget}>
              Save Target
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Onboarding Lifestyle Answers (View and Edit) */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm">Personal Profile & Lifestyle Inputs</CardTitle>
            <CardDescription>
              Update your location, commute mode, or household size to fine-tune your baseline.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsRegenerateModalOpen(true)}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Regenerate Baseline
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Name or Alias"
              value={onboarding.name}
              onChange={e => setOnboarding(p => ({ ...p, name: e.target.value }))}
            />
            <Input
              label="City / District"
              value={onboarding.city}
              onChange={e => setOnboarding(p => ({ ...p, city: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Primary Transport Mode"
              value={onboarding.primaryTransport}
              onChange={e => setOnboarding(p => ({ ...p, primaryTransport: e.target.value as any }))}
              options={[
                { value: 'Walking', label: 'Walking' },
                { value: 'Cycling', label: 'Cycling' },
                { value: 'Two-wheeler', label: 'Two-wheeler' },
                { value: 'Car', label: 'Car' },
                { value: 'Bus', label: 'Bus' },
                { value: 'Train', label: 'Train' },
              ]}
            />
            <Input
              label="Daily Commute Distance (km)"
              type="number"
              min="0"
              value={onboarding.avgKmPerDay}
              onChange={e => setOnboarding(p => ({ ...p, avgKmPerDay: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label="Household Occupants"
              type="number"
              min="1"
              value={onboarding.householdSize}
              onChange={e => setOnboarding(p => ({ ...p, householdSize: parseInt(e.target.value, 10) || 1 }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Daily AC Hours"
              type="number"
              min="0"
              max="24"
              value={onboarding.dailyAcHours}
              onChange={e => setOnboarding(p => ({ ...p, dailyAcHours: parseFloat(e.target.value) || 0 }))}
            />
            <Select
              label="Waste Handling Method"
              value={onboarding.wasteMethod}
              onChange={e => setOnboarding(p => ({ ...p, wasteMethod: e.target.value as any }))}
              options={[
                { value: 'Mixed', label: 'Mixed' },
                { value: 'Segregated', label: 'Segregated' },
                { value: 'Composted', label: 'Composted' },
                { value: 'Recycled regularly', label: 'Recycled regularly' },
              ]}
            />
            <Select
              label="Dietary Pattern"
              value={onboarding.foodPreference}
              onChange={e => setOnboarding(p => ({ ...p, foodPreference: e.target.value as any }))}
              options={[
                { value: 'Vegetarian', label: 'Vegetarian' },
                { value: 'Non-vegetarian', label: 'Non-vegetarian' },
                { value: 'Mixed', label: 'Mixed' },
              ]}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button size="sm" onClick={handleSaveOnboarding} leftIcon={<Save className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Browser Permissions & Privacy */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Browser Permissions</CardTitle>
          <CardDescription>
            Control on-device features and data retention.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Toggle
            checked={onboarding.permissions.locationAccess}
            onChange={c => {
              const next = { ...onboarding, permissions: { ...onboarding.permissions, locationAccess: c } };
              setOnboarding(next);
              saveStoredOnboarding(next);
            }}
            label="Location Access"
            description="Used to benchmark your regional grid intensity. Never uploaded to servers."
          />
          <Toggle
            checked={onboarding.permissions.gpsTracking}
            onChange={c => {
              const next = { ...onboarding, permissions: { ...onboarding.permissions, gpsTracking: c } };
              setOnboarding(next);
              saveStoredOnboarding(next);
            }}
            label="GPS Trip Distance Tracking"
            description="Allows real-time transit distance estimation when activated during a trip."
          />
          <Toggle
            checked={onboarding.permissions.saveLocally}
            onChange={handleToggleSaveLocally}
            label="Save Activity Data Locally"
            description="Retain your activities in your browser localStorage. Turning this off clears stored activity."
          />
        </CardContent>
      </Card>

      {/* 4. Export & Import Data */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Data Export & Backup</CardTitle>
          <CardDescription>
            You own your climate data. Export your ledger or import a prior JSON backup anytime.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={exportDataAsJSON}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export Full Backup (JSON)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportActivitiesAsCSV}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export Activities (CSV)
            </Button>
            <label className="inline-flex">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
              <span className="inline-flex items-center justify-center font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs px-2.5 py-1.5 gap-1.5 h-8 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import JSON Backup</span>
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* 5. Danger Zone / Reset All Data */}
      <Card className="border-danger-200 dark:border-danger-900/60 bg-danger-50/20 dark:bg-danger-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-danger-700 dark:text-danger-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Reset Application Data
          </CardTitle>
          <CardDescription>
            Irreversibly delete all local activities, onboarding responses, and gamification points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsResetModalOpen(true)}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Reset All Data
          </Button>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Confirm Application Reset"
        description="Are you absolutely sure you want to reset all data?"
        size="sm"
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            This action will wipe your entire local activity history, baseline onboarding calibration, eco points, and badges. This cannot be undone unless you have a JSON backup file.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={confirmResetAll}>
              Yes, Delete Everything
            </Button>
          </div>
        </div>
      </Modal>

      {/* Regenerate Profile Confirmation Dialog */}
      <Modal
        isOpen={isRegenerateModalOpen}
        onClose={() => setIsRegenerateModalOpen(false)}
        title="Regenerate Carbon Profile"
        description="Recalculate baseline carbon footprint from scratch."
        size="sm"
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            You will be guided back to the 7-step questionnaire. Your baseline footprint will be recalculated according to your updated commute, power, and diet inputs. Your existing activity records will remain safe.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsRegenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={confirmRegenerateProfile}>
              Proceed to Onboarding
            </Button>
          </div>
        </div>
      </Modal>

      {/* Turn Off Local Storage Confirmation Dialog */}
      <Modal
        isOpen={isDisableSaveModalOpen}
        onClose={() => setIsDisableSaveModalOpen(false)}
        title="Disable Local Activity Saving?"
        description="Turning off local saving will clear stored activities."
        size="sm"
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Per strict privacy guidelines, disabling local activity storage will clear all currently stored activity records from your browser. Are you sure you wish to proceed?
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDisableSaveModalOpen(false)}>
              Keep Saving
            </Button>
            <Button variant="danger" size="sm" onClick={confirmDisableSaving}>
              Disable & Clear
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
