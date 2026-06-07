"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditPeriodModal = EditPeriodModal;
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const zod_2 = require("zod");
const react_query_1 = require("@tanstack/react-query");
const Modal_1 = require("@/components/ui/Modal");
const Input_1 = require("@/components/ui/Input");
const Button_1 = require("@/components/ui/Button");
const periods_api_1 = require("./periods.api");
const Toast_1 = require("@/components/ui/Toast");
const schema = zod_2.z.object({
    title: zod_2.z.string().min(2, 'عنوان الزامی است'),
    startDate: zod_2.z.string().min(1),
    endDate: zod_2.z.string().min(1),
});
function EditPeriodModal({ open, onClose, period }) {
    const qc = (0, react_query_1.useQueryClient)();
    const { register, handleSubmit, formState: { errors } } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(schema),
        defaultValues: {
            title: period.title,
            startDate: period.startDate?.slice(0, 10) ?? '',
            endDate: period.endDate?.slice(0, 10) ?? '',
        },
    });
    const mutation = (0, react_query_1.useMutation)({
        mutationFn: (d) => periods_api_1.periodsApiExt.update(period.id, d),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['periods'] });
            (0, Toast_1.toast)('دوره با موفقیت ویرایش شد');
            onClose();
        },
        onError: (e) => (0, Toast_1.toast)(e.message, 'error'),
    });
    return (<Modal_1.Modal open={open} onClose={onClose} title="ویرایش دوره">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <Input_1.Input label="عنوان دوره *" error={errors.title?.message} {...register('title')}/>
        <div className="grid grid-cols-2 gap-3">
          <Input_1.Input label="تاریخ شروع" type="date" error={errors.startDate?.message} {...register('startDate')}/>
          <Input_1.Input label="تاریخ پایان" type="date" error={errors.endDate?.message} {...register('endDate')}/>
        </div>
        <Button_1.Button type="submit" fullWidth size="lg" loading={mutation.isPending}>ذخیره تغییرات</Button_1.Button>
      </form>
    </Modal_1.Modal>);
}
//# sourceMappingURL=EditPeriodModal.js.map