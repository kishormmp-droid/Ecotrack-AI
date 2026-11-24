import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { POINT_RULES } from '../../../data/challenges';
import { Coins, CheckCircle, Award } from 'lucide-react';

interface PointsRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PointsRulesModal: React.FC<PointsRulesModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eco Points & Gamification Policy"
      description="Eco Points reward consistent tracking, conservation milestones, and daily habits."
      size="md"
    >
      <div className="space-y-4">
        <div className="p-3 rounded-xl bg-eco-50 dark:bg-eco-950/60 border border-eco-200 dark:border-eco-900 flex items-center gap-2.5 text-xs text-eco-900 dark:text-eco-200">
          <Coins className="w-4 h-4 text-eco-600 shrink-0" />
          <span>
            Eco Points do not expire. They represent your sustained contribution toward emissions reduction.
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {POINT_RULES.map((rule, idx) => (
            <div key={idx} className="py-2.5 flex items-start justify-between gap-3">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  {rule.action}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {rule.description}
                </span>
              </div>
              <span className="font-bold text-eco-600 dark:text-eco-400 shrink-0 whitespace-nowrap bg-eco-100/60 dark:bg-eco-950 px-2 py-0.5 rounded-full text-[11px]">
                +{rule.points} pts
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button size="sm" onClick={onClose}>
            Got It
          </Button>
        </div>
      </div>
    </Modal>
  );
};
