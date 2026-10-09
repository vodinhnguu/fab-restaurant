import { useMutation, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { Banknote, CreditCard, ShoppingBag, Store, Ticket, Truck, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Button from '../components/ui/Button';
import { EmptyState } from '../components/ui/Feedback';
import { Field, Input, Textarea } from '../components/ui/Form';
import { formatPrice, imageUrl } from '../lib/format';
import { useDocumentTitle, useInfo } from '../lib/hooks';
import { couponApi, orderApi, paymentApi } from '../services';
import { useAuthStore } from '../stores/auth';
import { selectSubtotal, useCartStore } from '../stores/cart';

// Ô lựa chọn dạng thẻ (hình thức nhận hàng / thanh toán)
function OptionCard({ active, onClick, icon: Icon, title, desc, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'flex flex-1 items-start gap-3 rounded-xl border-2 p-4 text-left transition',
        active ? 'border-coral-500 bg-coral-50' : 'border-slate-200 bg-white hover:border-slate-300',
        disabled && 'cursor-not-allowed opacity-50 hover:border-slate-200',
      )}
    >
      <Icon className={clsx('mt-0.5 h-5 w-5', active ? 'text-coral-600' : 'text-slate-400')} />
      <span>
        <span className="block font-medium">{title}</span>
        <span className="block text-xs text-slate-500">{desc}</span>
      </span>
    </button>
  );
}

export default function Checkout() {
  useDocumentTitle('Thanh toán');
  const user = useAuthStore((s) => s.user);
  const { items, clear } = useCartStore();
  const subtotal = useCartStore(selectSubtotal);
  const { data: info } = useInfo();
  const navigate = useNavigate();

  const [type, setType] = useState('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null); // { code, discount, description }

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { customerName: user?.name || '', phone: user?.phone || '', address: user?.address || '', note: '' },
  });

  const { data: publicCoupons } = useQuery({ queryKey: ['coupons', 'public'], queryFn: couponApi.public });

  const checkCoupon = useMutation({
    mutationFn: (code) => couponApi.check(code, subtotal),
    onSuccess: (data) => {
      setCoupon(data);
      toast.success(`Áp dụng mã ${data.code}: giảm ${formatPrice(data.discount)}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const placeOrder = useMutation({
    mutationFn: orderApi.create,
    onSuccess: async (order) => {
      clear();
      // encodeURIComponent: SĐT dạng +84... có dấu + sẽ bị URL hiểu thành dấu cách nếu không mã hóa
      const detailUrl = `/orders/${order.code}?phone=${encodeURIComponent(order.phone)}`;

      if (order.paymentMethod === 'ONLINE') {
        try {
          // Rời khỏi web, sang trang VNPay. Trả xong VNPay đưa khách về /payment/vnpay-return
          window.location.href = await paymentApi.createVnpay(order.code, order.phone);
          return;
        } catch (e) {
          // Đơn đã tạo xong, chỉ lỗi bước lấy link -> khách bấm "Thanh toán ngay" ở trang đơn để thử lại
          toast.error(`Đã đặt đơn nhưng chưa mở được VNPay: ${e.message}`);
          navigate(detailUrl, { replace: true });
          return;
        }
      }

      toast.success('Đặt hàng thành công!');
      navigate(detailUrl, { replace: true });
    },
    onError: (e) => toast.error(e.message),
  });

  // Nhà hàng chưa cấu hình VNPay -> không cho chọn thanh toán online
  const onlineEnabled = Boolean(info?.onlinePayment);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Giỏ hàng trống"
        description="Bạn chưa chọn món nào."
        action={<Button as={Link} to="/menu">Xem thực đơn</Button>}
      />
    );
  }

  const shippingFee = type === 'DELIVERY' && info && subtotal < info.freeShippingMin ? info.shippingFee : 0;
  // Nếu giỏ hàng thay đổi sau khi áp mã thì giảm giá hiển thị có thể lệch -> backend luôn tính lại chính xác
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const total = subtotal - discount + shippingFee;

  const onSubmit = (form) => {
    placeOrder.mutate({
      ...form,
      type,
      paymentMethod,
      couponCode: coupon?.code,
      items: items.map((i) => ({ dishId: i.dishId, quantity: i.quantity })),
    });
  };

  return (
    <div className="container-page py-10">
      <h1 className="heading-display mb-8 text-3xl sm:text-4xl">Thanh toán</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className="card space-y-4 p-6">
            <h2 className="text-lg font-semibold">1. Hình thức nhận món</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <OptionCard active={type === 'DELIVERY'} onClick={() => setType('DELIVERY')} icon={Truck} title="Giao tận nơi" desc="Khoảng 30-45 phút" />
              <OptionCard active={type === 'PICKUP'} onClick={() => setType('PICKUP')} icon={Store} title="Đến lấy tại quán" desc="Không mất phí giao hàng" />
            </div>
          </section>

          <section className="card space-y-4 p-6">
            <h2 className="text-lg font-semibold">2. Thông tin người nhận</h2>
            {!user && (
              <p className="rounded-xl bg-ocean-50 p-3 text-sm text-ocean-800">
                <Link to="/login" state={{ from: '/checkout' }} className="font-semibold underline">Đăng nhập</Link> để lưu lịch sử đơn hàng và điền thông tin nhanh hơn.
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Họ tên" required error={errors.customerName?.message}>
                <Input invalid={errors.customerName} {...register('customerName', { required: 'Vui lòng nhập họ tên' })} />
              </Field>
              <Field label="Số điện thoại" required error={errors.phone?.message}>
                <Input
                  type="tel"
                  invalid={errors.phone}
                  {...register('phone', {
                    required: 'Vui lòng nhập số điện thoại',
                    pattern: { value: /^(0|\+84)\d{9,10}$/, message: 'Số điện thoại không hợp lệ' },
                  })}
                />
              </Field>
            </div>
            {type === 'DELIVERY' && (
              <Field label="Địa chỉ giao hàng" required error={errors.address?.message}>
                <Input
                  invalid={errors.address}
                  placeholder="Số nhà, đường, phường, quận"
                  {...register('address', { validate: (v) => type !== 'DELIVERY' || v.trim().length >= 5 || 'Vui lòng nhập địa chỉ giao hàng' })}
                />
              </Field>
            )}
            <Field label="Ghi chú cho nhà hàng">
              <Textarea placeholder="Ví dụ: ít cay, giao trước 12h..." {...register('note')} />
            </Field>
          </section>

          <section className="card space-y-4 p-6">
            <h2 className="text-lg font-semibold">3. Phương thức thanh toán</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <OptionCard active={paymentMethod === 'COD'} onClick={() => setPaymentMethod('COD')} icon={Banknote} title="Tiền mặt" desc="Thanh toán khi nhận món" />
              <OptionCard
                active={paymentMethod === 'ONLINE'}
                onClick={() => setPaymentMethod('ONLINE')}
                disabled={!onlineEnabled}
                icon={CreditCard}
                title="Thanh toán VNPay"
                desc={onlineEnabled ? 'Thẻ ATM, Visa/Master, QR ngân hàng' : 'Tạm thời chưa hỗ trợ'}
              />
            </div>
          </section>
        </div>

        {/* Tóm tắt đơn */}
        <aside className="lg:col-span-2">
          <div className="card sticky top-24 p-6">
            <h2 className="text-lg font-semibold">Đơn hàng ({items.length} món)</h2>
            <ul className="mt-2 max-h-72 space-y-3 overflow-y-auto pt-2 pr-2">
              {items.map((i) => (
                <li key={i.dishId} className="flex items-center gap-3">
                  <div className="relative">
                    <img src={imageUrl(i.image)} alt="" className="h-14 w-14 rounded-lg object-cover" />
                    <span className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center rounded-full bg-ocean-900 text-[11px] font-bold text-white">{i.quantity}</span>
                  </div>
                  <span className="flex-1 text-sm">{i.name}</span>
                  <span className="text-sm font-medium">{formatPrice(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>

            {/* Mã giảm giá */}
            <div className="mt-5 border-t border-slate-100 pt-5">
              {coupon ? (
                <div className="flex items-center justify-between rounded-xl bg-green-50 p-3 text-sm text-green-700">
                  <span className="flex items-center gap-2"><Ticket className="h-4 w-4" /> {coupon.code}</span>
                  <button type="button" onClick={() => setCoupon(null)} aria-label="Bỏ mã"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="Mã giảm giá" />
                    <Button type="button" variant="dark" loading={checkCoupon.isPending} disabled={!couponInput} onClick={() => checkCoupon.mutate(couponInput)}>
                      Áp dụng
                    </Button>
                  </div>
                  {publicCoupons?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {publicCoupons.map((c) => (
                        <button
                          type="button"
                          key={c.code}
                          title={c.description}
                          onClick={() => checkCoupon.mutate(c.code)}
                          className="rounded-md border border-dashed border-coral-300 bg-coral-50 px-2 py-0.5 font-mono text-xs text-coral-700 hover:bg-coral-100"
                        >
                          {c.code}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <dl className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Tạm tính</dt><dd>{formatPrice(subtotal)}</dd></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><dt>Giảm giá</dt><dd>-{formatPrice(discount)}</dd></div>}
              <div className="flex justify-between">
                <dt className="text-slate-500">Phí giao hàng</dt>
                <dd>{shippingFee ? formatPrice(shippingFee) : 'Miễn phí'}</dd>
              </div>
              {type === 'DELIVERY' && shippingFee > 0 && info && (
                <p className="text-xs text-slate-400">Mua thêm {formatPrice(info.freeShippingMin - subtotal)} để được miễn phí giao hàng</p>
              )}
              <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold">
                <dt>Tổng cộng</dt><dd className="text-coral-600">{formatPrice(total)}</dd>
              </div>
            </dl>

            <Button type="submit" size="lg" className="mt-6 w-full" loading={placeOrder.isPending}>
              {paymentMethod === 'ONLINE' ? 'Đặt hàng & thanh toán VNPay' : 'Đặt hàng'}
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}
