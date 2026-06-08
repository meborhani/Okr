import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { keyResultsApi, usersApi } from '@/lib/api/okr.api';
import { useAuthStore } from '@/lib/auth/auth.store';
import { toast } from '@/components/ui/Toast';

interface Props {
  open: boolean;
  onClose: () => void;
  objectiveId: string;
  objectiveScope?: 'organization' | 'team';
}

export function CreateKeyResultModal({ open, onClose, objectiveId, objectiveScope = 'organization' }: Props) {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [startValue, setStartValue] = useState('0');
  const [targetValue, setTargetValue] = useState('100');
  const [unit, setUnit] = useState('');
  const [weight, setWeight] = useState('1');
  const [ownerId, setOwnerId] = useState(user?.id || '');

  const { data: usersResp } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(1, 200),
    enabled: objectiveScope === 'organization',
  });
  const allUsers = usersResp?.data || [];
  const filteredOwners = objectiveScope === 'organization'
    ? allUsers.filter(u => u.roleName !== 'employee')
    : [];

  const ownerOptions = filteredOwners.map(u => ({
    value: u.id, label: `${u.firstName} ${u.lastName} (${u.roleDisplayName || u.roleName})`,
  }));

  const mutation = useMutation({
    mutationFn: () => {
      if (!title.trim()) throw new Error('عنوان الزامی است');
      const sv = parseFloat(startValue);
      const tv = parseFloat(targetValue);
      if (isNaN(sv) || isNaN(tv)) throw new Error('مقادیر عدد وارد کنید');
      if (sv === tv) throw new Error('مقدار هدف نباید با مقدار شروع برابر باشد');
      return keyResultsApi.create({
        title: title.trim(),
        objectiveId,
        ownerId: ownerId || user!.id,
        startValue: sv,
        targetValue: tv,
        unit: unit.trim() || undefined,
        weight: parseFloat(weight) || 1,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['key-results', 'by-objective', objectiveId] });
      qc.invalidateQueries({ queryKey: ['objectives', objectiveId] });
      toast('نتیجه کلیدی با موفقیت ایجاد شد');
      setTitle(''); setStartValue('0'); setTargetValue('100'); setUnit(''); setWeight('1');
      onClose();
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <Modal open={open} onClose={onClose} title="افزودن نتیجه کلیدی">
      <div className="space-y-4">
        <Input
          label="عنوان نتیجه کلیدی *"
          placeholder="مثال: افزایش نرخ تبدیل به ۵٪"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="مقدار شروع *" type="number" value={startValue} onChange={e => setStartValue(e.target.value)} />
          <Input label="مقدار هدف *" type="number" value={targetValue} onChange={e => setTargetValue(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="واحد اندازه‌گیری" placeholder="درصد، عدد، ریال" value={unit} onChange={e => setUnit(e.target.value)} />
          <Input label="وزن" type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} />
        </div>
        {objectiveScope === 'organization' && ownerOptions.length > 0 && (
          <Select
            label="مالک KR (CEO یا مدیر بخش)"
            options={[{ value: user?.id || '', label: 'خودم' }, ...ownerOptions]}
            value={ownerId}
            onChange={e => setOwnerId(e.target.value)}
          />
        )}
        {mutation.isError && (
          <p className="text-xs text-danger-600 bg-danger-50 px-3 py-2 rounded-xl">
            {(mutation.error as Error).message}
          </p>
        )}
        <Button fullWidth size="lg" loading={mutation.isPending} onClick={() => mutation.mutate()}>
          ایجاد نتیجه کلیدی
        </Button>
      </div>
    </Modal>
  );
}
