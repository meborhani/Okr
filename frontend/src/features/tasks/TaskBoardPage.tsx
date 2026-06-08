import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  useDroppable, useDraggable,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core';
import {
  Plus, MessageCircle, Calendar, AlertTriangle, Zap, GripVertical,
  X, Send, Tag, Archive, Trash2,
} from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { toast } from '@/components/ui/Toast';
import { tasksApi, usersApi } from '@/lib/api/okr.api';
import { useAuthStore } from '@/lib/auth/auth.store';
import { formatDateShort, periodLabel, quarterNames } from '@/lib/utils/format';
import type { Task, TaskStatus } from '@/types';

// ─── Config ──────────────────────────────────────────────────────────────────

const COLUMNS: { id: TaskStatus; label: string; headerClass: string; dotClass: string }[] = [
  { id: 'assigned', label: 'اساین‌شده', headerClass: 'border-blue-300 bg-blue-50', dotClass: 'bg-blue-400' },
  { id: 'in_progress', label: 'در حال انجام', headerClass: 'border-amber-300 bg-amber-50', dotClass: 'bg-amber-400' },
  { id: 'done', label: 'انجام شد', headerClass: 'border-emerald-300 bg-emerald-50', dotClass: 'bg-emerald-400' },
];

const priorityConfig = {
  normal: { label: 'عادی', badge: 'bg-gray-100 text-gray-500', border: 'border-l-gray-300' },
  important: { label: 'مهم', badge: 'bg-blue-100 text-blue-700', border: 'border-l-blue-400' },
  urgent: { label: 'فوری', badge: 'bg-red-100 text-red-600', border: 'border-l-red-400' },
} as const;

// ─── TaskBoardPage ────────────────────────────────────────────────────────────

export function TaskBoardPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const isAdmin = user?.permissions?.includes('okr_periods:manage') ?? false;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [openTask, setOpenTask] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: tasks = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.getAll,
  });

  const moveMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      tasksApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const activeTask = tasks.find((t) => t.id === activeId);

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const taskId = String(active.id);
    const overId = String(over.id);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const col = COLUMNS.find((c) => c.id === overId);
    if (col && col.id !== task.status) {
      if (!isAdmin && task.assigneeId !== user?.id) {
        toast('فقط مسئول تسک یا مدیر می‌تواند وضعیت را تغییر دهد', 'error');
        return;
      }
      moveMut.mutate({ id: taskId, status: col.id });
    }
  }

  if (isLoading) return <><TopBar title="تسک‌ها" /><PageSpinner /></>;
  if (isError) return <><TopBar title="تسک‌ها" /><div className="p-4"><ErrorState onRetry={refetch} /></div></>;

  const colTasks = (col: TaskStatus) => tasks.filter((t) => t.status === col);

  return (
    <div className="pb-24">
      <TopBar
        title="تسک‌ها"
        right={isAdmin ? <Button size="sm" onClick={() => setCreateOpen(true)}><Plus size={15} /> تسک جدید</Button> : null}
      />

      <div className="p-4 overflow-x-auto">
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex gap-3 min-w-[680px]">
            {COLUMNS.map((col) => {
              const items = colTasks(col.id);
              return (
                <div key={col.id} className="flex-1 min-w-[220px] flex flex-col">
                  {/* Column header */}
                  <div className={`rounded-t-2xl border-t-4 ${col.headerClass} px-4 py-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.dotClass}`} />
                      <span className="font-bold text-gray-700 text-sm">{col.label}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-400 bg-white rounded-full px-2 py-0.5">{items.length}</span>
                  </div>

                  {/* Droppable area */}
                  <ColumnDropArea id={col.id}>
                    <div className="space-y-2 min-h-[120px]">
                      {items.map((task) => (
                        <DraggableCard
                          key={task.id}
                          task={task}
                          canDrag={isAdmin || task.assigneeId === user?.id}
                          onClick={() => setOpenTask(task)}
                        />
                      ))}
                    </div>
                  </ColumnDropArea>

                  {/* Add button */}
                  {isAdmin && (
                    <button
                      onClick={() => setCreateOpen(true)}
                      className="mt-2 w-full text-xs text-gray-400 hover:text-primary-600 flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-primary-50 transition-colors"
                    >
                      <Plus size={12} /> افزودن تسک
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeTask && <TaskCard task={activeTask} dragging />}
          </DragOverlay>
        </DndContext>
      </div>

      {openTask && (
        <TaskDetailModal
          task={openTask}
          isAdmin={isAdmin}
          currentUserId={user?.id}
          onClose={() => setOpenTask(null)}
          onUpdated={() => { qc.invalidateQueries({ queryKey: ['tasks'] }); setOpenTask(null); }}
        />
      )}
      {createOpen && (
        <CreateTaskModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => { qc.invalidateQueries({ queryKey: ['tasks'] }); setCreateOpen(false); }}
        />
      )}
    </div>
  );
}

// ─── Droppable column ─────────────────────────────────────────────────────────

function ColumnDropArea({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 bg-gray-50/60 rounded-b-2xl p-2 transition-colors ${isOver ? 'bg-primary-50/60' : ''}`}
    >
      {children}
    </div>
  );
}

// ─── Draggable card wrapper ───────────────────────────────────────────────────

function DraggableCard({ task, canDrag, onClick }: { task: Task; canDrag: boolean; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    disabled: !canDrag,
  });
  return (
    <div ref={setNodeRef} style={{ opacity: isDragging ? 0.3 : 1 }}>
      <TaskCard
        task={task}
        dragProps={canDrag ? { ...attributes, ...listeners } : undefined}
        onClick={onClick}
      />
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  task, dragProps, onClick, dragging,
}: {
  task: Task;
  dragProps?: Record<string, unknown>;
  onClick?: () => void;
  dragging?: boolean;
}) {
  const p = priorityConfig[task.priority] || priorityConfig.normal;

  const sourceLabel = task.sourceType === 'meeting_minutes' && task.sourceSessionTitle
    ? `${task.sourceSessionTitle}${task.sourcePeriodYear ? ' — ' + periodLabel(task.sourcePeriodYear, task.sourcePeriodQuarter!) : ''}`
    : null;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${p.border} cursor-pointer hover:shadow-md transition-all group select-none ${dragging ? 'rotate-1 shadow-lg' : ''}`}
    >
      <div className="p-3">
        {/* Title row */}
        <div className="flex items-start gap-1.5">
          {dragProps && (
            <button
              className="text-gray-200 hover:text-gray-400 mt-0.5 flex-shrink-0 touch-none cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
              {...(dragProps as React.HTMLAttributes<HTMLButtonElement>)}
            >
              <GripVertical size={13} />
            </button>
          )}
          <p className="flex-1 text-sm font-semibold text-gray-900 leading-snug">{task.title}</p>
        </div>

        {/* Priority + tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {task.priority !== 'normal' && (
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-medium ${p.badge}`}>
              {task.priority === 'urgent' ? <AlertTriangle size={10} /> : <Zap size={10} />}
              {p.label}
            </span>
          )}
          {task.tags.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="px-1.5 py-0.5 rounded-md text-xs font-medium"
              style={{ background: tag.color + '20', color: tag.color }}
            >
              {tag.label}
            </span>
          ))}
        </div>

        {/* Assignee row */}
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
              {task.assigneeName?.[0]}
            </div>
            <span className="text-xs text-gray-500 truncate max-w-[80px]">{task.assigneeName}</span>
            {task.assigneeDepartment && (
              <span className="text-xs text-gray-400 truncate max-w-[60px]">· {task.assigneeDepartment}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {task.commentCount > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-gray-400">
                <MessageCircle size={10} />{task.commentCount}
              </span>
            )}
            {task.dueDate && (
              <span className="flex items-center gap-0.5 text-xs text-gray-400">
                <Calendar size={10} />{formatDateShort(task.dueDate)}
              </span>
            )}
          </div>
        </div>

        {/* Source label */}
        {sourceLabel && (
          <p className="text-[10px] text-gray-400 mt-1.5 leading-tight border-t border-gray-50 pt-1.5">
            📎 {sourceLabel}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Task Detail Modal ────────────────────────────────────────────────────────

function TaskDetailModal({
  task, isAdmin, currentUserId, onClose, onUpdated,
}: {
  task: Task; isAdmin: boolean; currentUserId?: string;
  onClose: () => void; onUpdated: () => void;
}) {
  const qc = useQueryClient();
  const [comment, setComment] = useState('');
  const [addTagOpen, setAddTagOpen] = useState(false);
  const [tagLabel, setTagLabel] = useState('');
  const [tagColor, setTagColor] = useState('#6366f1');

  const { data: comments = [] } = useQuery({
    queryKey: ['task-comments', task.id],
    queryFn: () => tasksApi.getComments(task.id),
  });
  const { data: latest } = useQuery({
    queryKey: ['task', task.id],
    queryFn: () => tasksApi.getById(task.id),
  });
  const current = latest || task;

  const addCommentMut = useMutation({
    mutationFn: () => tasksApi.addComment(task.id, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-comments', task.id] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setComment('');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const delCommentMut = useMutation({
    mutationFn: (cid: string) => tasksApi.deleteComment(task.id, cid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task-comments', task.id] }),
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const addTagMut = useMutation({
    mutationFn: () => tasksApi.addTag(task.id, tagLabel, tagColor),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task', task.id] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setTagLabel(''); setAddTagOpen(false);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const removeTagMut = useMutation({
    mutationFn: (tagId: string) => tasksApi.removeTag(task.id, tagId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task', task.id] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const archiveMut = useMutation({
    mutationFn: () => tasksApi.archive(task.id),
    onSuccess: () => { toast('تسک آرشیو شد'); onUpdated(); },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: () => tasksApi.remove(task.id),
    onSuccess: () => { toast('تسک حذف شد'); onUpdated(); },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const p = priorityConfig[current.priority] || priorityConfig.normal;
  const sourceLabel = current.sourceType === 'meeting_minutes' && current.sourceSessionTitle
    ? `${current.sourceSessionTitle}${current.sourcePeriodYear ? ' — ' + periodLabel(current.sourcePeriodYear, current.sourcePeriodQuarter!) : ''}`
    : null;

  function renderCommentText(text: string) {
    const parts = text.split(/(@\S+)/g);
    return parts.map((part, i) =>
      part.startsWith('@')
        ? <span key={i} className="text-primary-600 font-semibold">{part}</span>
        : part
    );
  }

  return (
    <Modal open onClose={onClose} title={current.title}>
      <div className="space-y-4">

        {/* Meta badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${p.badge}`}>
            {current.priority === 'urgent' && <AlertTriangle size={11} />}
            {current.priority === 'important' && <Zap size={11} />}
            {p.label}
          </span>
          <Badge className="bg-gray-100 text-gray-700 text-xs">{current.assigneeName}</Badge>
          {current.assigneeDepartment && <Badge className="bg-gray-50 text-gray-500 text-xs">{current.assigneeDepartment}</Badge>}
          {current.dueDate && (
            <Badge className="bg-amber-50 text-amber-700 text-xs flex items-center gap-1">
              <Calendar size={10} />{formatDateShort(current.dueDate)}
            </Badge>
          )}
        </div>

        {/* Source */}
        {sourceLabel && (
          <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
            📎 از صورت‌جلسه: <span className="font-medium text-gray-600">{sourceLabel}</span>
          </p>
        )}

        {/* Description */}
        {current.description && (
          <p className="text-sm text-gray-700 bg-surface-50 rounded-xl px-3 py-2.5 leading-relaxed">{current.description}</p>
        )}

        {/* Tags */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-xs font-semibold text-gray-500">برچسب‌ها</p>
            {isAdmin && (
              <button onClick={() => setAddTagOpen(v => !v)} className="text-xs text-primary-600 flex items-center gap-0.5">
                <Tag size={10} /> افزودن
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(current.tags || []).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: tag.color + '22', color: tag.color }}
              >
                {tag.label}
                {isAdmin && (
                  <button onClick={() => removeTagMut.mutate(tag.id)} className="hover:opacity-60">
                    <X size={9} />
                  </button>
                )}
              </span>
            ))}
          </div>
          {addTagOpen && (
            <div className="flex gap-2 mt-2">
              <Input value={tagLabel} onChange={(e) => setTagLabel(e.target.value)} placeholder="نام برچسب" className="flex-1" />
              <input type="color" value={tagColor} onChange={(e) => setTagColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-surface-200 cursor-pointer p-1" />
              <Button size="sm" onClick={() => tagLabel && addTagMut.mutate()} loading={addTagMut.isPending}>+</Button>
            </div>
          )}
        </div>

        {/* Comments */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">کامنت‌ها <span className="text-gray-400">({comments.length})</span></p>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2 bg-gray-50 rounded-xl p-2.5 group/c">
                <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                  {c.authorName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700">{c.authorName}</span>
                    {(isAdmin || c.authorId === currentUserId) && (
                      <button onClick={() => delCommentMut.mutate(c.id)}
                        className="opacity-0 group-hover/c:opacity-100 mr-auto text-gray-300 hover:text-red-500 transition-all">
                        <X size={11} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5 leading-snug">{renderCommentText(c.content)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2.5">
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="کامنت بنویسید... (@نام برای mention)"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && comment.trim()) { e.preventDefault(); addCommentMut.mutate(); } }}
              className="flex-1"
            />
            <Button size="sm" onClick={() => comment.trim() && addCommentMut.mutate()}
              loading={addCommentMut.isPending} disabled={!comment.trim()}>
              <Send size={13} />
            </Button>
          </div>
        </div>

        {/* Admin actions */}
        {isAdmin && current.status !== 'archived' && (
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <Button size="sm" variant="ghost" onClick={() => archiveMut.mutate()} loading={archiveMut.isPending}>
              <Archive size={13} /> آرشیو
            </Button>
            <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50"
              onClick={() => deleteMut.mutate()} loading={deleteMut.isPending}>
              <Trash2 size={13} /> حذف
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Create Task Modal ────────────────────────────────────────────────────────

function CreateTaskModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
  const [assigneeId, setAssigneeId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const { data: usersResp } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll(1, 200) });
  const { data: sessions = [] } = useQuery({
    queryKey: ['check-in-sessions'],
    queryFn: () => import('@/lib/api/okr.api').then(m => m.checkInSessionsApi.getAll()),
  });

  const userOptions = [
    { value: '', label: 'انتخاب مسئول...' },
    ...(usersResp?.data || []).map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` })),
  ];
  const sessionOptions = [
    { value: '', label: 'بدون جلسه' },
    ...sessions.map((s) => ({ value: s.id, label: s.title })),
  ];

  const mut = useMutation({
    mutationFn: () => tasksApi.create({
      title, description, priority, assigneeId,
      sessionId: sessionId || undefined,
      sourceType: sessionId ? 'meeting_minutes' : undefined,
      dueDate: dueDate || undefined,
    }),
    onSuccess: () => { toast('تسک ایجاد شد'); onCreated(); },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <Modal open onClose={onClose} title="تسک جدید">
      <div className="space-y-4">
        <Input label="عنوان *" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        <Input label="توضیحات" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Select label="اولویت" value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}
          options={[{ value: 'normal', label: 'عادی' }, { value: 'important', label: 'مهم' }, { value: 'urgent', label: 'فوری' }]} />
        <Select label="مسئول *" options={userOptions} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} />
        <Select label="جلسه چک‌این (اختیاری)" options={sessionOptions} value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
        <Input label="مهلت" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <Button fullWidth loading={mut.isPending} disabled={!title.trim() || !assigneeId} onClick={() => mut.mutate()}>
          ایجاد تسک
        </Button>
      </div>
    </Modal>
  );
}
