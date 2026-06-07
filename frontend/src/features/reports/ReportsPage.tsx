import { useQuery } from '@tanstack/react-query';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { reportsApi } from '@/lib/api/okr.api';
import { Users, Building2 } from 'lucide-react';

export function ReportsPage() {
  const dashboard = useQuery({ queryKey: ['dashboard'], queryFn: () => reportsApi.getDashboard() });
  const teamProgress = useQuery({ queryKey: ['reports', 'team'], queryFn: () => reportsApi.getTeamProgress() });
  const userProgress = useQuery({ queryKey: ['reports', 'user'], queryFn: () => reportsApi.getUserProgress() });

  return (
    <div>
      <TopBar title="گزارش‌ها" />
      <div className="p-4 space-y-4">

        {/* Summary */}
        {dashboard.isLoading ? <PageSpinner />
          : dashboard.isError ? <ErrorState onRetry={dashboard.refetch} />
          : dashboard.data ? (
            <Card>
              <h3 className="font-bold text-gray-900 mb-4">خلاصه کلی</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Stat label="کل اهداف" value={dashboard.data.objectives.total_objectives} />
                <Stat label="تکمیل شده" value={dashboard.data.objectives.completed_objectives} color="text-success-600" />
                <Stat label="نتایج کلیدی" value={dashboard.data.keyResults.total_key_results} />
                <Stat label="در خطر" value={dashboard.data.keyResults.at_risk_key_results} color="text-warning-600" />
              </div>
              <div className="space-y-3">
                <ProgressRow label="میانگین پیشرفت اهداف" value={dashboard.data.objectives.avg_progress || 0} color="bg-primary-500" />
                <ProgressRow label="میانگین پیشرفت KR ها" value={dashboard.data.keyResults.avg_progress || 0} color="bg-success-500" />
              </div>
            </Card>
          ) : null}

        {/* Team Progress */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">پیشرفت تیم‌ها</p>
          {teamProgress.isLoading ? <PageSpinner />
            : teamProgress.isError ? <ErrorState onRetry={teamProgress.refetch} />
            : !teamProgress.data?.length ? (
              <EmptyState icon={<Building2 size={24} className="text-gray-400" />} title="داده‌ای موجود نیست" />
            ) : (
              <div className="space-y-3">
                {teamProgress.data.map(t => (
                  <Card key={t.teamId}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-gray-900 text-sm">{t.teamName}</p>
                      <Badge className="bg-primary-100 text-primary-700">{Math.round(t.avgObjectiveProgress)}٪</Badge>
                    </div>
                    <ProgressBar value={t.avgObjectiveProgress} colorClass="bg-primary-500" size="sm" />
                    <div className="flex gap-3 mt-2 text-xs text-gray-400">
                      <span>{t.totalObjectives} هدف</span>
                      <span>{t.totalKeyResults} نتیجه کلیدی</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
        </div>

        {/* User Progress */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">پیشرفت کاربران</p>
          {userProgress.isLoading ? <PageSpinner />
            : userProgress.isError ? <ErrorState onRetry={userProgress.refetch} />
            : !userProgress.data?.filter(u => u.totalObjectives > 0).length ? (
              <EmptyState icon={<Users size={24} className="text-gray-400" />} title="داده‌ای موجود نیست" />
            ) : (
              <div className="space-y-3">
                {userProgress.data.filter(u => u.totalObjectives > 0).map(u => (
                  <Card key={u.userId}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{u.userName}</p>
                        <p className="text-xs text-gray-400">{u.role}</p>
                      </div>
                      <Badge className="bg-success-50 text-success-600">{Math.round(u.avgObjectiveProgress)}٪</Badge>
                    </div>
                    <ProgressBar value={u.avgObjectiveProgress} colorClass="bg-success-500" size="sm" />
                    <div className="flex gap-3 mt-2 text-xs text-gray-400">
                      <span>{u.totalObjectives} هدف</span>
                      <span>{u.totalKeyResults} نتیجه کلیدی</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
        </div>

      </div>
    </div>
  );
}

function Stat({ label, value, color = 'text-gray-900' }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-surface-50 rounded-xl p-3">
      <p className={`text-xl font-bold ${color}`}>{(value || 0).toLocaleString('fa-IR')}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
function ProgressRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-500">{label}</span>
        <span className="font-bold text-gray-800">{Math.round(value)}٪</span>
      </div>
      <ProgressBar value={value} colorClass={color} size="sm" />
    </div>
  );
}
