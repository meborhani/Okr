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
import { keyResultsApi, objectivesApi, usersApi } from '@/lib/api/okr.api';
import { useAuthStore } from '@/lib/auth/auth.store';

const schema = z.object({
  title: z.string().min(3, 'عنوان الزامی است'),
  description: z.string().optional(),
  objectiveId: z.string().min(1, 'هدف الزامی است'),
  ownerId: z.string().min(1, 'مالک الزامی است'),
  startValue: z.coerce.number({ invalid_type_error: 'عدد وارد کنید' }),
  targetValue: z.coerce.number({ invalid_type_error: 'عدد وارد کنید' }),
  unit: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function CreateKeyResultPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data: objectives } = useQuery({ queryKey: ['objectives', 'all'], queryFn: () => objectivesApi.getAll() });
  const { data: usersRes } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll() });
  const users = (usersRes?.data || []) as { id: string; firstName: string; lastName: string }[];

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ownerId: user?.id || '', objectiveId: sp.get('objectiveId') || '', startValue: 0 },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => keyResultsApi.create(data),
    onSuccess: (kr) => {
      qc.invalidateQueries({ queryKey: ['key-results'] });
      navigate(`/key-results/${kr.id}`);
    },
  });

  const objOptions = (objectives || []).map(o => ({ value: o.id, label: o.title }));
  const ownerOptions = users.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }));

  return (
    <div>
      <TopBar title="نتیجه کلیدی جدید" showBack />
      <div className="p-4">
        <Card>
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
            <Input label="عنوان *" placeholder="مثال: افزایش NPS به ۷۰" error={errors.title?.message} {...register('title')} />
            <Textarea label="توضیحات" placeholder="توضیحات..." {...register('description')} />
            <Select label="هدف *" options={objOptions} placeholder="انتخاب هدف..." error={errors.objectiveId?.message} {...register('objectiveId')} />
            <Select label="مالک *" options={ownerOptions} placeholder="انتخاب مالک..." error={errors.ownerId?.message} {...register('ownerId')} />
            <div className="grid grid-cols-3 gap-3">
              <Input label="مقدار شروع *" type="number" error={errors.startValue?.message} {...register('startValue')} />
              <Input label="مقدار هدف *" type="number" error={errors.targetValue?.message} {...register('targetValue')} />
              <Input label="واحد" placeholder="٪، نفر..." {...register('unit')} />
            </div>
            {mutation.isError && (
              <div className="bg-danger-50 text-danger-600 text-sm rounded-xl px-4 py-3">
                {(mutation.error as Error).message}
              </div>
            )}
            <Button type="submit" fullWidth size="lg" loading={mutation.isPending}>ذخیره</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
