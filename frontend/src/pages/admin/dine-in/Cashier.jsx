import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { BellRing, HandCoins, Printer, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { mergeBillItems, openBillPrint, waitingCount, weighingCount } from '../../../components/dine-in/bill';
import { DINE_IN_REFRESH_MS } from '../../../components/dine-in/useDineInAlerts';
import PageHeader from '../../../components/PageHeader';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { EmptyState, ErrorState, Spinner } from '../../../components/ui/Feedback';
import Modal from '../../../components/ui/Modal';
import { formatDuration, formatKg, formatPrice, fromNow } from '../../../lib/format';
import { useDocumentTitle } from '../../../lib/hooks';
import { useCan } from '../../../lib/permissions';
import { dineInApi } from '../../../services';

// Thanh toán tại bàn (thu ngân). Tài liệu: docs/23-app-nhan-vien-phuc-vu.md
// Phục vụ bấm "Gửi thanh toán" trên app -> bàn hiện ở mục "Chờ thanh toán" + chuông + số đỏ trên menu.
// Thu ngân bấm "In bill" -> khách trả tiền -> "Đã thu tiền" (bàn trống lại trên app phục vụ).
export default function Cashier() {
  useDocumentTitle('Thanh toán tại bàn');
  const can = useCan();
  const qc = useQueryClient();
  const [paying, setPaying] = useState(null); // đơn đang hỏi "Đã thu tiền?"
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dine-in', 'bills'],
    queryFn: dineInApi.bills,
    refetchInterval: DINE_IN_REFRESH_MS,
  });

  const pay = useMutation({
    mutationFn: (id) => dineInApi.pay(id),
    onSuccess: (res) => { toast.success(res.message); setPaying(null); qc.invalidateQueries({ queryKey: ['dine-in'] }); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const requested = data.filter((o) => o.billRequestedAt);
  const eating = data.filter((o) => !o.billRequestedAt);
  const cardProps = { canPay: can('PAYMENTS', 'edit'), onPay: setPaying };

  return (
    <>
      <PageHeader title="Thanh toán tại bàn" subtitle="Bàn phục vụ gửi thanh toán từ app · tự cập nhật mỗi 10 giây" />

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-semibold">
          <BellRing className="h-5 w-5 text-coral-500" /> Chờ thanh toán
          {requested.length > 0 && <Badge color="coral">{requested.length} bàn</Badge>}
        </h2>
        {requested.length === 0 ? (
          <p className="card px-4 py-6 text-center text-sm text-slate-500">Chưa có bàn nào gửi thanh toán. Có bàn gửi là trang báo bằng chuông.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {requested.map((o) => <BillCard key={o.id} order={o} highlight {...cardProps} />)}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-semibold">Bàn đang ăn ({eating.length})</h2>
        {eating.length === 0 ? (
          <EmptyState icon={HandCoins} title="Không có bàn nào đang ăn" />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {eating.map((o) => <BillCard key={o.id} order={o} {...cardProps} />)}
          </div>
        )}
      </section>

      {paying && <PayDialog order={paying} loading={pay.isPending} onClose={() => setPaying(null)} onConfirm={() => pay.mutate(paying.id)} />}
    </>
  );
}

function BillCard({ order, highlight, canPay, onPay }) {
  const lines = mergeBillItems(order.items);
  const waiting = waitingCount(order.items);
  const shown = lines.slice(0, 5);

  return (
    <div className={clsx('card flex flex-col p-4', highlight && 'bg-coral-50/40 ring-2 ring-coral-400')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-bold">Bàn {order.table?.code}</p>
          <p className="text-sm text-slate-500">{order.table?.area} · {order.staff?.name ?? 'Phục vụ'}</p>
        </div>
        <p className="text-xl font-bold text-coral-600">{formatPrice(order.total)}</p>
      </div>

      <p className="mt-1 text-sm text-slate-500">
        {highlight
          ? <>Gửi thanh toán <b className="text-coral-700">{fromNow(order.billRequestedAt)}</b> ({dayjs(order.billRequestedAt).format('HH:mm')})</>
          : <>Mở bàn {dayjs(order.createdAt).format('HH:mm')} · đã ngồi {formatDuration(order.createdAt, new Date())}</>}
      </p>

      <ul className="mt-3 flex-1 space-y-1 text-sm">
        {shown.map((l) => (
          <li key={l.key} className="flex justify-between gap-2">
            <span className="min-w-0 truncate">
              <b>{l.byWeight ? (l.weight != null ? formatKg(l.weight) : 'Chờ cân') : `${l.quantity}×`}</b> {l.name}
              {l.weighing && l.weight != null && <span className="text-cyan-700"> (tạm, chờ cân)</span>}
            </span>
            <span className="shrink-0 text-slate-600">{l.byWeight && l.weight == null ? '—' : formatPrice(l.amount)}</span>
          </li>
        ))}
        {lines.length > shown.length && <li className="text-slate-400">… và {lines.length - shown.length} món khác</li>}
      </ul>

      <div className="mt-3 flex flex-wrap gap-2">
        {weighingCount(order.items) > 0 && <Badge color="cyan">Còn {weighingCount(order.items)} món chờ cân</Badge>}
        {waiting > 0 && <Badge color="amber">Còn {waiting} phần chưa lên</Badge>}
        {order.billPrintedAt && <Badge color="green">Đã in {dayjs(order.billPrintedAt).format('HH:mm')}</Badge>}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => openBillPrint(order.id)}><Printer className="h-4 w-4" /> In bill</Button>
        {canPay && <Button variant={highlight ? 'primary' : 'dark'} onClick={() => onPay(order)}><HandCoins className="h-4 w-4" /> Đã thu tiền</Button>}
      </div>
    </div>
  );
}

function PayDialog({ order, loading, onClose, onConfirm }) {
  const waiting = waitingCount(order.items);
  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={`Thu tiền bàn ${order.table?.code}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Đóng</Button>
          <Button loading={loading} onClick={onConfirm}><HandCoins className="h-4 w-4" /> Đã thu {formatPrice(order.total)}</Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">Xác nhận đã nhận đủ tiền của khách. Đơn chuyển sang <b>Đã thanh toán</b> và bàn trống lại trên app phục vụ.</p>
      <p className="mt-4 text-center text-3xl font-bold text-coral-600">{formatPrice(order.total)}</p>
      {waiting > 0 && (
        <p className="mt-4 flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <TriangleAlert className="h-4 w-4 shrink-0" /> Bàn còn {waiting} phần chưa mang ra. Nếu khách không lấy nữa, nhờ phục vụ hủy món trước khi thu tiền.
        </p>
      )}
      {!order.billPrintedAt && <p className="mt-3 text-sm text-slate-500">Bàn này chưa in bill.</p>}
    </Modal>
  );
}
