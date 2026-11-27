import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { Beer, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { DINE_IN_REFRESH_MS } from '../../../components/dine-in/useDineInAlerts';
import PageHeader from '../../../components/PageHeader';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { EmptyState, ErrorState, Spinner } from '../../../components/ui/Feedback';
import { DINE_IN_ITEM_STATUS } from '../../../lib/constants';
import { fromNow } from '../../../lib/format';
import { useDocumentTitle } from '../../../lib/hooks';
import { useCan } from '../../../lib/permissions';
import { dineInApi } from '../../../services';

export default function Bar() {
  useDocumentTitle('Quầy bia nước');
  const can = useCan();
  const qc = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dine-in', 'bar'],
    queryFn: dineInApi.bar,
    refetchInterval: DINE_IN_REFRESH_MS,
  });

  const serve = useMutation({
    mutationFn: dineInApi.barServe,
    onSuccess: (res) => { toast.success(res.message); qc.invalidateQueries({ queryKey: ['dine-in'] }); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const pending = data.flatMap((o) => o.items).filter((i) => i.status === 'PENDING').reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <PageHeader
        title="Quầy bia nước"
        subtitle={data.length ? `${pending} phần chờ lấy · tự cập nhật mỗi 10 giây` : 'Tự cập nhật mỗi 10 giây'}
      />
      {data.length === 0 ? (
        <EmptyState icon={Beer} title="Chưa có đồ uống nào cần lấy" description="Phục vụ gọi bia nước từ app là đơn hiện ở đây." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((o) => (
            <DrinkCard key={o.id} order={o} canServe={can('DRINKS', 'edit')} serve={serve} />
          ))}
        </div>
      )}
    </>
  );
}

function DrinkCard({ order, canServe, serve }) {
  const allIds = order.items.map((i) => i.id);
  const oldest = order.items.reduce((min, i) => (i.createdAt < min ? i.createdAt : min), order.items[0].createdAt);
  const waitMinutes = dayjs().diff(oldest, 'minute');
  const busy = serve.isPending && allIds.some((id) => serve.variables?.includes(id));

  return (
    <div className={clsx('card flex flex-col p-4', 'ring-2 ring-amber-300')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-bold">Bàn {order.table?.code}</p>
          <p className="text-sm text-slate-500">{order.table?.area} · {order.staff?.name ?? 'Phục vụ'}</p>
        </div>
        <span className={clsx('flex items-center gap-1 text-sm', waitMinutes >= 5 ? 'font-semibold text-red-600' : 'text-slate-500')}>
          <Clock className="h-4 w-4" /> {fromNow(oldest)}
        </span>
      </div>

      <ul className="mt-3 flex-1 divide-y divide-slate-100">
        {order.items.map((i) => (
          <li key={i.id} className="flex items-start gap-3 py-2">
            <span className="w-8 shrink-0 text-lg font-bold text-ocean-900">{i.quantity}×</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{i.name}</p>
              {i.note && <p className="text-sm text-coral-700 italic">{i.note}</p>}
              <p className="text-xs text-slate-400">Gọi lúc {dayjs(i.createdAt).format('HH:mm')}</p>
            </div>
            {canServe ? (
              <Button size="sm" variant="primary" loading={busy} onClick={() => serve.mutate([i.id])}>Đã lấy</Button>
            ) : (
              <Badge color={DINE_IN_ITEM_STATUS[i.status]?.color}>{DINE_IN_ITEM_STATUS[i.status]?.label}</Badge>
            )}
          </li>
        ))}
      </ul>

      {canServe && allIds.length > 1 && (
        <Button className="mt-3 w-full" variant="primary" loading={busy} onClick={() => serve.mutate(allIds)}>
          <Beer className="h-4 w-4" /> Đã lấy cả bàn ({allIds.length} đồ uống)
        </Button>
      )}
    </div>
  );
}
