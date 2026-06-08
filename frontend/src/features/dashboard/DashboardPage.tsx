import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Target, TrendingUp, AlertTriangle, CheckCircle2, LogOut, CalendarClock, KanbanSquare } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/lib/auth/auth.store';
import { periodLabel, formatDateShort } from '@/lib/utils/format';
import { useDashboard } from './useDashboard';
import { reportsApi, keyResultsApi, type KrTimeline } from '@/lib/api/okr.api';

export function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { dashboard, activePeriods, currentSession } = useDashboard();
  const teamProgress = useQuery({ queryKey: ['reports', 'team'], queryFn: () => reportsApi.getTeamProgress() });

  const data = dashboard.data;
  const periods = activePeriods.data || [];
  const session = currentSession.data;

  return (
    <div>
      <TopBar
        title="داشبورد"
        right={
          <button onClick={() => { logout(); navigate('/login'); }} className="p-2 hover:bg-surface-100 rounded-xl">
            <LogOut size={18} className="text-gray-500" />
          </button>
        }
      />

      <div className="p-4 space-y-4">
        {/* Greeting */}
        <div className="bg-gradient-to-l from-primary-600 to-primary-700 rounded-2xl p-5 text-white">
          <p className="text-primary-200 text-sm mb-1">خوش آمدید</p>
          <h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
          <p className="text-primary-200 text-sm mt-1">{user?.roleDisplayName || user?.roleName}</p>
        </div>

        {/* Active Periods */}
        {periods.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">دوره فعال</p>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {periods.map((p) => (
                <div key={p.id} className="flex-shrink-0 bg-white rounded-2xl px-4 py-2.5 shadow-card border border-primary-100">
                  <p className="text-xs text-primary-600 font-semibold">{periodLabel(p.year, p.quarter)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Check-in Session */}
        {session && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">جلسه چک‌این جاری</p>
            <Card hoverable onClick={() => navigate('/check-in-sessions')} className="border-l-4 border-l-emerald-400">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <CalendarClock size={18} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{session.title}</p>
                  <p className="text-xs text-gray-400">{session.periodTitle}</p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700">باز</Badge>
              </div>
            </Card>
          </div>
        )}

        {/* KR Timeline Chart */}
        <KrTimelineSection />

        {/* Stats */}
        {dashboard.isLoading ? (
          <PageSpinner />
        ) : dashboard.isError ? (
          <ErrorState onRetry={dashboard.refetch} />
        ) : data ? (
          <>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">خلاصه اهداف</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={<Target size={20} className="text-primary-500" />} label="کل اهداف" value={data.objectives.total_objectives} bgClass="bg-primary-50" />
                <StatCard icon={<CheckCircle2 size={20} className="text-success-500" />} label="تکمیل شده" value={data.objectives.completed_objectives} bgClass="bg-success-50" />
                <StatCard icon={<TrendingUp size={20} className="text-primary-500" />} label="نتایج کلیدی" value={data.keyResults.total_key_results} bgClass="bg-primary-50" />
                <StatCard icon={<AlertTriangle size={20} className="text-warning-500" />} label="در خطر" value={data.keyResults.at_risk_key_results} bgClass="bg-warning-50" />
              </div>
            </div>

            <Card>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-semibold text-gray-800">میانگین پیشرفت اهداف</p>
                <Badge className="bg-primary-100 text-primary-700">{Math.round(data.objectives.avg_progress || 0)}٪</Badge>
              </div>
              <ProgressBar value={data.objectives.avg_progress || 0} colorClass="bg-primary-500" />
              <div className="flex justify-between items-center mb-3 mt-4">
                <p className="text-sm font-semibold text-gray-800">میانگین پیشرفت نتایج کلیدی</p>
                <Badge className="bg-success-50 text-success-600">{Math.round(data.keyResults.avg_progress || 0)}٪</Badge>
              </div>
              <ProgressBar value={data.keyResults.avg_progress || 0} colorClass="bg-success-500" />
            </Card>

            {/* Quick actions */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">دسترسی سریع</p>
              <div className="grid grid-cols-2 gap-3">
                <Card hoverable onClick={() => navigate('/objectives')} className="text-center py-5">
                  <Target size={24} className="text-primary-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-800">اهداف و نتایج</p>
                </Card>
                <Card hoverable onClick={() => navigate('/tasks')} className="text-center py-5">
                  <KanbanSquare size={24} className="text-success-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-800">تسک‌ها</p>
                </Card>
              </div>
            </div>

            {/* Team progress */}
            {teamProgress.data && teamProgress.data.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">پیشرفت تیم‌ها</p>
                <div className="space-y-3">
                  {teamProgress.data.map((t) => (
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
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

// ─── KR Timeline Section ──────────────────────────────────────────────────────

function KrTimelineSection() {
  const [selectedKrId, setSelectedKrId] = useState('');

  const { data: activePeriods } = useQuery({
    queryKey: ['periods', 'active'],
    queryFn: () => import('@/lib/api/okr.api').then(m => m.periodsApi.getActive()),
  });
  const activePeriodId = activePeriods?.[0]?.id;

  const { data: krsResp } = useQuery({
    queryKey: ['key-results', 'dashboard', activePeriodId],
    queryFn: () => keyResultsApi.getAll(activePeriodId ? { periodId: activePeriodId } : undefined),
    enabled: !!activePeriodId,
  });
  const krs = (krsResp || []).filter(kr => kr.status !== 'cancelled');

  const { data: timeline, isLoading } = useQuery({
    queryKey: ['kr-timeline', selectedKrId],
    queryFn: () => reportsApi.getKeyResultTimeline(selectedKrId),
    enabled: !!selectedKrId,
  });

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">نمودار زمانی نتیجه کلیدی</p>
      <Card>
        <div className="mb-3">
          <select
            className="w-full text-sm border border-surface-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white text-gray-800"
            value={selectedKrId}
            onChange={e => setSelectedKrId(e.target.value)}
            dir="rtl"
          >
            <option value="">انتخاب نتیجه کلیدی...</option>
            {krs.map(kr => (
              <option key={kr.id} value={kr.id}>{kr.title} — {kr.objectiveTitle}</option>
            ))}
          </select>
        </div>

        {!selectedKrId && (
          <div className="flex flex-col items-center py-8 text-center">
            <TrendingUp size={32} className="text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">یک نتیجه کلیدی انتخاب کنید</p>
          </div>
        )}

        {selectedKrId && isLoading && <div className="py-8 text-center text-xs text-gray-400">در حال بارگذاری...</div>}

        {selectedKrId && !isLoading && timeline && (
          <KrLineChart timeline={timeline} />
        )}

        {selectedKrId && !isLoading && !timeline && (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-400">داده‌ای یافت نشد</p>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── SVG Line Chart ───────────────────────────────────────────────────────────

function KrLineChart({ timeline }: { timeline: KrTimeline }) {
  const { keyResultTitle, startValue, targetValue, unit, sessions, thresholds } = timeline;

  if (sessions.length === 0) {
    return (
      <div className="py-8 text-center">
        <TrendingUp size={28} className="text-gray-200 mx-auto mb-2" />
        <p className="text-sm text-gray-400">هنوز چک‌اینی ثبت نشده</p>
      </div>
    );
  }

  const W = 380, H = 180, PAD = { t: 20, r: 12, b: 36, l: 52 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const vals = sessions.map(s => s.value);
  const minY = Math.min(thresholds.p0, ...vals);
  const maxY = Math.max(thresholds.p100, ...vals);
  const rangeY = maxY - minY || 1;

  const xOf = (i: number) => sessions.length < 2 ? chartW / 2 : (i / (sessions.length - 1)) * chartW;
  const yOf = (v: number) => chartH - ((v - minY) / rangeY) * chartH;

  const points = sessions.map((s, i) => `${PAD.l + xOf(i)},${PAD.t + yOf(s.value)}`).join(' ');

  const thresholdLines = [
    { v: thresholds.p0,   label: '۰٪',   color: '#9ca3af' },
    { v: thresholds.p30,  label: '۳۰٪',  color: '#f59e0b' },
    { v: thresholds.p70,  label: '۷۰٪',  color: '#10b981' },
    { v: thresholds.p100, label: '۱۰۰٪', color: '#6366f1' },
  ];

  const u = unit ? ` ${unit}` : '';

  return (
    <div>
      <p className="text-xs font-semibold text-gray-700 mb-0.5 truncate">{keyResultTitle}</p>
      <p className="text-[10px] text-gray-400 mb-3">
        شروع: {startValue.toLocaleString('fa-IR')}{u} · هدف: {targetValue.toLocaleString('fa-IR')}{u}
      </p>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 260, maxWidth: '100%' }}>

          {/* Threshold reference lines */}
          {thresholdLines.map(({ v, label, color }) => {
            const y = PAD.t + yOf(v);
            return (
              <g key={label}>
                <line x1={PAD.l} y1={y} x2={PAD.l + chartW} y2={y}
                  stroke={color} strokeWidth="1" strokeDasharray="4,3" opacity="0.45" />
                <text x={PAD.l - 3} y={y + 3.5} textAnchor="end" fontSize="8.5" fill={color} opacity="0.75">{label}</text>
              </g>
            );
          })}

          {/* Axes */}
          <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + chartH} stroke="#e5e7eb" strokeWidth="1" />
          <line x1={PAD.l} y1={PAD.t + chartH} x2={PAD.l + chartW} y2={PAD.t + chartH} stroke="#e5e7eb" strokeWidth="1" />

          {/* Area */}
          {sessions.length > 1 && (
            <path
              d={`M ${PAD.l + xOf(0)},${PAD.t + chartH} ${sessions.map((s, i) => `L ${PAD.l + xOf(i)},${PAD.t + yOf(s.value)}`).join(' ')} L ${PAD.l + xOf(sessions.length - 1)},${PAD.t + chartH} Z`}
              fill="#6366f1" opacity="0.07"
            />
          )}

          {/* Line */}
          <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />

          {/* Dots + labels */}
          {sessions.map((s, i) => {
            const x = PAD.l + xOf(i);
            const y = PAD.t + yOf(s.value);
            const showLabel = sessions.length <= 7 || i % Math.ceil(sessions.length / 6) === 0;
            const jalali = new Date(s.gregorianDate).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
            return (
              <g key={s.sessionId}>
                <circle cx={x} cy={y} r="3.5" fill="#6366f1" />
                <text x={x} y={y - 7} textAnchor="middle" fontSize="8.5" fill="#4f46e5">
                  {s.value.toLocaleString('fa-IR')}{u}
                </text>
                {showLabel && (
                  <text x={x} y={PAD.t + chartH + 14} textAnchor="middle" fontSize="8" fill="#9ca3af">{jalali}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, bgClass }: { icon: React.ReactNode; label: string; value: number; bgClass: string }) {
  return (
    <Card>
      <div className={`w-10 h-10 rounded-2xl ${bgClass} flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{(value || 0).toLocaleString('fa-IR')}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </Card>
  );
}
