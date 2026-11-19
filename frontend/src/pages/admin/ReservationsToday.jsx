import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { ArrowLeftRight, CalendarX2, Phone, StickyNote, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { EmptyState, ErrorState, Spinner } from '../../components/ui/Feedback';
import { RESERVATION_STATUS } from '../../lib/constants';
import { useCan } from '../../lib/permissions';
import { MOVABLE_STATUSES, RESERVATION_ACTIONS } from '../../lib/reservation';
import { reservationApi } from '../../services';

const SOON_MINUTES = 60; // Khách sắp đến trong 60 phút -> tô vàng

// "còn 25 phút" / "trễ 10 phút" / "19:00"
function timing(date, now) {
  const diff = Math.round((new Date(date) - now) / 60000);
  if (diff < 0) return { label: `Trễ ${-diff} phút`, tone: 'late' };
  if (diff <= SOON_MINUTES) return { label: `Còn ${diff} phút`, tone: 'soon' };
  return null;
}

function ReservationCard({ r, now, onAction, onMove }) {
  const can = useCan();
  const waiting = ['PENDING', 'CONFIRMED'].includes(r.status);
  const t = waiting ? timing(r.date, now) : null;
  const lastMove = r.tableChanges?.[0];

  return (
    <div className={clsx('card flex flex-col gap-3 p-4 sm:flex-row sm:items-center', t?.tone === 'late' && 'border-red-200 bg-red-50/40', t?.tone === 'soon' && 'border-amber-200 bg-amber-50/40')}>
      <div className="flex items-center gap-3 sm:w-28 sm:flex-col sm:items-start sm:gap-1">
        <p className="text-2xl font-bold text-ocean-950">{dayjs(r.date).format('HH:mm')}</p>
        {t && <Badge color={t.tone === 'late' ? 'red' : 'amber'}>{t.label}</Badge>}
      </div>

      <div className="min-w-0 flex-1 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base font-semibold">{r.name}</p>
          <StatusBadge map={RESERVATION_STATUS} value={r.status} />
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600">
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {r.guests} khách</span>
          <a href={`tel:${r.phone}`} className="flex items-center gap-1 text-ocean-600"><Phone className="h-3.5 w-3.5" /> {r.phone}</a>
          <span className="font-mono text-xs text-slate-400">{r.code}</span>
        </p>
        <p className="mt-1">
          {r.table
            ? <span className="font-semibold text-ocean-800">Bàn {r.table.code} · {r.table.area}</span>
            : <Badge color="amber">Chưa xếp bàn{r.area ? ` · muốn ${r.area}` : ''}</Badge>}
          {lastMove?.fromTableCode && <span className="ml-2 text-xs text-slate-500">(chuyển từ {lastMove.fromTableCode})</span>}
        </p>
        {r.note && <p className="mt-1 flex items-start gap-1 text-xs text-slate-500"><StickyNote className="mt-0.5 h-3 w-3 shrink-0" /> {r.note}</p>}
        {r.cancelReason && <p className="mt-1 text-xs text-red-600">Lý do hủy: {r.cancelReason}</p>}
      </div>

      {can('RESERVATIONS', 'edit') && (
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {MOVABLE_STATUSES.includes(r.status) && (
            <Button size="sm" variant={r.table ? 'outline' : 'dark'} onClick={() => onMove(r)}>
              <ArrowLeftRight className="h-4 w-4" /> {r.table ? 'Chuyển bàn' : 'Xếp bàn'}
            </Button>
          )}
          {RESERVATION_ACTIONS[r.status]?.map(([s, label, variant]) => (
            <Button key={s} size="sm" variant={variant} onClick={() => onAction(r, s)}>{label}</Button>
          ))}
        </div>
      )}
    </div>
  );
}

function Group({ title, items, ...props }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-slate-600">{title} ({items.length})</h2>
      <div className="space-y-3">{items.map((r) => <ReservationCard key={r.id} r={r} {...props} />)}</div>
    </section>
  );
}

// Tab "Hôm nay" của trang Đặt bàn: lễ tân đứng quầy xem các lịch hôm nay theo giờ,
// nút nhanh Xác nhận / Khách đã đến / Chuyển bàn / Hủy. Tự tải lại mỗi 30 giây.
export default function ReservationsToday({ onAction, onMove }) {
  const today = dayjs().format('YYYY-MM-DD');
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-reservations', 'today', today],
    queryFn: () => reservationApi.list({ date: today, limit: 100 }),
    refetchInterval: 30000,
  });

  // Giờ hiện tại cập nhật mỗi phút để "còn x phút" / "trễ x phút" luôn đúng
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const all = data.data;
  const waiting = all.filter((r) => ['PENDING', 'CONFIRMED'].includes(r.status));
  const arrived = all.filter((r) => r.status === 'COMPLETED');
  const cancelled = all.filter((r) => r.status === 'CANCELLED');
  const soon = waiting.filter((r) => timing(r.date, now)?.tone === 'soon').length;
  const late = waiting.filter((r) => timing(r.date, now)?.tone === 'late').length;
  const noTable = waiting.filter((r) => !r.table).length;
  const props = { now, onAction, onMove };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold">{dayjs().format('DD/MM/YYYY')}: {all.length} lịch</span>
        <Badge color="blue">{waiting.length} chưa đến</Badge>
        {soon > 0 && <Badge color="amber">{soon} sắp đến trong {SOON_MINUTES} phút</Badge>}
        {late > 0 && <Badge color="red">{late} trễ giờ</Badge>}
        {noTable > 0 && <Badge color="amber">{noTable} chưa xếp bàn</Badge>}
        <Badge color="green">{arrived.length} đã đến</Badge>
        {cancelled.length > 0 && <Badge>{cancelled.length} đã hủy</Badge>}
      </div>

      {all.length === 0 ? (
        <EmptyState icon={CalendarX2} title="Hôm nay chưa có lịch đặt bàn" description="Lịch mới sẽ tự hiện ở đây (trang tự tải lại mỗi 30 giây)." />
      ) : (
        <div className="space-y-6">
          <Group title="Chưa đến" items={waiting} {...props} />
          <Group title="Đã đến" items={arrived} {...props} />
          {cancelled.length > 0 && (
            <details>
              <summary className="cursor-pointer text-sm font-semibold text-slate-600">Đã hủy ({cancelled.length})</summary>
              <div className="mt-2 space-y-3">{cancelled.map((r) => <ReservationCard key={r.id} r={r} {...props} />)}</div>
            </details>
          )}
        </div>
      )}
    </>
  );
}
