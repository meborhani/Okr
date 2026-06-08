import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TopBar } from '@/components/layout/TopBar';
import { ObjectiveCard } from '@/components/okr/ObjectiveCard';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { objectivesApi, periodsApi } from '@/lib/api/okr.api';
import { useAuthStore } from '@/lib/auth/auth.store';
import { periodLabel } from '@/lib/utils/format';
import type { Objective } from '@/types';

export function ObjectivesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [periodId, setPeriodId] = useState<string | undefined>();
  const [viewMine, setViewMine] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Objective | null>(null);

  const canDelete = user?.permissions?.includes('objectives:delete') ?? false;

  const { data: objectives, isLoading, isError, refetch } = useQuery({
    queryKey: ['objectives', viewMine ? 'mine' : 'all', periodId],
    queryFn: () => objectivesApi.getAll({ periodId, ownerId: viewMine ? user?.id : undefined }),
    enabled: !viewMine || !!user?.id,
  });
  const { data: periods } = useQuery({ queryKey: ['periods'], queryFn: periodsApi.getAll });

  const selectedPeriod = periods?.find((p) => p.id === periodId);
  const canCreate = !selectedPeriod || selectedPeriod.status === 'active';

  const deleteMut = useMutation({
    mutationFn: (id: string) => objectivesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['objectives'] });
      toast('هدف حذف شد');
      setDeleteConfirm(null);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <div>
      <TopBar title="اهداف و نتایج" right={
        canCreate ? (
          <Button size="sm" onClick={() => navigate('/objectives/new')}>
            <Plus size={15} /> جدید
          </Button>
        ) : null
      } />
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <PillBtn active={!viewMine} onClick={() => setViewMine(false)}>همه اهداف</PillBtn>
          <PillBtn active={viewMine} onClick={() => setViewMine(true)}>اهداف من</PillBtn>
        </div>

        {periods && periods.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <PillBtn active={!periodId} onClick={() => setPeriodId(undefined)} small>همه</PillBtn>
            {periods.map(p => (
              <PillBtn key={p.id} active={periodId === p.id} onClick={() => setPeriodId(p.id)} small>
                {periodLabel(p.year, p.quarter)}
              </PillBtn>
            ))}
          </div>
        )}

        {isLoading ? <PageSpinner />
          : isError ? <ErrorState onRetry={refetch} />
          : !objectives?.length ? (
            <EmptyState title="هدفی یافت نشد"
              action={canCreate ? <Button size="sm" onClick={() => navigate('/objectives/new')}>ایجاد هدف</Button> : undefined} />
          ) : (
            <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {objectives.map(o => (
                <ObjectiveCard
                  key={o.id}
                  objective={o}
                  onDelete={canDelete ? () => setDeleteConfirm(o) : undefined}
                />
              ))}
            </div>
          )}
      </div>

      {canCreate && (
        <button onClick={() => navigate('/objectives/new')}
          className="fixed bottom-20 left-4 w-14 h-14 rounded-full bg-primary-600 text-white shadow-fab flex items-center justify-center z-30 active:scale-95 transition-transform md:hidden">
          <Plus size={24} />
        </button>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">حذف هدف</h3>
            <p className="text-sm text-gray-600 mb-4">
              هدف <span className="font-semibold">«{deleteConfirm.title}»</span> و تمام نتایج کلیدی آن حذف شود؟ این عمل قابل بازگشت نیست.
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

function PillBtn({ active, onClick, children, small }: { active: boolean; onClick: () => void; children: React.ReactNode; small?: boolean }) {
  return (
    <button onClick={onClick}
      className={`flex-shrink-0 px-4 ${small ? 'py-1.5 text-xs' : 'py-2 text-sm'} rounded-xl font-medium transition-colors ${
        active ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 shadow-card'}`}>
      {children}
    </button>
  );
}
