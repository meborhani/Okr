"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateObjectivePage = CreateObjectivePage;
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
const format_1 = require("@/lib/utils/format");
const schema = zod_2.z.object({
    title: zod_2.z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
    description: zod_2.z.string().optional(),
    periodId: zod_2.z.string().min(1, 'دوره الزامی است'),
    ownerId: zod_2.z.string().min(1, 'مالک الزامی است'),
});
function CreateObjectivePage() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { user } = (0, auth_store_1.useAuthStore)();
    const qc = (0, react_query_1.useQueryClient)();
    const { data: periods } = (0, react_query_1.useQuery)({ queryKey: ['periods'], queryFn: okr_api_1.periodsApi.getAll });
    const { data: usersRes } = (0, react_query_1.useQuery)({ queryKey: ['users'], queryFn: () => okr_api_1.usersApi.getAll() });
    const rawUsers = usersRes?.data || [];
    const users = rawUsers.length > 0 ? rawUsers
        : user ? [{ id: user.id, firstName: user.firstName, lastName: user.lastName }] : [];
    const { register, handleSubmit, formState: { errors } } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(schema),
        defaultValues: { ownerId: user?.id || '' },
    });
    const mutation = (0, react_query_1.useMutation)({
        mutationFn: (data) => okr_api_1.objectivesApi.create(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['objectives'] });
            navigate(-1);
        },
    });
    const periodOptions = (periods || []).map(p => ({ value: p.id, label: (0, format_1.periodLabel)(p.year, p.quarter) + ' — ' + p.title }));
    const ownerOptions = users.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }));
    return (<div>
      <TopBar_1.TopBar title="هدف جدید" showBack/>
      <div className="p-4">
        <Card_1.Card>
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
            <Input_1.Input label="عنوان هدف *" placeholder="مثال: افزایش رضایت مشتریان" error={errors.title?.message} {...register('title')}/>
            <Textarea_1.Textarea label="توضیحات" placeholder="هدف را شفاف توضیح دهید..." {...register('description')}/>
            <Select_1.Select label="دوره OKR *" options={periodOptions} placeholder="انتخاب دوره..." error={errors.periodId?.message} {...register('periodId')}/>
            <Select_1.Select label="مالک *" options={ownerOptions} placeholder="انتخاب مالک..." error={errors.ownerId?.message} {...register('ownerId')}/>
            {mutation.isError && (<div className="bg-danger-50 text-danger-600 text-sm rounded-xl px-4 py-3">
                {mutation.error.message}
              </div>)}
            <Button_1.Button type="submit" fullWidth size="lg" loading={mutation.isPending}>ذخیره هدف</Button_1.Button>
          </form>
        </Card_1.Card>
      </div>
    </div>);
}
//# sourceMappingURL=CreateObjectivePage.js.map