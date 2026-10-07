import clsx from 'clsx';
import { CalendarSearch, PackageSearch } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Field, Input } from '../components/ui/Form';
import { useDocumentTitle } from '../lib/hooks';

// Tra cứu đơn hàng hoặc lịch đặt bàn bằng mã + SĐT (dành cho khách không đăng nhập)
// Tab đang chọn lưu trên URL: /track (đơn hàng), /track?tab=reservation (đặt bàn)
const TABS = {
  order: {
    label: 'Đơn hàng',
    icon: PackageSearch,
    title: 'Tra cứu đơn hàng',
    desc: 'Nhập mã đơn và số điện thoại đã dùng khi đặt hàng',
    placeholder: 'VD: FAB2610011234',
    path: '/orders',
  },
  reservation: {
    label: 'Đặt bàn',
    icon: CalendarSearch,
    title: 'Tra cứu đặt bàn',
    desc: 'Nhập mã đặt bàn và số điện thoại đã dùng khi đặt',
    placeholder: 'VD: RSV2610011234',
    path: '/reservations',
  },
};

export default function TrackOrder() {
  useDocumentTitle('Tra cứu');
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tabKey = params.get('tab') === 'reservation' ? 'reservation' : 'order';
  const tab = TABS[tabKey];
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = ({ code, phone }) =>
    navigate(`${tab.path}/${code.trim().toUpperCase()}?phone=${encodeURIComponent(phone.replace(/\s/g, ''))}`);

  return (
    <div className="container-page flex justify-center py-16">
      <form onSubmit={handleSubmit(onSubmit)} className="card w-full max-w-md space-y-4 p-8">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          {Object.entries(TABS).map(([key, t]) => (
            <button
              key={key}
              type="button"
              onClick={() => setParams(key === 'order' ? {} : { tab: key }, { replace: true })}
              className={clsx(
                'rounded-lg py-2 text-sm font-medium transition',
                tabKey === key ? 'bg-white text-ocean-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="text-center">
          <tab.icon className="mx-auto h-12 w-12 text-coral-500" />
          <h1 className="mt-3 text-2xl font-bold">{tab.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{tab.desc}</p>
        </div>
        <Field label={tabKey === 'order' ? 'Mã đơn hàng' : 'Mã đặt bàn'} error={errors.code?.message}>
          <Input placeholder={tab.placeholder} {...register('code', { required: 'Vui lòng nhập mã' })} />
        </Field>
        <Field label="Số điện thoại" error={errors.phone?.message}>
          <Input type="tel" placeholder="0901234567" {...register('phone', { required: 'Vui lòng nhập số điện thoại' })} />
        </Field>
        <Button type="submit" size="lg" className="w-full">Tra cứu</Button>
      </form>
    </div>
  );
}
