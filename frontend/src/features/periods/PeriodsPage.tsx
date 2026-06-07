import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { toast } from '@/components/ui/Toast';
import { periodsApiExt } from './periods.api';
import { usePeriods } from './usePeriods';
import { CreatePeriodModal } from './CreatePeriodModal';
import { EditPeriodModal } from './EditPeriodModal';
import { formatDate } from '@/lib/utils/format';
import type { OkrPeriod } from '@/types';
import { Calendar, Plus, Play, Lock, Archive, Edit2 } from 'lucide-react';

const statusLabel: Record<string, string> = {
  draft: 'پیش‌نویس',
  active: 'فعال',
  closed: 'بسته‌شده',
  archived: 'آرشیو',
};

const statusColor: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-amber-50 text-amber-700',
  archived: 'bg-gray-100 text-gray-400',
};

export function PeriodsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editPeriod, setEditPeriod] = useState<OkrPeriod | null>(null);
  const qc = useQueryClient();
  const { data: periods, isLoading, isError, refetch } = usePeriods();

  const activateMut = useMutation({
    mutationFn: (id: string) => periodsApiExt.activate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['periods'] }); toast('دوره فعال شد'); },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const closeMut = useMutation({
    mutationFn: (id: string) => periodsApiExt.close(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['periods'] }); toast('دوره بسته شد'); },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const archiveMut = useMutation({
    mutationFn: (id: string) => periodsApiExt.archive(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['periods'] }); toast('دوره آرشیو شد'); },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const isPending = activateMut.isPending || closeMut.isPending || archiveMut.isPending;

  return (
    <div className="pb-24">
      <TopBar title="دوره‌های OKR" />

      <div className="p-4 space-y-3">
        {isLoading ? (
          <PageSpinner />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !periods?.length ? (
          <EmptyState
            icon={<Calendar size={28} className="text-primary-400" />}
            title="هنوز دوره‌ای تعریف نشده است"
            description="اولین دوره OKR سازمان خود را بسازید"
            action={
              <Button onClick={() => setCreateOpen(true)} size="lg">
                <Plus size={18} />
                ایجاد اولین دوره
              </Button>
            }
          />
        ) : (
          periods.map((p) => (
            <PeriodCard
              key={p.id}
              period={p}
              onEdit={() => setEditPeriod(p)}
              onActivate={() => activateMut.mutate(p.id)}
              onClose={() => closeMut.mutate(p.id)}
              onArchive={() => archiveMut.mutate(p.id)}
              disabled={isPending}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-20 left-4 w-14 h-14 rounded-full bg-primary-600 text-white
          shadow-fab flex items-center justify-center active:scale-95 transition-transform z-30"
        aria-label="ایجاد دوره"
      >
        <Plus size={24} />
      </button>

      <CreatePeriodModal open={createOpen} onClose={() => setCreateOpen(false)} />
      {editPeriod && (
        <EditPeriodModal
          period={editPeriod}
          open={!!editPeriod}
          onClose={() => setEditPeriod(null)}
        />
      )}
    </div>
  );
}

interface CardProps {
  period: OkrPeriod;
  onEdit: () => void;
  onActivate: () => void;
  onClose: () => void;
  onArchive: () => void;
  disabled: boolean;
}

function PeriodCard({ period: p, onEdit, onActivate, onClose, onArchive, disabled }: CardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base truncate">{p.title}</h3>
          <div className="flex gap-3 text-xs text-gray-400 mt-1">
            <span>{formatDate(p.startDate)} — {formatDate(p.endDate)}</span>
          </div>
        </div>
        <Badge className={`${statusColor[p.status]} mr-2 shrink-0`}>{statusLabel[p.status]}</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {p.status === 'draft' && (
          <>
            <Button size="sm" variant="secondary" onClick={onEdit} disabled={disabled}>
              <Edit2 size={14} /> ویرایش
            </Button>
            <Button size="sm" onClick={onActivate} disabled={disabled}>
              <Play size={14} /> فعال‌سازی
            </Button>
          </>
        )}
        {p.status === 'active' && (
          <Button size="sm" variant="secondary" onClick={onClose} disabled={disabled}>
            <Lock size={14} /> بستن دوره
          </Button>
        )}
        {p.status === 'closed' && (
          <Button size="sm" variant="ghost" onClick={onArchive} disabled={disabled}>
            <Archive size={14} /> آرشیو
          </Button>
        )}
      </div>
    </Card>
  );
}
