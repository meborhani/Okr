import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { KeyResultCard } from '@/components/okr/KeyResultCard';
import { CreateKeyResultModal } from '@/features/key-results/CreateKeyResultModal';
import { objectiveStatusLabel, objectiveStatusColor } from '@/lib/utils/status';
import { formatDate } from '@/lib/utils/format';
import { useObjective, useObjectiveKeyResults } from './useObjectives';
import { objectivesApi, keyResultsApi, periodsApi, usersApi } from '@/lib/api/okr.api';
import { useAuthStore } from '@/lib/auth/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/Toast';
import { TrendingUp, Plus, Lock, Trash2, Edit2 } from 'lucide-react';
import type { KeyResult } from '@/types';

export function ObjectiveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [addKrOpen, setAddKrOpen] = useState(false);
  const [deleteObjConfirm, setDeleteObjConfirm] = useState(false);
  const [deleteKr, setDeleteKr] = useState<KeyResult | null>(null);
  const [editObjOpen, setEditObjOpen] = useState(false);
  const [editKr, setEditKr] = useState<KeyResult | null>(null);

  const isAdmin = user?.permissions?.includes('okr_periods:manage') ?? false;
  const canDeleteObj = user?.permissions?.includes('objectives:delete') ?? false;
  const canDeleteKr = user?.permissions?.includes('key_results:delete') ?? false;
  const canEdit = user?.permissions?.includes('objectives:update') ?? false;

  const { data: objective, isLoading, isError, refetch } = useObjective(id!);
  const { data: keyResults, isLoading: krLoading } = useObjectiveKeyResults(id!);
  const { data: periods } = useQuery({ queryKey: ['periods'], queryFn: periodsApi.getAll, enabled: !!objective?.periodId });

  const deleteObjMut = useMutation({
    mutationFn: () => objectivesApi.remove(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['objectives'] });
      toast('هدف حذف شد');
      navigate('/objectives');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const deleteKrMut = useMutation({
    mutationFn: (krId: string) => keyResultsApi.remove(krId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['key-results', id] });
      qc.invalidateQueries({ queryKey: ['objectives'] });
      toast('نتیجه کلیدی حذف شد');
      setDeleteKr(null);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  if (isLoading) return <PageSpinner />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!objective) return null;

  const period = periods?.find((p) => p.id === objective.periodId);
  const periodLocked = period && (period.status === 'closed' || period.status === 'archived');
  const canActuallyEdit = canEdit && !periodLocked;

  // dept_manager check: admin edits all; dept_manager only their own dept's objectives
  const editAllowed = isAdmin || (canActuallyEdit && (!objective.departmentId || objective.departmentId === (user as any)?.departmentId));

  const progress = objective.progress ?? 0;
  const progressColor = progress >= 70 ? 'bg-success-500' : progress >= 40 ? 'bg-primary-500' : 'bg-warning-500';

  return (
    <div className="pb-24 md:pb-8">
      <TopBar title="جزئیات هدف" showBack right={
        <div className="flex items-center gap-1">
          {editAllowed && (
            <button onClick={() => setEditObjOpen(true)} className="p-2 text-gray-400 hover:text-primary-500 transition-colors">
              <Edit2 size={17} />
            </button>
          )}
          {canDeleteObj && (
            <button onClick={() => setDeleteObjConfirm(true)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      } />

      <div className="p-4 md:grid md:grid-cols-3 md:gap-6 md:items-start">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <div className="flex items-start justify-between gap-2 mb-3">
              <h2 className="text-base font-bold text-gray-900 flex-1 leading-snug">{objective.title}</h2>
              <Badge className={objectiveStatusColor[objective.status]}>{objectiveStatusLabel[objective.status]}</Badge>
            </div>
            {objective.description && (
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{objective.description}</p>
            )}
            <ProgressBar value={progress} showLabel colorClass={progressColor} />
          </Card>

          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                نتایج کلیدی ({keyResults?.length || 0})
              </p>
              {!periodLocked ? (
                <Button size="sm" onClick={() => setAddKrOpen(true)}>
                  <Plus size={14} /> افزودن نتیجه کلیدی
                </Button>
              ) : (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Lock size={13} /> دوره قفل است
                </span>
              )}
            </div>

            {krLoading ? (
              <PageSpinner />
            ) : !keyResults?.length ? (
              <EmptyState
                icon={<TrendingUp size={24} className="text-gray-400" />}
                title="نتیجه کلیدی تعریف نشده"
                description="اولین KR این هدف را تعریف کنید"
                action={!periodLocked ? <Button size="sm" onClick={() => setAddKrOpen(true)}><Plus size={14} /> افزودن</Button> : undefined}
              />
            ) : (
              <div className="space-y-3">
                {keyResults.map((kr) => (
                  <KeyResultCard
                    key={kr.id}
                    keyResult={kr}
                    onDelete={canDeleteKr ? () => setDeleteKr(kr) : undefined}
                    onEdit={editAllowed ? () => setEditKr(kr) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 md:mt-0 space-y-4">
          <Card>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">اطلاعات هدف</p>
            <div className="space-y-3">
              <InfoItem label="دوره" value={objective.periodTitle} />
              <InfoItem label="مالک" value={objective.ownerName} />
              <InfoItem label="سطح" value={objective.scope === 'team' ? 'تیم' : 'سازمان'} />
              {objective.teamName && <InfoItem label="تیم" value={objective.teamName} />}
              {objective.departmentName && <InfoItem label="بخش" value={objective.departmentName} />}
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

      {!periodLocked && (
        <button
          onClick={() => setAddKrOpen(true)}
          className="fixed bottom-20 left-4 w-14 h-14 rounded-full bg-primary-600 text-white shadow-fab flex items-center justify-center active:scale-95 transition-transform z-30 md:hidden"
        >
          <Plus size={24} />
        </button>
      )}

      <CreateKeyResultModal open={addKrOpen} onClose={() => setAddKrOpen(false)} objectiveId={id!} objectiveScope={objective.scope} />

      {editObjOpen && (
        <EditObjectiveModal
          objective={objective}
          onClose={() => setEditObjOpen(false)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ['objectives', id] }); qc.invalidateQueries({ queryKey: ['objectives'] }); setEditObjOpen(false); }}
        />
      )}

      {editKr && (
        <EditKeyResultModal
          kr={editKr}
          objectiveScope={objective.scope}
          onClose={() => setEditKr(null)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ['key-results', 'by-objective', id] }); setEditKr(null); }}
        />
      )}

      {deleteObjConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">حذف هدف</h3>
            <p className="text-sm text-gray-600 mb-4">هدف «{objective.title}» و تمام نتایج کلیدی آن حذف شود؟</p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setDeleteObjConfirm(false)} disabled={deleteObjMut.isPending}>انصراف</Button>
              <Button variant="danger" loading={deleteObjMut.isPending} onClick={() => deleteObjMut.mutate()}>حذف</Button>
            </div>
          </div>
        </div>
      )}

      {deleteKr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">حذف نتیجه کلیدی</h3>
            <p className="text-sm text-gray-600 mb-4">نتیجه کلیدی «{deleteKr.title}» حذف شود؟</p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setDeleteKr(null)} disabled={deleteKrMut.isPending}>انصراف</Button>
              <Button variant="danger" loading={deleteKrMut.isPending} onClick={() => deleteKrMut.mutate(deleteKr.id)}>حذف</Button>
            </div>
          </div>
        </div>
      )}
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

// ─── Edit Objective Modal ─────────────────────────────────────────────────────

function EditObjectiveModal({ objective, onClose, onSaved }: {
  objective: import('@/types').Objective;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(objective.title);
  const [description, setDescription] = useState(objective.description || '');
  const [scope, setScope] = useState(objective.scope || 'organization');
  const [ownerId, setOwnerId] = useState(objective.ownerId);
  const [status, setStatus] = useState(objective.status);

  const { data: usersResp } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll(1, 200) });
  const allUsers = usersResp?.data || [];

  const filteredOwners = scope === 'organization'
    ? allUsers.filter(u => u.roleName !== 'employee')
    : allUsers;

  const ownerOptions = [
    { value: '', label: 'انتخاب مالک...' },
    ...filteredOwners.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName} (${u.roleDisplayName || u.roleName})` })),
  ];

  const mut = useMutation({
    mutationFn: () => objectivesApi.update(objective.id, {
      title: title.trim(), description: description.trim() || undefined, scope, ownerId, status,
    }),
    onSuccess: () => { toast('هدف ویرایش شد'); onSaved(); },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <Modal open onClose={onClose} title="ویرایش هدف">
      <div className="space-y-4">
        <Input label="عنوان *" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
        <Input label="توضیحات" value={description} onChange={e => setDescription(e.target.value)} />
        <Select
          label="وضعیت"
          value={status}
          onChange={e => setStatus(e.target.value as import('@/types').ObjectiveStatus)}
          options={[
            { value: 'draft', label: 'پیش‌نویس' },
            { value: 'active', label: 'فعال' },
            { value: 'completed', label: 'تکمیل شده' },
            { value: 'cancelled', label: 'لغو شده' },
          ]}
        />
        <Select
          label="سطح هدف"
          value={scope}
          onChange={e => { setScope(e.target.value as 'organization' | 'team'); setOwnerId(''); }}
          options={[{ value: 'organization', label: 'سطح سازمان' }, { value: 'team', label: 'سطح تیم' }]}
        />
        <Select label="مالک *" options={ownerOptions} value={ownerId} onChange={e => setOwnerId(e.target.value)} />
        <Button fullWidth loading={mut.isPending} disabled={!title.trim() || !ownerId} onClick={() => mut.mutate()}>
          ذخیره
        </Button>
      </div>
    </Modal>
  );
}

// ─── Edit KR Modal ────────────────────────────────────────────────────────────

function EditKeyResultModal({ kr, objectiveScope, onClose, onSaved }: {
  kr: KeyResult;
  objectiveScope: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(kr.title);
  const [description, setDescription] = useState(kr.description || '');
  const [targetValue, setTargetValue] = useState(String(kr.targetValue));
  const [unit, setUnit] = useState(kr.unit || '');
  const [ownerId, setOwnerId] = useState(kr.ownerId);

  const { data: usersResp } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll(1, 200) });
  const allUsers = usersResp?.data || [];

  const filteredOwners = objectiveScope === 'organization'
    ? allUsers.filter(u => u.roleName !== 'employee')
    : allUsers;

  const ownerOptions = filteredOwners.map(u => ({
    value: u.id, label: `${u.firstName} ${u.lastName} (${u.roleDisplayName || u.roleName})`,
  }));

  const mut = useMutation({
    mutationFn: () => keyResultsApi.update(kr.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      targetValue: parseFloat(targetValue),
      unit: unit.trim() || undefined,
      ownerId,
    }),
    onSuccess: () => { toast('نتیجه کلیدی ویرایش شد'); onSaved(); },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <Modal open onClose={onClose} title="ویرایش نتیجه کلیدی">
      <div className="space-y-4">
        <Input label="عنوان *" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
        <Input label="توضیحات" value={description} onChange={e => setDescription(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="مقدار هدف *" type="number" value={targetValue} onChange={e => setTargetValue(e.target.value)} />
          <Input label="واحد" value={unit} onChange={e => setUnit(e.target.value)} />
        </div>
        <Select
          label="مالک *"
          options={ownerOptions}
          value={ownerId}
          onChange={e => setOwnerId(e.target.value)}
        />
        <Button fullWidth loading={mut.isPending}
          disabled={!title.trim() || !targetValue || !ownerId}
          onClick={() => mut.mutate()}>
          ذخیره
        </Button>
      </div>
    </Modal>
  );
}
