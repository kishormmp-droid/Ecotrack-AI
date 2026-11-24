import React, { useState, useEffect, useRef } from 'react';
import { Navigation, Play, Square, AlertCircle, Check, MapPin } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { ActivityRecord, TransportActivityType } from '../../../engine/types';
import { calculateActivityEmission } from '../../../engine/calculator';
import { getTodayString } from '../../../lib/dateUtils';
import { getStoredOnboarding } from '../../../services/storage';

interface GpsTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrip: (record: ActivityRecord) => void;
}

// Haversine formula in kilometers
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const GpsTripModal: React.FC<GpsTripModalProps> = ({
  isOpen,
  onClose,
  onSaveTrip,
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [distanceKm, setDistanceKm] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<TransportActivityType>('walking');
  const [manualOverrideKm, setManualOverrideKm] = useState<string>('');

  const lastPosRef = useRef<{ lat: number; lon: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopTracking();
      setDistanceKm(0);
      setElapsedSeconds(0);
      setGeoError(null);
      lastPosRef.current = null;
      setManualOverrideKm('');
    }
  }, [isOpen]);

  const startTracking = () => {
    setGeoError(null);
    setDistanceKm(0);
    setElapsedSeconds(0);
    lastPosRef.current = null;

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. You can enter your distance manually below.');
      return;
    }

    try {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          // Ignore highly inaccurate GPS readings (> 100 meters)
          if (accuracy > 100) return;

          if (lastPosRef.current) {
            const delta = calculateHaversineKm(
              lastPosRef.current.lat,
              lastPosRef.current.lon,
              latitude,
              longitude
            );
            // Ignore micro-jitter (< 10 meters)
            if (delta > 0.01) {
              setDistanceKm(prev => Number((prev + delta).toFixed(3)));
              lastPosRef.current = { lat: latitude, lon: longitude };
            }
          } else {
            lastPosRef.current = { lat: latitude, lon: longitude };
          }
        },
        (error) => {
          let message = 'Unable to access GPS location.';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location permission was denied. You can still log your trip distance manually.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'GPS position is currently unavailable.';
          } else if (error.code === error.TIMEOUT) {
            message = 'GPS connection timed out.';
          }
          setGeoError(message);
          stopTracking();
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
        }
      );

      watchIdRef.current = watchId;
      setIsTracking(true);

      timerIdRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } catch {
      setGeoError('Could not start GPS service. Please enter trip distance manually.');
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerIdRef.current !== null) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    setIsTracking(false);
  };

  const handleSave = () => {
    const finalDistance = manualOverrideKm !== '' ? parseFloat(manualOverrideKm) : distanceKm;
    if (isNaN(finalDistance) || finalDistance <= 0) return;

    const onboarding = getStoredOnboarding();
    const emission = calculateActivityEmission(selectedMode, finalDistance, onboarding.householdSize);

    const record: ActivityRecord = {
      id: `gps-${Date.now()}`,
      category: 'transportation',
      activityType: selectedMode,
      quantity: Number(finalDistance.toFixed(2)),
      unit: 'km',
      date: getTodayString(),
      notes: `Recorded via GPS Trip Tracker (${formatTime(elapsedSeconds)})`,
      source: 'gps',
      emissionKgCO2e: emission,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveTrip(record);
    onClose();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  const finalKm = manualOverrideKm !== '' ? parseFloat(manualOverrideKm) : distanceKm;
  const currentEmission = !isNaN(finalKm) && finalKm > 0
    ? calculateActivityEmission(selectedMode, finalKm, 1)
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Live GPS Trip Recorder"
      description="Estimate transit distance using on-device GPS without continuous background tracking."
      size="md"
    >
      <div className="space-y-4">
        {/* Mode selector */}
        <Select
          label="Trip Transportation Mode"
          value={selectedMode}
          onChange={e => setSelectedMode(e.target.value as TransportActivityType)}
          options={[
            { value: 'walking', label: 'Walking (0 kg CO2e)' },
            { value: 'cycling', label: 'Cycling (0 kg CO2e)' },
            { value: 'two_wheeler', label: 'Two-Wheeler (Motorcycle/Scooter)' },
            { value: 'car', label: 'Personal Car' },
            { value: 'bus', label: 'Public City Bus' },
            { value: 'train', label: 'Metro / Local Train' },
          ]}
        />

        {/* GPS Live Status Box */}
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Badge variant={isTracking ? 'success' : 'default'} size="sm" className="gap-1">
              <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-eco-500 animate-ping' : 'bg-slate-400'}`} />
              {isTracking ? 'GPS Active (Recording)' : 'GPS Idle'}
            </Badge>
            <Badge variant="warning" size="sm">GPS Estimate</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Distance</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {distanceKm.toFixed(2)} <span className="text-xs font-semibold text-slate-500">km</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Duration</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {formatTime(elapsedSeconds)}
              </span>
            </div>
          </div>

          {/* Start/Stop Button */}
          <div className="pt-2">
            {!isTracking ? (
              <Button
                onClick={startTracking}
                size="md"
                className="w-full bg-eco-600 hover:bg-eco-700 shadow-sm"
                leftIcon={<Play className="w-4 h-4 fill-current" />}
              >
                Start GPS Trip
              </Button>
            ) : (
              <Button
                onClick={stopTracking}
                size="md"
                variant="danger"
                className="w-full"
                leftIcon={<Square className="w-4 h-4 fill-current" />}
              >
                Stop Trip
              </Button>
            )}
          </div>
        </div>

        {/* Error / Fallback Banner */}
        {geoError && (
          <div className="p-3.5 rounded-xl bg-warning-50 dark:bg-warning-950/50 border border-warning-200 dark:border-warning-900/60 text-xs text-warning-800 dark:text-warning-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice</p>
              <p className="mt-0.5 text-[11px]">{geoError}</p>
            </div>
          </div>
        )}

        {/* Manual distance override if GPS is inaccurate or unavailable */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Manual Distance Override (Optional)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder={`Current GPS: ${distanceKm.toFixed(2)} km`}
              value={manualOverrideKm}
              onChange={e => setManualOverrideKm(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-eco-500"
            />
            <span className="text-xs text-slate-500">km</span>
          </div>
        </div>

        {/* Impact preview */}
        {finalKm > 0 && (
          <div className="p-3 rounded-lg bg-eco-50 dark:bg-eco-950/50 border border-eco-200 dark:border-eco-900/50 flex items-center justify-between text-xs">
            <span className="font-medium text-eco-900 dark:text-eco-200">
              Trip Calculated Footprint:
            </span>
            <span className="font-bold text-eco-700 dark:text-eco-400">
              {currentEmission.toFixed(2)} kg CO2e
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={finalKm <= 0}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Save Trip to Ledger
          </Button>
        </div>
      </div>
    </Modal>
  );
};
