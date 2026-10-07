import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, CalendarSearch, MapPin, Phone, Users } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { EmptyState, Spinner } from '../components/ui/Feedback';
import { RESERVATION_STATUS } from '../lib/constants';
import { formatDateTime } from '../lib/format';
import { useDocumentTitle, useInfo } from '../lib/hooks';
import { reservationApi } from '../services';

// Chi tiết 1 lịch đặt bàn: /reservations/RSV...?phone=09...
// Xem được nếu: là chủ lịch (đã đăng nhập), là admin, hoặc biết đúng SĐT (backend kiểm tra)
export default function ReservationDetail() {
  const { code } = useParams();
  const [params] = useSearchParams();
  const phone = params.get('phone') || undefined;
  const qc = useQueryClient();
  const { data: info } = useInfo();
  useDocumentTitle(`Đặt bàn ${code}`);

  const { data: r, isLoading, isError } = useQuery({
    queryKey: ['reservation', code],
    queryFn: () => reservationApi.track(code, phone),
    retry: false,
  });

  const cancel = useMutation({
    mutationFn: () => reservationApi.cancel(code, phone),
    onSuccess: () => {
      toast.success('Đã hủy đặt bàn');
      qc.invalidateQueries({ queryKey: ['reservation', code] });
      qc.invalidateQueries({ queryKey: ['my-reservations'] });
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Spinner className="py-32" />;
  if (isError) {
    return (
      <EmptyState
        icon={CalendarSearch}
        title="Không tìm thấy lịch đặt bàn"
        description="Kiểm tra lại mã đặt bàn và số điện thoại."
        action={<Button as={Link} to="/track?tab=reservation">Tra cứu lại</Button>}
      />
    );
  }

  const canCancel = ['PENDING', 'CONFIRMED'].includes(r.status) && new Date(r.date) > new Date();

  return (
    <div className="container-page flex justify-center py-12">
      <div className="card w-full max-w-lg p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Mã đặt bàn</p>
            <p className="font-mono text-xl font-bold text-ocean-900">{r.code}</p>
          </div>
          <StatusBadge map={RESERVATION_STATUS} value={r.status} />
        </div>

        <ul className="mt-6 space-y-3 rounded-xl bg-ocean-50 p-5 text-sm">
          <li className="flex items-center gap-3"><CalendarDays className="h-4 w-4 text-ocean-500" /> {formatDateTime(r.date)}</li>
          <li className="flex items-center gap-3"><Users className="h-4 w-4 text-ocean-500" /> {r.guests} khách</li>
          {r.area && <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-ocean-500" /> {r.area}</li>}
          <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-ocean-500" /> {r.name} · {r.phone}</li>
        </ul>
        {r.note && <p className="mt-4 text-sm text-slate-600"><span className="text-slate-500">Ghi chú:</span> {r.note}</p>}

        {r.status === 'PENDING' && (
          <p className="mt-4 text-sm text-amber-700">Nhà hàng sẽ gọi điện xác nhận trong ít phút.</p>
        )}
        {info && <p className="mt-4 text-xs text-slate-400">Cần thay đổi giờ hoặc số khách? Gọi hotline {info.phone}.</p>}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button as={Link} to="/menu" variant="outline">Xem thực đơn</Button>
          {canCancel && (
            <Button variant="danger" loading={cancel.isPending} onClick={() => window.confirm('Hủy lịch đặt bàn này?') && cancel.mutate()}>
              Hủy đặt bàn
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
