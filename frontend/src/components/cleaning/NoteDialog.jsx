import { Check } from 'lucide-react';
import { useState } from 'react';
import Button from '../ui/Button';
import { Field, Textarea } from '../ui/Form';
import Modal from '../ui/Modal';

// Hộp thoại xác nhận kèm ghi chú KHÔNG bắt buộc: hoàn thành 1 việc, báo "Đã dọn xong" cả khu.
// onConfirm(note): note = null nếu để trống
export default function NoteDialog({ title, description, confirmLabel = 'Xác nhận', placeholder, loading, onClose, onConfirm }) {
  const [note, setNote] = useState('');
  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Đóng</Button>
          <Button loading={loading} onClick={() => onConfirm(note.trim() || null)}>
            <Check className="h-4 w-4" /> {confirmLabel}
          </Button>
        </>
      }
    >
      {description && <p className="mb-4 text-sm text-slate-600">{description}</p>}
      <Field label="Ghi chú (không bắt buộc)">
        <Textarea maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder={placeholder ?? 'Vd: hết xà phòng, đã báo kho'} />
      </Field>
    </Modal>
  );
}
