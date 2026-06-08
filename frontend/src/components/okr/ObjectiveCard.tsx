import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2 } from 'lucide-react';
import type { Objective } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { objectiveStatusLabel, objectiveStatusColor } from '@/lib/utils/status';

interface ObjectiveCardProps {
  objective: Objective;
  onDelete?: (e: React.MouseEvent) => void;
}

export function ObjectiveCard({ objective, onDelete }: ObjectiveCardProps) {
  const navigate = useNavigate();

  return (
    <Card hoverable onClick={() => navigate(`/objectives/${objective.id}`)}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug truncate">
            {objective.title}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{objective.periodTitle}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Badge className={objectiveStatusColor[objective.status]}>
            {objectiveStatusLabel[objective.status]}
          </Badge>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(e); }}
              className="p-1 text-gray-300 hover:text-red-500 transition-colors"
              aria-label="حذف هدف"
            >
              <Trash2 size={15} />
            </button>
          )}
          <ChevronLeft size={16} className="text-gray-300" />
        </div>
      </div>

      <ProgressBar
        value={objective.progress}
        showLabel
        colorClass={
          objective.progress >= 70
            ? 'bg-success-500'
            : objective.progress >= 40
            ? 'bg-primary-500'
            : 'bg-warning-500'
        }
      />

      {(objective.teamName || objective.departmentName) && (
        <p className="text-xs text-gray-400 mt-2">
          {objective.teamName || objective.departmentName}
        </p>
      )}
    </Card>
  );
}
