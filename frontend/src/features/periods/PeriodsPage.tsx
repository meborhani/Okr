import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { toast } from '@/components/ui/Toast';
import { periodsApiExt } from './periods.api';
import { checkInSessionsApi } from '@/lib/api/okr.api';
import { usePeriods } from './usePeriods';
import { CreatePeriodModal } from './CreatePeriodModal';
import { EditPeriodModal } from './EditPeriodModal';
import { formatDate } from '@/lib/utils/format';
import type { OkrPeriod, CheckInSession } from '@/types';
import { useAuthStore } from '@/lib/auth/auth.store';
import { Calendar, Plus, Play, Lock, Archive, Edit2, CalendarClock, Unlock, Trash2 } from 'lucide-react';

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

const frequencyLabel: Record<string, string> = {
  weekly: 'هفتگی',
  biweekly: 'دو هفته‌ای',
  monthly: 'ماهانه',
};

export function PeriodsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editPeriod, setEditPeriod] = useState<OkrPeriod | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<OkrPeriod | null>(null);
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const canManage = user?.permissions?.includes('okr_periods:manage') ?? false;
  const { data: periods, isLoading, isError, refetch } = usePeriods();

  const { data: allSessions } = useQuery({
    queryKey: ['check-in-sessions'],
    queryFn: () => checkInSessionsApi.getAll(),
    enabled: !!periods?.length,
  });

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

  const reopenMut = useMutation({
    mutationFn: (id: string) => periodsApiExt.reopen(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['periods'] }); toast('دوره بازگشایی شد'); },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => periodsApiExt.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['periods'] }); toast('دوره حذف شد'); setDeleteConfirm(null); },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const generateMut = useMutation({
    mutationFn: ({ periodId, frequency }: { periodId: string; frequency: string }) =>
      checkInSessionsApi.generateForPeriod(periodId, frequency),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['check-in-sessions'] });
      toast('جلسات چک‌این ساخته شدند');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const isPending = activateMut.isPending || closeMut.isPending || archiveMut.isPending || reopenMut.isPending || removeMut.isPending;

  const sessionsByPeriod = (allSessions || []).reduce<Record<string, CheckInSession[]>>((acc, s) => {
    if (!acc[s.periodId]) acc[s.periodId] = [];
    acc[s.periodId].push(s);
    return acc;
  }, {});

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
              sessionCount={sessionsByPeriod[p.id]?.length || 0}
              canManage={canManage}
              onEdit={() => setEditPeriod(p)}
              onActivate={() => activateMut.mutate(p.id)}
              onClose={() => closeMut.mutate(p.id)}
              onArchive={() => archiveMut.mutate(p.id)}
              onReopen={() => reopenMut.mutate(p.id)}
              onDelete={() => setDeleteConfirm(p)}
              onGenerateSessions={() => generateMut.mutate({ periodId: p.id, frequency: p.frequency || 'weekly' })}
              disabled={isPending || generateMut.isPending}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-20 left-4 w-14 h-14 rounded-full bg-primary-600 text-white
          shadow-fab flex items-center justify-center active:scale-95 transition-transform z-30 md:hidden"
        aria-label="ایجاد دوره"
      >
        <Plus size={24} />
      </button>
      <div className="hidden md:flex justify-end px-4 pt-2">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> ایجاد دوره جدید
        </Button>
      </div>

      <CreatePeriodModal open={createOpen} onClose={() => setCreateOpen(false)} />
      {editPeriod && (
        <EditPeriodModal
          period={editPeriod}
          open={!!editPeriod}
          onClose={() => setEditPeriod(null)}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">حذف دوره</h3>
            <p className="text-sm text-gray-600 mb-4">
              دوره <span className="font-semibold">{deleteConfirm.title}</span> حذف شود؟ این عمل قابل بازگشت نیست.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)} disabled={removeMut.isPending}>انصراف</Button>
              <Button
                variant="danger"
                loading={removeMut.isPending}
                onClick={() => removeMut.mutate(deleteConfirm.id)}
              >
                حذف
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CardProps {
  period: OkrPeriod;
  sessionCount: number;
  canManage: boolean;
  onEdit: () => void;
  onActivate: () => void;
  onClose: () => void;
  onArchive: () => void;
  onReopen: () => void;
  onDelete: () => void;
  onGenerateSessions: () => void;
  disabled: boolean;
}

function PeriodCard({ period: p, sessionCount, canManage, onEdit, onActivate, onClose, onArchive, onReopen, onDelete, onGenerateSessions, disabled }: CardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base truncate">{p.title}</h3>
          <div className="flex gap-3 text-xs text-gray-400 mt-1 flex-wrap">
            <span>{formatDate(p.startDate)} — {formatDate(p.endDate)}</span>
            {p.frequency && (
              <span className="text-primary-500">{frequencyLabel[p.frequency] || p.frequency}</span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
            <CalendarClock size={12} />
            <span>
              {sessionCount > 0
                ? `${sessionCount} جلسه چک‌این`
                : 'بدون جلسه چک‌این'}
            </span>
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
        {p.status === 'closed' && canManage && (
          <>
            <Button size="sm" variant="secondary" onClick={onReopen} disabled={disabled}>
              <Unlock size={14} /> بازگشایی
            </Button>
            <Button size="sm" variant="ghost" onClick={onArchive} disabled={disabled}>
              <Archive size={14} /> آرشیو
            </Button>
          </>
        )}
        {canManage && (
          <Button size="sm" variant="ghost" onClick={onDelete} disabled={disabled} className="text-red-500 hover:text-red-600">
            <Trash2 size={14} /> حذف
          </Button>
        )}
        {/* Show generate button if no sessions or for any non-archived period */}
        {p.status !== 'archived' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onGenerateSessions}
            disabled={disabled}
          >
            <CalendarClock size={14} />
            {sessionCount > 0 ? 'بازسازی جلسات' : 'ساخت جلسات چک‌این'}
          </Button>
        )}
      </div>
    </Card>
  );
}
