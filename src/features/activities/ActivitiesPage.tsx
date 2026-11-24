import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Navigation, Download, Sparkles, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { ActivityRecord } from '../../engine/types';
import { 
  getStoredActivities, 
  saveActivityRecord, 
  deleteActivityRecord, 
  awardPoints, 
  subscribeToStorage,
  isDemoModeActive 
} from '../../services/storage';
import { ActivityFormModal } from './components/ActivityFormModal';
import { ActivityHistoryTable } from './components/ActivityHistoryTable';
import { ActivityFilters } from './components/ActivityFilters';
import { GpsTripModal } from './components/GpsTripModal';
import { getTodayString, getDaysAgo, isDateInThisMonth } from '../../lib/dateUtils';
import { formatCO2 } from '../../lib/utils';
import { exportActivitiesAsCSV } from '../../services/exportImport';

export const ActivitiesPage: React.FC = () => {
  const { showToast } = useToast();
  const [activities, setActivities] = useState<ActivityRecord[]>(() => getStoredActivities());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ActivityRecord | null>(null);

  // Filters state
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const isDemo = isDemoModeActive();

  // Keep synced with storage
  useEffect(() => {
    const sync = () => {
      setActivities(getStoredActivities());
    };
    return subscribeToStorage(sync);
  }, []);

  const handleSaveActivity = (record: ActivityRecord) => {
    const isEdit = Boolean(editingRecord);
    saveActivityRecord(record);
    setActivities(getStoredActivities());

    if (!isEdit) {
      // Award eco points for logging
      awardPoints(10);
      showToast({
        type: 'success',
        message: 'Activity logged! +10 Eco Points earned.',
      });
    } else {
      showToast({
        type: 'info',
        message: 'Activity record updated successfully.',
      });
    }
    setEditingRecord(null);
  };

  const handleDeleteActivity = (id: string) => {
    const { updated, deleted } = deleteActivityRecord(id);
    setActivities(updated);

    if (deleted) {
      showToast({
        type: 'warning',
        message: 'Activity removed from ledger.',
        durationMs: 6000,
        action: {
          label: 'Undo',
          onClick: () => {
            saveActivityRecord(deleted);
            setActivities(getStoredActivities());
            showToast({
              type: 'success',
              message: 'Activity restored.',
            });
          },
        },
      });
    }
  };

  const handleEditActivity = (record: ActivityRecord) => {
    setEditingRecord(record);
    setIsAddModalOpen(true);
  };

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    const today = getTodayString();
    const weekAgo = getDaysAgo(7);

    return activities.filter((act) => {
      // Category filter
      if (categoryFilter !== 'all' && act.category !== categoryFilter) {
        return false;
      }

      // Date Range filter
      if (dateRange === 'today' && act.date !== today) {
        return false;
      }
      if (dateRange === 'week' && act.date < weekAgo) {
        return false;
      }
      if (dateRange === 'month' && !isDateInThisMonth(act.date)) {
        return false;
      }
      if (dateRange === 'custom') {
        if (startDate && act.date < startDate) return false;
        if (endDate && act.date > endDate) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesType = act.activityType.toLowerCase().includes(query);
        const matchesNotes = (act.notes || '').toLowerCase().includes(query);
        const matchesCat = act.category.toLowerCase().includes(query);
        if (!matchesType && !matchesNotes && !matchesCat) return false;
      }

      return true;
    });
  }, [activities, categoryFilter, dateRange, startDate, endDate, searchQuery]);

  // Aggregate stats
  const totalEmissionsFiltered = filteredActivities.reduce((sum, a) => sum + (a.emissionKgCO2e || 0), 0);
  const todayActivities = activities.filter(a => a.date === getTodayString());
  const todayTotalEmissions = todayActivities.reduce((sum, a) => sum + (a.emissionKgCO2e || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Carbon Activity Ledger
            </h2>
            {isDemo && (
              <Badge variant="warning" size="sm" className="gap-1">
                <Sparkles className="w-3 h-3" /> Sample Data
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log your daily transportation, electricity, and waste activities to compute precise emissions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={exportActivitiesAsCSV}
            leftIcon={<Download className="w-4 h-4" />}
            title="Export ledger as CSV spreadsheet"
          >
            Export CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsGpsModalOpen(true)}
            leftIcon={<Navigation className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
          >
            Start GPS Trip
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingRecord(null);
              setIsAddModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Log Activity
          </Button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
              Today's Footprint
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {formatCO2(todayTotalEmissions)}
            </span>
          </div>
          <Badge variant="default" size="sm">
            {todayActivities.length} logs today
          </Badge>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
              Filtered Total Emissions
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {formatCO2(totalEmissionsFiltered)}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {filteredActivities.length} matching
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
              Total Logged Records
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {activities.length} activities
            </span>
          </div>
          <span className="text-xs text-eco-600 dark:text-eco-400 font-medium">
            Active Ledger
          </span>
        </div>
      </div>

      {/* Filter Controls */}
      <ActivityFilters
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      {/* Activity History Table */}
      <ActivityHistoryTable
        records={filteredActivities}
        onEdit={handleEditActivity}
        onDelete={handleDeleteActivity}
        onOpenAddModal={() => {
          setEditingRecord(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Add / Edit Activity Modal */}
      <ActivityFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveActivity}
        initialRecord={editingRecord}
      />

      {/* Live GPS Trip Modal */}
      <GpsTripModal
        isOpen={isGpsModalOpen}
        onClose={() => setIsGpsModalOpen(false)}
        onSaveTrip={handleSaveActivity}
      />
    </div>
  );
};
