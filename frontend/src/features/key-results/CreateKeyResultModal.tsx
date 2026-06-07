import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { keyResultsApi } from '@/lib/api/okr.api';
import { useAuthStore } from '@/lib/auth/auth.store';
import { toast } from '@/components/ui/Toast';

const schema = z.object({
  title: z.string().min(2, 'عنوان الزامی است'),
  startValue: z.coerce.number({ invalid_type_error: 'عدد وارد کنید' }),
  targetValue: z.coerce.number({ invalid_type_error: 'عدد وارد کنید' }),
  unit: z.string().optional(),
  weight: z.coerce.number().min(0).max(10).optional(),
}).refine(d => d.targetValue !== d.startValue, {
  message: 'مقدار هدف نباید با مقدار شروع برابر باشد',
  path: ['targetValue'],
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  objectiveId: string;
}

export function CreateKeyResultModal({ open, onClose, objectiveId }: Props) {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { startValue: 0, targetValue: 100, weight: 1 },
  });

  const mutation = useMutation({
    mutationFn: (d: FormData) => keyResultsApi.create({
      title: d.title,
      objectiveId,
      ownerId: user!.id,
      startValue: d.startValue,
      targetValue: d.targetValue,
      unit: d.unit || undefined,
      weight: d.weight,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['key-results', 'by-objective', objectiveId] });
      qc.invalidateQueries({ queryKey: ['objectives', objectiveId] });
      toast('نتیجه کلیدی با موفقیت ایجاد شد');
      reset();
      onClose();
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <Modal open={open} onClose={onClose} title="افزودن نتیجه کلیدی">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <Input
          label="عنوان نتیجه کلیدی *"
          placeholder="مثال: افزایش نرخ تبدیل به ۵٪"
          error={errors.title?.message}
          {...register('title')}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="مقدار شروع *"
            type="number"
            error={errors.startValue?.message}
            {...register('startValue')}
          />
          <Input
            label="مقدار هدف *"
            type="number"
            error={errors.targetValue?.message}
            {...register('targetValue')}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="واحد اندازه‌گیری"
            placeholder="مثال: درصد، عدد، ریال"
            error={errors.unit?.message}
            {...register('unit')}
          />
          <Input
            label="وزن"
            type="number"
            step="0.1"
            error={errors.weight?.message}
            {...register('weight')}
          />
        </div>
        {mutation.isError && (
          <p className="text-xs text-danger-600 bg-danger-50 px-3 py-2 rounded-xl">
            {(mutation.error as Error).message}
          </p>
        )}
        <Button type="submit" fullWidth size="lg" loading={mutation.isPending}>
          ایجاد نتیجه کلیدی
        </Button>
      </form>
    </Modal>
  );
}
