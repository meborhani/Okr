import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, AlertTriangle, CheckCircle2, LogOut } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/lib/auth/auth.store';
import { periodLabel } from '@/lib/utils/format';
import { useDashboard } from './useDashboard';

export function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { dashboard, activePeriods } = useDashboard();

  const data = dashboard.data;
  const periods = activePeriods.data || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <TopBar
        title="داشبورد"
        right={
          <button onClick={handleLogout} className="p-2 hover:bg-surface-100 rounded-xl">
            <LogOut size={18} className="text-gray-500" />
          </button>
        }
      />

      <div className="p-4 space-y-4">
        {/* Greeting */}
        <div className="bg-gradient-to-l from-primary-600 to-primary-700 rounded-2xl p-5 text-white">
          <p className="text-primary-200 text-sm mb-1">خوش آمدید</p>
          <h2 className="text-xl font-bold">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-primary-200 text-sm mt-1">{user?.roleName}</p>
        </div>

        {/* Active Periods */}
        {periods.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
              دوره فعال
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {periods.map((p) => (
                <div
                  key={p.id}
                  className="flex-shrink-0 bg-white rounded-2xl px-4 py-2.5 shadow-card border border-primary-100"
                >
                  <p className="text-xs text-primary-600 font-semibold">
                    {periodLabel(p.year, p.quarter)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {dashboard.isLoading ? (
          <PageSpinner />
        ) : dashboard.isError ? (
          <ErrorState onRetry={dashboard.refetch} />
        ) : data ? (
          <>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                خلاصه اهداف
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  icon={<Target size={20} className="text-primary-500" />}
                  label="کل اهداف"
                  value={data.objectives.total_objectives}
                  bgClass="bg-primary-50"
                />
                <StatCard
                  icon={<CheckCircle2 size={20} className="text-success-500" />}
                  label="تکمیل شده"
                  value={data.objectives.completed_objectives}
                  bgClass="bg-success-50"
                />
                <StatCard
                  icon={<TrendingUp size={20} className="text-primary-500" />}
                  label="نتایج کلیدی"
                  value={data.keyResults.total_key_results}
                  bgClass="bg-primary-50"
                />
                <StatCard
                  icon={<AlertTriangle size={20} className="text-warning-500" />}
                  label="در خطر"
                  value={data.keyResults.at_risk_key_results}
                  bgClass="bg-warning-50"
                />
              </div>
            </div>

            {/* Average progress */}
            <Card>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-semibold text-gray-800">میانگین پیشرفت اهداف</p>
                <Badge className="bg-primary-100 text-primary-700">
                  {Math.round(data.objectives.avg_progress || 0)}٪
                </Badge>
              </div>
              <ProgressBar
                value={data.objectives.avg_progress || 0}
                colorClass="bg-primary-500"
              />

              <div className="flex justify-between items-center mb-3 mt-4">
                <p className="text-sm font-semibold text-gray-800">میانگین پیشرفت نتایج کلیدی</p>
                <Badge className="bg-success-50 text-success-600">
                  {Math.round(data.keyResults.avg_progress || 0)}٪
                </Badge>
              </div>
              <ProgressBar
                value={data.keyResults.avg_progress || 0}
                colorClass="bg-success-500"
              />
            </Card>

            {/* Quick actions */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                دسترسی سریع
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Card
                  hoverable
                  onClick={() => navigate('/my-okrs')}
                  className="text-center py-5"
                >
                  <Target size={24} className="text-primary-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-800">OKR من</p>
                </Card>
                <Card
                  hoverable
                  onClick={() => navigate('/reports')}
                  className="text-center py-5"
                >
                  <TrendingUp size={24} className="text-success-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-800">گزارش‌ها</p>
                </Card>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bgClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bgClass: string;
}) {
  return (
    <Card>
      <div className={`w-10 h-10 rounded-2xl ${bgClass} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{(value || 0).toLocaleString('fa-IR')}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </Card>
  );
}
