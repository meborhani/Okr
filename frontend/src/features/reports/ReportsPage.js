"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsPage = ReportsPage;
const react_query_1 = require("@tanstack/react-query");
const TopBar_1 = require("@/components/layout/TopBar");
const Card_1 = require("@/components/ui/Card");
const ProgressBar_1 = require("@/components/ui/ProgressBar");
const Badge_1 = require("@/components/ui/Badge");
const Spinner_1 = require("@/components/ui/Spinner");
const ErrorState_1 = require("@/components/ui/ErrorState");
const EmptyState_1 = require("@/components/ui/EmptyState");
const okr_api_1 = require("@/lib/api/okr.api");
const lucide_react_1 = require("lucide-react");
function ReportsPage() {
    const dashboard = (0, react_query_1.useQuery)({ queryKey: ['dashboard'], queryFn: () => okr_api_1.reportsApi.getDashboard() });
    const teamProgress = (0, react_query_1.useQuery)({ queryKey: ['reports', 'team'], queryFn: () => okr_api_1.reportsApi.getTeamProgress() });
    const userProgress = (0, react_query_1.useQuery)({ queryKey: ['reports', 'user'], queryFn: () => okr_api_1.reportsApi.getUserProgress() });
    return (<div>
      <TopBar_1.TopBar title="گزارش‌ها"/>
      <div className="p-4 space-y-4">

        
        {dashboard.isLoading ? <Spinner_1.PageSpinner />
            : dashboard.isError ? <ErrorState_1.ErrorState onRetry={dashboard.refetch}/>
                : dashboard.data ? (<Card_1.Card>
              <h3 className="font-bold text-gray-900 mb-4">خلاصه کلی</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Stat label="کل اهداف" value={dashboard.data.objectives.total_objectives}/>
                <Stat label="تکمیل شده" value={dashboard.data.objectives.completed_objectives} color="text-success-600"/>
                <Stat label="نتایج کلیدی" value={dashboard.data.keyResults.total_key_results}/>
                <Stat label="در خطر" value={dashboard.data.keyResults.at_risk_key_results} color="text-warning-600"/>
              </div>
              <div className="space-y-3">
                <ProgressRow label="میانگین پیشرفت اهداف" value={dashboard.data.objectives.avg_progress || 0} color="bg-primary-500"/>
                <ProgressRow label="میانگین پیشرفت KR ها" value={dashboard.data.keyResults.avg_progress || 0} color="bg-success-500"/>
              </div>
            </Card_1.Card>) : null}

        
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">پیشرفت تیم‌ها</p>
          {teamProgress.isLoading ? <Spinner_1.PageSpinner />
            : teamProgress.isError ? <ErrorState_1.ErrorState onRetry={teamProgress.refetch}/>
                : !teamProgress.data?.length ? (<EmptyState_1.EmptyState icon={<lucide_react_1.Building2 size={24} className="text-gray-400"/>} title="داده‌ای موجود نیست"/>) : (<div className="space-y-3">
                {teamProgress.data.map(t => (<Card_1.Card key={t.teamId}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-gray-900 text-sm">{t.teamName}</p>
                      <Badge_1.Badge className="bg-primary-100 text-primary-700">{Math.round(t.avgObjectiveProgress)}٪</Badge_1.Badge>
                    </div>
                    <ProgressBar_1.ProgressBar value={t.avgObjectiveProgress} colorClass="bg-primary-500" size="sm"/>
                    <div className="flex gap-3 mt-2 text-xs text-gray-400">
                      <span>{t.totalObjectives} هدف</span>
                      <span>{t.totalKeyResults} نتیجه کلیدی</span>
                    </div>
                  </Card_1.Card>))}
              </div>)}
        </div>

        
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">پیشرفت کاربران</p>
          {userProgress.isLoading ? <Spinner_1.PageSpinner />
            : userProgress.isError ? <ErrorState_1.ErrorState onRetry={userProgress.refetch}/>
                : !userProgress.data?.filter(u => u.totalObjectives > 0).length ? (<EmptyState_1.EmptyState icon={<lucide_react_1.Users size={24} className="text-gray-400"/>} title="داده‌ای موجود نیست"/>) : (<div className="space-y-3">
                {userProgress.data.filter(u => u.totalObjectives > 0).map(u => (<Card_1.Card key={u.userId}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{u.userName}</p>
                        <p className="text-xs text-gray-400">{u.role}</p>
                      </div>
                      <Badge_1.Badge className="bg-success-50 text-success-600">{Math.round(u.avgObjectiveProgress)}٪</Badge_1.Badge>
                    </div>
                    <ProgressBar_1.ProgressBar value={u.avgObjectiveProgress} colorClass="bg-success-500" size="sm"/>
                    <div className="flex gap-3 mt-2 text-xs text-gray-400">
                      <span>{u.totalObjectives} هدف</span>
                      <span>{u.totalKeyResults} نتیجه کلیدی</span>
                    </div>
                  </Card_1.Card>))}
              </div>)}
        </div>

      </div>
    </div>);
}
function Stat({ label, value, color = 'text-gray-900' }) {
    return (<div className="bg-surface-50 rounded-xl p-3">
      <p className={`text-xl font-bold ${color}`}>{(value || 0).toLocaleString('fa-IR')}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>);
}
function ProgressRow({ label, value, color }) {
    return (<div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-500">{label}</span>
        <span className="font-bold text-gray-800">{Math.round(value)}٪</span>
      </div>
      <ProgressBar_1.ProgressBar value={value} colorClass={color} size="sm"/>
    </div>);
}
//# sourceMappingURL=ReportsPage.js.map