import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { KeyResultCard } from '@/components/okr/KeyResultCard';
import { CreateKeyResultModal } from '@/features/key-results/CreateKeyResultModal';
import { objectiveStatusLabel, objectiveStatusColor } from '@/lib/utils/status';
import { formatDate } from '@/lib/utils/format';
import { useObjective, useObjectiveKeyResults } from './useObjectives';
import { TrendingUp, Plus } from 'lucide-react';

export function ObjectiveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [addKrOpen, setAddKrOpen] = useState(false);
  const { data: objective, isLoading, isError, refetch } = useObjective(id!);
  const { data: keyResults, isLoading: krLoading } = useObjectiveKeyResults(id!);

  if (isLoading) return <PageSpinner />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!objective) return null;

  const progress = objective.progress ?? 0;
  const progressColor = progress >= 70 ? 'bg-success-500' : progress >= 40 ? 'bg-primary-500' : 'bg-warning-500';

  return (
    <div className="pb-24 md:pb-8">
      <TopBar title="جزئیات هدف" showBack />

      {/* Desktop 2-column / Mobile single column */}
      <div className="p-4 md:grid md:grid-cols-3 md:gap-6 md:items-start">

        {/* ── Main column ─────────────────────────────────────── */}
        <div className="md:col-span-2 space-y-4">
          {/* Title + description */}
          <Card>
            <div className="flex items-start justify-between gap-2 mb-3">
              <h2 className="text-base font-bold text-gray-900 flex-1 leading-snug">
                {objective.title}
              </h2>
              <Badge className={objectiveStatusColor[objective.status]}>
                {objectiveStatusLabel[objective.status]}
              </Badge>
            </div>
            {objective.description && (
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{objective.description}</p>
            )}
            <ProgressBar value={progress} showLabel colorClass={progressColor} />
          </Card>

          {/* Key Results */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                نتایج کلیدی ({keyResults?.length || 0})
              </p>
              <Button size="sm" onClick={() => setAddKrOpen(true)}>
                <Plus size={14} /> افزودن نتیجه کلیدی
              </Button>
            </div>

            {krLoading ? (
              <PageSpinner />
            ) : !keyResults?.length ? (
              <EmptyState
                icon={<TrendingUp size={24} className="text-gray-400" />}
                title="نتیجه کلیدی تعریف نشده"
                description="اولین KR این هدف را تعریف کنید"
                action={
                  <Button size="sm" onClick={() => setAddKrOpen(true)}>
                    <Plus size={14} /> افزودن نتیجه کلیدی
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {keyResults.map((kr) => (
                  <KeyResultCard key={kr.id} keyResult={kr} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar column (desktop only, stacks below on mobile) ── */}
        <div className="mt-4 md:mt-0 space-y-4">
          <Card>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">اطلاعات هدف</p>
            <div className="space-y-3">
              <InfoItem label="دوره" value={objective.periodTitle} />
              <InfoItem label="مالک" value={objective.ownerName} />
              {objective.teamName && <InfoItem label="تیم" value={objective.teamName} />}
              {objective.departmentName && <InfoItem label="دپارتمان" value={objective.departmentName} />}
              <InfoItem label="ایجاد" value={formatDate(objective.createdAt)} />
              <InfoItem label="آخرین بروزرسانی" value={formatDate(objective.updatedAt)} />
            </div>
          </Card>

          <Card>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">پیشرفت</p>
            <div className="text-center mb-3">
              <span className="text-3xl font-bold text-gray-900">{Math.round(progress)}</span>
              <span className="text-lg text-gray-400">٪</span>
            </div>
            <ProgressBar value={progress} colorClass={progressColor} />
          </Card>
        </div>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setAddKrOpen(true)}
        className="fixed bottom-20 left-4 w-14 h-14 rounded-full bg-primary-600 text-white shadow-fab flex items-center justify-center active:scale-95 transition-transform z-30 md:hidden"
        aria-label="افزودن نتیجه کلیدی"
      >
        <Plus size={24} />
      </button>

      <CreateKeyResultModal open={addKrOpen} onClose={() => setAddKrOpen(false)} objectiveId={id!} />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}
