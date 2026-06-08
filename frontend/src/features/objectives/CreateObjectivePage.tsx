import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { objectivesApi, periodsApi, usersApi } from '@/lib/api/okr.api';
import { useAuthStore } from '@/lib/auth/auth.store';
import { periodLabel } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';

export function CreateObjectivePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [periodId, setPeriodId] = useState('');
  const [ownerId, setOwnerId] = useState(user?.id || '');
  const [scope, setScope] = useState<'organization' | 'team'>('organization');

  const { data: periods } = useQuery({ queryKey: ['periods'], queryFn: periodsApi.getAll });
  const { data: usersResp } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll(1, 200) });
  const allUsers = usersResp?.data || [];

  // For org scope: filter to non-employees (CEO, dept_managers, admin)
  // For team scope: all users
  const filteredOwners = scope === 'organization'
    ? allUsers.filter(u => u.roleName !== 'employee')
    : allUsers;

  const periodOptions = [
    { value: '', label: 'انتخاب دوره...' },
    ...(periods || []).map(p => ({ value: p.id, label: periodLabel(p.year, p.quarter) + ' — ' + p.title })),
  ];

  const ownerOptions = [
    { value: '', label: 'انتخاب مالک...' },
    ...filteredOwners.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName} (${u.roleDisplayName || u.roleName})` })),
  ];

  const mutation = useMutation({
    mutationFn: () => objectivesApi.create({ title, description: description || undefined, periodId, ownerId, scope }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['objectives'] });
      navigate(-1);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const canSubmit = title.trim().length >= 3 && periodId && ownerId;

  return (
    <div>
      <TopBar title="هدف جدید" showBack />
      <div className="p-4">
        <Card>
          <div className="space-y-4">
            <Input
              label="عنوان هدف *"
              placeholder="مثال: افزایش رضایت مشتریان"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <Input
              label="توضیحات"
              placeholder="هدف را شفاف توضیح دهید..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <Select
              label="سطح هدف"
              value={scope}
              onChange={e => { setScope(e.target.value as 'organization' | 'team'); setOwnerId(''); }}
              options={[
                { value: 'organization', label: 'سطح سازمان (CEO / مدیر بخش)' },
                { value: 'team', label: 'سطح تیم' },
              ]}
            />
            <Select
              label="دوره OKR *"
              options={periodOptions}
              value={periodId}
              onChange={e => setPeriodId(e.target.value)}
            />
            <Select
              label="مالک *"
              options={ownerOptions}
              value={ownerId}
              onChange={e => setOwnerId(e.target.value)}
            />
            {mutation.isError && (
              <div className="bg-danger-50 text-danger-600 text-sm rounded-xl px-4 py-3">
                {(mutation.error as Error).message}
              </div>
            )}
            <Button
              fullWidth size="lg"
              loading={mutation.isPending}
              disabled={!canSubmit}
              onClick={() => mutation.mutate()}
            >
              ذخیره هدف
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
