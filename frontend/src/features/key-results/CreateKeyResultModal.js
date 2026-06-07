"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateKeyResultModal = CreateKeyResultModal;
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const zod_2 = require("zod");
const react_query_1 = require("@tanstack/react-query");
const Modal_1 = require("@/components/ui/Modal");
const Input_1 = require("@/components/ui/Input");
const Button_1 = require("@/components/ui/Button");
const okr_api_1 = require("@/lib/api/okr.api");
const auth_store_1 = require("@/lib/auth/auth.store");
const Toast_1 = require("@/components/ui/Toast");
const schema = zod_2.z.object({
    title: zod_2.z.string().min(2, 'عنوان الزامی است'),
    startValue: zod_2.z.coerce.number({ invalid_type_error: 'عدد وارد کنید' }),
    targetValue: zod_2.z.coerce.number({ invalid_type_error: 'عدد وارد کنید' }),
    unit: zod_2.z.string().optional(),
    weight: zod_2.z.coerce.number().min(0).max(10).optional(),
}).refine(d => d.targetValue !== d.startValue, {
    message: 'مقدار هدف نباید با مقدار شروع برابر باشد',
    path: ['targetValue'],
});
function CreateKeyResultModal({ open, onClose, objectiveId }) {
    const qc = (0, react_query_1.useQueryClient)();
    const { user } = (0, auth_store_1.useAuthStore)();
    const { register, handleSubmit, reset, formState: { errors } } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(schema),
        defaultValues: { startValue: 0, targetValue: 100, weight: 1 },
    });
    const mutation = (0, react_query_1.useMutation)({
        mutationFn: (d) => okr_api_1.keyResultsApi.create({
            title: d.title,
            objectiveId,
            ownerId: user.id,
            startValue: d.startValue,
            targetValue: d.targetValue,
            unit: d.unit || undefined,
            weight: d.weight,
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['key-results', 'by-objective', objectiveId] });
            qc.invalidateQueries({ queryKey: ['objectives', objectiveId] });
            (0, Toast_1.toast)('نتیجه کلیدی با موفقیت ایجاد شد');
            reset();
            onClose();
        },
        onError: (e) => (0, Toast_1.toast)(e.message, 'error'),
    });
    return (<Modal_1.Modal open={open} onClose={onClose} title="افزودن نتیجه کلیدی">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <Input_1.Input label="عنوان نتیجه کلیدی *" placeholder="مثال: افزایش نرخ تبدیل به ۵٪" error={errors.title?.message} {...register('title')}/>
        <div className="grid grid-cols-2 gap-3">
          <Input_1.Input label="مقدار شروع *" type="number" error={errors.startValue?.message} {...register('startValue')}/>
          <Input_1.Input label="مقدار هدف *" type="number" error={errors.targetValue?.message} {...register('targetValue')}/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input_1.Input label="واحد اندازه‌گیری" placeholder="مثال: درصد، عدد، ریال" error={errors.unit?.message} {...register('unit')}/>
          <Input_1.Input label="وزن" type="number" step="0.1" error={errors.weight?.message} {...register('weight')}/>
        </div>
        {mutation.isError && (<p className="text-xs text-danger-600 bg-danger-50 px-3 py-2 rounded-xl">
            {mutation.error.message}
          </p>)}
        <Button_1.Button type="submit" fullWidth size="lg" loading={mutation.isPending}>
          ایجاد نتیجه کلیدی
        </Button_1.Button>
      </form>
    </Modal_1.Modal>);
}
//# sourceMappingURL=CreateKeyResultModal.js.map