import clsx from 'clsx';
import { useState } from 'react';
import Button from './ui/Button';
import { Field, Textarea } from './ui/Form';
import Modal from './ui/Modal';

const OTHER = 'Lý do khác';

// Hộp thoại hủy dùng chung (hủy đặt bàn, hủy đơn hàng): bắt buộc chọn / nhập lý do để khách biết vì sao.
// - reasons: các lý do có sẵn để bấm nhanh; "Lý do khác" thì tự gõ (tối đa 300 ký tự, khớp backend)
// - onConfirm(reason): gọi khi bấm nút xác nhận, reason đã bỏ khoảng trắng thừa
export default function CancelReasonDialog({ title, description, reasons, confirmLabel = 'Xác nhận hủy', placeholder = 'Ghi lý do cho khách...', loading, onClose, onConfirm }) {
  const [choice, setChoice] = useState('');
  const [text, setText] = useState('');
  const reason = (choice === OTHER ? text : choice).trim();

  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Đóng</Button>
          <Button variant="danger" disabled={!reason} loading={loading} onClick={() => onConfirm(reason)}>{confirmLabel}</Button>
        </>
      }
    >
      {description && <p className="mb-4 text-sm text-slate-600">{description}</p>}
      <div className="flex flex-wrap gap-2">
        {[...reasons, OTHER].map((r) => (
          <button key={r} type="button" onClick={() => setChoice(r)}
            className={clsx('rounded-full border px-3 py-1.5 text-sm', choice === r ? 'border-ocean-900 bg-ocean-900 text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-100')}>
            {r}
          </button>
        ))}
      </div>
      {choice === OTHER && (
        <Field label="Lý do" className="mt-4" required>
          <Textarea autoFocus maxLength={300} value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} />
        </Field>
      )}
    </Modal>
  );
}
