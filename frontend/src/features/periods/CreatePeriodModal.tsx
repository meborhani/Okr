import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { periodsApiExt } from './periods.api';
import { getQuarterDates, getQuarterTitle, currentShamsiYear, currentQuarter, quarterNames } from '@/lib/utils/shamsi';
import { toast } from '@/components/ui/Toast';

const schema = z.object({
  year: z.coerce.number().min(1400).max(1500),
  quarter: z.coerce.number().min(1).max(4),
  title: z.string().min(2, 'عنوان الزامی است'),
  startDate: z.string().min(1, 'تاریخ شروع الزامی است'),
  endDate: z.string().min(1, 'تاریخ پایان الزامی است'),
  frequency: z.enum(['weekly', 'biweekly', 'monthly']),
});
type FormData = z.infer<typeof schema>;

const frequencyOptions = [
  { value: 'weekly', label: 'هفتگی' },
  { value: 'biweekly', label: 'دو هفته‌ای' },
  { value: 'monthly', label: 'ماهانه' },
];

const quarterOptions = [1, 2, 3, 4].map(q => ({ value: String(q), label: `فصل ${q} — ${quarterNames[q]}` }));
const yearOptions = Array.from({ length: 6 }, (_, i) => {
  const y = currentShamsiYear() - 1 + i;
  return { value: String(y), label: String(y) };
});

interface Props { open: boolean; onClose: () => void; }

export function CreatePeriodModal({ open, onClose }: Props) {
  const qc = useQueryClient();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { year: currentShamsiYear(), quarter: currentQuarter(), frequency: 'weekly' },
  });

  const year = watch('year');
  const quarter = watch('quarter');

  // Auto-fill title and dates when year/quarter change
  useEffect(() => {
    if (year && quarter) {
      const dates = getQuarterDates(Number(year), Number(quarter));
      setValue('title', getQuarterTitle(Number(year), Number(quarter)));
      setValue('startDate', dates.start);
      setValue('endDate', dates.end);
    }
  }, [year, quarter, setValue]);

  const mutation = useMutation({
    mutationFn: (d: FormData) => periodsApiExt.create({
      title: d.title,
      year: Number(d.year),
      quarter: Number(d.quarter),
      startDate: d.startDate,
      endDate: d.endDate,
      frequency: d.frequency,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['periods'] });
      qc.invalidateQueries({ queryKey: ['check-in-sessions'] });
      toast('دوره با موفقیت ایجاد شد و جلسات چک‌این ساخته شدند');
      onClose();
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <Modal open={open} onClose={onClose} title="ایجاد دوره جدید">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Select label="سال شمسی *" options={yearOptions} error={errors.year?.message} {...register('year')} />
          <Select label="فصل *" options={quarterOptions} error={errors.quarter?.message} {...register('quarter')} />
        </div>
        <Input label="عنوان دوره *" error={errors.title?.message} {...register('title')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="تاریخ شروع (میلادی)" type="date" error={errors.startDate?.message} {...register('startDate')} />
          <Input label="تاریخ پایان (میلادی)" type="date" error={errors.endDate?.message} {...register('endDate')} />
        </div>
        <Select label="تناوب چک‌این *" options={frequencyOptions} error={errors.frequency?.message} {...register('frequency')} />
        <p className="text-xs text-gray-400">تاریخ‌ها بر اساس فصل انتخابی پیشنهاد داده می‌شوند. جلسات چک‌این به‌صورت خودکار ایجاد می‌شوند.</p>
        <Button type="submit" fullWidth size="lg" loading={mutation.isPending}>ایجاد دوره</Button>
      </form>
    </Modal>
  );
}
