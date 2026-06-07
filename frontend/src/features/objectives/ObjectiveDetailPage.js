"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectiveDetailPage = ObjectiveDetailPage;
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const TopBar_1 = require("@/components/layout/TopBar");
const Card_1 = require("@/components/ui/Card");
const Badge_1 = require("@/components/ui/Badge");
const Button_1 = require("@/components/ui/Button");
const ProgressBar_1 = require("@/components/ui/ProgressBar");
const Spinner_1 = require("@/components/ui/Spinner");
const ErrorState_1 = require("@/components/ui/ErrorState");
const EmptyState_1 = require("@/components/ui/EmptyState");
const KeyResultCard_1 = require("@/components/okr/KeyResultCard");
const CreateKeyResultModal_1 = require("@/features/key-results/CreateKeyResultModal");
const status_1 = require("@/lib/utils/status");
const format_1 = require("@/lib/utils/format");
const useObjectives_1 = require("./useObjectives");
const lucide_react_1 = require("lucide-react");
function ObjectiveDetailPage() {
    const { id } = (0, react_router_dom_1.useParams)();
    const [addKrOpen, setAddKrOpen] = (0, react_1.useState)(false);
    const { data: objective, isLoading, isError, refetch } = (0, useObjectives_1.useObjective)(id);
    const { data: keyResults, isLoading: krLoading } = (0, useObjectives_1.useObjectiveKeyResults)(id);
    if (isLoading)
        return <Spinner_1.PageSpinner />;
    if (isError)
        return <ErrorState_1.ErrorState onRetry={refetch}/>;
    if (!objective)
        return null;
    const progress = objective.progress ?? 0;
    const progressColor = progress >= 70 ? 'bg-success-500' : progress >= 40 ? 'bg-primary-500' : 'bg-warning-500';
    return (<div className="pb-24 md:pb-8">
      <TopBar_1.TopBar title="جزئیات هدف" showBack/>

      
      <div className="p-4 md:grid md:grid-cols-3 md:gap-6 md:items-start">

        
        <div className="md:col-span-2 space-y-4">
          
          <Card_1.Card>
            <div className="flex items-start justify-between gap-2 mb-3">
              <h2 className="text-base font-bold text-gray-900 flex-1 leading-snug">
                {objective.title}
              </h2>
              <Badge_1.Badge className={status_1.objectiveStatusColor[objective.status]}>
                {status_1.objectiveStatusLabel[objective.status]}
              </Badge_1.Badge>
            </div>
            {objective.description && (<p className="text-sm text-gray-500 mb-4 leading-relaxed">{objective.description}</p>)}
            <ProgressBar_1.ProgressBar value={progress} showLabel colorClass={progressColor}/>
          </Card_1.Card>

          
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                نتایج کلیدی ({keyResults?.length || 0})
              </p>
              <Button_1.Button size="sm" onClick={() => setAddKrOpen(true)}>
                <lucide_react_1.Plus size={14}/> افزودن نتیجه کلیدی
              </Button_1.Button>
            </div>

            {krLoading ? (<Spinner_1.PageSpinner />) : !keyResults?.length ? (<EmptyState_1.EmptyState icon={<lucide_react_1.TrendingUp size={24} className="text-gray-400"/>} title="نتیجه کلیدی تعریف نشده" description="اولین KR این هدف را تعریف کنید" action={<Button_1.Button size="sm" onClick={() => setAddKrOpen(true)}>
                    <lucide_react_1.Plus size={14}/> افزودن نتیجه کلیدی
                  </Button_1.Button>}/>) : (<div className="space-y-3">
                {keyResults.map((kr) => (<KeyResultCard_1.KeyResultCard key={kr.id} keyResult={kr}/>))}
              </div>)}
          </div>
        </div>

        
        <div className="mt-4 md:mt-0 space-y-4">
          <Card_1.Card>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">اطلاعات هدف</p>
            <div className="space-y-3">
              <InfoItem label="دوره" value={objective.periodTitle}/>
              <InfoItem label="مالک" value={objective.ownerName}/>
              {objective.teamName && <InfoItem label="تیم" value={objective.teamName}/>}
              {objective.departmentName && <InfoItem label="دپارتمان" value={objective.departmentName}/>}
              <InfoItem label="ایجاد" value={(0, format_1.formatDate)(objective.createdAt)}/>
              <InfoItem label="آخرین بروزرسانی" value={(0, format_1.formatDate)(objective.updatedAt)}/>
            </div>
          </Card_1.Card>

          <Card_1.Card>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">پیشرفت</p>
            <div className="text-center mb-3">
              <span className="text-3xl font-bold text-gray-900">{Math.round(progress)}</span>
              <span className="text-lg text-gray-400">٪</span>
            </div>
            <ProgressBar_1.ProgressBar value={progress} colorClass={progressColor}/>
          </Card_1.Card>
        </div>
      </div>

      
      <button onClick={() => setAddKrOpen(true)} className="fixed bottom-20 left-4 w-14 h-14 rounded-full bg-primary-600 text-white shadow-fab flex items-center justify-center active:scale-95 transition-transform z-30 md:hidden" aria-label="افزودن نتیجه کلیدی">
        <lucide_react_1.Plus size={24}/>
      </button>

      <CreateKeyResultModal_1.CreateKeyResultModal open={addKrOpen} onClose={() => setAddKrOpen(false)} objectiveId={id}/>
    </div>);
}
function InfoItem({ label, value }) {
    return (<div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
    </div>);
}
//# sourceMappingURL=ObjectiveDetailPage.js.map