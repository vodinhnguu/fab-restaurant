import { useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Check, Hourglass, MapPin, Pencil, Play, Wrench, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { REPAIR_STATUS } from '../../lib/constants';
import { fromNow } from '../../lib/format';
import { useCan } from '../../lib/permissions';
import { maintenanceApi } from '../../services';
import { useAuthStore } from '../../stores/auth';
import CancelReasonDialog from '../CancelReasonDialog';
import Badge, { StatusBadge } from '../ui/Badge';
import Button from '../ui/Button';
import TicketActionDialog from './TicketActionDialog';
import TicketFormModal from './TicketFormModal';

const CANCEL_REASONS = ['Báo nhầm', 'Máy đã tự hoạt động lại', 'Trùng với phiếu khác'];
const MESSAGE = { IN_PROGRESS: 'Đã nhận sửa', WAITING_PARTS: 'Đã chuyển sang chờ linh kiện', DONE: 'Đã sửa xong', CANCELLED: 'Đã hủy phiếu' };

// 1 phiếu sửa chữa chưa xong + các nút. Luật (khớp backend maintenance.controller.js):
// - Nhận sửa / Tiếp tục sửa: người bấm thành người sửa (phiếu của người khác thì hỏi "nhận thay?")
// - Chờ linh kiện, Hoàn thành: phiếu chưa ai nhận, phiếu của mình, hoặc người có quyền Xóa
// - Hủy: chỉ người có quyền Xóa (kỹ thuật), bắt buộc lý do
export default function TicketCard({ ticket: t, hideEquipment }) {
  const me = useAuthStore((s) => s.user);
  const can = useCan();
  const qc = useQueryClient();
  const [dialog, setDialog] = useState(null); // 'waiting' | 'done' | 'cancel' | 'edit'

  const update = useMutation({
    mutationFn: (body) => maintenanceApi.updateStatus(t.id, body),
    onSuccess: (_, body) => {
      toast.success(MESSAGE[body.status]);
      setDialog(null);
      qc.invalidateQueries({ queryKey: ['maintenance'] });
    },
    onError: (e) => {
      toast.error(e.message);
      qc.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });

  const isMine = t.assigneeId === me?.id;
  const otherName = t.assignee && !isMine ? t.assignee.name : null;
  const canWork = can('FACILITY', 'edit');
  const isManager = can('FACILITY', 'delete');
  const canFinish = canWork && (!t.assigneeId || isMine || isManager);
  const urgent = t.priority === 'URGENT';

  const take = () => {
    if (otherName && !window.confirm(`Phiếu này do ${otherName} đang nhận. Bạn nhận sửa thay?`)) return;
    update.mutate({ status: 'IN_PROGRESS' });
  };

  let who;
  if (t.status === 'IN_PROGRESS') who = `${isMine ? 'Bạn' : (t.assignee?.name ?? 'Ai đó')} đang sửa · từ ${fromNow(t.startedAt)}`;
  else if (t.status === 'WAITING_PARTS') who = `${isMine ? 'Bạn' : (t.assignee?.name ?? 'Ai đó')} nhận · đang chờ`;
  else if (t.assignee) who = isMine ? 'Giao cho bạn' : `Giao cho ${t.assignee.name}`;
  else who = 'Chưa ai nhận';
  const reporter = t.reportedBy ? (t.reportedBy.id === me?.id ? 'Bạn' : `${t.reportedBy.name}${t.reportedBy.staffRole ? ` (${t.reportedBy.staffRole.name})` : ''}`) : 'Không rõ';

  return (
    <div className={clsx('card flex flex-col p-4', urgent && 'border-l-4 border-l-red-500')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {urgent && <Badge color="red">Gấp</Badge>}
            <StatusBadge map={REPAIR_STATUS} value={t.status} />
          </div>
          <h3 className="mt-1.5 font-semibold break-words">{t.title}</h3>
          {!hideEquipment && (
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-ocean-700">
              <span className="flex items-center gap-1"><Wrench className="h-3.5 w-3.5 shrink-0" /> {t.equipment?.name}</span>
              {t.equipment?.location && <span className="flex items-center gap-1 text-slate-500"><MapPin className="h-3.5 w-3.5 shrink-0" /> {t.equipment.location}</span>}
            </p>
          )}
          {t.description && <p className="mt-1 text-sm break-words text-slate-600">{t.description}</p>}
          {t.status === 'WAITING_PARTS' && t.waitingNote && (
            <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs text-indigo-800">
              <Hourglass className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {t.waitingNote}
            </p>
          )}
        </div>
        <div className="flex shrink-0">
          {canWork && (
            <Button size="icon" variant="ghost" onClick={() => setDialog('edit')} aria-label="Sửa phiếu" title="Sửa / giao phiếu">
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {isManager && (
            <Button size="icon" variant="ghost" className="text-red-500" onClick={() => setDialog('cancel')} aria-label="Hủy phiếu" title="Hủy phiếu">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
        <div className="text-xs text-slate-500">
          <p className={clsx(isMine && 'font-medium text-ocean-700', !t.assignee && 'font-medium text-amber-700')}>{who}</p>
          <p>{reporter} báo · {fromNow(t.createdAt)}</p>
        </div>
        {canWork && (
          <div className="flex flex-wrap gap-2">
            {t.status === 'OPEN' && (
              <Button size="sm" variant={otherName ? 'outline' : 'primary'} onClick={take} loading={update.isPending && update.variables?.status === 'IN_PROGRESS'}>
                <Play className="h-4 w-4" /> {otherName ? 'Nhận thay' : 'Nhận sửa'}
              </Button>
            )}
            {t.status === 'WAITING_PARTS' && (
              <Button size="sm" variant="outline" onClick={take} loading={update.isPending && update.variables?.status === 'IN_PROGRESS'}>
                <Play className="h-4 w-4" /> Tiếp tục sửa
              </Button>
            )}
            {t.status === 'IN_PROGRESS' && canFinish && (
              <Button size="sm" variant="outline" onClick={() => setDialog('waiting')}><Hourglass className="h-4 w-4" /> Chờ linh kiện</Button>
            )}
            {canFinish && (
              <Button size="sm" variant={t.status === 'OPEN' ? 'outline' : 'primary'} onClick={() => setDialog('done')}>
                <Check className="h-4 w-4" /> {t.status === 'OPEN' ? 'Xong' : 'Hoàn thành'}
              </Button>
            )}
          </div>
        )}
      </div>

      {(dialog === 'waiting' || dialog === 'done') && (
        <TicketActionDialog
          mode={dialog}
          title={dialog === 'done' ? 'Hoàn thành sửa chữa' : 'Chờ linh kiện'}
          description={`${t.title} · ${t.equipment?.name}`}
          loading={update.isPending}
          onClose={() => setDialog(null)}
          onConfirm={({ note, cost }) => update.mutate({ status: dialog === 'done' ? 'DONE' : 'WAITING_PARTS', note, ...(dialog === 'done' && { cost }) })}
        />
      )}
      {dialog === 'cancel' && (
        <CancelReasonDialog
          title="Hủy phiếu sửa chữa"
          description={`Hủy "${t.title}"? Phiếu bị hủy vẫn xem được ở Lịch sử (lọc Đã hủy).`}
          reasons={CANCEL_REASONS}
          confirmLabel="Hủy phiếu"
          placeholder="Ghi lý do hủy..."
          loading={update.isPending}
          onClose={() => setDialog(null)}
          onConfirm={(note) => update.mutate({ status: 'CANCELLED', note })}
        />
      )}
      {dialog === 'edit' && <TicketFormModal ticket={t} onClose={() => setDialog(null)} />}
    </div>
  );
}
