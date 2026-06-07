"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodsPage = PeriodsPage;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const TopBar_1 = require("@/components/layout/TopBar");
const Card_1 = require("@/components/ui/Card");
const Badge_1 = require("@/components/ui/Badge");
const Button_1 = require("@/components/ui/Button");
const Spinner_1 = require("@/components/ui/Spinner");
const EmptyState_1 = require("@/components/ui/EmptyState");
const ErrorState_1 = require("@/components/ui/ErrorState");
const Toast_1 = require("@/components/ui/Toast");
const periods_api_1 = require("./periods.api");
const usePeriods_1 = require("./usePeriods");
const CreatePeriodModal_1 = require("./CreatePeriodModal");
const EditPeriodModal_1 = require("./EditPeriodModal");
const format_1 = require("@/lib/utils/format");
const lucide_react_1 = require("lucide-react");
const statusLabel = {
    draft: 'پیش‌نویس',
    active: 'فعال',
    closed: 'بسته‌شده',
    archived: 'آرشیو',
};
const statusColor = {
    draft: 'bg-gray-100 text-gray-600',
    active: 'bg-emerald-50 text-emerald-700',
    closed: 'bg-amber-50 text-amber-700',
    archived: 'bg-gray-100 text-gray-400',
};
function PeriodsPage() {
    const [createOpen, setCreateOpen] = (0, react_1.useState)(false);
    const [editPeriod, setEditPeriod] = (0, react_1.useState)(null);
    const qc = (0, react_query_1.useQueryClient)();
    const { data: periods, isLoading, isError, refetch } = (0, usePeriods_1.usePeriods)();
    const activateMut = (0, react_query_1.useMutation)({
        mutationFn: (id) => periods_api_1.periodsApiExt.activate(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['periods'] }); (0, Toast_1.toast)('دوره فعال شد'); },
        onError: (e) => (0, Toast_1.toast)(e.message, 'error'),
    });
    const closeMut = (0, react_query_1.useMutation)({
        mutationFn: (id) => periods_api_1.periodsApiExt.close(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['periods'] }); (0, Toast_1.toast)('دوره بسته شد'); },
        onError: (e) => (0, Toast_1.toast)(e.message, 'error'),
    });
    const archiveMut = (0, react_query_1.useMutation)({
        mutationFn: (id) => periods_api_1.periodsApiExt.archive(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['periods'] }); (0, Toast_1.toast)('دوره آرشیو شد'); },
        onError: (e) => (0, Toast_1.toast)(e.message, 'error'),
    });
    const isPending = activateMut.isPending || closeMut.isPending || archiveMut.isPending;
    return (<div className="pb-24">
      <TopBar_1.TopBar title="دوره‌های OKR"/>

      <div className="p-4 space-y-3">
        {isLoading ? (<Spinner_1.PageSpinner />) : isError ? (<ErrorState_1.ErrorState onRetry={refetch}/>) : !periods?.length ? (<EmptyState_1.EmptyState icon={<lucide_react_1.Calendar size={28} className="text-primary-400"/>} title="هنوز دوره‌ای تعریف نشده است" description="اولین دوره OKR سازمان خود را بسازید" action={<Button_1.Button onClick={() => setCreateOpen(true)} size="lg">
                <lucide_react_1.Plus size={18}/>
                ایجاد اولین دوره
              </Button_1.Button>}/>) : (periods.map((p) => (<PeriodCard key={p.id} period={p} onEdit={() => setEditPeriod(p)} onActivate={() => activateMut.mutate(p.id)} onClose={() => closeMut.mutate(p.id)} onArchive={() => archiveMut.mutate(p.id)} disabled={isPending}/>)))}
      </div>

      
      <button onClick={() => setCreateOpen(true)} className="fixed bottom-20 left-4 w-14 h-14 rounded-full bg-primary-600 text-white
          shadow-fab flex items-center justify-center active:scale-95 transition-transform z-30" aria-label="ایجاد دوره">
        <lucide_react_1.Plus size={24}/>
      </button>

      <CreatePeriodModal_1.CreatePeriodModal open={createOpen} onClose={() => setCreateOpen(false)}/>
      {editPeriod && (<EditPeriodModal_1.EditPeriodModal period={editPeriod} open={!!editPeriod} onClose={() => setEditPeriod(null)}/>)}
    </div>);
}
function PeriodCard({ period: p, onEdit, onActivate, onClose, onArchive, disabled }) {
    return (<Card_1.Card>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base truncate">{p.title}</h3>
          <div className="flex gap-3 text-xs text-gray-400 mt-1">
            <span>{(0, format_1.formatDate)(p.startDate)} — {(0, format_1.formatDate)(p.endDate)}</span>
          </div>
        </div>
        <Badge_1.Badge className={`${statusColor[p.status]} mr-2 shrink-0`}>{statusLabel[p.status]}</Badge_1.Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {p.status === 'draft' && (<>
            <Button_1.Button size="sm" variant="secondary" onClick={onEdit} disabled={disabled}>
              <lucide_react_1.Edit2 size={14}/> ویرایش
            </Button_1.Button>
            <Button_1.Button size="sm" onClick={onActivate} disabled={disabled}>
              <lucide_react_1.Play size={14}/> فعال‌سازی
            </Button_1.Button>
          </>)}
        {p.status === 'active' && (<Button_1.Button size="sm" variant="secondary" onClick={onClose} disabled={disabled}>
            <lucide_react_1.Lock size={14}/> بستن دوره
          </Button_1.Button>)}
        {p.status === 'closed' && (<Button_1.Button size="sm" variant="ghost" onClick={onArchive} disabled={disabled}>
            <lucide_react_1.Archive size={14}/> آرشیو
          </Button_1.Button>)}
      </div>
    </Card_1.Card>);
}
//# sourceMappingURL=PeriodsPage.js.map