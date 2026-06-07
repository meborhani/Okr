"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersPage = UsersPage;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const zod_2 = require("zod");
const TopBar_1 = require("@/components/layout/TopBar");
const Modal_1 = require("@/components/ui/Modal");
const Input_1 = require("@/components/ui/Input");
const Select_1 = require("@/components/ui/Select");
const Button_1 = require("@/components/ui/Button");
const Badge_1 = require("@/components/ui/Badge");
const Card_1 = require("@/components/ui/Card");
const Spinner_1 = require("@/components/ui/Spinner");
const EmptyState_1 = require("@/components/ui/EmptyState");
const ErrorState_1 = require("@/components/ui/ErrorState");
const Toast_1 = require("@/components/ui/Toast");
const okr_api_1 = require("@/lib/api/okr.api");
const lucide_react_1 = require("lucide-react");
const createSchema = zod_2.z.object({
    firstName: zod_2.z.string().min(1, 'نام الزامی است'),
    lastName: zod_2.z.string().min(1, 'نام خانوادگی الزامی است'),
    email: zod_2.z.string().email('ایمیل معتبر نیست'),
    password: zod_2.z.string().min(8, 'رمز عبور حداقل ۸ کاراکتر').regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'رمز عبور باید شامل حرف بزرگ، کوچک و عدد باشد'),
    roleId: zod_2.z.string().min(1, 'نقش الزامی است'),
    departmentId: zod_2.z.string().optional(),
    teamId: zod_2.z.string().optional(),
});
const editSchema = zod_2.z.object({
    firstName: zod_2.z.string().min(1, 'نام الزامی است'),
    lastName: zod_2.z.string().min(1, 'نام خانوادگی الزامی است'),
    roleId: zod_2.z.string().min(1, 'نقش الزامی است'),
    departmentId: zod_2.z.string().optional(),
    teamId: zod_2.z.string().optional(),
    isActive: zod_2.z.enum(['true', 'false']),
});
function UsersPage() {
    const qc = (0, react_query_1.useQueryClient)();
    const [formMode, setFormMode] = (0, react_1.useState)(null);
    const [editTarget, setEditTarget] = (0, react_1.useState)(null);
    const [deleteTarget, setDeleteTarget] = (0, react_1.useState)(null);
    const { data: res, isLoading, isError, refetch } = (0, react_query_1.useQuery)({
        queryKey: ['users'],
        queryFn: () => okr_api_1.usersApi.getAll(),
    });
    const { data: roles = [] } = (0, react_query_1.useQuery)({ queryKey: ['roles'], queryFn: okr_api_1.rolesApi.getAll });
    const { data: depts = [] } = (0, react_query_1.useQuery)({ queryKey: ['departments'], queryFn: okr_api_1.departmentsApi.getAll });
    const { data: teams = [] } = (0, react_query_1.useQuery)({ queryKey: ['teams'], queryFn: okr_api_1.teamsApi.getAll });
    const deleteMut = (0, react_query_1.useMutation)({
        mutationFn: (id) => okr_api_1.usersApi.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['users'] });
            (0, Toast_1.toast)('کاربر با موفقیت حذف شد');
            setDeleteTarget(null);
        },
        onError: (e) => (0, Toast_1.toast)(e.message, 'error'),
    });
    const users = res?.data || [];
    const openCreate = () => { setEditTarget(null); setFormMode('create'); };
    const openEdit = (u) => { setEditTarget(u); setFormMode('edit'); };
    const closeForm = () => { setFormMode(null); setEditTarget(null); };
    return (<div className="pb-24 md:pb-8">
      <TopBar_1.TopBar title="مدیریت کاربران" right={<Button_1.Button size="sm" onClick={openCreate}>
            <lucide_react_1.Plus size={15}/> افزودن کاربر
          </Button_1.Button>}/>

      <div className="p-4">
        {isLoading ? <Spinner_1.PageSpinner />
            : isError ? <ErrorState_1.ErrorState onRetry={refetch}/>
                : !users.length ? (<EmptyState_1.EmptyState icon={<lucide_react_1.Users size={28} className="text-primary-400"/>} title="هنوز کاربری ثبت نشده" action={<Button_1.Button onClick={openCreate}><lucide_react_1.Plus size={16}/> افزودن کاربر</Button_1.Button>}/>) : (<>
              
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
                      {users.map((u, i) => (<tr key={u.id} className={`border-b border-surface-50 hover:bg-surface-50/60 transition-colors ${i === users.length - 1 ? 'border-0' : ''}`}>
                          <td className="px-5 py-4 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                          <td className="px-5 py-4 text-gray-500 font-mono text-xs">{u.email}</td>
                          <td className="px-5 py-4">
                            <Badge_1.Badge className="bg-primary-50 text-primary-700">{u.roleDisplayName || u.roleName}</Badge_1.Badge>
                          </td>
                          <td className="px-5 py-4 text-gray-500">{u.departmentName || '—'}</td>
                          <td className="px-5 py-4">
                            <Badge_1.Badge className={u.isActive ? 'bg-success-50 text-success-600' : 'bg-gray-100 text-gray-400'}>
                              {u.isActive ? 'فعال' : 'غیرفعال'}
                            </Badge_1.Badge>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1">
                              <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-surface-100 text-gray-400 hover:text-primary-600 transition-colors">
                                <lucide_react_1.Edit2 size={14}/>
                              </button>
                              <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded-lg hover:bg-danger-50 text-gray-400 hover:text-danger-600 transition-colors">
                                <lucide_react_1.Trash2 size={14}/>
                              </button>
                            </div>
                          </td>
                        </tr>))}
                    </tbody>
                  </table>
                </div>
              </div>

              
              <div className="md:hidden space-y-3">
                {users.map(u => (<Card_1.Card key={u.id}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">{u.email}</p>
                      </div>
                      <Badge_1.Badge className={u.isActive ? 'bg-success-50 text-success-600' : 'bg-gray-100 text-gray-400'}>
                        {u.isActive ? 'فعال' : 'غیرفعال'}
                      </Badge_1.Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge_1.Badge className="bg-primary-50 text-primary-700 text-xs">{u.roleDisplayName || u.roleName}</Badge_1.Badge>
                      {u.departmentName && <span className="text-xs text-gray-400">{u.departmentName}</span>}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button_1.Button size="sm" variant="secondary" onClick={() => openEdit(u)}>
                        <lucide_react_1.Edit2 size={13}/> ویرایش
                      </Button_1.Button>
                      <Button_1.Button size="sm" variant="ghost" onClick={() => setDeleteTarget(u)}>
                        <lucide_react_1.Trash2 size={13}/> حذف
                      </Button_1.Button>
                    </div>
                  </Card_1.Card>))}
              </div>
            </>)}
      </div>

      
      <button onClick={openCreate} className="fixed bottom-20 left-4 w-14 h-14 rounded-full bg-primary-600 text-white shadow-fab flex items-center justify-center active:scale-95 transition-transform z-30 md:hidden">
        <lucide_react_1.Plus size={24}/>
      </button>

      
      {formMode === 'create' && (<UserFormModal mode="create" roles={roles} depts={depts} teams={teams} onClose={closeForm} onSaved={() => { qc.invalidateQueries({ queryKey: ['users'] }); closeForm(); }}/>)}
      {formMode === 'edit' && editTarget && (<UserFormModal mode="edit" user={editTarget} roles={roles} depts={depts} teams={teams} onClose={closeForm} onSaved={() => { qc.invalidateQueries({ queryKey: ['users'] }); closeForm(); }}/>)}

      
      <Modal_1.Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="حذف کاربر">
        <p className="text-sm text-gray-600 mb-5">
          آیا از حذف <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong> اطمینان دارید؟ این عمل قابل برگشت نیست.
        </p>
        <div className="flex gap-2">
          <Button_1.Button variant="danger" fullWidth loading={deleteMut.isPending} onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}>
            بله، حذف کن
          </Button_1.Button>
          <Button_1.Button variant="secondary" fullWidth onClick={() => setDeleteTarget(null)}>انصراف</Button_1.Button>
        </div>
      </Modal_1.Modal>
    </div>);
}
function UserFormModal({ mode, user, roles, depts, teams, onClose, onSaved }) {
    const roleOptions = roles.map(r => ({ value: r.id, label: r.display_name || r.name }));
    const deptOptions = [{ value: '', label: 'بدون دپارتمان' }, ...depts.map(d => ({ value: d.id, label: d.name }))];
    const teamOptions = [{ value: '', label: 'بدون تیم' }, ...teams.map(t => ({ value: t.id, label: t.name }))];
    if (mode === 'create') {
        return <CreateForm roles={roleOptions} depts={deptOptions} teams={teamOptions} onClose={onClose} onSaved={onSaved}/>;
    }
    return <EditForm user={user} roles={roleOptions} depts={deptOptions} teams={teamOptions} onClose={onClose} onSaved={onSaved}/>;
}
function CreateForm({ roles, depts, teams, onClose, onSaved }) {
    const { register, handleSubmit, formState: { errors } } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(createSchema),
    });
    const mutation = (0, react_query_1.useMutation)({
        mutationFn: (d) => okr_api_1.usersApi.create({
            ...d,
            departmentId: d.departmentId || undefined,
            teamId: d.teamId || undefined,
        }),
        onSuccess: () => { (0, Toast_1.toast)('کاربر با موفقیت ایجاد شد'); onSaved(); },
        onError: (e) => (0, Toast_1.toast)(e.message, 'error'),
    });
    return (<Modal_1.Modal open title="افزودن کاربر" onClose={onClose}>
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input_1.Input label="نام *" error={errors.firstName?.message} {...register('firstName')}/>
          <Input_1.Input label="نام خانوادگی *" error={errors.lastName?.message} {...register('lastName')}/>
        </div>
        <Input_1.Input label="ایمیل *" type="email" error={errors.email?.message} {...register('email')}/>
        <Input_1.Input label="رمز عبور *" type="password" error={errors.password?.message} {...register('password')} hint="حداقل ۸ کاراکتر، شامل حرف بزرگ، کوچک و عدد"/>
        <Select_1.Select label="نقش *" options={roles} placeholder="انتخاب نقش..." error={errors.roleId?.message} {...register('roleId')}/>
        <div className="grid grid-cols-2 gap-3">
          <Select_1.Select label="دپارتمان" options={depts} {...register('departmentId')}/>
          <Select_1.Select label="تیم" options={teams} {...register('teamId')}/>
        </div>
        {mutation.isError && (<p className="text-xs text-danger-600 bg-danger-50 px-3 py-2 rounded-xl">{mutation.error.message}</p>)}
        <Button_1.Button type="submit" fullWidth size="lg" loading={mutation.isPending}>ایجاد کاربر</Button_1.Button>
      </form>
    </Modal_1.Modal>);
}
function EditForm({ user, roles, depts, teams, onClose, onSaved }) {
    const { register, handleSubmit, formState: { errors } } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(editSchema),
        defaultValues: {
            firstName: user.firstName,
            lastName: user.lastName,
            roleId: user.roleId,
            departmentId: user.departmentId || '',
            teamId: user.teamId || '',
            isActive: user.isActive ? 'true' : 'false',
        },
    });
    const mutation = (0, react_query_1.useMutation)({
        mutationFn: (d) => okr_api_1.usersApi.update(user.id, {
            firstName: d.firstName,
            lastName: d.lastName,
            roleId: d.roleId,
            departmentId: d.departmentId || undefined,
            teamId: d.teamId || undefined,
            isActive: d.isActive === 'true',
        }),
        onSuccess: () => { (0, Toast_1.toast)('کاربر با موفقیت ویرایش شد'); onSaved(); },
        onError: (e) => (0, Toast_1.toast)(e.message, 'error'),
    });
    const statusOptions = [{ value: 'true', label: 'فعال' }, { value: 'false', label: 'غیرفعال' }];
    return (<Modal_1.Modal open title="ویرایش کاربر" onClose={onClose}>
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input_1.Input label="نام *" error={errors.firstName?.message} {...register('firstName')}/>
          <Input_1.Input label="نام خانوادگی *" error={errors.lastName?.message} {...register('lastName')}/>
        </div>
        <Input_1.Input label="ایمیل" value={user.email} disabled className="opacity-60 cursor-not-allowed"/>
        <Select_1.Select label="نقش *" options={roles} error={errors.roleId?.message} {...register('roleId')}/>
        <div className="grid grid-cols-2 gap-3">
          <Select_1.Select label="دپارتمان" options={depts} {...register('departmentId')}/>
          <Select_1.Select label="تیم" options={teams} {...register('teamId')}/>
        </div>
        <Select_1.Select label="وضعیت" options={statusOptions} {...register('isActive')}/>
        {mutation.isError && (<p className="text-xs text-danger-600 bg-danger-50 px-3 py-2 rounded-xl">{mutation.error.message}</p>)}
        <Button_1.Button type="submit" fullWidth size="lg" loading={mutation.isPending}>ذخیره تغییرات</Button_1.Button>
      </form>
    </Modal_1.Modal>);
}
//# sourceMappingURL=UsersPage.js.map