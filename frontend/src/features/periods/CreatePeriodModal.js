"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePeriodModal = CreatePeriodModal;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const zod_2 = require("zod");
const react_query_1 = require("@tanstack/react-query");
const Modal_1 = require("@/components/ui/Modal");
const Input_1 = require("@/components/ui/Input");
const Select_1 = require("@/components/ui/Select");
const Button_1 = require("@/components/ui/Button");
const periods_api_1 = require("./periods.api");
const shamsi_1 = require("@/lib/utils/shamsi");
const Toast_1 = require("@/components/ui/Toast");
const schema = zod_2.z.object({
    year: zod_2.z.coerce.number().min(1400).max(1500),
    quarter: zod_2.z.coerce.number().min(1).max(4),
    title: zod_2.z.string().min(2, 'عنوان الزامی است'),
    startDate: zod_2.z.string().min(1, 'تاریخ شروع الزامی است'),
    endDate: zod_2.z.string().min(1, 'تاریخ پایان الزامی است'),
});
const quarterOptions = [1, 2, 3, 4].map(q => ({ value: String(q), label: `فصل ${q} — ${shamsi_1.quarterNames[q]}` }));
const yearOptions = Array.from({ length: 6 }, (_, i) => {
    const y = (0, shamsi_1.currentShamsiYear)() - 1 + i;
    return { value: String(y), label: String(y) };
});
function CreatePeriodModal({ open, onClose }) {
    const qc = (0, react_query_1.useQueryClient)();
    const { register, handleSubmit, watch, setValue, formState: { errors } } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(schema),
        defaultValues: { year: (0, shamsi_1.currentShamsiYear)(), quarter: (0, shamsi_1.currentQuarter)() },
    });
    const year = watch('year');
    const quarter = watch('quarter');
    (0, react_1.useEffect)(() => {
        if (year && quarter) {
            const dates = (0, shamsi_1.getQuarterDates)(Number(year), Number(quarter));
            setValue('title', (0, shamsi_1.getQuarterTitle)(Number(year), Number(quarter)));
            setValue('startDate', dates.start);
            setValue('endDate', dates.end);
        }
    }, [year, quarter, setValue]);
    const mutation = (0, react_query_1.useMutation)({
        mutationFn: (d) => periods_api_1.periodsApiExt.create({
            title: d.title,
            year: Number(d.year),
            quarter: Number(d.quarter),
            startDate: d.startDate,
            endDate: d.endDate,
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['periods'] });
            (0, Toast_1.toast)('دوره با موفقیت ایجاد شد');
            onClose();
        },
        onError: (e) => (0, Toast_1.toast)(e.message, 'error'),
    });
    return (<Modal_1.Modal open={open} onClose={onClose} title="ایجاد دوره جدید">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Select_1.Select label="سال شمسی *" options={yearOptions} error={errors.year?.message} {...register('year')}/>
          <Select_1.Select label="فصل *" options={quarterOptions} error={errors.quarter?.message} {...register('quarter')}/>
        </div>
        <Input_1.Input label="عنوان دوره *" error={errors.title?.message} {...register('title')}/>
        <div className="grid grid-cols-2 gap-3">
          <Input_1.Input label="تاریخ شروع (میلادی)" type="date" error={errors.startDate?.message} {...register('startDate')}/>
          <Input_1.Input label="تاریخ پایان (میلادی)" type="date" error={errors.endDate?.message} {...register('endDate')}/>
        </div>
        <p className="text-xs text-gray-400">تاریخ‌ها بر اساس فصل انتخابی پیشنهاد داده می‌شوند و قابل تغییر هستند.</p>
        <Button_1.Button type="submit" fullWidth size="lg" loading={mutation.isPending}>ایجاد دوره</Button_1.Button>
      </form>
    </Modal_1.Modal>);
}
//# sourceMappingURL=CreatePeriodModal.js.map