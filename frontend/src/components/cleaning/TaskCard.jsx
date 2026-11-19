import { useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Check, MapPin, Pencil, Play, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { CLEANING_STATUS } from '../../lib/constants';
import { fromNow } from '../../lib/format';
import { useCan } from '../../lib/permissions';
import { cleaningApi } from '../../services';
import { useAuthStore } from '../../stores/auth';
import CancelReasonDialog from '../CancelReasonDialog';
import Badge, { StatusBadge } from '../ui/Badge';
import Button from '../ui/Button';
import NoteDialog from './NoteDialog';
import TaskFormModal from './TaskFormModal';

const CANCEL_REASONS = ['Giao nhầm việc', 'Đã có người làm rồi', 'Không cần làm nữa'];
const DONE_MESSAGE = { IN_PROGRESS: 'Đã nhận việc, bắt đầu làm', DONE: 'Đã hoàn thành', CANCELLED: 'Đã hủy việc' };

// 1 việc vệ sinh chưa xong + các nút: Bắt đầu, Hoàn thành, Sửa, Hủy.
// Luật (khớp backend cleaning.controller.js):
// - Bắt đầu = nhận việc: người bấm thành người làm (việc đang giao cho người khác thì hỏi lại "nhận làm thay?")
// - Hoàn thành: việc chưa ai nhận, việc của mình, hoặc quản lý (quyền Xóa) xác nhận thay
// - Hủy: chỉ quản lý (quyền Xóa), bắt buộc lý do
export default function TaskCard({ task, hideArea }) {
  const me = useAuthStore((s) => s.user);
  const can = useCan();
  const qc = useQueryClient();
  const [dialog, setDialog] = useState(null); // 'finish' | 'cancel' | 'edit'

  const update = useMutation({
    mutationFn: ({ status, note }) => cleaningApi.updateStatus(task.id, status, note),
    onSuccess: (_, v) => {
      toast.success(DONE_MESSAGE[v.status]);
      setDialog(null);
      qc.invalidateQueries({ queryKey: ['cleaning'] });
    },
    onError: (e) => {
      toast.error(e.message);
      qc.invalidateQueries({ queryKey: ['cleaning'] }); // người khác vừa cập nhật -> tải lại cho đúng
    },
  });

  const isMine = task.assigneeId === me?.id;
  const otherName = task.assignee && !isMine ? task.assignee.name : null;
  const canWork = can('CLEANING', 'edit');
  const isManager = can('CLEANING', 'delete');
  const canFinish = canWork && (!task.assigneeId || isMine || isManager);
  const urgent = task.priority === 'URGENT';

  const start = () => {
    if (otherName && !window.confirm(`Việc này đang giao cho ${otherName}. Bạn nhận làm thay?`)) return;
    update.mutate({ status: 'IN_PROGRESS' });
  };

  // "Ai làm": đang làm / được giao / chưa ai nhận
  let who;
  if (task.status === 'IN_PROGRESS') who = `${isMine ? 'Bạn' : (task.assignee?.name ?? 'Ai đó')} đang làm · bắt đầu ${fromNow(task.startedAt)}`;
  else if (task.assignee) who = isMine ? 'Giao cho bạn' : `Giao cho ${task.assignee.name}`;
  else who = 'Chưa ai nhận';
  const reporter = task.createdBy ? (task.createdBy.id === me?.id ? 'Bạn' : task.createdBy.name) : null;

  return (
    <div className={clsx('card flex flex-col p-4', urgent && 'border-l-4 border-l-red-500')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {urgent && <Badge color="red">Gấp</Badge>}
            <StatusBadge map={CLEANING_STATUS} value={task.status} />
          </div>
          <h3 className="mt-1.5 font-semibold break-words">{task.title}</h3>
          {!hideArea && (
            <p className="mt-0.5 flex items-center gap-1 text-sm text-ocean-700">
              <MapPin className="h-3.5 w-3.5 shrink-0" /> {task.area?.name}
            </p>
          )}
          {task.note && <p className="mt-1 text-sm break-words text-slate-600">{task.note}</p>}
        </div>
        <div className="flex shrink-0">
          {canWork && (
            <Button size="icon" variant="ghost" onClick={() => setDialog('edit')} aria-label="Sửa việc" title="Sửa / giao việc">
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {isManager && (
            <Button size="icon" variant="ghost" className="text-red-500" onClick={() => setDialog('cancel')} aria-label="Hủy việc" title="Hủy việc">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
        <div className="text-xs text-slate-500">
          <p className={clsx(isMine && 'font-medium text-ocean-700', !task.assignee && 'font-medium text-amber-700')}>{who}</p>
          <p>{reporter ? `${reporter} báo` : 'Tạo'} · {fromNow(task.createdAt)}</p>
        </div>
        {canWork && (
          <div className="flex gap-2">
            {task.status === 'TODO' && (
              <Button size="sm" variant={otherName ? 'outline' : 'primary'} onClick={start} loading={update.isPending && update.variables?.status === 'IN_PROGRESS'}>
                <Play className="h-4 w-4" /> {otherName ? 'Nhận làm thay' : 'Bắt đầu'}
              </Button>
            )}
            {canFinish && (
              <Button size="sm" variant={task.status === 'IN_PROGRESS' ? 'primary' : 'outline'} onClick={() => setDialog('finish')}>
                <Check className="h-4 w-4" /> {task.status === 'IN_PROGRESS' ? 'Hoàn thành' : 'Xong'}
              </Button>
            )}
          </div>
        )}
      </div>

      {dialog === 'finish' && (
        <NoteDialog
          title="Hoàn thành việc"
          description={`${task.title} · ${task.area?.name}`}
          confirmLabel="Đã xong"
          loading={update.isPending}
          onClose={() => setDialog(null)}
          onConfirm={(note) => update.mutate({ status: 'DONE', note })}
        />
      )}
      {dialog === 'cancel' && (
        <CancelReasonDialog
          title="Hủy việc"
          description={`Hủy "${task.title}"? Việc bị hủy vẫn xem được ở Lịch sử (lọc Đã hủy).`}
          reasons={CANCEL_REASONS}
          confirmLabel="Hủy việc"
          placeholder="Ghi lý do hủy..."
          loading={update.isPending}
          onClose={() => setDialog(null)}
          onConfirm={(note) => update.mutate({ status: 'CANCELLED', note })}
        />
      )}
      {dialog === 'edit' && <TaskFormModal task={task} onClose={() => setDialog(null)} />}
    </div>
  );
}
