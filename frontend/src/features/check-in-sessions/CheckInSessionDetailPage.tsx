import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock, Unlock, CheckCircle2, TrendingUp, Filter, FileText, Edit3, Plus } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { Select } from '@/components/ui/Select';
import { checkInSessionsApi, checkInsApi, sessionMinutesApi, tasksApi, usersApi } from '@/lib/api/okr.api';
import { useAuthStore } from '@/lib/auth/auth.store';
import { formatDate } from '@/lib/utils/format';
import type { SessionKr } from '@/types';

const statusConfig = {
  locked: { label: 'قفل', color: 'bg-gray-100 text-gray-500', icon: Lock },
  open: { label: 'باز', color: 'bg-emerald-50 text-emerald-700', icon: Unlock },
  closed: { label: 'بسته', color: 'bg-amber-50 text-amber-700', icon: CheckCircle2 },
} as const;

export function CheckInSessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [onlyMine, setOnlyMine] = useState(false);
  const [checkInKr, setCheckInKr] = useState<SessionKr | null>(null);
  const [minutesEdit, setMinutesEdit] = useState(false);
  const [minutesContent, setMinutesContent] = useState('');
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  const isAdmin = user?.permissions?.includes('okr_periods:manage') ?? false;

  const { data: session, isLoading: sessionLoading, isError: sessionError } = useQuery({
    queryKey: ['check-in-sessions', id],
    queryFn: () => checkInSessionsApi.getById(id!),
  });

  const { data: minutes } = useQuery({
    queryKey: ['session-minutes', id],
    queryFn: () => sessionMinutesApi.get(id!),
    enabled: !!id,
  });

  const saveMinutesMut = useMutation({
    mutationFn: () => sessionMinutesApi.save(id!, minutesContent),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['session-minutes', id] });
      setMinutesEdit(false);
      toast('صورت جلسه ذخیره شد');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const { data: krs, isLoading: krsLoading, isError: krsError, refetch: refetchKrs } = useQuery({
    queryKey: ['session-krs', id],
    queryFn: () => checkInSessionsApi.getKrsForSession(id!),
    enabled: !!id,
  });

  if (sessionLoading || krsLoading) return <PageSpinner />;
  if (sessionError || krsError) return <ErrorState onRetry={refetchKrs} />;
  if (!session) return null;

  const cfg = statusConfig[session.status] || statusConfig.locked;
  const Icon = cfg.icon;
  const sessionIsOpen = session.status === 'open';
  const canSubmit = isAdmin || sessionIsOpen;

  const visibleKrs = (krs || []).filter((kr) => !onlyMine || kr.isMyKr);

  return (
    <div className="pb-24">
      <TopBar title={session.title} showBack />

      <div className="p-4 space-y-4">
        {/* Session info */}
        <Card>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="font-bold text-gray-900">{session.title}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{session.periodTitle}</p>
            </div>
            <Badge className={cfg.color}>
              <Icon size={12} className="ml-1" />
              {cfg.label}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>{formatDate(session.startDate)} — {formatDate(session.endDate)}</span>
            {session.dueDate && <span className="text-warning-600">مهلت: {formatDate(session.dueDate)}</span>}
          </div>
          {!canSubmit && (
            <p className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
              این جلسه باز نیست — امکان ثبت چک‌این وجود ندارد
            </p>
          )}
        </Card>

        {/* Session minutes */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-gray-400" />
              <span className="font-semibold text-gray-800 text-sm">صورت جلسه</span>
            </div>
            {isAdmin && (
            <div className="flex gap-2">
              {!minutesEdit && (
                <button
                  onClick={() => { setMinutesContent(minutes?.content || ''); setMinutesEdit(true); }}
                  className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                >
                  <Edit3 size={12} /> ویرایش
                </button>
              )}
              {minutes?.id && (
                <button
                  onClick={() => setCreateTaskOpen(true)}
                  className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <Plus size={12} /> افزودن تسک
                </button>
              )}
            </div>
          )}
          </div>
          {minutesEdit ? (
            <div className="space-y-2">
              <textarea
                value={minutesContent}
                onChange={(e) => setMinutesContent(e.target.value)}
                rows={6}
                className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                placeholder="متن صورت جلسه را وارد کنید..."
                dir="rtl"
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setMinutesEdit(false)}>انصراف</Button>
                <Button size="sm" loading={saveMinutesMut.isPending} onClick={() => saveMinutesMut.mutate()}>ذخیره</Button>
              </div>
            </div>
          ) : minutes?.content ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{minutes.content}</p>
          ) : (
            <p className="text-xs text-gray-400 italic">{isAdmin ? 'صورت جلسه‌ای وارد نشده — ویرایش کنید' : 'صورت جلسه‌ای ثبت نشده'}</p>
          )}
        </Card>

        {/* Filter toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyMine(false)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              !onlyMine ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 shadow-card'}`}
          >
            همه نتایج کلیدی
          </button>
          <button
            onClick={() => setOnlyMine(true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              onlyMine ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 shadow-card'}`}
          >
            <Filter size={14} />
            نتایج کلیدی من
          </button>
        </div>

        {/* KR list */}
        {!visibleKrs.length ? (
          <EmptyState
            icon={<TrendingUp size={24} className="text-gray-400" />}
            title={onlyMine ? 'نتیجه کلیدی برای شما یافت نشد' : 'نتیجه کلیدی در این جلسه وجود ندارد'}
          />
        ) : (
          <div className="space-y-3">
            {visibleKrs.map((kr) => (
              <KrRow
                key={kr.id}
                kr={kr}
                canSubmit={canSubmit && (isAdmin || kr.isMyKr)}
                onCheckIn={() => setCheckInKr(kr)}
              />
            ))}
          </div>
        )}
      </div>

      {checkInKr && (
        <CheckInModal
          kr={checkInKr}
          sessionId={id!}
          onClose={() => setCheckInKr(null)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['session-krs', id] });
            setCheckInKr(null);
          }}
        />
      )}

      {createTaskOpen && minutes?.id && (
        <ErrorBoundary>
          <CreateTaskFromMinutesModal
            minutesId={minutes.id}
            sessionId={id!}
            onClose={() => setCreateTaskOpen(false)}
            onCreated={() => { qc.invalidateQueries({ queryKey: ['tasks'] }); setCreateTaskOpen(false); toast('تسک ایجاد شد'); }}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}

function KrRow({ kr, canSubmit, onCheckIn }: { kr: SessionKr; canSubmit: boolean; onCheckIn: () => void }) {
  const progressColor = kr.progress >= 70 ? 'bg-success-500' : kr.progress >= 40 ? 'bg-primary-500' : 'bg-warning-500';

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 mb-0.5 truncate">{kr.objectiveTitle}</p>
          <h4 className="font-medium text-gray-900 text-sm leading-snug">{kr.title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{kr.ownerName}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {kr.hasCheckedIn ? (
            <Badge className="bg-emerald-50 text-emerald-700 text-xs">
              <CheckCircle2 size={11} className="ml-1" />
              ثبت شده
            </Badge>
          ) : (
            <Badge className="bg-gray-50 text-gray-400 text-xs">ثبت نشده</Badge>
          )}
          {canSubmit && (
            <Button size="sm" variant={kr.hasCheckedIn ? 'ghost' : 'primary'} onClick={onCheckIn}>
              {kr.hasCheckedIn ? 'ویرایش' : 'ثبت چک‌این'}
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
        <span>{kr.currentValue.toLocaleString('fa-IR')}{kr.unit ? ` ${kr.unit}` : ''}</span>
        <span className="font-medium text-gray-700">{Math.round(kr.progress)}٪</span>
        <span>{kr.targetValue.toLocaleString('fa-IR')}{kr.unit ? ` ${kr.unit}` : ''}</span>
      </div>
      <ProgressBar value={kr.progress} colorClass={progressColor} size="sm" />

      {kr.hasCheckedIn && kr.lastCheckInValue != null && (
        <p className="text-xs text-primary-600 mt-2">
          آخرین مقدار ثبت شده: <span className="font-semibold">{kr.lastCheckInValue.toLocaleString('fa-IR')}{kr.unit ? ` ${kr.unit}` : ''}</span>
          {kr.lastCheckInNote && <span className="text-gray-400 mr-2">— {kr.lastCheckInNote}</span>}
        </p>
      )}
    </Card>
  );
}

function CheckInModal({
  kr, sessionId, onClose, onSuccess,
}: {
  kr: SessionKr;
  sessionId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [value, setValue] = useState(kr.lastCheckInValue != null ? String(kr.lastCheckInValue) : '');
  const [note, setNote] = useState(kr.lastCheckInNote || '');

  const mutation = useMutation({
    mutationFn: () => checkInsApi.create({
      keyResultId: kr.id,
      value: parseFloat(value),
      note: note || undefined,
      sessionId,
    }),
    onSuccess: () => { toast('چک‌این ثبت شد'); onSuccess(); },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <Modal open onClose={onClose} title={`ثبت چک‌این — ${kr.title}`}>
      <div className="space-y-4">
        <div className="bg-surface-50 rounded-2xl p-3 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>شروع: <strong>{kr.startValue.toLocaleString('fa-IR')}{kr.unit ? ` ${kr.unit}` : ''}</strong></span>
            <span>هدف: <strong>{kr.targetValue.toLocaleString('fa-IR')}{kr.unit ? ` ${kr.unit}` : ''}</strong></span>
            <span>فعلی: <strong className="text-primary-600">{kr.currentValue.toLocaleString('fa-IR')}{kr.unit ? ` ${kr.unit}` : ''}</strong></span>
          </div>
        </div>
        <Input
          label={`مقدار جدید${kr.unit ? ` (${kr.unit})` : ''} *`}
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <Input
          label="یادداشت (اختیاری)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button
          fullWidth
          size="lg"
          loading={mutation.isPending}
          disabled={!value || isNaN(parseFloat(value))}
          onClick={() => mutation.mutate()}
        >
          ثبت چک‌این
        </Button>
      </div>
    </Modal>
  );
}

function CreateTaskFromMinutesModal({
  minutesId, sessionId: sessId, onClose, onCreated,
}: {
  minutesId: string;
  sessionId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const { data: usersResp } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(1, 200),
  });
  const userOptions = [
    { value: '', label: 'انتخاب مسئول...' },
    ...(usersResp?.data || []).map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` })),
  ];

  const mutation = useMutation({
    mutationFn: () => tasksApi.create({
      title, description, priority, assigneeId,
      minutesId, sessionId: sessId,
      sourceType: 'meeting_minutes',
      dueDate: dueDate || undefined,
    }),
    onSuccess: onCreated,
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <Modal open onClose={onClose} title="افزودن تسک از صورت جلسه">
      <div className="space-y-4">
        <Input label="عنوان تسک *" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        <Input label="توضیحات" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Select
          label="اولویت"
          options={[
            { value: 'normal', label: 'عادی' },
            { value: 'important', label: 'مهم' },
            { value: 'urgent', label: 'فوری' },
          ]}
          value={priority}
          onChange={(e) => setPriority(e.target.value as typeof priority)}
        />
        <Select label="مسئول *" options={userOptions} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} />
        <Input label="مهلت" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <Button fullWidth loading={mutation.isPending} disabled={!title.trim() || !assigneeId}
          onClick={() => mutation.mutate()}>
          ایجاد تسک
        </Button>
      </div>
    </Modal>
  );
}
