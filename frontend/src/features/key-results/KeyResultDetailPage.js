"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyResultDetailPage = KeyResultDetailPage;
const react_router_dom_1 = require("react-router-dom");
const lucide_react_1 = require("lucide-react");
const TopBar_1 = require("@/components/layout/TopBar");
const Card_1 = require("@/components/ui/Card");
const Badge_1 = require("@/components/ui/Badge");
const ProgressBar_1 = require("@/components/ui/ProgressBar");
const Button_1 = require("@/components/ui/Button");
const Spinner_1 = require("@/components/ui/Spinner");
const ErrorState_1 = require("@/components/ui/ErrorState");
const EmptyState_1 = require("@/components/ui/EmptyState");
const status_1 = require("@/lib/utils/status");
const format_1 = require("@/lib/utils/format");
const useKeyResults_1 = require("./useKeyResults");
function KeyResultDetailPage() {
    const { id } = (0, react_router_dom_1.useParams)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { data: kr, isLoading, isError, refetch } = (0, useKeyResults_1.useKeyResult)(id);
    const { data: checkIns, isLoading: checkInsLoading } = (0, useKeyResults_1.useKeyResultCheckIns)(id);
    if (isLoading)
        return <Spinner_1.PageSpinner />;
    if (isError)
        return <ErrorState_1.ErrorState onRetry={refetch}/>;
    if (!kr)
        return null;
    return (<div>
      <TopBar_1.TopBar title="نتیجه کلیدی" showBack right={<Button_1.Button size="sm" onClick={() => navigate(`/check-in/${id}`)}>
            <lucide_react_1.Plus size={16}/>
            چک‌این
          </Button_1.Button>}/>

      <div className="p-4 space-y-4">
        
        <Card_1.Card>
          <div className="flex items-start justify-between gap-2 mb-3">
            <h2 className="text-base font-bold text-gray-900 flex-1 leading-snug">{kr.title}</h2>
            <Badge_1.Badge className={status_1.krStatusColor[kr.status]}>{status_1.krStatusLabel[kr.status]}</Badge_1.Badge>
          </div>

          {kr.description && (<p className="text-sm text-gray-500 mb-4">{kr.description}</p>)}

          
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
            <ProgressBar_1.ProgressBar value={kr.progress} colorClass={status_1.krProgressColor[kr.status]} showLabel/>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="هدف" value={kr.objectiveTitle}/>
            <InfoItem label="مالک" value={kr.ownerName}/>
            <InfoItem label="تاریخ ایجاد" value={(0, format_1.formatDate)(kr.createdAt)}/>
            <InfoItem label="آخرین بروزرسانی" value={(0, format_1.formatDate)(kr.updatedAt)}/>
          </div>
        </Card_1.Card>

        
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
            تاریخچه چک‌این ({checkIns?.length || 0})
          </p>

          {checkInsLoading ? (<Spinner_1.PageSpinner />) : !checkIns?.length ? (<EmptyState_1.EmptyState icon={<lucide_react_1.ClipboardList size={24} className="text-gray-400"/>} title="چک‌اینی ثبت نشده" action={<Button_1.Button size="sm" onClick={() => navigate(`/check-in/${id}`)}>
                  ثبت اولین چک‌این
                </Button_1.Button>}/>) : (<div className="space-y-3">
              {checkIns.map((ci) => (<Card_1.Card key={ci.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-base font-bold text-primary-600">
                        {ci.value.toLocaleString('fa-IR')}
                        {kr.unit && <span className="text-sm font-normal mr-1">{kr.unit}</span>}
                      </p>
                      {ci.note && (<p className="text-sm text-gray-500 mt-1 leading-relaxed">{ci.note}</p>)}
                    </div>
                    <div className="text-left text-xs text-gray-400">
                      <p>{ci.checkedByName}</p>
                      <p className="mt-0.5">{(0, format_1.formatDateTime)(ci.checkDate)}</p>
                    </div>
                  </div>
                </Card_1.Card>))}
            </div>)}
        </div>
      </div>

      
      <button onClick={() => navigate(`/check-in/${id}`)} className="fixed bottom-24 left-4 w-14 h-14 rounded-full bg-primary-600 text-white shadow-fab flex items-center justify-center z-30 active:scale-95 transition-transform">
        <lucide_react_1.Plus size={24}/>
      </button>
    </div>);
}
function InfoItem({ label, value }) {
    return (<div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{value}</p>
    </div>);
}
//# sourceMappingURL=KeyResultDetailPage.js.map