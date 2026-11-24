import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { ChefHat, Clock, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { DINE_IN_REFRESH_MS } from '../../../components/dine-in/useDineInAlerts';
import PageHeader from '../../../components/PageHeader';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { EmptyState, ErrorState, Spinner } from '../../../components/ui/Feedback';
import { DINE_IN_ITEM_STATUS } from '../../../lib/constants';
import { formatKg, fromNow } from '../../../lib/format';
import { useDocumentTitle } from '../../../lib/hooks';
import { useCan } from '../../../lib/permissions';
import { dineInApi } from '../../../services';

// Phiếu bếp: món phục vụ gửi từ app (docs/23-app-nhan-vien-phuc-vu.md).
// Bếp bấm "Nhận làm" -> món "Đang làm": từ lúc này phục vụ muốn hủy món phải ghi lý do.
// Món mang ra bàn thì phục vụ tick "Check món" trên app, phiếu tự biến mất.
export default function Kitchen() {
  useDocumentTitle('Phiếu bếp');
  const can = useCan();
  const qc = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dine-in', 'kitchen'],
    queryFn: dineInApi.kitchen,
    refetchInterval: DINE_IN_REFRESH_MS,
  });

  const start = useMutation({
    mutationFn: dineInApi.startCooking,
    onSuccess: (res) => { toast.success(res.message); qc.invalidateQueries({ queryKey: ['dine-in'] }); },
    onError: (e) => toast.error(e.message),
  });

  const finish = useMutation({
    mutationFn: dineInApi.finishCooking,
    onSuccess: (res) => { toast.success(res.message); qc.invalidateQueries({ queryKey: ['dine-in'] }); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const pending = data.flatMap((o) => o.items).filter((i) => i.status === 'PENDING').reduce((s, i) => s + i.quantity, 0);
  const cooking = data.flatMap((o) => o.items).filter((i) => i.status === 'COOKING').reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <PageHeader
        title="Phiếu bếp"
        subtitle={data.length ? `${pending} phần chờ làm · ${cooking} phần đang làm · tự cập nhật mỗi 10 giây` : 'Tự cập nhật mỗi 10 giây'}
      />
      {data.length === 0 ? (
        <EmptyState icon={ChefHat} title="Chưa có món nào cần làm" description="Phục vụ gửi món từ app là phiếu hiện ở đây, kèm tiếng chuông." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((o) => (
            <TicketCard key={o.id} order={o} canStart={can('KITCHEN', 'edit')} start={start} finish={finish} />
          ))}
        </div>
      )}
    </>
  );
}

function TicketCard({ order, canStart, start, finish }) {
  const pendingIds = order.items.filter((i) => i.status === 'PENDING').map((i) => i.id);
  const cookingIds = order.items.filter((i) => i.status === 'COOKING').map((i) => i.id);
  const oldest = order.items.reduce((min, i) => (i.createdAt < min ? i.createdAt : min), order.items[0].createdAt);
  const waitMinutes = dayjs().diff(oldest, 'minute');
  const busy = (ids) => (start.isPending && ids.some((id) => start.variables?.includes(id)))
    || (finish.isPending && ids.some((id) => finish.variables?.includes(id)));

  return (
    <div className={clsx('card flex flex-col p-4', pendingIds.length && 'ring-2 ring-amber-300')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-bold">Bàn {order.table?.code}</p>
          <p className="text-sm text-slate-500">{order.table?.area} · {order.staff?.name ?? 'Phục vụ'}</p>
        </div>
        <span className={clsx('flex items-center gap-1 text-sm', waitMinutes >= 15 ? 'font-semibold text-red-600' : 'text-slate-500')}>
          <Clock className="h-4 w-4" /> {fromNow(oldest)}
        </span>
      </div>
      {order.note && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Ghi chú bàn: {order.note}</p>}

      <ul className="mt-3 flex-1 divide-y divide-slate-100">
        {order.items.map((i) => (
          <li key={i.id} className="flex items-start gap-3 py-2">
            <span className="w-8 shrink-0 text-lg font-bold text-ocean-900">{i.quantity}×</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{i.name}</p>
              {i.weight != null && <p className="text-sm font-semibold text-cyan-700">Đã cân {formatKg(i.weight)}</p>}
              {i.note && <p className="text-sm text-coral-700 italic">{i.note}</p>}
              <p className="text-xs text-slate-400">Gửi lúc {dayjs(i.createdAt).format('HH:mm')}</p>
            </div>
            {i.status === 'PENDING' && canStart ? (
              <Button size="sm" variant="outline" loading={busy([i.id])} onClick={() => start.mutate([i.id])}>Nhận làm</Button>
            ) : i.status === 'COOKING' && canStart ? (
              <Button size="sm" variant="primary" loading={busy([i.id])} onClick={() => finish.mutate([i.id])}>Đã xong</Button>
            ) : (
              <Badge color={DINE_IN_ITEM_STATUS[i.status].color}>{DINE_IN_ITEM_STATUS[i.status].label}</Badge>
            )}
          </li>
        ))}
      </ul>

      {canStart && pendingIds.length > 1 && (
        <Button className="mt-3 w-full" variant="dark" loading={busy(pendingIds)} onClick={() => start.mutate(pendingIds)}>
          <Flame className="h-4 w-4" /> Nhận làm cả bàn ({pendingIds.length} món)
        </Button>
      )}
      {canStart && cookingIds.length > 1 && (
        <Button className="mt-3 w-full" variant="primary" loading={busy(cookingIds)} onClick={() => finish.mutate(cookingIds)}>
          <ChefHat className="h-4 w-4" /> Đã xong cả bàn ({cookingIds.length} món)
        </Button>
      )}
    </div>
  );
}
