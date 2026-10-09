import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Eye, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState, Pagination, Spinner } from '../../components/ui/Feedback';
import { Input } from '../../components/ui/Form';
import Modal from '../../components/ui/Modal';
import { Table, Td, Th } from '../../components/ui/Table';
import { NEXT_STATUS, ORDER_STATUS, ORDER_TYPE, PAYMENT_METHOD, PAYMENT_STATUS, PAYMENT_TXN_STATUS, STATUS_ACTION_LABEL } from '../../lib/constants';
import { formatDateTime, formatPrice } from '../../lib/format';
import { useDocumentTitle } from '../../lib/hooks';
import { orderApi } from '../../services';

function OrderModal({ id, onClose }) {
  const qc = useQueryClient();
  const { data: order, isLoading } = useQuery({ queryKey: ['admin-order', id], queryFn: () => orderApi.detail(id), enabled: !!id });

  const update = useMutation({
    mutationFn: (status) => orderApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái');
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-order', id] });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Modal open={!!id} onClose={onClose} title={order ? `Đơn ${order.code}` : 'Chi tiết đơn'} size="lg">
      {isLoading || !order ? (
        <Spinner />
      ) : (
        <div className="space-y-5 text-sm">
          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            <p><span className="text-slate-500">Khách:</span> {order.customerName} {order.user && <span className="text-xs text-slate-400">({order.user.email})</span>}</p>
            <p><span className="text-slate-500">SĐT:</span> <a href={`tel:${order.phone}`} className="text-ocean-600">{order.phone}</a></p>
            <p><span className="text-slate-500">Hình thức:</span> {ORDER_TYPE[order.type]}</p>
            <p><span className="text-slate-500">Thời gian:</span> {formatDateTime(order.createdAt)}</p>
            {order.address && <p className="sm:col-span-2"><span className="text-slate-500">Địa chỉ:</span> {order.address}</p>}
            {order.note && <p className="sm:col-span-2 rounded-lg bg-amber-50 p-2"><span className="text-slate-500">Ghi chú:</span> {order.note}</p>}
            <p className="flex items-center gap-2"><span className="text-slate-500">Thanh toán:</span> {PAYMENT_METHOD[order.paymentMethod]} <StatusBadge map={PAYMENT_STATUS} value={order.paymentStatus} /></p>
            <p className="flex items-center gap-2"><span className="text-slate-500">Trạng thái:</span> <StatusBadge map={ORDER_STATUS} value={order.status} /></p>
          </div>

          <table className="w-full">
            <tbody>
              {order.items.map((i) => (
                <tr key={i.id} className="border-b border-slate-100">
                  <td className="py-2">{i.name}</td>
                  <td className="py-2 text-center text-slate-500">× {i.quantity}</td>
                  <td className="py-2 text-right">{formatPrice(i.price * i.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="ml-auto max-w-xs space-y-1">
            <div className="flex justify-between"><dt className="text-slate-500">Tạm tính</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><dt>Giảm ({order.couponCode})</dt><dd>-{formatPrice(order.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-slate-500">Phí giao</dt><dd>{formatPrice(order.shippingFee)}</dd></div>
            <div className="flex justify-between text-base font-bold"><dt>Tổng</dt><dd className="text-coral-600">{formatPrice(order.total)}</dd></div>
          </dl>

          {order.payments?.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <p className="mb-2 font-medium">Lịch sử thanh toán VNPay</p>
              <ul className="space-y-1.5 text-xs">
                {order.payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-slate-50 px-3 py-2">
                    <StatusBadge map={PAYMENT_TXN_STATUS} value={p.status} />
                    <span>{formatDateTime(p.paidAt || p.createdAt)}</span>
                    {p.transactionNo && <span>Mã GD VNPay: <span className="font-mono">{p.transactionNo}</span></span>}
                    {p.bankCode && <span>Ngân hàng: {p.bankCode}</span>}
                    {p.status === 'FAILED' && p.responseCode && <span className="text-slate-500">Mã lỗi {p.responseCode}</span>}
                  </li>
                ))}
              </ul>
              {order.status === 'CANCELLED' && order.paymentStatus !== 'UNPAID' && (
                <p className="mt-2 rounded-lg bg-amber-50 p-2 text-amber-800">Đơn đã hủy nhưng khách đã trả tiền: nhớ hoàn tiền trên trang quản lý của VNPay.</p>
              )}
            </div>
          )}

          {NEXT_STATUS[order.status].length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <p className="mb-2 font-medium">Chuyển trạng thái:</p>
              <div className="flex flex-wrap gap-2">
                {NEXT_STATUS[order.status]
                  .filter((s) => !(s === 'DELIVERING' && order.type === 'PICKUP'))
                  .map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={s === 'CANCELLED' ? 'danger' : 'primary'}
                      loading={update.isPending && update.variables === s}
                      onClick={() => (s !== 'CANCELLED' || window.confirm('Hủy đơn này?')) && update.mutate(s)}
                    >
                      {STATUS_ACTION_LABEL[s]}
                    </Button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default function Orders() {
  useDocumentTitle('Quản trị - Đơn hàng');
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const page = Number(params.get('page')) || 1;
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [selected, setSelected] = useState(null);

  const query = { status: status || undefined, page, search: submitted || undefined };
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-orders', query],
    queryFn: () => orderApi.list(query),
    placeholderData: keepPreviousData,
    refetchInterval: 30000, // Tự làm mới để thấy đơn mới
  });

  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    if (k !== 'page') next.delete('page');
    setParams(next);
  };

  const counts = data?.meta.statusCounts ?? {};
  const totalAll = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      <PageHeader
        title="Đơn hàng"
        actions={<Button variant="outline" onClick={() => refetch()}><RefreshCw className={clsx('h-4 w-4', isFetching && 'animate-spin')} /> Làm mới</Button>}
      />

      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {[['', 'Tất cả', totalAll], ...Object.entries(ORDER_STATUS).map(([k, v]) => [k, v.label, counts[k] ?? 0])].map(([k, label, n]) => (
          <button
            key={k}
            onClick={() => setParam('status', k)}
            className={clsx('shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium', status === k ? 'bg-ocean-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200')}
          >
            {label} <span className="opacity-60">({n})</span>
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setSubmitted(search); setParam('page', ''); }} className="mb-4 flex max-w-md gap-2">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm mã đơn, tên, SĐT..." />
        <Button type="submit" variant="dark"><Search className="h-4 w-4" /></Button>
      </form>

      {isLoading ? (
        <Spinner />
      ) : data.data.length === 0 ? (
        <EmptyState title="Không có đơn hàng" />
      ) : (
        <>
          <Table>
            <thead>
              <tr><Th>Mã đơn</Th><Th>Khách hàng</Th><Th>Thời gian</Th><Th>Hình thức</Th><Th className="text-right">Tổng tiền</Th><Th>Thanh toán</Th><Th>Trạng thái</Th><Th /></tr>
            </thead>
            <tbody>
              {data.data.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <Td className="font-mono font-medium">{o.code}</Td>
                  <Td><p>{o.customerName}</p><p className="text-xs text-slate-500">{o.phone}</p></Td>
                  <Td className="whitespace-nowrap text-slate-600">{formatDateTime(o.createdAt)}</Td>
                  <Td className="whitespace-nowrap">{ORDER_TYPE[o.type]}</Td>
                  <Td className="text-right font-semibold whitespace-nowrap">{formatPrice(o.total)}</Td>
                  <Td><StatusBadge map={PAYMENT_STATUS} value={o.paymentStatus} /></Td>
                  <Td><StatusBadge map={ORDER_STATUS} value={o.status} /></Td>
                  <Td><Button size="sm" variant="ghost" onClick={() => setSelected(o.id)}><Eye className="h-4 w-4" /> Xem</Button></Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={page} totalPages={data.meta.totalPages} onChange={(p) => setParam('page', String(p))} />
        </>
      )}

      <OrderModal id={selected} onClose={() => setSelected(null)} />
    </>
  );
}
