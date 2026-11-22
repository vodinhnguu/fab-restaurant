import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ISSUE_SUGGESTIONS, REPAIR_STATUS } from '../../lib/constants';
import { fromNow } from '../../lib/format';
import { useCan } from '../../lib/permissions';
import { maintenanceApi } from '../../services';
import { StatusBadge } from '../ui/Badge';
import Button from '../ui/Button';
import { Field, Input, Select, Textarea } from '../ui/Form';
import Modal from '../ui/Modal';

// Danh sách 10 phiếu gần nhất người này đã báo: người báo theo dõi kỹ thuật đã xử lý tới đâu
function MyReports() {
  const { data = [] } = useQuery({ queryKey: ['maintenance', 'reported'], queryFn: maintenanceApi.myReported });
  if (!data.length) return null;
  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <p className="mb-2 text-sm font-medium text-slate-700">Bạn đã báo gần đây</p>
      <ul className="space-y-2 text-sm">
        {data.map((t) => (
          <li key={t.id} className="flex items-start justify-between gap-2">
            <span className="min-w-0">
              <span className="text-slate-800">{t.title}</span>
              <span className="block text-xs text-slate-500">
                {t.equipment.name} · {fromNow(t.createdAt)}{t.assignee && ` · ${t.assignee.name} nhận`}
                {t.status === 'WAITING_PARTS' && t.waitingNote && ` · ${t.waitingNote}`}
              </span>
            </span>
            <StatusBadge map={REPAIR_STATUS} value={t.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// Báo hỏng / tạo phiếu / sửa phiếu sửa chữa.
// - ticket: phiếu đang sửa (bỏ trống = tạo mới)
// - equipmentId: thiết bị điền sẵn (vd bấm "Báo hỏng" ở 1 thiết bị)
// - showMyReports: hiện danh sách phiếu mình đã báo (nút Báo hỏng trên thanh tiêu đề)
// Ô "Giao cho" chỉ hiện với người có quyền Sửa (kỹ thuật, quản lý).
export default function TicketFormModal({ ticket, equipmentId, title, showMyReports, onClose }) {
  const can = useCan();
  const qc = useQueryClient();
  const canAssign = can('FACILITY', 'edit');

  const { data: equipment = [] } = useQuery({ queryKey: ['maintenance', 'equipment', false], queryFn: () => maintenanceApi.equipment() });
  const { data: staff = [] } = useQuery({ queryKey: ['maintenance', 'staff'], queryFn: maintenanceApi.staff, enabled: canAssign, staleTime: 5 * 60 * 1000 });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      equipmentId: String(ticket?.equipmentId ?? equipmentId ?? ''),
      title: ticket?.title ?? '',
      description: ticket?.description ?? '',
      priority: ticket?.priority ?? 'NORMAL',
      assigneeId: ticket?.assigneeId ? String(ticket.assigneeId) : '',
    },
  });
  const priority = watch('priority');
  const chosen = equipment.find((e) => String(e.id) === watch('equipmentId'));

  // Gom thiết bị theo nhóm để hiện <optgroup>
  const groups = equipment.reduce((acc, e) => ({ ...acc, [e.category]: [...(acc[e.category] ?? []), e] }), {});

  const save = useMutation({
    mutationFn: (v) => {
      const body = {
        equipmentId: Number(v.equipmentId),
        title: v.title,
        description: v.description || null,
        priority: v.priority,
        ...(canAssign && { assigneeId: v.assigneeId ? Number(v.assigneeId) : null }),
      };
      return ticket ? maintenanceApi.updateTicket(ticket.id, body) : maintenanceApi.createTicket(body);
    },
    onSuccess: (res) => {
      toast.success(ticket ? 'Đã lưu phiếu' : res.message);
      qc.invalidateQueries({ queryKey: ['maintenance'] });
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={title ?? (ticket ? 'Sửa phiếu sửa chữa' : 'Báo hỏng thiết bị')}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit((v) => save.mutate(v))} loading={save.isPending}>{ticket ? 'Lưu' : 'Gửi báo hỏng'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Thiết bị" required error={errors.equipmentId?.message} hint="Không biết là máy nào thì chọn 'Khác / chưa rõ thiết bị' và ghi rõ ở mô tả">
          <Select {...register('equipmentId', { required: 'Chọn thiết bị' })} invalid={!!errors.equipmentId}>
            <option value="">Chọn thiết bị...</option>
            {Object.entries(groups).map(([cat, list]) => (
              <optgroup key={cat} label={cat}>
                {list.map((e) => <option key={e.id} value={e.id}>{e.name}{e.location ? ` (${e.location})` : ''}</option>)}
              </optgroup>
            ))}
          </Select>
        </Field>

        <Field label="Sự cố" required error={errors.title?.message}>
          <Input
            placeholder="Vd: Máy lạnh phòng VIP chảy nước"
            invalid={!!errors.title}
            {...register('title', { required: 'Mô tả ngắn sự cố', minLength: { value: 3, message: 'Tối thiểu 3 ký tự' }, maxLength: 120 })}
          />
        </Field>
        {/* Bấm để điền nhanh: ghép tên thiết bị đã chọn + tình trạng */}
        <div className="-mt-2 flex flex-wrap gap-1.5">
          {ISSUE_SUGGESTIONS.map((s) => (
            <button key={s} type="button"
              onClick={() => setValue('title', chosen && chosen.category !== 'Khác' ? `${chosen.name} ${s.toLowerCase()}` : s, { shouldValidate: true })}
              className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:border-ocean-300 hover:bg-ocean-50">
              {s}
            </button>
          ))}
        </div>

        <Field label="Mô tả thêm">
          <Textarea rows={2} maxLength={500} placeholder="Vd: Nước nhỏ giọt xuống bàn VIP2 từ 10h sáng" {...register('description')} />
        </Field>

        {/* Không bọc trong <Field> (thẻ label) để bấm không bị nhầm nút */}
        <div role="radiogroup" aria-labelledby="repair-priority-label">
          <span id="repair-priority-label" className="mb-1.5 block text-sm font-medium text-slate-700">Mức độ</span>
          <div className="grid grid-cols-2 gap-2">
            {[['NORMAL', 'Bình thường'], ['URGENT', 'Gấp: ảnh hưởng khách / an toàn']].map(([value, label]) => (
              <button key={value} type="button" role="radio" aria-checked={priority === value} onClick={() => setValue('priority', value)}
                className={clsx(
                  'min-h-10 rounded-xl border px-2 py-1.5 text-sm font-medium transition',
                  priority === value
                    ? value === 'URGENT' ? 'border-red-500 bg-red-50 text-red-700' : 'border-ocean-600 bg-ocean-50 text-ocean-800'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50',
                )}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {canAssign && (
          <Field label="Giao cho" hint="Để trống: kỹ thuật nào rảnh thì nhận">
            <Select {...register('assigneeId')}>
              <option value="">Chưa giao</option>
              {staff.map((u) => <option key={u.id} value={u.id}>{u.name}{u.staffRole ? ` · ${u.staffRole.name}` : ''}</option>)}
            </Select>
          </Field>
        )}
      </div>

      {showMyReports && <MyReports />}
    </Modal>
  );
}
