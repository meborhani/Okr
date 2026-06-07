import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ClipboardCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { TopBar } from '@/components/layout/TopBar';
import { ObjectiveCard } from '@/components/okr/ObjectiveCard';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { objectivesApi, periodsApi } from '@/lib/api/okr.api';
import { useAuthStore } from '@/lib/auth/auth.store';
import { periodLabel } from '@/lib/utils/format';

export function MyOkrsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [periodId, setPeriodId] = useState<string | undefined>();

  const { data: objectives, isLoading, isError, refetch } = useQuery({
    queryKey: ['objectives', 'mine', periodId],
    queryFn: () => objectivesApi.getAll({ periodId, ownerId: user?.id }),
    enabled: !!user?.id,
  });
  const { data: periods } = useQuery({ queryKey: ['periods'], queryFn: periodsApi.getAll });

  return (
    <div>
      <TopBar title="OKR من"
        right={
          <button onClick={() => navigate('/check-in')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 text-primary-700 text-xs font-semibold">
            <ClipboardCheck size={14} /> چک‌این
          </button>
        }
      />
      <div className="p-4 space-y-4">
        {periods && periods.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <PillBtn active={!periodId} onClick={() => setPeriodId(undefined)}>همه</PillBtn>
            {periods.map(p => (
              <PillBtn key={p.id} active={periodId === p.id} onClick={() => setPeriodId(p.id)}>
                {periodLabel(p.year, p.quarter)}
              </PillBtn>
            ))}
          </div>
        )}
        {isLoading ? <PageSpinner />
          : isError ? <ErrorState onRetry={refetch} />
          : !objectives?.length ? (
            <EmptyState
              icon={<ClipboardCheck size={28} className="text-primary-400" />}
              title="هنوز هدفی تعریف نشده است"
              description="اولین هدف OKR خود را بسازید"
              action={
                <Button size="lg" onClick={() => navigate('/objectives/new')}>
                  <Plus size={18} /> ایجاد هدف جدید
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {objectives.map(o => <ObjectiveCard key={o.id} objective={o} />)}
            </div>
          )}
      </div>
      <button onClick={() => navigate('/objectives/new')}
        className="fixed bottom-20 left-4 w-14 h-14 rounded-full bg-primary-600 text-white shadow-fab flex items-center justify-center z-30 active:scale-95 transition-transform">
        <Plus size={24} />
      </button>
    </div>
  );
}

function PillBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
        active ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 shadow-card'}`}>
      {children}
    </button>
  );
}
