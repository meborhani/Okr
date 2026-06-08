import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, ChevronLeft, Edit3 } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { sessionMinutesApi } from '@/lib/api/okr.api';
import { useAuthStore } from '@/lib/auth/auth.store';
import { formatDate } from '@/lib/utils/format';
import { quarterNames } from '@/lib/utils/format';
import type { SessionMinutesFull } from '@/types';

export function MinutesListPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isAdmin = user?.permissions?.includes('okr_periods:manage') ?? false;

  const [editing, setEditing] = useState<SessionMinutesFull | null>(null);

  const { data: minutes = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['session-minutes-all'],
    queryFn: sessionMinutesApi.getAll,
  });

  if (isLoading) return <><TopBar title="صورت‌جلسه‌ها" /><PageSpinner /></>;
  if (isError) return <><TopBar title="صورت‌جلسه‌ها" /><div className="p-4"><ErrorState onRetry={refetch} /></div></>;

  return (
    <div className="pb-24">
      <TopBar title="صورت‌جلسه‌ها" />

      <div className="p-4 space-y-3">
        {minutes.length === 0 ? (
          <EmptyState
            icon={<FileText size={28} className="text-gray-400" />}
            title="صورت‌جلسه‌ای ثبت نشده"
            description="پس از ایجاد جلسات چک‌این، صورت جلسه‌ها اینجا نمایش داده می‌شوند"
          />
        ) : (
          minutes.map((m) => (
            <Card key={m.id} hoverable={false}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => navigate(`/check-in-sessions/${m.sessionId}`)}
                    className="flex items-center gap-1.5 hover:text-primary-600 transition-colors group"
                  >
                    <FileText size={14} className="text-gray-400 group-hover:text-primary-500 flex-shrink-0" />
                    <span className="font-semibold text-gray-900 text-sm truncate">{m.sessionTitle}</span>
                    <ChevronLeft size={13} className="text-gray-300 flex-shrink-0" />
                  </button>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {m.periodTitle} — {quarterNames[m.periodQuarter]} {m.periodYear}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(m.sessionStartDate)} تا {formatDate(m.sessionEndDate)}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setEditing(m)}
                    className="p-1.5 rounded-xl hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors flex-shrink-0"
                  >
                    <Edit3 size={15} />
                  </button>
                )}
              </div>
              {m.content ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-4">{m.content}</p>
              ) : (
                <p className="text-xs text-gray-300 italic">متنی وارد نشده</p>
              )}
              {m.createdByName && (
                <p className="text-[10px] text-gray-300 mt-2">ثبت توسط: {m.createdByName} · {formatDate(m.updatedAt)}</p>
              )}
            </Card>
          ))
        )}
      </div>

      {editing && (
        <EditMinutesModal
          minutes={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ['session-minutes-all'] });
            qc.invalidateQueries({ queryKey: ['session-minutes', editing.sessionId] });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function EditMinutesModal({ minutes, onClose, onSaved }: {
  minutes: SessionMinutesFull;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user } = useAuthStore();
  const [content, setContent] = useState(minutes.content);

  const mut = useMutation({
    mutationFn: () => sessionMinutesApi.save(minutes.sessionId, content),
    onSuccess: () => { toast('صورت جلسه ذخیره شد'); onSaved(); },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <Modal open onClose={onClose} title={`ویرایش صورت جلسه — ${minutes.sessionTitle}`}>
      <div className="space-y-4">
        <p className="text-xs text-gray-400">{minutes.periodTitle} · {formatDate(minutes.sessionStartDate)}</p>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={10}
          className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
          dir="rtl"
          placeholder="متن صورت جلسه را وارد کنید..."
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>انصراف</Button>
          <Button loading={mut.isPending} onClick={() => mut.mutate()}>ذخیره</Button>
        </div>
      </div>
    </Modal>
  );
}
