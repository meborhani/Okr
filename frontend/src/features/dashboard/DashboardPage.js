"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardPage = DashboardPage;
const react_router_dom_1 = require("react-router-dom");
const lucide_react_1 = require("lucide-react");
const TopBar_1 = require("@/components/layout/TopBar");
const Card_1 = require("@/components/ui/Card");
const Spinner_1 = require("@/components/ui/Spinner");
const ErrorState_1 = require("@/components/ui/ErrorState");
const ProgressBar_1 = require("@/components/ui/ProgressBar");
const Badge_1 = require("@/components/ui/Badge");
const auth_store_1 = require("@/lib/auth/auth.store");
const format_1 = require("@/lib/utils/format");
const useDashboard_1 = require("./useDashboard");
function DashboardPage() {
    const { user, logout } = (0, auth_store_1.useAuthStore)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { dashboard, activePeriods } = (0, useDashboard_1.useDashboard)();
    const data = dashboard.data;
    const periods = activePeriods.data || [];
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (<div>
      <TopBar_1.TopBar title="داشبورد" right={<button onClick={handleLogout} className="p-2 hover:bg-surface-100 rounded-xl">
            <lucide_react_1.LogOut size={18} className="text-gray-500"/>
          </button>}/>

      <div className="p-4 space-y-4">
        
        <div className="bg-gradient-to-l from-primary-600 to-primary-700 rounded-2xl p-5 text-white">
          <p className="text-primary-200 text-sm mb-1">خوش آمدید</p>
          <h2 className="text-xl font-bold">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-primary-200 text-sm mt-1">{user?.roleName}</p>
        </div>

        
        {periods.length > 0 && (<div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
              دوره فعال
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {periods.map((p) => (<div key={p.id} className="flex-shrink-0 bg-white rounded-2xl px-4 py-2.5 shadow-card border border-primary-100">
                  <p className="text-xs text-primary-600 font-semibold">
                    {(0, format_1.periodLabel)(p.year, p.quarter)}
                  </p>
                </div>))}
            </div>
          </div>)}

        
        {dashboard.isLoading ? (<Spinner_1.PageSpinner />) : dashboard.isError ? (<ErrorState_1.ErrorState onRetry={dashboard.refetch}/>) : data ? (<>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                خلاصه اهداف
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={<lucide_react_1.Target size={20} className="text-primary-500"/>} label="کل اهداف" value={data.objectives.total_objectives} bgClass="bg-primary-50"/>
                <StatCard icon={<lucide_react_1.CheckCircle2 size={20} className="text-success-500"/>} label="تکمیل شده" value={data.objectives.completed_objectives} bgClass="bg-success-50"/>
                <StatCard icon={<lucide_react_1.TrendingUp size={20} className="text-primary-500"/>} label="نتایج کلیدی" value={data.keyResults.total_key_results} bgClass="bg-primary-50"/>
                <StatCard icon={<lucide_react_1.AlertTriangle size={20} className="text-warning-500"/>} label="در خطر" value={data.keyResults.at_risk_key_results} bgClass="bg-warning-50"/>
              </div>
            </div>

            
            <Card_1.Card>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-semibold text-gray-800">میانگین پیشرفت اهداف</p>
                <Badge_1.Badge className="bg-primary-100 text-primary-700">
                  {Math.round(data.objectives.avg_progress || 0)}٪
                </Badge_1.Badge>
              </div>
              <ProgressBar_1.ProgressBar value={data.objectives.avg_progress || 0} colorClass="bg-primary-500"/>

              <div className="flex justify-between items-center mb-3 mt-4">
                <p className="text-sm font-semibold text-gray-800">میانگین پیشرفت نتایج کلیدی</p>
                <Badge_1.Badge className="bg-success-50 text-success-600">
                  {Math.round(data.keyResults.avg_progress || 0)}٪
                </Badge_1.Badge>
              </div>
              <ProgressBar_1.ProgressBar value={data.keyResults.avg_progress || 0} colorClass="bg-success-500"/>
            </Card_1.Card>

            
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                دسترسی سریع
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Card_1.Card hoverable onClick={() => navigate('/my-okrs')} className="text-center py-5">
                  <lucide_react_1.Target size={24} className="text-primary-500 mx-auto mb-2"/>
                  <p className="text-sm font-semibold text-gray-800">OKR من</p>
                </Card_1.Card>
                <Card_1.Card hoverable onClick={() => navigate('/reports')} className="text-center py-5">
                  <lucide_react_1.TrendingUp size={24} className="text-success-500 mx-auto mb-2"/>
                  <p className="text-sm font-semibold text-gray-800">گزارش‌ها</p>
                </Card_1.Card>
              </div>
            </div>
          </>) : null}
      </div>
    </div>);
}
function StatCard({ icon, label, value, bgClass, }) {
    return (<Card_1.Card>
      <div className={`w-10 h-10 rounded-2xl ${bgClass} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{(value || 0).toLocaleString('fa-IR')}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </Card_1.Card>);
}
//# sourceMappingURL=DashboardPage.js.map