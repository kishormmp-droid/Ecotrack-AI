import React from 'react';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Filter, Calendar, Tag } from 'lucide-react';
import { ActivityCategory } from '../../../engine/types';

interface ActivityFiltersProps {
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  startDate: string;
  onStartDateChange: (d: string) => void;
  endDate: string;
  onEndDateChange: (d: string) => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
}

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  categoryFilter,
  onCategoryChange,
  dateRange,
  onDateRangeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  searchQuery,
  onSearchQueryChange,
}) => {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-eco-600" /> Filter Ledger
        </span>
        {(categoryFilter !== 'all' || dateRange !== 'all' || searchQuery !== '') && (
          <button
            onClick={() => {
              onCategoryChange('all');
              onDateRangeChange('all');
              onSearchQueryChange('');
              onStartDateChange('');
              onEndDateChange('');
            }}
            className="text-[11px] font-medium text-eco-600 dark:text-eco-400 hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Category Filter */}
        <Select
          value={categoryFilter}
          onChange={e => onCategoryChange(e.target.value)}
          options={[
            { value: 'all', label: 'All Categories' },
            { value: 'transportation', label: 'Transportation' },
            { value: 'electricity', label: 'Electricity' },
            { value: 'waste_lifestyle', label: 'Waste & Lifestyle' },
          ]}
        />

        {/* Date Range Preset */}
        <Select
          value={dateRange}
          onChange={e => onDateRangeChange(e.target.value)}
          options={[
            { value: 'all', label: 'All Time' },
            { value: 'today', label: 'Today Only' },
            { value: 'week', label: 'Past 7 Days' },
            { value: 'month', label: 'This Month' },
            { value: 'custom', label: 'Custom Date Range' },
          ]}
        />

        {/* Search query */}
        <Input
          placeholder="Search by notes or type..."
          value={searchQuery}
          onChange={e => onSearchQueryChange(e.target.value)}
        />
      </div>

      {dateRange === 'custom' && (
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={e => onStartDateChange(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={e => onEndDateChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};
