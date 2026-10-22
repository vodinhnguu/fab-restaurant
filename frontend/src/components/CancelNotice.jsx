import { CalendarX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/cn';
import Button from './ui/Button';

// Lịch bị nhà hàng hủy (có lý do): báo cho khách + nút đặt lại, điền sẵn thông tin cũ.
// Khách tự hủy thì không có lý do nên không hiện.
export default function CancelNotice({ reservation: r, className }) {
  if (r.status !== 'CANCELLED' || !r.cancelReason) return null;
  const rebook = { name: r.name, phone: r.phone, email: r.email || '', guests: r.guests, area: r.area || '' };

  return (
    <div className={cn('rounded-xl border border-red-200 bg-red-50 p-4 text-sm', className)}>
      <p className="flex items-center gap-2 font-semibold text-red-700">
        <CalendarX className="h-4 w-4" /> Nhà hàng đã hủy lịch này
      </p>
      <p className="mt-1 text-red-700">Lý do: {r.cancelReason}</p>
      <p className="mt-1 text-slate-600">Rất xin lỗi bạn. Bạn có thể chọn ngày hoặc khung giờ khác để đặt lại.</p>
      <Button as={Link} to="/reservation" state={{ rebook }} size="sm" className="mt-3">
        Đặt lại ngày/giờ khác
      </Button>
    </div>
  );
}
