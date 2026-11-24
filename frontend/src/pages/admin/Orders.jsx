import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Eye, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import CancelReasonDialog from '../../components/CancelReasonDialog';
import { lineAmount } from '../../components/dine-in/bill';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState, Pagination, Spinner } from '../../components/ui/Feedback';
import { Input, Select } from '../../components/ui/Form';
import Modal from '../../components/ui/Modal';
import { Table, Td, Th } from '../../components/ui/Table';
import { ORDER_TYPE, PAYMENT_METHOD, PAYMENT_STATUS, PAYMENT_TXN_STATUS, nextStatusList, orderStatusMap, statusActionLabel } from '../../lib/constants';
import { formatDateTime, formatKg, formatPrice } from '../../lib/format';
import { useDocumentTitle } from '../../lib/hooks';
import { useCan } from '../../lib/permissions';
import { orderApi } from '../../services';

// Lý do hủy đơn có sẵn để bấm nhanh; "Lý do khác" thì tự gõ. Khách sẽ thấy lý do ở trang chi tiết đơn.
// Muốn thêm / sửa lý do thì sửa mảng này, backend nhận mọi lý do dạng chữ (tối đa 300 ký tự).
const CANCEL_REASONS = [
  'Món / hải sản trong đơn đã hết',
  'Không liên lạc được với khách',
  'Địa chỉ ngoài khu vực giao hàng',
  'Nhà hàng quá tải / sắp đóng cửa',
  'Khách yêu cầu hủy qua điện thoại',
];

function OrderModal({ id, onClose }) {
  const qc = useQueryClient();
  const can = useCan();
  const [cancelling, setCancelling] = useState(false); // đang mở hộp thoại chọn lý do hủy
  const { data: order, isLoading } = useQuery({ queryKey: ['admin-order', id], queryFn: () => orderApi.detail(id), enabled: !!id });

  const update = useMutation({
    mutationFn: ({ status, reason }) => orderApi.updateStatus(id, status, reason),
    onSuccess: (_, { status }) => {
      toast.success(status === 'CANCELLED' ? 'Đã hủy đơn, khách sẽ thấy lý do hủy' : 'Đã cập nhật trạng thái');
      setCancelling(false);
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-order', id] });
    },
    onError: (e) => toast.error(e.message),
  });

  // Hủy đơn: tạm thay cửa sổ chi tiết bằng hộp thoại chọn lý do (không mở 2 cửa sổ chồng nhau),
  // hủy xong tự quay lại cửa sổ chi tiết
  if (id && order && cancelling) {
    return (
      <CancelReasonDialog
        title={`Hủy đơn ${order.code}`}
        description={`${order.customerName} · ${order.phone} · ${formatPrice(order.total)}. Lý do sẽ hiện ở trang chi tiết đơn để khách biết vì sao đơn bị hủy.`}
        reasons={CANCEL_REASONS}
        confirmLabel="Hủy đơn"
        loading={update.isPending}
        onClose={() => setCancelling(false)}
        onConfirm={(reason) => update.mutate({ status: 'CANCELLED', reason })}
      />
    );
  }

  return (
    <Modal open={!!id} onClose={onClose} title={order ? `Đơn ${order.code}` : 'Chi tiết đơn'} size="lg">
      {isLoading || !order ? (
        <Spinner />
      ) : (
        <div className="space-y-5 text-sm">
          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            <p><span className="text-slate-500">Khách:</span> {order.customerName} {order.user && <span className="text-xs text-slate-400">({order.user.email})</span>}</p>
            {order.phone ? (
              <p><span className="text-slate-500">SĐT:</span> <a href={`tel:${order.phone}`} className="text-ocean-600">{order.phone}</a></p>
            ) : (
              <span /> /* đơn ăn tại quán không có SĐT: giữ ô trống cho lưới 2 cột không bị lệch */
            )}
            <p><span className="text-slate-500">Hình thức:</span> {ORDER_TYPE[order.type]}</p>
            <p><span className="text-slate-500">Thời gian:</span> {formatDateTime(order.createdAt)}</p>
            {order.address && <p className="sm:col-span-2"><span className="text-slate-500">Địa chỉ:</span> {order.address}</p>}
            {order.note && <p className="sm:col-span-2 rounded-lg bg-amber-50 p-2"><span className="text-slate-500">Ghi chú:</span> {order.note}</p>}
            <p className="flex items-center gap-2"><span className="text-slate-500">Thanh toán:</span> {PAYMENT_METHOD[order.paymentMethod]} <StatusBadge map={PAYMENT_STATUS} value={order.paymentStatus} /></p>
            <p className="flex items-center gap-2"><span className="text-slate-500">Trạng thái:</span> <StatusBadge map={orderStatusMap(order.type)} value={order.status} /></p>
            {order.table && (
              <p className="sm:col-span-2">
                <span className="text-slate-500">Bàn:</span> {order.table.code} ({order.table.area})
                {order.staff && <> · <span className="text-slate-500">Phục vụ:</span> {order.staff.name}</>}
              </p>
            )}
            {order.cancelReason && (
              <p className="sm:col-span-2 rounded-lg bg-red-50 p-2 text-red-700"><span className="text-slate-500">Lý do hủy (khách xem được):</span> {order.cancelReason}</p>
            )}
          </div>

          <table className="w-full">
            <tbody>
              {order.items.map((i) => (
                <tr key={i.id} className="border-b border-slate-100">
                  <td className="py-2">
                    {i.name}
                    {i.note && <p className="text-xs font-medium text-coral-600">Ghi chú: {i.note}</p>}
                  </td>
                  <td className="py-2 text-center text-slate-500">
                    {i.weight != null
                      ? `${formatKg(i.weight)}${i.status === 'WEIGHING' ? ' (tạm, chờ cân)' : ''}`
                      : i.status === 'WEIGHING' ? 'Chờ cân' : `× ${i.quantity}`}
                  </td>
                  <td className="py-2 text-right">{formatPrice(lineAmount(i))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="ml-auto max-w-xs space-y-1">
            <div className="flex justify-between"><dt className="text-slate-500">Tạm tính</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><dt>Giảm ({order.couponCode})</dt><dd>-{formatPrice(order.discount)}</dd></div>}
            {order.type !== 'DINE_IN' && (
              <div className="flex justify-between"><dt className="text-slate-500">Phí giao</dt><dd>{formatPrice(order.shippingFee)}</dd></div>
            )}
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

          {can('ORDERS', 'edit') && nextStatusList(order.type, order.status).length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <p className="mb-2 font-medium">Chuyển trạng thái:</p>
              <div className="flex flex-wrap gap-2">
                {nextStatusList(order.type, order.status)
                  .filter((s) => !(s === 'DELIVERING' && order.type === 'PICKUP'))
                  .map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={s === 'CANCELLED' ? 'danger' : 'primary'}
                      loading={update.isPending && update.variables?.status === s}
                      onClick={() => (s === 'CANCELLED' ? setCancelling(true) : update.mutate({ status: s }))}
                    >
                      {statusActionLabel(order.type, s)}
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
  const type = params.get('type') || ''; // '' = mọi hình thức, hoặc DELIVERY / PICKUP / DINE_IN
  const page = Number(params.get('page')) || 1;
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [selected, setSelected] = useState(null);

  const query = { status: status || undefined, type: type || undefined, page, search: submitted || undefined };
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
        {[['', 'Tất cả', totalAll], ...Object.entries(orderStatusMap(type)).map(([k, v]) => [k, v.label, counts[k] ?? 0])].map(([k, label, n]) => (
          <button
            key={k}
            onClick={() => setParam('status', k)}
            className={clsx('shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium', status === k ? 'bg-ocean-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200')}
          >
            {label} <span className="opacity-60">({n})</span>
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(search); setParam('page', ''); }} className="flex max-w-md flex-1 gap-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm mã đơn, tên, SĐT..." />
          <Button type="submit" variant="dark"><Search className="h-4 w-4" /></Button>
        </form>
        {/* Lọc theo hình thức: đơn online (giao / đến lấy) hay đơn ăn tại quán do phục vụ ghi trên app */}
        <Select value={type} onChange={(e) => setParam('type', e.target.value)} className="w-48">
          <option value="">Mọi hình thức</option>
          {Object.entries(ORDER_TYPE).map(([k, label]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </Select>
      </div>

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
                  <Td>
                    <StatusBadge map={orderStatusMap(o.type)} value={o.status} />
                    {o.cancelReason && <p className="mt-1 max-w-48 text-xs text-red-600" title={o.cancelReason}>Lý do: {o.cancelReason}</p>}
                  </Td>
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
