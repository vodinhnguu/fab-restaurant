import clsx from 'clsx';
import { Check } from 'lucide-react';
import { useState } from 'react';
import Button from '../ui/Button';
import { Field, Input, Textarea } from '../ui/Form';
import Modal from '../ui/Modal';

// Cấu hình theo từng việc: chờ linh kiện / hoàn thành / ghi bảo trì định kỳ
const MODES = {
  waiting: {
    label: 'Đang chờ gì?',
    required: true,
    cost: false,
    chips: ['Chờ linh kiện', 'Chờ thợ hãng đến sửa', 'Chờ hết giờ phục vụ mới sửa được'],
    placeholder: 'Vd: Đã đặt màng bơm mới, 2 ngày nữa giao',
    confirm: 'Chuyển sang chờ',
  },
  done: {
    label: 'Đã xử lý thế nào?',
    required: true,
    cost: true,
    chips: ['Vệ sinh, chỉnh lại', 'Thay linh kiện mới', 'Thợ hãng đến sửa', 'Kiểm tra không thấy lỗi'],
    placeholder: 'Vd: Thay tụ quạt dàn nóng',
    confirm: 'Đã sửa xong',
  },
  maintain: {
    label: 'Ghi chú (không bắt buộc)',
    required: false,
    cost: true,
    chips: ['Vệ sinh lưới lọc', 'Kiểm tra, siết lại ốc', 'Thay dầu / nhớt', 'Nạp gas'],
    placeholder: 'Vd: Vệ sinh dàn lạnh, kiểm tra gas',
    confirm: 'Đã bảo trì',
  },
};

// onConfirm({ note, cost, closeTickets }): note đã bỏ khoảng trắng (null nếu trống), cost là số hoặc null.
// openTickets (chỉ dùng khi mode = 'maintain'): phiếu sửa chữa chưa xong của máy. Bảo trì KHÔNG tự đóng phiếu,
// nên hỏi người dùng có muốn đóng luôn không (khi đó bắt buộc ghi cách xử lý).
export default function TicketActionDialog({ mode, title, description, openTickets = [], loading, onClose, onConfirm }) {
  const m = MODES[mode];
  const [note, setNote] = useState('');
  const [cost, setCost] = useState('');
  const [closeTickets, setCloseTickets] = useState(false);
  const required = m.required || closeTickets;
  const ok = !required || note.trim();

  return (
    <Modal open onClose={onClose} title={title} size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Đóng</Button>
          <Button disabled={!ok} loading={loading} onClick={() => onConfirm({ note: note.trim() || null, cost: cost === '' ? null : Number(cost), ...(closeTickets && { closeTickets: true }) })}>
            <Check className="h-4 w-4" /> {closeTickets ? 'Đã bảo trì và sửa xong' : m.confirm}
          </Button>
        </>
      }
    >
      {description && <p className="mb-4 text-sm text-slate-600">{description}</p>}

      {mode === 'maintain' && openTickets.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm">
          <p className="font-medium text-red-800">Máy đang có {openTickets.length} phiếu sửa chữa chưa xong:</p>
          <ul className="mt-1 list-disc pl-5 text-red-700">
            {openTickets.map((t) => <li key={t.id}>{t.title}{t.assignee ? ` (${t.assignee.name} đang nhận)` : ''}</li>)}
          </ul>
          <p className="mt-2 text-xs text-slate-600">Bảo trì định kỳ không tự đóng phiếu sửa chữa, máy vẫn hiện "Có sự cố" cho tới khi phiếu được hoàn thành.</p>
          <label className="mt-2 flex cursor-pointer items-start gap-2 font-medium text-slate-800">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-ocean-600" checked={closeTickets} onChange={(e) => setCloseTickets(e.target.checked)} />
            Máy đã sửa xong, đóng luôn các phiếu này
          </label>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Field label={closeTickets ? 'Đã xử lý thế nào? (ghi vào các phiếu được đóng)' : m.label} required={required}>
            <Textarea rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder={m.placeholder} />
          </Field>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {m.chips.map((c) => (
              <button key={c} type="button" onClick={() => setNote(c)}
                className={clsx('rounded-full border px-2.5 py-1 text-xs', note === c ? 'border-ocean-900 bg-ocean-900 text-white' : 'border-slate-300 text-slate-600 hover:bg-slate-100')}>
                {c}
              </button>
            ))}
          </div>
        </div>
        {m.cost && (
          <Field label="Chi phí (đồng)" hint="Tiền linh kiện, thuê thợ. Không tốn tiền thì để trống">
            <Input type="number" min={0} step={1000} value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Vd: 350000" />
          </Field>
        )}
      </div>
    </Modal>
  );
}
