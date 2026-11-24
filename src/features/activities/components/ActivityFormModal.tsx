import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { 
  ActivityRecord, 
  ActivityCategory, 
  ActivityType,
  ActivitySource 
} from '../../../engine/types';
import { ACTIVITY_TYPE_METADATA, getEmissionFactor } from '../../../data/emissionFactors';
import { calculateActivityEmission } from '../../../engine/calculator';
import { getTodayString } from '../../../lib/dateUtils';
import { getStoredOnboarding } from '../../../services/storage';
import { AlertTriangle, Check, Info } from 'lucide-react';

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: ActivityRecord) => void;
  initialRecord?: ActivityRecord | null;
}

export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRecord,
}) => {
  const [category, setCategory] = useState<ActivityCategory>('transportation');
  const [activityType, setActivityType] = useState<ActivityType>('car');
  const [quantity, setQuantity] = useState<number>(10);
  const [date, setDate] = useState<string>(getTodayString());
  const [notes, setNotes] = useState<string>('');
  const [source, setSource] = useState<ActivitySource>('manual');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onboarding = getStoredOnboarding();
  const householdSize = onboarding.householdSize || 1;

  useEffect(() => {
    if (initialRecord) {
      setCategory(initialRecord.category);
      setActivityType(initialRecord.activityType);
      setQuantity(initialRecord.quantity);
      setDate(initialRecord.date);
      setNotes(initialRecord.notes || '');
      setSource(initialRecord.source);
    } else {
      setCategory('transportation');
      setActivityType('car');
      setQuantity(10);
      setDate(getTodayString());
      setNotes('');
      setSource('manual');
    }
    setErrors({});
  }, [initialRecord, isOpen]);

  // Handle category change: update activityType default
  const handleCategoryChange = (cat: ActivityCategory) => {
    setCategory(cat);
    if (cat === 'transportation') setActivityType('car');
    else if (cat === 'electricity') setActivityType('ac_hours');
    else if (cat === 'waste_lifestyle') setActivityType('waste_segregated');
  };

  const meta = ACTIVITY_TYPE_METADATA[activityType] || {
    label: activityType,
    unit: 'units',
    description: '',
  };

  const emissionFactor = getEmissionFactor(activityType);
  const currentEmission = calculateActivityEmission(activityType, quantity, householdSize);

  // Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (quantity < 0 || isNaN(quantity)) {
      errs.quantity = 'Quantity cannot be negative.';
    }
    if (!date) {
      errs.date = 'Date is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const record: ActivityRecord = {
      id: initialRecord ? initialRecord.id : `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category,
      activityType,
      quantity: Number(quantity),
      unit: meta.unit,
      date,
      notes: notes.trim() || undefined,
      source,
      emissionKgCO2e: currentEmission,
      createdAt: initialRecord ? initialRecord.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(record);
    onClose();
  };

  // Warning when transport > 500 km (requirement: warning, not a block)
  const isHighDistanceWarning = category === 'transportation' && quantity > 500;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialRecord ? 'Edit Activity Record' : 'Log Carbon Activity'}
      description="Add verified personal transport, electricity, or lifestyle activities to your ledger."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Activity Pillar
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'transportation', label: 'Transport' },
              { id: 'electricity', label: 'Electricity' },
              { id: 'waste_lifestyle', label: 'Waste & Diet' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id as ActivityCategory)}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                  category === cat.id
                    ? 'border-eco-600 bg-eco-50 dark:bg-eco-950/70 text-eco-700 dark:text-eco-300 font-semibold ring-1 ring-eco-600'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Type Dropdown */}
        <div>
          <Select
            label="Specific Activity Type"
            value={activityType}
            onChange={e => setActivityType(e.target.value as ActivityType)}
            options={Object.entries(ACTIVITY_TYPE_METADATA)
              .filter(([_, item]) => item.category === category)
              .map(([key, item]) => ({
                value: key,
                label: `${item.label} (${item.unit})`,
              }))}
          />
          {meta.description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {meta.description}
            </p>
          )}
        </div>

        {/* Quantity and Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={`Quantity (${meta.unit}) *`}
            type="number"
            step="0.1"
            min="0"
            value={quantity}
            onChange={e => setQuantity(parseFloat(e.target.value) || 0)}
            error={errors.quantity}
            rightAddon={meta.unit}
          />
          <Input
            label="Activity Date *"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            error={errors.date}
          />
        </div>

        {/* High Distance Warning (> 500 km) */}
        {isHighDistanceWarning && (
          <div className="p-3 rounded-lg bg-warning-50 dark:bg-warning-950/60 border border-warning-200 dark:border-warning-900/60 flex items-start gap-2.5 text-xs text-warning-800 dark:text-warning-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-warning-600 dark:text-warning-400" />
            <div>
              <p className="font-semibold">Long Distance Commute Detected</p>
              <p className="text-[11px] mt-0.5">
                A daily travel distance exceeding 500 km is higher than typical intracity travel. If this was an intercity trip or flight, please verify the distance entered.
              </p>
            </div>
          </div>
        )}

        {/* Source & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Activity Source"
            value={source}
            onChange={e => setSource(e.target.value as ActivitySource)}
            options={[
              { value: 'manual', label: 'Manual Entry' },
              { value: 'gps', label: 'GPS Tracked' },
              { value: 'estimated', label: 'Estimated' },
            ]}
          />
          <Input
            label="Optional Notes"
            placeholder="e.g. Metro to Indiranagar"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Live Emission Calculation Preview */}
        <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Calculated Carbon Emission:
            </span>
            <span className="text-base font-bold text-eco-600 dark:text-eco-400">
              {currentEmission.toFixed(2)} kg CO2e
            </span>
          </div>

          {emissionFactor && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 space-y-0.5">
              <div className="flex items-center justify-between">
                <span>Emission Factor:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {emissionFactor.value} kg CO2e / {emissionFactor.unit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Factor Status & Year:</span>
                <span className="capitalize">
                  <Badge variant={emissionFactor.status === 'measured' ? 'success' : 'default'} size="sm">
                    {emissionFactor.status} ({emissionFactor.year})
                  </Badge>
                </span>
              </div>
              {category === 'electricity' && householdSize > 1 && (
                <div className="flex items-center justify-between text-slate-500 text-[10px] pt-0.5">
                  <span>Household allocation:</span>
                  <span>Divided by {householdSize} occupants</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" leftIcon={<Check className="w-4 h-4" />}>
            {initialRecord ? 'Update Record' : 'Save to Ledger'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
