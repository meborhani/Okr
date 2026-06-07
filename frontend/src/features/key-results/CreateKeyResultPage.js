"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateKeyResultPage = CreateKeyResultPage;
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
const okr_api_1 = require("@/lib/api/okr.api");
const auth_store_1 = require("@/lib/auth/auth.store");
const schema = zod_2.z.object({
    title: zod_2.z.string().min(3, 'عنوان الزامی است'),
    description: zod_2.z.string().optional(),
    objectiveId: zod_2.z.string().min(1, 'هدف الزامی است'),
    ownerId: zod_2.z.string().min(1, 'مالک الزامی است'),
    startValue: zod_2.z.coerce.number({ invalid_type_error: 'عدد وارد کنید' }),
    targetValue: zod_2.z.coerce.number({ invalid_type_error: 'عدد وارد کنید' }),
    unit: zod_2.z.string().optional(),
});
function CreateKeyResultPage() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [sp] = (0, react_router_dom_1.useSearchParams)();
    const { user } = (0, auth_store_1.useAuthStore)();
    const qc = (0, react_query_1.useQueryClient)();
    const { data: objectives } = (0, react_query_1.useQuery)({ queryKey: ['objectives', 'all'], queryFn: () => okr_api_1.objectivesApi.getAll() });
    const { data: usersRes } = (0, react_query_1.useQuery)({ queryKey: ['users'], queryFn: () => okr_api_1.usersApi.getAll() });
    const users = (usersRes?.data || []);
    const { register, handleSubmit, formState: { errors } } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(schema),
        defaultValues: { ownerId: user?.id || '', objectiveId: sp.get('objectiveId') || '', startValue: 0 },
    });
    const mutation = (0, react_query_1.useMutation)({
        mutationFn: (data) => okr_api_1.keyResultsApi.create(data),
        onSuccess: (kr) => {
            qc.invalidateQueries({ queryKey: ['key-results'] });
            navigate(`/key-results/${kr.id}`);
        },
    });
    const objOptions = (objectives || []).map(o => ({ value: o.id, label: o.title }));
    const ownerOptions = users.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }));
    return (<div>
      <TopBar_1.TopBar title="نتیجه کلیدی جدید" showBack/>
      <div className="p-4">
        <Card_1.Card>
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
            <Input_1.Input label="عنوان *" placeholder="مثال: افزایش NPS به ۷۰" error={errors.title?.message} {...register('title')}/>
            <Textarea_1.Textarea label="توضیحات" placeholder="توضیحات..." {...register('description')}/>
            <Select_1.Select label="هدف *" options={objOptions} placeholder="انتخاب هدف..." error={errors.objectiveId?.message} {...register('objectiveId')}/>
            <Select_1.Select label="مالک *" options={ownerOptions} placeholder="انتخاب مالک..." error={errors.ownerId?.message} {...register('ownerId')}/>
            <div className="grid grid-cols-3 gap-3">
              <Input_1.Input label="مقدار شروع *" type="number" error={errors.startValue?.message} {...register('startValue')}/>
              <Input_1.Input label="مقدار هدف *" type="number" error={errors.targetValue?.message} {...register('targetValue')}/>
              <Input_1.Input label="واحد" placeholder="٪، نفر..." {...register('unit')}/>
            </div>
            {mutation.isError && (<div className="bg-danger-50 text-danger-600 text-sm rounded-xl px-4 py-3">
                {mutation.error.message}
              </div>)}
            <Button_1.Button type="submit" fullWidth size="lg" loading={mutation.isPending}>ذخیره</Button_1.Button>
          </form>
        </Card_1.Card>
      </div>
    </div>);
}
//# sourceMappingURL=CreateKeyResultPage.js.map