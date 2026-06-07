import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { periodsApiExt } from './periods.api';
import { toast } from '@/components/ui/Toast';
import type { OkrPeriod } from '@/types';

const schema = z.object({
  title: z.string().min(2, 'عنوان الزامی است'),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

interface Props { open: boolean; onClose: () => void; period: OkrPeriod; }

export function EditPeriodModal({ open, onClose, period }: Props) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: period.title,
      startDate: period.startDate?.slice(0, 10) ?? '',
      endDate: period.endDate?.slice(0, 10) ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (d: FormData) => periodsApiExt.update(period.id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['periods'] });
      toast('دوره با موفقیت ویرایش شد');
      onClose();
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <Modal open={open} onClose={onClose} title="ویرایش دوره">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <Input label="عنوان دوره *" error={errors.title?.message} {...register('title')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="تاریخ شروع" type="date" error={errors.startDate?.message} {...register('startDate')} />
          <Input label="تاریخ پایان" type="date" error={errors.endDate?.message} {...register('endDate')} />
        </div>
        <Button type="submit" fullWidth size="lg" loading={mutation.isPending}>ذخیره تغییرات</Button>
      </form>
    </Modal>
  );
}
