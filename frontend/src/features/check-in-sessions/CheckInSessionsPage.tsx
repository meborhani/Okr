import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, Lock, Unlock, CheckCircle2, Trash2, LogIn } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import { checkInSessionsApi, periodsApi } from '@/lib/api/okr.api';
import { useAuthStore } from '@/lib/auth/auth.store';
import { formatDate, periodLabel } from '@/lib/utils/format';
import type { CheckInSession } from '@/types';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  locked: { label: 'قفل', color: 'bg-gray-100 text-gray-500', icon: Lock },
  open: { label: 'باز', color: 'bg-emerald-50 text-emerald-700', icon: Unlock },
  closed: { label: 'بسته', color: 'bg-amber-50 text-amber-700', icon: CheckCircle2 },
};

const frequencyLabel: Record<string, string> = {
  weekly: 'هفتگی',
  biweekly: 'دو هفته‌ای',
  monthly: 'ماهانه',
};

export function CheckInSessionsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const isAdmin = user?.permissions?.includes('okr_periods:manage') ?? false;
  const [periodId, setPeriodId] = useState<string | undefined>();
  const [editSession, setEditSession] = useState<CheckInSession | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CheckInSession | null>(null);

  const { data: sessions, isLoading, isError, refetch } = useQuery({
    queryKey: ['check-in-sessions', periodId],
    queryFn: () => checkInSessionsApi.getAll(periodId),
  });
  const { data: periods } = useQuery({ queryKey: ['periods'], queryFn: periodsApi.getAll });

  const deleteMut = useMutation({
    mutationFn: (id: string) => checkInSessionsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['check-in-sessions'] });
      toast('جلسه حذف شد');
      setDeleteConfirm(null);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const periodOptions = [
    { value: '', label: 'همه دوره‌ها' },
    ...(periods || []).map((p) => ({ value: p.id, label: periodLabel(p.year, p.quarter) })),
  ];

  const canEnter = (s: CheckInSession) => isAdmin || s.status === 'open';

  return (
    <div>
      <TopBar title="جلسات چک‌این" />
      <div className="p-4 space-y-4">
        <Select
          label=""
          options={periodOptions}
          value={periodId || ''}
          onChange={(e) => setPeriodId(e.target.value || undefined)}
        />

        {isLoading ? <PageSpinner />
          : isError ? <ErrorState onRetry={refetch} />
          : !sessions?.length ? (
            <EmptyState
              icon={<CalendarClock size={28} className="text-primary-400" />}
              title="جلسه‌ای یافت نشد"
              description="پس از ایجاد دوره، جلسات چک‌این به‌صورت خودکار ایجاد می‌شوند"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  isAdmin={isAdmin}
                  canEnter={canEnter(s)}
                  onEnter={() => navigate(`/check-in-sessions/${s.id}`)}
                  onEdit={() => setEditSession(s)}
                  onDelete={() => setDeleteConfirm(s)}
                />
              ))}
            </div>
          )}
      </div>

      {editSession && (
        <EditSessionModal
          session={editSession}
          onClose={() => setEditSession(null)}
          onSave={() => {
            qc.invalidateQueries({ queryKey: ['check-in-sessions'] });
            setEditSession(null);
          }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">حذف جلسه</h3>
            <p className="text-sm text-gray-600 mb-4">
              جلسه <span className="font-semibold">«{deleteConfirm.title}»</span> حذف شود؟
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)} disabled={deleteMut.isPending}>انصراف</Button>
              <Button variant="danger" loading={deleteMut.isPending} onClick={() => deleteMut.mutate(deleteConfirm.id)}>حذف</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SessionCard({
  session, isAdmin, canEnter, onEnter, onEdit, onDelete,
}: {
  session: CheckInSession;
  isAdmin: boolean;
  canEnter: boolean;
  onEnter: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cfg = statusConfig[session.status] || statusConfig.locked;
  const Icon = cfg.icon;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">{session.title}</span>
            <Badge className={cfg.color}>
              <Icon size={12} className="ml-1" />
              {cfg.label}
            </Badge>
            <Badge className="bg-gray-50 text-gray-500 text-xs">
              {frequencyLabel[session.frequency] || session.frequency}
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mt-1">{session.periodTitle}</p>
          <p className="text-xs text-gray-500 mt-1.5">
            {formatDate(session.startDate)} — {formatDate(session.endDate)}
          </p>
          {session.dueDate && (
            <p className="text-xs text-warning-600 mt-0.5">مهلت: {formatDate(session.dueDate)}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5 items-end shrink-0">
          {canEnter && (
            <Button size="sm" onClick={onEnter}>
              <LogIn size={14} />
              ورود
            </Button>
          )}
          {isAdmin && (
            <>
              <Button size="sm" variant="ghost" onClick={onEdit}>ویرایش</Button>
              <button onClick={onDelete} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

function EditSessionModal({
  session, onClose, onSave,
}: {
  session: CheckInSession;
  onClose: () => void;
  onSave: () => void;
}) {
  const [title, setTitle] = useState(session.title);
  const [startDate, setStartDate] = useState(session.startDate?.split('T')[0] || '');
  const [endDate, setEndDate] = useState(session.endDate?.split('T')[0] || '');
  const [dueDate, setDueDate] = useState(session.dueDate?.split('T')[0] || '');
  const [status, setStatus] = useState(session.status);

  const mutation = useMutation({
    mutationFn: () => checkInSessionsApi.update(session.id, { title, startDate, endDate, dueDate, status }),
    onSuccess: () => { toast('جلسه به‌روز شد'); onSave(); },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const statusOptions = [
    { value: 'locked', label: 'قفل' },
    { value: 'open', label: 'باز' },
    { value: 'closed', label: 'بسته' },
  ];

  return (
    <Modal open onClose={onClose} title="ویرایش جلسه چک‌این">
      <div className="space-y-4">
        <Input label="عنوان" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="تاریخ شروع" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="تاریخ پایان" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <Input label="مهلت ارسال" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <Select
          label="وضعیت"
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
        />
        <Button fullWidth onClick={() => mutation.mutate()} loading={mutation.isPending}>ذخیره</Button>
      </div>
    </Modal>
  );
}
