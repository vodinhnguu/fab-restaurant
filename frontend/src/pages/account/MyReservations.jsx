import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState, Spinner } from '../../components/ui/Feedback';
import { RESERVATION_STATUS } from '../../lib/constants';
import { formatDateTime } from '../../lib/format';
import { reservationApi } from '../../services';

export default function MyReservations() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['my-reservations'], queryFn: reservationApi.my });

  const cancel = useMutation({
    mutationFn: (code) => reservationApi.cancel(code),
    onSuccess: () => {
      toast.success('Đã hủy đặt bàn');
      qc.invalidateQueries({ queryKey: ['my-reservations'] });
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Spinner />;
  if (!data.length) {
    return <EmptyState icon={CalendarDays} title="Bạn chưa đặt bàn lần nào" action={<Button as={Link} to="/reservation">Đặt bàn</Button>} />;
  }

  return (
    <div className="space-y-4">
      {data.map((r) => (
        <div key={r.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-semibold">{r.code}</span>
              <StatusBadge map={RESERVATION_STATUS} value={r.status} />
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> {formatDateTime(r.date)}</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {r.guests} khách</span>
              {r.area && <span>{r.area}</span>}
            </p>
            {r.note && <p className="mt-1 text-sm text-slate-500">Ghi chú: {r.note}</p>}
          </div>
          {['PENDING', 'CONFIRMED'].includes(r.status) && new Date(r.date) > new Date() && (
            <Button variant="outline" size="sm" loading={cancel.isPending && cancel.variables === r.code} onClick={() => window.confirm('Hủy lịch đặt bàn này?') && cancel.mutate(r.code)}>
              Hủy đặt bàn
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
