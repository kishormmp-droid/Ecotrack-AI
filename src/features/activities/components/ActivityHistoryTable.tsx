import React, { useState } from 'react';
import { 
  ActivityRecord, 
  ActivityCategory 
} from '../../../engine/types';
import { 
  Car, 
  Zap, 
  Trash2, 
  Edit2, 
  Trash, 
  Navigation, 
  FileText, 
  AlertCircle 
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatDate } from '../../../lib/dateUtils';
import { ACTIVITY_TYPE_METADATA } from '../../../data/emissionFactors';

interface ActivityHistoryTableProps {
  records: ActivityRecord[];
  onEdit: (record: ActivityRecord) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
}

export const ActivityHistoryTable: React.FC<ActivityHistoryTableProps> = ({
  records,
  onEdit,
  onDelete,
  onOpenAddModal,
}) => {
  const [recordToDelete, setRecordToDelete] = useState<ActivityRecord | null>(null);

  if (records.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="w-6 h-6" />}
        title="No Activity Records Found"
        description="You have not logged any activities matching your filter criteria yet. Start recording your daily commute, power, or waste to track your carbon footprint."
        actionLabel="Log First Activity"
        onAction={onOpenAddModal}
      />
    );
  }

  const getCategoryIcon = (cat: ActivityCategory) => {
    switch (cat) {
      case 'transportation':
        return <Car className="w-4 h-4 text-sky-500 shrink-0" />;
      case 'electricity':
        return <Zap className="w-4 h-4 text-warning-500 shrink-0" />;
      case 'waste_lifestyle':
        return <Trash2 className="w-4 h-4 text-eco-500 shrink-0" />;
    }
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      onDelete(recordToDelete.id);
      setRecordToDelete(null);
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Activity</th>
              <th className="py-3 px-4">Quantity</th>
              <th className="py-3 px-4 text-right">Emissions (kg CO2e)</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4">Notes</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {records.map((record) => {
              const meta = ACTIVITY_TYPE_METADATA[record.activityType];
              const label = meta ? meta.label : record.activityType;

              return (
                <tr
                  key={record.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {formatDate(record.date)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(record.category)}
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {label}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    <span className="font-semibold">{record.quantity}</span>{' '}
                    <span className="text-[11px] text-slate-500">{record.unit}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                    {record.emissionKgCO2e === 0 ? (
                      <span className="text-eco-600 dark:text-eco-400">0.00 kg</span>
                    ) : record.emissionKgCO2e > 5.0 ? (
                      <span className="text-warning-600 dark:text-warning-400">
                        {record.emissionKgCO2e.toFixed(2)} kg
                      </span>
                    ) : (
                      <span>{record.emissionKgCO2e.toFixed(2)} kg</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {record.source === 'gps' ? (
                      <Badge variant="info" size="sm" className="gap-1">
                        <Navigation className="w-2.5 h-2.5" /> GPS
                      </Badge>
                    ) : record.source === 'estimated' ? (
                      <Badge variant="warning" size="sm">Estimated</Badge>
                    ) : (
                      <Badge variant="default" size="sm">Manual</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate text-[11px]">
                    {record.notes || '—'}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(record)}
                        className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                        aria-label={`Edit ${label} activity on ${record.date}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRecordToDelete(record)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-danger-600 dark:hover:text-danger-400"
                        aria-label={`Delete ${label} activity on ${record.date}`}
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={recordToDelete !== null}
        onClose={() => setRecordToDelete(null)}
        title="Confirm Deletion"
        description="Are you sure you want to delete this activity record from your ledger?"
        size="sm"
      >
        <div className="space-y-4">
          {recordToDelete && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <p>
                <span className="font-semibold">Activity:</span>{' '}
                {ACTIVITY_TYPE_METADATA[recordToDelete.activityType]?.label || recordToDelete.activityType}
              </p>
              <p>
                <span className="font-semibold">Quantity:</span> {recordToDelete.quantity} {recordToDelete.unit}
              </p>
              <p>
                <span className="font-semibold">Emission:</span> {recordToDelete.emissionKgCO2e.toFixed(2)} kg CO2e
              </p>
              <p>
                <span className="font-semibold">Date:</span> {formatDate(recordToDelete.date)}
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setRecordToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={confirmDelete}>
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
