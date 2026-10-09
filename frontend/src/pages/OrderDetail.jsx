import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Check, CircleCheck, CreditCard, LoaderCircle, PackageSearch } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import Button from '../components/ui/Button';
import Badge, { StatusBadge } from '../components/ui/Badge';
import { EmptyState, Spinner } from '../components/ui/Feedback';
import { ORDER_STATUS, ORDER_TYPE, PAYMENT_METHOD, PAYMENT_STATUS } from '../lib/constants';
import { formatDateTime, formatPrice, imageUrl } from '../lib/format';
import { useDocumentTitle } from '../lib/hooks';
import { orderApi, paymentApi } from '../services';

const STEPS = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'COMPLETED'];

function Timeline({ order }) {
  if (order.status === 'CANCELLED') {
    return <div className="rounded-xl bg-red-50 p-4 text-center font-medium text-red-700">Đơn hàng đã bị hủy</div>;
  }
  const steps = order.type === 'PICKUP' ? STEPS.filter((s) => s !== 'DELIVERING') : STEPS;
  const current = steps.indexOf(order.status);

  return (
    <ol className="flex items-start">
      {steps.map((s, i) => (
        <li key={s} className="relative flex flex-1 flex-col items-center text-center">
          {i > 0 && <span className={clsx('absolute top-4 right-1/2 h-0.5 w-full', i <= current ? 'bg-coral-500' : 'bg-slate-200')} />}
          <span
            className={clsx(
              'relative z-10 grid h-8 w-8 place-items-center rounded-full text-sm font-bold',
              i < current && 'bg-coral-500 text-white',
              i === current && 'bg-coral-500 text-white ring-4 ring-coral-100',
              i > current && 'bg-slate-200 text-slate-500',
            )}
          >
            {i < current ? <Check className="h-4 w-4" /> : i + 1}
          </span>
          <span className={clsx('mt-2 text-xs sm:text-sm', i <= current ? 'font-medium text-slate-800' : 'text-slate-400')}>
            {ORDER_STATUS[s].label}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function OrderDetail() {
  const { code } = useParams();
  const [params] = useSearchParams();
  const phone = params.get('phone') || undefined;
  const qc = useQueryClient();
  useDocumentTitle(`Đơn hàng ${code}`);

  const { data: order, isLoading, isError, isFetching } = useQuery({
    queryKey: ['order', code],
    queryFn: () => orderApi.track(code, phone),
    refetchInterval: 15000, // Tự cập nhật trạng thái mỗi 15 giây
    retry: false,
  });

  // Lấy link VNPay rồi chuyển khách sang đó (mỗi lần bấm là 1 giao dịch mới)
  const pay = useMutation({
    mutationFn: () => paymentApi.createVnpay(code, phone),
    onSuccess: (paymentUrl) => {
      window.location.href = paymentUrl;
    },
    onError: (e) => toast.error(e.message),
  });

  const cancel = useMutation({
    mutationFn: () => orderApi.cancel(code, phone),
    onSuccess: () => {
      toast.success('Đã hủy đơn hàng');
      qc.invalidateQueries({ queryKey: ['order', code] });
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Spinner className="py-32" />;
  if (isError) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Không tìm thấy đơn hàng"
        description="Kiểm tra lại mã đơn và số điện thoại đặt hàng."
        action={<Button as={Link} to="/track">Tra cứu đơn khác</Button>}
      />
    );
  }

  // Đơn vừa đặt (trong 10 phút) thì hiện lời cảm ơn, đơn cũ thì hiện tiêu đề bình thường
  const isNew = Date.now() - new Date(order.createdAt).getTime() < 10 * 60 * 1000;
  const needPay = order.paymentMethod === 'ONLINE' && order.paymentStatus === 'UNPAID' && order.status !== 'CANCELLED';

  return (
    <div className="container-page max-w-4xl py-10">
      <div className="mb-6 text-center">
        {isNew && <CircleCheck className="mx-auto h-14 w-14 text-green-500" />}
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{isNew ? 'Cảm ơn bạn đã đặt món!' : 'Chi tiết đơn hàng'}</h1>
        <p className="mt-1 text-slate-500">
          Mã đơn: <span className="font-mono font-semibold text-ocean-900">{order.code}</span> · {formatDateTime(order.createdAt)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {isFetching ? <LoaderCircle className="inline h-3 w-3 animate-spin" /> : 'Trạng thái tự động cập nhật mỗi 15 giây'}
        </p>
      </div>

      {needPay && (
        <div className="mb-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row">
          <p className="text-sm text-amber-800">Đơn hàng chưa được thanh toán. Vui lòng thanh toán để nhà hàng xác nhận nhanh hơn.</p>
          <Button loading={pay.isPending} onClick={() => pay.mutate()}><CreditCard className="h-4 w-4" /> Thanh toán qua VNPay</Button>
        </div>
      )}

      <div className="card p-6"><Timeline order={order} /></div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="card space-y-2 p-6 text-sm">
          <h2 className="mb-3 text-base font-semibold">Thông tin nhận hàng</h2>
          <p><span className="text-slate-500">Người nhận:</span> {order.customerName}</p>
          <p><span className="text-slate-500">Điện thoại:</span> {order.phone}</p>
          <p><span className="text-slate-500">Hình thức:</span> {ORDER_TYPE[order.type]}</p>
          {order.address && <p><span className="text-slate-500">Địa chỉ:</span> {order.address}</p>}
          {order.note && <p><span className="text-slate-500">Ghi chú:</span> {order.note}</p>}
          <p className="flex items-center gap-2"><span className="text-slate-500">Thanh toán:</span> {PAYMENT_METHOD[order.paymentMethod]} <StatusBadge map={PAYMENT_STATUS} value={order.paymentStatus} /></p>
          <p className="flex items-center gap-2"><span className="text-slate-500">Trạng thái:</span> <StatusBadge map={ORDER_STATUS} value={order.status} /></p>
        </div>

        <div className="card p-6">
          <h2 className="mb-3 font-semibold">Chi tiết đơn</h2>
          <ul className="space-y-3">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 text-sm">
                <img src={imageUrl(i.dish?.image)} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <span className="flex-1">{i.name} <span className="text-slate-400">× {i.quantity}</span></span>
                <span className="font-medium">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Tạm tính</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600"><dt>Giảm giá {order.couponCode && <Badge color="green">{order.couponCode}</Badge>}</dt><dd>-{formatPrice(order.discount)}</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-slate-500">Phí giao hàng</dt><dd>{order.shippingFee ? formatPrice(order.shippingFee) : 'Miễn phí'}</dd></div>
            <div className="flex justify-between pt-2 text-base font-bold"><dt>Tổng cộng</dt><dd className="text-coral-600">{formatPrice(order.total)}</dd></div>
          </dl>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button as={Link} to="/menu" variant="outline">Tiếp tục đặt món</Button>
        {/* Đã trả tiền online thì phải gọi nhà hàng để hủy + hoàn tiền */}
        {order.status === 'PENDING' && order.paymentStatus !== 'PAID' && (
          <Button variant="danger" loading={cancel.isPending} onClick={() => window.confirm('Bạn chắc chắn muốn hủy đơn này?') && cancel.mutate()}>
            Hủy đơn
          </Button>
        )}
      </div>
    </div>
  );
}
