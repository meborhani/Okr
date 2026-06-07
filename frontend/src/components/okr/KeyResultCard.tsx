import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import type { KeyResult } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { krStatusLabel, krStatusColor, krProgressColor } from '@/lib/utils/status';

interface KeyResultCardProps {
  keyResult: KeyResult;
}

export function KeyResultCard({ keyResult }: KeyResultCardProps) {
  const navigate = useNavigate();

  return (
    <Card hoverable onClick={() => navigate(`/key-results/${keyResult.id}`)}>
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <h3 className="font-medium text-gray-900 text-sm leading-snug flex-1">{keyResult.title}</h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Badge className={krStatusColor[keyResult.status]}>
            {krStatusLabel[keyResult.status]}
          </Badge>
          <ChevronLeft size={16} className="text-gray-300" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span>
          {keyResult.currentValue.toLocaleString('fa-IR')}
          {keyResult.unit ? ` ${keyResult.unit}` : ''}
        </span>
        <span className="font-medium text-gray-700">{Math.round(keyResult.progress)}٪</span>
        <span>
          {keyResult.targetValue.toLocaleString('fa-IR')}
          {keyResult.unit ? ` ${keyResult.unit}` : ''}
        </span>
      </div>

      <ProgressBar
        value={keyResult.progress}
        colorClass={krProgressColor[keyResult.status]}
        size="sm"
      />
    </Card>
  );
}
