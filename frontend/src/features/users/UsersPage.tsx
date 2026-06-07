import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TopBar } from '@/components/layout/TopBar';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { toast } from '@/components/ui/Toast';
import { usersApi, rolesApi, departmentsApi, teamsApi, type UserListItem } from '@/lib/api/okr.api';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';

// ─── Schemas ────────────────────────────────────────────────────────────────
const createSchema = z.object({
  firstName: z.string().min(1, 'نام الزامی است'),
  lastName: z.string().min(1, 'نام خانوادگی الزامی است'),
  email: z.string().email('ایمیل معتبر نیست'),
  password: z.string().min(8, 'رمز عبور حداقل ۸ کاراکتر').regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'رمز عبور باید شامل حرف بزرگ، کوچک و عدد باشد'),
  roleId: z.string().min(1, 'نقش الزامی است'),
  departmentId: z.string().optional(),
  teamId: z.string().optional(),
});
const editSchema = z.object({
  firstName: z.string().min(1, 'نام الزامی است'),
  lastName: z.string().min(1, 'نام خانوادگی الزامی است'),
  roleId: z.string().min(1, 'نقش الزامی است'),
  departmentId: z.string().optional(),
  teamId: z.string().optional(),
  isActive: z.enum(['true', 'false']),
});

type CreateData = z.infer<typeof createSchema>;
type EditData = z.infer<typeof editSchema>;

// ─── Main Page ───────────────────────────────────────────────────────────────
export function UsersPage() {
  const qc = useQueryClient();
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<UserListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);

  const { data: res, isLoading, isError, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  });
  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: rolesApi.getAll });
  const { data: depts = [] } = useQuery({ queryKey: ['departments'], queryFn: departmentsApi.getAll });
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: teamsApi.getAll });

  const deleteMut = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast('کاربر با موفقیت حذف شد');
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const users = res?.data || [];

  const openCreate = () => { setEditTarget(null); setFormMode('create'); };
  const openEdit = (u: UserListItem) => { setEditTarget(u); setFormMode('edit'); };
  const closeForm = () => { setFormMode(null); setEditTarget(null); };

  return (
    <div className="pb-24 md:pb-8">
      <TopBar title="مدیریت کاربران"
        right={
          <Button size="sm" onClick={openCreate}>
            <Plus size={15} /> افزودن کاربر
          </Button>
        }
      />

      <div className="p-4">
        {isLoading ? <PageSpinner />
          : isError ? <ErrorState onRetry={refetch} />
          : !users.length ? (
            <EmptyState
              icon={<Users size={28} className="text-primary-400" />}
              title="هنوز کاربری ثبت نشده"
              action={<Button onClick={openCreate}><Plus size={16} /> افزودن کاربر</Button>}
            />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-100 bg-surface-50">
                        <th className="text-right px-5 py-3.5 font-semibold text-gray-500">نام</th>
                        <th className="text-right px-5 py-3.5 font-semibold text-gray-500">ایمیل</th>
                        <th className="text-right px-5 py-3.5 font-semibold text-gray-500">نقش</th>
                        <th className="text-right px-5 py-3.5 font-semibold text-gray-500">دپارتمان</th>
                        <th className="text-right px-5 py-3.5 font-semibold text-gray-500">وضعیت</th>
                        <th className="text-right px-5 py-3.5 font-semibold text-gray-500">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u.id}
                          className={`border-b border-surface-50 hover:bg-surface-50/60 transition-colors ${i === users.length - 1 ? 'border-0' : ''}`}>
                          <td className="px-5 py-4 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                          <td className="px-5 py-4 text-gray-500 font-mono text-xs">{u.email}</td>
                          <td className="px-5 py-4">
                            <Badge className="bg-primary-50 text-primary-700">{u.roleDisplayName || u.roleName}</Badge>
                          </td>
                          <td className="px-5 py-4 text-gray-500">{u.departmentName || '—'}</td>
                          <td className="px-5 py-4">
                            <Badge className={u.isActive ? 'bg-success-50 text-success-600' : 'bg-gray-100 text-gray-400'}>
                              {u.isActive ? 'فعال' : 'غیرفعال'}
                            </Badge>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1">
                              <button onClick={() => openEdit(u)}
                                className="p-1.5 rounded-lg hover:bg-surface-100 text-gray-400 hover:text-primary-600 transition-colors">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => setDeleteTarget(u)}
                                className="p-1.5 rounded-lg hover:bg-danger-50 text-gray-400 hover:text-danger-600 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {users.map(u => (
                  <Card key={u.id}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">{u.email}</p>
                      </div>
                      <Badge className={u.isActive ? 'bg-success-50 text-success-600' : 'bg-gray-100 text-gray-400'}>
                        {u.isActive ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-primary-50 text-primary-700 text-xs">{u.roleDisplayName || u.roleName}</Badge>
                      {u.departmentName && <span className="text-xs text-gray-400">{u.departmentName}</span>}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(u)}>
                        <Edit2 size={13} /> ویرایش
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(u)}>
                        <Trash2 size={13} /> حذف
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )
        }
      </div>

      {/* FAB mobile */}
      <button onClick={openCreate}
        className="fixed bottom-20 left-4 w-14 h-14 rounded-full bg-primary-600 text-white shadow-fab flex items-center justify-center active:scale-95 transition-transform z-30 md:hidden">
        <Plus size={24} />
      </button>

      {/* Create / Edit Modal */}
      {formMode === 'create' && (
        <UserFormModal
          mode="create"
          roles={roles}
          depts={depts}
          teams={teams}
          onClose={closeForm}
          onSaved={() => { qc.invalidateQueries({ queryKey: ['users'] }); closeForm(); }}
        />
      )}
      {formMode === 'edit' && editTarget && (
        <UserFormModal
          mode="edit"
          user={editTarget}
          roles={roles}
          depts={depts}
          teams={teams}
          onClose={closeForm}
          onSaved={() => { qc.invalidateQueries({ queryKey: ['users'] }); closeForm(); }}
        />
      )}

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="حذف کاربر">
        <p className="text-sm text-gray-600 mb-5">
          آیا از حذف <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong> اطمینان دارید؟ این عمل قابل برگشت نیست.
        </p>
        <div className="flex gap-2">
          <Button variant="danger" fullWidth loading={deleteMut.isPending}
            onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}>
            بله، حذف کن
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setDeleteTarget(null)}>انصراف</Button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────
interface FormModalProps {
  mode: 'create' | 'edit';
  user?: UserListItem;
  roles: { id: string; name: string; display_name: string }[];
  depts: { id: string; name: string }[];
  teams: { id: string; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}

function UserFormModal({ mode, user, roles, depts, teams, onClose, onSaved }: FormModalProps) {
  const roleOptions = roles.map(r => ({ value: r.id, label: r.display_name || r.name }));
  const deptOptions = [{ value: '', label: 'بدون دپارتمان' }, ...depts.map(d => ({ value: d.id, label: d.name }))];
  const teamOptions = [{ value: '', label: 'بدون تیم' }, ...teams.map(t => ({ value: t.id, label: t.name }))];

  if (mode === 'create') {
    return <CreateForm roles={roleOptions} depts={deptOptions} teams={teamOptions} onClose={onClose} onSaved={onSaved} />;
  }
  return <EditForm user={user!} roles={roleOptions} depts={deptOptions} teams={teamOptions} onClose={onClose} onSaved={onSaved} />;
}

function CreateForm({ roles, depts, teams, onClose, onSaved }: {
  roles: { value: string; label: string }[];
  depts: { value: string; label: string }[];
  teams: { value: string; label: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateData>({
    resolver: zodResolver(createSchema),
  });

  const mutation = useMutation({
    mutationFn: (d: CreateData) => usersApi.create({
      ...d,
      departmentId: d.departmentId || undefined,
      teamId: d.teamId || undefined,
    }),
    onSuccess: () => { toast('کاربر با موفقیت ایجاد شد'); onSaved(); },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <Modal open title="افزودن کاربر" onClose={onClose}>
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input label="نام *" error={errors.firstName?.message} {...register('firstName')} />
          <Input label="نام خانوادگی *" error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <Input label="ایمیل *" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="رمز عبور *" type="password" error={errors.password?.message} {...register('password')}
          hint="حداقل ۸ کاراکتر، شامل حرف بزرگ، کوچک و عدد" />
        <Select label="نقش *" options={roles} placeholder="انتخاب نقش..." error={errors.roleId?.message} {...register('roleId')} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="دپارتمان" options={depts} {...register('departmentId')} />
          <Select label="تیم" options={teams} {...register('teamId')} />
        </div>
        {mutation.isError && (
          <p className="text-xs text-danger-600 bg-danger-50 px-3 py-2 rounded-xl">{(mutation.error as Error).message}</p>
        )}
        <Button type="submit" fullWidth size="lg" loading={mutation.isPending}>ایجاد کاربر</Button>
      </form>
    </Modal>
  );
}

function EditForm({ user, roles, depts, teams, onClose, onSaved }: {
  user: UserListItem;
  roles: { value: string; label: string }[];
  depts: { value: string; label: string }[];
  teams: { value: string; label: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<EditData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      departmentId: user.departmentId || '',
      teamId: user.teamId || '',
      isActive: user.isActive ? 'true' : 'false',
    },
  });

  const mutation = useMutation({
    mutationFn: (d: EditData) => usersApi.update(user.id, {
      firstName: d.firstName,
      lastName: d.lastName,
      roleId: d.roleId,
      departmentId: d.departmentId || undefined,
      teamId: d.teamId || undefined,
      isActive: d.isActive === 'true',
    }),
    onSuccess: () => { toast('کاربر با موفقیت ویرایش شد'); onSaved(); },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const statusOptions = [{ value: 'true', label: 'فعال' }, { value: 'false', label: 'غیرفعال' }];

  return (
    <Modal open title="ویرایش کاربر" onClose={onClose}>
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input label="نام *" error={errors.firstName?.message} {...register('firstName')} />
          <Input label="نام خانوادگی *" error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <Input label="ایمیل" value={user.email} disabled className="opacity-60 cursor-not-allowed" />
        <Select label="نقش *" options={roles} error={errors.roleId?.message} {...register('roleId')} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="دپارتمان" options={depts} {...register('departmentId')} />
          <Select label="تیم" options={teams} {...register('teamId')} />
        </div>
        <Select label="وضعیت" options={statusOptions} {...register('isActive')} />
        {mutation.isError && (
          <p className="text-xs text-danger-600 bg-danger-50 px-3 py-2 rounded-xl">{(mutation.error as Error).message}</p>
        )}
        <Button type="submit" fullWidth size="lg" loading={mutation.isPending}>ذخیره تغییرات</Button>
      </form>
    </Modal>
  );
}
