"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickCheckInPage = QuickCheckInPage;
const react_router_dom_1 = require("react-router-dom");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const zod_2 = require("zod");
const TopBar_1 = require("@/components/layout/TopBar");
const Card_1 = require("@/components/ui/Card");
const Input_1 = require("@/components/ui/Input");
const Button_1 = require("@/components/ui/Button");
const ProgressBar_1 = require("@/components/ui/ProgressBar");
const Spinner_1 = require("@/components/ui/Spinner");
const ErrorState_1 = require("@/components/ui/ErrorState");
const Badge_1 = require("@/components/ui/Badge");
const status_1 = require("@/lib/utils/status");
const useKeyResults_1 = require("@/features/key-results/useKeyResults");
const useCheckIn_1 = require("./useCheckIn");
const schema = zod_2.z.object({
    value: zod_2.z.string().min(1, 'مقدار الزامی است'),
    note: zod_2.z.string().optional(),
});
function QuickCheckInPage() {
    const { krId } = (0, react_router_dom_1.useParams)();
    const { data: kr, isLoading, isError, refetch } = (0, useKeyResults_1.useKeyResult)(krId);
    const { submit, loading, error } = (0, useCheckIn_1.useCheckIn)();
    const { register, handleSubmit, formState: { errors }, } = (0, react_hook_form_1.useForm)({ resolver: (0, zod_1.zodResolver)(schema) });
    if (isLoading)
        return <Spinner_1.PageSpinner />;
    if (isError)
        return <ErrorState_1.ErrorState onRetry={refetch}/>;
    if (!kr)
        return null;
    const onSubmit = (data) => {
        const num = parseFloat(data.value.replace(/,/g, ''));
        if (isNaN(num))
            return;
        submit({ keyResultId: krId, value: num, note: data.note });
    };
    return (<div>
      <TopBar_1.TopBar title="ثبت چک‌این" showBack/>

      <div className="p-4 space-y-4">
        
        <Card_1.Card>
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex-1">{kr.title}</h3>
            <Badge_1.Badge className={status_1.krStatusColor[kr.status]}>{status_1.krStatusLabel[kr.status]}</Badge_1.Badge>
          </div>

          <div className="bg-surface-50 rounded-xl p-3 mb-3 flex justify-between text-sm">
            <span className="text-gray-500">
              فعلی: <b className="text-gray-800">{kr.currentValue.toLocaleString('fa-IR')}</b>
              {kr.unit && ` ${kr.unit}`}
            </span>
            <span className="text-gray-500">
              هدف: <b className="text-gray-800">{kr.targetValue.toLocaleString('fa-IR')}</b>
              {kr.unit && ` ${kr.unit}`}
            </span>
          </div>

          <ProgressBar_1.ProgressBar value={kr.progress} colorClass={status_1.krProgressColor[kr.status]} showLabel/>
        </Card_1.Card>

        
        <Card_1.Card>
          <h3 className="font-semibold text-gray-900 mb-4">ثبت مقدار جدید</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input_1.Input label={`مقدار جدید${kr.unit ? ` (${kr.unit})` : ''}`} type="number" inputMode="decimal" placeholder="عدد وارد کنید" error={errors.value?.message} {...register('value')}/>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                یادداشت (اختیاری)
              </label>
              <textarea className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm bg-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none" rows={3} placeholder="توضیحات..." {...register('note')}/>
            </div>

            {error && (<div className="bg-danger-50 border border-danger-200 text-danger-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>)}

            <Button_1.Button type="submit" fullWidth size="lg" loading={loading}>
              ثبت چک‌این
            </Button_1.Button>
          </form>
        </Card_1.Card>
      </div>
    </div>);
}
//# sourceMappingURL=QuickCheckInPage.js.map