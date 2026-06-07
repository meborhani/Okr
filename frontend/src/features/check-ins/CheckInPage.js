"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckInPage = CheckInPage;
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const zod_2 = require("zod");
const react_query_1 = require("@tanstack/react-query");
const TopBar_1 = require("@/components/layout/TopBar");
const Card_1 = require("@/components/ui/Card");
const Input_1 = require("@/components/ui/Input");
const Textarea_1 = require("@/components/ui/Textarea");
const Select_1 = require("@/components/ui/Select");
const Button_1 = require("@/components/ui/Button");
const ProgressBar_1 = require("@/components/ui/ProgressBar");
const Badge_1 = require("@/components/ui/Badge");
const Spinner_1 = require("@/components/ui/Spinner");
const okr_api_1 = require("@/lib/api/okr.api");
const status_1 = require("@/lib/utils/status");
const auth_store_1 = require("@/lib/auth/auth.store");
const schema = zod_2.z.object({
    keyResultId: zod_2.z.string().min(1, 'نتیجه کلیدی الزامی است'),
    value: zod_2.z.coerce.number({ invalid_type_error: 'عدد وارد کنید' }),
    note: zod_2.z.string().optional(),
});
function CheckInPage() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [sp] = (0, react_router_dom_1.useSearchParams)();
    const { user } = (0, auth_store_1.useAuthStore)();
    const qc = (0, react_query_1.useQueryClient)();
    const defaultKrId = sp.get('krId') || '';
    const [selectedKrId, setSelectedKrId] = (0, react_1.useState)(defaultKrId);
    const { data: allKrs, isLoading: krsLoading } = (0, react_query_1.useQuery)({
        queryKey: ['key-results', 'mine'],
        queryFn: () => okr_api_1.keyResultsApi.getAll({ ownerId: user?.id }),
        enabled: !!user?.id,
    });
    const selectedKr = allKrs?.find(k => k.id === selectedKrId);
    const { register, handleSubmit, setValue, formState: { errors } } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(schema),
        defaultValues: { keyResultId: defaultKrId },
    });
    const mutation = (0, react_query_1.useMutation)({
        mutationFn: (data) => okr_api_1.checkInsApi.create(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['key-results'] });
            qc.invalidateQueries({ queryKey: ['check-ins'] });
            qc.invalidateQueries({ queryKey: ['dashboard'] });
            navigate(-1);
        },
    });
    const krOptions = (allKrs || []).map(k => ({ value: k.id, label: k.title }));
    return (<div>
      <TopBar_1.TopBar title="ثبت چک‌این" showBack/>
      <div className="p-4 space-y-4">
        {krsLoading ? <Spinner_1.PageSpinner /> : (<Card_1.Card>
            <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
              <Select_1.Select label="نتیجه کلیدی *" options={krOptions} placeholder="انتخاب کنید..." error={errors.keyResultId?.message} {...register('keyResultId', {
            onChange: (e) => { setSelectedKrId(e.target.value); setValue('keyResultId', e.target.value); }
        })}/>

              {selectedKr && (<div className="bg-surface-50 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 truncate">{selectedKr.title}</span>
                    <Badge_1.Badge className={status_1.krStatusColor[selectedKr.status]}>{status_1.krStatusLabel[selectedKr.status]}</Badge_1.Badge>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>فعلی: <b>{selectedKr.currentValue.toLocaleString('fa-IR')}{selectedKr.unit ? ` ${selectedKr.unit}` : ''}</b></span>
                    <span>هدف: <b>{selectedKr.targetValue.toLocaleString('fa-IR')}{selectedKr.unit ? ` ${selectedKr.unit}` : ''}</b></span>
                  </div>
                  <ProgressBar_1.ProgressBar value={selectedKr.progress} colorClass={status_1.krProgressColor[selectedKr.status]} size="sm"/>
                </div>)}

              <Input_1.Input label={`مقدار جدید${selectedKr?.unit ? ` (${selectedKr.unit})` : ''} *`} type="number" inputMode="decimal" placeholder="عدد وارد کنید" error={errors.value?.message} {...register('value')}/>
              <Textarea_1.Textarea label="یادداشت (اختیاری)" placeholder="توضیحات..." {...register('note')}/>

              {mutation.isError && (<div className="bg-danger-50 text-danger-600 text-sm rounded-xl px-4 py-3">
                  {mutation.error.message}
                </div>)}
              <Button_1.Button type="submit" fullWidth size="lg" loading={mutation.isPending}>ثبت چک‌این</Button_1.Button>
            </form>
          </Card_1.Card>)}
      </div>
    </div>);
}
//# sourceMappingURL=CheckInPage.js.map