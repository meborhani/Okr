import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Badge } from '@/components/ui/Badge';
import { krStatusLabel, krStatusColor, krProgressColor } from '@/lib/utils/status';
import { useKeyResult } from '@/features/key-results/useKeyResults';
import { useCheckIn } from './useCheckIn';

const schema = z.object({
  value: z.string().min(1, 'مقدار الزامی است'),
  note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function QuickCheckInPage() {
  const { krId } = useParams<{ krId: string }>();
  const { data: kr, isLoading, isError, refetch } = useKeyResult(krId!);
  const { submit, loading, error } = useCheckIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (isLoading) return <PageSpinner />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!kr) return null;

  const onSubmit = (data: FormData) => {
    const num = parseFloat(data.value.replace(/,/g, ''));
    if (isNaN(num)) return;
    submit({ keyResultId: krId!, value: num, note: data.note });
  };

  return (
    <div>
      <TopBar title="ثبت چک‌این" showBack />

      <div className="p-4 space-y-4">
        {/* KR Info */}
        <Card>
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex-1">{kr.title}</h3>
            <Badge className={krStatusColor[kr.status]}>{krStatusLabel[kr.status]}</Badge>
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

          <ProgressBar value={kr.progress} colorClass={krProgressColor[kr.status]} showLabel />
        </Card>

        {/* Form */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">ثبت مقدار جدید</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={`مقدار جدید${kr.unit ? ` (${kr.unit})` : ''}`}
              type="number"
              inputMode="decimal"
              placeholder="عدد وارد کنید"
              error={errors.value?.message}
              {...register('value')}
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                یادداشت (اختیاری)
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm bg-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
                rows={3}
                placeholder="توضیحات..."
                {...register('note')}
              />
            </div>

            {error && (
              <div className="bg-danger-50 border border-danger-200 text-danger-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading}>
              ثبت چک‌این
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
