import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, ChevronDown, ChevronRight, Plus, Edit2, Trash2,
  Crown, User2,
} from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { departmentsApi, teamsApi, usersApi, type DepartmentItem, type TeamItem, type UserListItem } from '@/lib/api/okr.api';
import { useAuthStore } from '@/lib/auth/auth.store';

export function OrgChartPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isAdmin = user?.permissions?.includes('departments:create');

  const [deptModal, setDeptModal] = useState<{ mode: 'create' | 'edit'; data?: DepartmentItem } | null>(null);
  const [teamModal, setTeamModal] = useState<{ mode: 'create' | 'edit'; data?: TeamItem; deptId?: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'dept' | 'team'; id: string; name: string } | null>(null);

  const { data: departments, isLoading: dLoading, isError: dError, refetch: dRefetch } = useQuery({
    queryKey: ['departments'], queryFn: departmentsApi.getAll,
  });
  const { data: teams } = useQuery({ queryKey: ['teams'], queryFn: teamsApi.getAll });
  const { data: usersResp } = useQuery({ queryKey: ['users', 'all'], queryFn: () => usersApi.getAll(1, 200) });

  const deleteDeptMut = useMutation({
    mutationFn: (id: string) => departmentsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); toast('بخش حذف شد'); setDeleteTarget(null); },
    onError: (e: Error) => toast(e.message, 'error'),
  });
  const deleteTeamMut = useMutation({
    mutationFn: (id: string) => teamsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams'] }); toast('تیم حذف شد'); setDeleteTarget(null); },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const users: UserListItem[] = usersResp?.data || [];
  const depts: DepartmentItem[] = departments || [];
  const teamsList: TeamItem[] = teams || [];

  if (dLoading) return <div><TopBar title="چارت سازمانی" /><PageSpinner /></div>;
  if (dError) return <div><TopBar title="چارت سازمانی" /><div className="p-4"><ErrorState onRetry={dRefetch} /></div></div>;

  // CEO: shown in company root node only
  const ceoUser = users.find(u => u.roleName === 'ceo' || u.roleName === 'admin');
  // Unassigned = no department AND not the CEO (CEO is already shown in root node)
  const unassignedUsers = users.filter(u => !u.departmentId && u.id !== ceoUser?.id);

  return (
    <div className="pb-24">
      <TopBar
        title="چارت سازمانی"
        right={isAdmin ? (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setTeamModal({ mode: 'create' })}>
              <Plus size={14} /> تیم
            </Button>
            <Button size="sm" onClick={() => setDeptModal({ mode: 'create' })}>
              <Plus size={14} /> بخش
            </Button>
          </div>
        ) : null}
      />

      <div className="p-4 space-y-0">
        {depts.length === 0 ? (
          <EmptyState
            icon={<Building2 size={28} className="text-primary-400" />}
            title="هنوز بخشی تعریف نشده"
            description="ساختار سازمانی خود را تعریف کنید"
            action={isAdmin ? (
              <div className="flex flex-col gap-2 items-center">
                <Button onClick={() => setDeptModal({ mode: 'create' })}><Plus size={16} /> افزودن بخش</Button>
                <Button variant="secondary" onClick={() => navigate('/users')}><Users size={16} /> مدیریت کاربران</Button>
              </div>
            ) : undefined}
          />
        ) : (
          <div className="tree-root">
            {/* ── Company root node ─── */}
            <div className="flex flex-col items-center mb-2">
              <div className="bg-white rounded-2xl border border-primary-200 shadow-sm px-5 py-3 flex items-center gap-3 min-w-[200px] justify-center">
                <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center flex-shrink-0">
                  <Crown size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">سازمان</p>
                  {ceoUser && (
                    <p className="text-xs text-gray-400">{ceoUser.firstName} {ceoUser.lastName}</p>
                  )}
                </div>
              </div>
              {/* vertical line down */}
              {depts.length > 0 && <div className="w-0.5 h-6 bg-gray-200" />}
            </div>

            {/* ── Horizontal branches to depts ── */}
            <div className="relative">
              {depts.length > 1 && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 bg-gray-200"
                  style={{ width: `${((depts.length - 1) / depts.length) * 100}%` }} />
              )}
              <div className="flex gap-4 justify-center">
                {depts.map((dept) => {
                  const deptTeams = teamsList.filter(t => t.departmentId === dept.id);
                  const deptUsers = users.filter(u => u.departmentId === dept.id);
                  return (
                    <DeptNode
                      key={dept.id}
                      dept={dept}
                      teams={deptTeams}
                      users={deptUsers}
                      isAdmin={!!isAdmin}
                      onEdit={() => setDeptModal({ mode: 'edit', data: dept })}
                      onDelete={() => setDeleteTarget({ type: 'dept', id: dept.id, name: dept.name })}
                      onAddTeam={() => setTeamModal({ mode: 'create', deptId: dept.id })}
                      onEditTeam={(t) => setTeamModal({ mode: 'edit', data: t })}
                      onDeleteTeam={(t) => setDeleteTarget({ type: 'team', id: t.id, name: t.name })}
                    />
                  );
                })}
              </div>
            </div>

            {unassignedUsers.length > 0 && (
              <div className="mt-6">
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <User2 size={16} className="text-gray-400" />
                    <span className="font-semibold text-gray-700 text-sm">بدون بخش</span>
                    <span className="text-xs text-gray-400">({unassignedUsers.length} نفر)</span>
                    {isAdmin && (
                      <Button size="sm" variant="ghost" className="mr-auto" onClick={() => navigate('/users')}>مدیریت</Button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {unassignedUsers.map(u => <UserRow key={u.id} user={u} />)}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {deptModal && (
        <DeptModal
          mode={deptModal.mode}
          existing={deptModal.data}
          users={users}
          onClose={() => setDeptModal(null)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ['departments'] }); setDeptModal(null); }}
        />
      )}
      {teamModal && (
        <TeamModal
          mode={teamModal.mode}
          existing={teamModal.data}
          departments={depts}
          users={users}
          defaultDeptId={teamModal.deptId}
          onClose={() => setTeamModal(null)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ['teams'] }); setTeamModal(null); }}
        />
      )}
      {deleteTarget && (
        <Modal open onClose={() => setDeleteTarget(null)} title="تأیید حذف">
          <p className="text-gray-600 mb-4">آیا از حذف «{deleteTarget.name}» مطمئن هستید؟</p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setDeleteTarget(null)}>انصراف</Button>
            <Button
              variant="danger" fullWidth
              loading={deleteDeptMut.isPending || deleteTeamMut.isPending}
              onClick={() => {
                if (deleteTarget.type === 'dept') deleteDeptMut.mutate(deleteTarget.id);
                else deleteTeamMut.mutate(deleteTarget.id);
              }}
            >
              حذف
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── DeptNode (tree node) ────────────────────────────────────────────────────

function DeptNode({
  dept, teams, users, isAdmin,
  onEdit, onDelete, onAddTeam, onEditTeam, onDeleteTeam,
}: {
  dept: DepartmentItem; teams: TeamItem[]; users: UserListItem[]; isAdmin: boolean;
  onEdit: () => void; onDelete: () => void;
  onAddTeam: () => void; onEditTeam: (t: TeamItem) => void; onDeleteTeam: (t: TeamItem) => void;
}) {
  const [open, setOpen] = useState(true);
  // Dept manager is already shown in the dept card header — exclude from user lists
  const directUsers = users.filter(u => !u.teamId && u.id !== dept.managerId);
  const hasChildren = teams.length > 0 || directUsers.length > 0;

  return (
    <div className="flex flex-col items-center min-w-[200px] max-w-[280px]">
      {/* vertical line from parent */}
      <div className="w-0.5 h-6 bg-gray-200" />

      {/* dept card */}
      <div className="w-full bg-white rounded-2xl border border-surface-200 shadow-sm">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <button className="flex items-center gap-2 flex-1 min-w-0" onClick={() => setOpen(v => !v)}>
            <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Building2 size={15} className="text-primary-600" />
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="font-semibold text-gray-900 text-xs truncate">{dept.name}</p>
              {dept.managerName && <p className="text-xs text-gray-400 truncate">{dept.managerName}</p>}
              <p className="text-[10px] text-gray-300">{teams.length} تیم · {users.length} نفر</p>
            </div>
            {hasChildren && (open ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />)}
          </button>
          {isAdmin && (
            <div className="flex gap-0.5">
              <button onClick={onEdit} className="p-1 rounded hover:bg-gray-100 text-gray-400"><Edit2 size={12} /></button>
              <button onClick={onDelete} className="p-1 rounded hover:bg-danger-50 text-gray-400 hover:text-danger-500"><Trash2 size={12} /></button>
            </div>
          )}
        </div>
      </div>

      {/* children */}
      {open && hasChildren && (
        <div className="flex flex-col items-center w-full mt-1">
          <div className="w-0.5 h-4 bg-gray-200" />
          <div className="flex gap-3 flex-wrap justify-center">
            {teams.map(team => {
              // Exclude dept manager and team manager from the team member list —
              // both are already shown in their respective node headers.
              const teamUsers = users.filter(
                u => u.teamId === team.id && u.id !== team.managerId && u.id !== dept.managerId,
              );
              return (
                <TeamNode
                  key={team.id} team={team} users={teamUsers} isAdmin={isAdmin}
                  onEdit={() => onEditTeam(team)} onDelete={() => onDeleteTeam(team)}
                />
              );
            })}
            {directUsers.length > 0 && (
              <div className="flex flex-col items-center min-w-[160px]">
                <div className="w-0.5 h-4 bg-gray-200" />
                <div className="bg-gray-50 border border-dashed border-surface-200 rounded-xl p-2 w-full">
                  <p className="text-[10px] text-gray-400 mb-1 text-center">بدون تیم</p>
                  {directUsers.map(u => <UserRow key={u.id} user={u} compact />)}
                </div>
              </div>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={onAddTeam}
              className="mt-2 text-xs text-primary-500 border border-dashed border-primary-200 rounded-xl px-3 py-1.5 hover:bg-primary-50 flex items-center gap-1 transition-colors"
            >
              <Plus size={11} /> افزودن تیم
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TeamNode ─────────────────────────────────────────────────────────────────

function TeamNode({ team, users, isAdmin, onEdit, onDelete }: {
  team: TeamItem; users: UserListItem[]; isAdmin: boolean;
  onEdit: () => void; onDelete: () => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex flex-col items-center min-w-[150px] max-w-[200px]">
      <div className="w-0.5 h-4 bg-gray-200" />
      <div className="w-full bg-white border border-surface-100 rounded-xl shadow-sm">
        <div className="flex items-center gap-1.5 px-2.5 py-2">
          <button className="flex items-center gap-1.5 flex-1 min-w-0" onClick={() => setOpen(v => !v)}>
            <Users size={13} className="text-primary-400 flex-shrink-0" />
            <div className="flex-1 min-w-0 text-right">
              <p className="text-xs font-semibold text-gray-700 truncate">{team.name}</p>
              {team.managerName && <p className="text-[10px] text-gray-400 truncate">{team.managerName}</p>}
              <p className="text-[10px] text-gray-300">{users.length} نفر</p>
            </div>
          </button>
          {isAdmin && (
            <div className="flex gap-0.5">
              <button onClick={onEdit} className="p-0.5 rounded hover:bg-gray-100 text-gray-400"><Edit2 size={11} /></button>
              <button onClick={onDelete} className="p-0.5 rounded hover:bg-danger-50 text-gray-400 hover:text-danger-500"><Trash2 size={11} /></button>
            </div>
          )}
        </div>
        {open && users.length > 0 && (
          <div className="border-t border-surface-50 px-2 py-1.5 space-y-1">
            {users.map(u => <UserRow key={u.id} user={u} compact />)}
          </div>
        )}
        {open && users.length === 0 && (
          <p className="text-[10px] text-gray-300 px-2 pb-1.5 text-center">عضوی ندارد</p>
        )}
      </div>
    </div>
  );
}

// ─── UserRow ──────────────────────────────────────────────────────────────────

function UserRow({ user, compact }: { user: UserListItem; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? 'py-0.5' : 'px-2 py-1'}`}>
      <div className={`${compact ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-xs'} rounded-xl bg-surface-100 flex items-center justify-center font-bold text-gray-500 flex-shrink-0`}>
        {user.firstName?.[0]}{user.lastName?.[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${compact ? 'text-[10px]' : 'text-sm'} font-medium text-gray-800 truncate`}>{user.firstName} {user.lastName}</p>
        {!compact && <p className="text-xs text-gray-400 truncate">{user.roleDisplayName || user.roleName}</p>}
      </div>
    </div>
  );
}

// ─── DeptModal ────────────────────────────────────────────────────────────────

function DeptModal({ mode, existing, users, onClose, onSaved }: {
  mode: 'create' | 'edit'; existing?: DepartmentItem;
  users: UserListItem[]; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(existing?.name || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [managerId, setManagerId] = useState(existing?.managerId || '');
  const [nameErr, setNameErr] = useState('');

  const managerOptions = [
    { value: '', label: 'بدون مسئول' },
    ...users.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName} (${u.roleDisplayName || u.roleName})` })),
  ];

  const mutation = useMutation({
    mutationFn: () => {
      if (!name.trim()) { setNameErr('نام الزامی است'); return Promise.reject(); }
      const data = { name: name.trim(), description: description.trim() || undefined, managerId: managerId || undefined };
      if (mode === 'edit' && existing) return departmentsApi.update(existing.id, data);
      return departmentsApi.create(data);
    },
    onSuccess: () => { toast(mode === 'create' ? 'بخش ایجاد شد' : 'بخش ویرایش شد'); onSaved(); },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <Modal open onClose={onClose} title={mode === 'create' ? 'افزودن بخش' : 'ویرایش بخش'}>
      <div className="space-y-4">
        <Input label="نام بخش *" value={name} onChange={e => { setName(e.target.value); setNameErr(''); }} error={nameErr} autoFocus />
        <Input label="توضیحات" value={description} onChange={e => setDescription(e.target.value)} />
        <Select label="مسئول بخش (department_manager)" options={managerOptions} value={managerId} onChange={e => setManagerId(e.target.value)} />
        <Button fullWidth onClick={() => mutation.mutate()} loading={mutation.isPending}>
          {mode === 'create' ? 'ایجاد' : 'ذخیره'}
        </Button>
      </div>
    </Modal>
  );
}

// ─── TeamModal ────────────────────────────────────────────────────────────────

function TeamModal({ mode, existing, departments, users, defaultDeptId, onClose, onSaved }: {
  mode: 'create' | 'edit'; existing?: TeamItem;
  departments: DepartmentItem[]; users: UserListItem[];
  defaultDeptId?: string; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(existing?.name || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [departmentId, setDepartmentId] = useState(existing?.departmentId || defaultDeptId || '');
  const [managerId, setManagerId] = useState(existing?.managerId || '');
  const [nameErr, setNameErr] = useState('');

  const deptOptions = [
    { value: '', label: 'بدون بخش' },
    ...departments.map(d => ({ value: d.id, label: d.name })),
  ];
  const managerOptions = [
    { value: '', label: 'بدون مسئول' },
    ...users.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName} (${u.roleDisplayName || u.roleName})` })),
  ];

  const mutation = useMutation({
    mutationFn: () => {
      if (!name.trim()) { setNameErr('نام الزامی است'); return Promise.reject(); }
      const data = { name: name.trim(), description: description.trim() || undefined, departmentId: departmentId || undefined, managerId: managerId || undefined };
      if (mode === 'edit' && existing) return teamsApi.update(existing.id, data);
      return teamsApi.create(data);
    },
    onSuccess: () => { toast(mode === 'create' ? 'تیم ایجاد شد' : 'تیم ویرایش شد'); onSaved(); },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <Modal open onClose={onClose} title={mode === 'create' ? 'افزودن تیم' : 'ویرایش تیم'}>
      <div className="space-y-4">
        <Input label="نام تیم *" value={name} onChange={e => { setName(e.target.value); setNameErr(''); }} error={nameErr} autoFocus />
        <Input label="توضیحات" value={description} onChange={e => setDescription(e.target.value)} />
        <Select label="بخش" options={deptOptions} value={departmentId} onChange={e => setDepartmentId(e.target.value)} />
        <Select label="مسئول تیم" options={managerOptions} value={managerId} onChange={e => setManagerId(e.target.value)} />
        <Button fullWidth onClick={() => mutation.mutate()} loading={mutation.isPending}>
          {mode === 'create' ? 'ایجاد' : 'ذخیره'}
        </Button>
      </div>
    </Modal>
  );
}
