"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectivesPage = ObjectivesPage;
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const lucide_react_1 = require("lucide-react");
const react_query_1 = require("@tanstack/react-query");
const TopBar_1 = require("@/components/layout/TopBar");
const ObjectiveCard_1 = require("@/components/okr/ObjectiveCard");
const Spinner_1 = require("@/components/ui/Spinner");
const EmptyState_1 = require("@/components/ui/EmptyState");
const ErrorState_1 = require("@/components/ui/ErrorState");
const Button_1 = require("@/components/ui/Button");
const okr_api_1 = require("@/lib/api/okr.api");
const format_1 = require("@/lib/utils/format");
function ObjectivesPage() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [periodId, setPeriodId] = (0, react_1.useState)();
    const { data: objectives, isLoading, isError, refetch } = (0, react_query_1.useQuery)({
        queryKey: ['objectives', 'all', periodId],
        queryFn: () => okr_api_1.objectivesApi.getAll({ periodId }),
    });
    const { data: periods } = (0, react_query_1.useQuery)({ queryKey: ['periods'], queryFn: okr_api_1.periodsApi.getAll });
    return (<div>
      <TopBar_1.TopBar title="همه اهداف" right={<Button_1.Button size="sm" onClick={() => navigate('/objectives/new')}>
          <lucide_react_1.Plus size={15}/> جدید
        </Button_1.Button>}/>
      <div className="p-4 space-y-4">
        {periods && periods.length > 0 && (<div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <PillBtn active={!periodId} onClick={() => setPeriodId(undefined)}>همه</PillBtn>
            {periods.map(p => (<PillBtn key={p.id} active={periodId === p.id} onClick={() => setPeriodId(p.id)}>
                {(0, format_1.periodLabel)(p.year, p.quarter)}
              </PillBtn>))}
          </div>)}
        {isLoading ? <Spinner_1.PageSpinner />
            : isError ? <ErrorState_1.ErrorState onRetry={refetch}/>
                : !objectives?.length ? (<EmptyState_1.EmptyState title="هدفی تعریف نشده" action={<Button_1.Button size="sm" onClick={() => navigate('/objectives/new')}>ایجاد هدف</Button_1.Button>}/>) : (<div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {objectives.map(o => <ObjectiveCard_1.ObjectiveCard key={o.id} objective={o}/>)}
            </div>)}
      </div>
      <button onClick={() => navigate('/objectives/new')} className="fixed bottom-20 left-4 w-14 h-14 rounded-full bg-primary-600 text-white shadow-fab flex items-center justify-center z-30 active:scale-95 transition-transform">
        <lucide_react_1.Plus size={24}/>
      </button>
    </div>);
}
function PillBtn({ active, onClick, children }) {
    return (<button onClick={onClick} className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 shadow-card'}`}>
      {children}
    </button>);
}
//# sourceMappingURL=ObjectivesPage.js.map