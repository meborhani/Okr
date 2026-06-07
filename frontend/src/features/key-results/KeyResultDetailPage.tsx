import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ClipboardList } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { krStatusLabel, krStatusColor, krProgressColor } from '@/lib/utils/status';
import { formatDate, formatDateTime } from '@/lib/utils/format';
import { useKeyResult, useKeyResultCheckIns } from './useKeyResults';

export function KeyResultDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: kr, isLoading, isError, refetch } = useKeyResult(id!);
  const { data: checkIns, isLoading: checkInsLoading } = useKeyResultCheckIns(id!);

  if (isLoading) return <PageSpinner />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!kr) return null;

  return (
    <div>
      <TopBar
        title="نتیجه کلیدی"
        showBack
        right={
          <Button
            size="sm"
            onClick={() => navigate(`/check-in/${id}`)}
          >
            <Plus size={16} />
            چک‌این
          </Button>
        }
      />

      <div className="p-4 space-y-4">
        {/* Header */}
        <Card>
          <div className="flex items-start justify-between gap-2 mb-3">
            <h2 className="text-base font-bold text-gray-900 flex-1 leading-snug">{kr.title}</h2>
            <Badge className={krStatusColor[kr.status]}>{krStatusLabel[kr.status]}</Badge>
          </div>

          {kr.description && (
            <p className="text-sm text-gray-500 mb-4">{kr.description}</p>
          )}

          {/* Progress numbers */}
          <div className="bg-surface-50 rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-end mb-2">
              <div className="text-center">
                <p className="text-xs text-gray-400">شروع</p>
                <p className="text-lg font-bold text-gray-600">
                  {kr.startValue.toLocaleString('fa-IR')}
                  {kr.unit && <span className="text-xs font-normal mr-1">{kr.unit}</span>}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">فعلی</p>
                <p className="text-2xl font-bold text-primary-600">
                  {kr.currentValue.toLocaleString('fa-IR')}
                  {kr.unit && <span className="text-sm font-normal mr-1">{kr.unit}</span>}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">هدف</p>
                <p className="text-lg font-bold text-gray-600">
                  {kr.targetValue.toLocaleString('fa-IR')}
                  {kr.unit && <span className="text-xs font-normal mr-1">{kr.unit}</span>}
                </p>
              </div>
            </div>
            <ProgressBar
              value={kr.progress}
              colorClass={krProgressColor[kr.status]}
              showLabel
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="هدف" value={kr.objectiveTitle} />
            <InfoItem label="مالک" value={kr.ownerName} />
            <InfoItem label="تاریخ ایجاد" value={formatDate(kr.createdAt)} />
            <InfoItem label="آخرین بروزرسانی" value={formatDate(kr.updatedAt)} />
          </div>
        </Card>

        {/* Check-ins */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
            تاریخچه چک‌این ({checkIns?.length || 0})
          </p>

          {checkInsLoading ? (
            <PageSpinner />
          ) : !checkIns?.length ? (
            <EmptyState
              icon={<ClipboardList size={24} className="text-gray-400" />}
              title="چک‌اینی ثبت نشده"
              action={
                <Button size="sm" onClick={() => navigate(`/check-in/${id}`)}>
                  ثبت اولین چک‌این
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {checkIns.map((ci) => (
                <Card key={ci.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-base font-bold text-primary-600">
                        {ci.value.toLocaleString('fa-IR')}
                        {kr.unit && <span className="text-sm font-normal mr-1">{kr.unit}</span>}
                      </p>
                      {ci.note && (
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{ci.note}</p>
                      )}
                    </div>
                    <div className="text-left text-xs text-gray-400">
                      <p>{ci.checkedByName}</p>
                      <p className="mt-0.5">{formatDateTime(ci.checkDate)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate(`/check-in/${id}`)}
        className="fixed bottom-24 left-4 w-14 h-14 rounded-full bg-primary-600 text-white shadow-fab flex items-center justify-center z-30 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{value}</p>
    </div>
  );
}
