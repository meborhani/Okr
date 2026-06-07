import { useNavigate } from 'react-router-dom';
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
import { objectivesApi, periodsApi, usersApi } from '@/lib/api/okr.api';
import { useAuthStore } from '@/lib/auth/auth.store';
import { periodLabel } from '@/lib/utils/format';

const schema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
  description: z.string().optional(),
  periodId: z.string().min(1, 'دوره الزامی است'),
  ownerId: z.string().min(1, 'مالک الزامی است'),
});
type FormData = z.infer<typeof schema>;

export function CreateObjectivePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data: periods } = useQuery({ queryKey: ['periods'], queryFn: periodsApi.getAll });
  const { data: usersRes } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll() });
  const rawUsers = usersRes?.data || [];
  const users = rawUsers.length > 0 ? rawUsers
    : user ? [{ id: user.id, firstName: user.firstName, lastName: user.lastName }] : [];

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ownerId: user?.id || '' },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => objectivesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['objectives'] });
      navigate(-1);
    },
  });

  const periodOptions = (periods || []).map(p => ({ value: p.id, label: periodLabel(p.year, p.quarter) + ' — ' + p.title }));
  const ownerOptions = users.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }));

  return (
    <div>
      <TopBar title="هدف جدید" showBack />
      <div className="p-4">
        <Card>
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
            <Input label="عنوان هدف *" placeholder="مثال: افزایش رضایت مشتریان" error={errors.title?.message} {...register('title')} />
            <Textarea label="توضیحات" placeholder="هدف را شفاف توضیح دهید..." {...register('description')} />
            <Select label="دوره OKR *" options={periodOptions} placeholder="انتخاب دوره..." error={errors.periodId?.message} {...register('periodId')} />
            <Select label="مالک *" options={ownerOptions} placeholder="انتخاب مالک..." error={errors.ownerId?.message} {...register('ownerId')} />
            {mutation.isError && (
              <div className="bg-danger-50 text-danger-600 text-sm rounded-xl px-4 py-3">
                {(mutation.error as Error).message}
              </div>
            )}
            <Button type="submit" fullWidth size="lg" loading={mutation.isPending}>ذخیره هدف</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
