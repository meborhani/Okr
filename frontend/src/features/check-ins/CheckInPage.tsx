import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { checkInsApi, keyResultsApi } from '@/lib/api/okr.api';
import { krStatusLabel, krStatusColor, krProgressColor } from '@/lib/utils/status';
import { useAuthStore } from '@/lib/auth/auth.store';

const schema = z.object({
  keyResultId: z.string().min(1, 'نتیجه کلیدی الزامی است'),
  value: z.coerce.number({ invalid_type_error: 'عدد وارد کنید' }),
  note: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function CheckInPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const defaultKrId = sp.get('krId') || '';
  const [selectedKrId, setSelectedKrId] = useState(defaultKrId);

  const { data: allKrs, isLoading: krsLoading } = useQuery({
    queryKey: ['key-results', 'mine'],
    queryFn: () => keyResultsApi.getAll({ ownerId: user?.id }),
    enabled: !!user?.id,
  });

  const selectedKr = allKrs?.find(k => k.id === selectedKrId);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { keyResultId: defaultKrId },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => checkInsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['key-results'] });
      qc.invalidateQueries({ queryKey: ['check-ins'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      navigate(-1);
    },
  });

  const krOptions = (allKrs || []).map(k => ({ value: k.id, label: k.title }));

  return (
    <div>
      <TopBar title="ثبت چک‌این" showBack />
      <div className="p-4 space-y-4">
        {krsLoading ? <PageSpinner /> : (
          <Card>
            <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
              <Select
                label="نتیجه کلیدی *"
                options={krOptions}
                placeholder="انتخاب کنید..."
                error={errors.keyResultId?.message}
                {...register('keyResultId', {
                  onChange: (e) => { setSelectedKrId(e.target.value); setValue('keyResultId', e.target.value); }
                })}
              />

              {selectedKr && (
                <div className="bg-surface-50 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 truncate">{selectedKr.title}</span>
                    <Badge className={krStatusColor[selectedKr.status]}>{krStatusLabel[selectedKr.status]}</Badge>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>فعلی: <b>{selectedKr.currentValue.toLocaleString('fa-IR')}{selectedKr.unit ? ` ${selectedKr.unit}` : ''}</b></span>
                    <span>هدف: <b>{selectedKr.targetValue.toLocaleString('fa-IR')}{selectedKr.unit ? ` ${selectedKr.unit}` : ''}</b></span>
                  </div>
                  <ProgressBar value={selectedKr.progress} colorClass={krProgressColor[selectedKr.status]} size="sm" />
                </div>
              )}

              <Input
                label={`مقدار جدید${selectedKr?.unit ? ` (${selectedKr.unit})` : ''} *`}
                type="number" inputMode="decimal"
                placeholder="عدد وارد کنید"
                error={errors.value?.message}
                {...register('value')}
              />
              <Textarea label="یادداشت (اختیاری)" placeholder="توضیحات..." {...register('note')} />

              {mutation.isError && (
                <div className="bg-danger-50 text-danger-600 text-sm rounded-xl px-4 py-3">
                  {(mutation.error as Error).message}
                </div>
              )}
              <Button type="submit" fullWidth size="lg" loading={mutation.isPending}>ثبت چک‌این</Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
