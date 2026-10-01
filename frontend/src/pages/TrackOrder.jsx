import { PackageSearch } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Field, Input } from '../components/ui/Form';

export default function TrackOrder() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = ({ code, phone }) => navigate(`/orders/${code.trim().toUpperCase()}?phone=${phone.trim()}`);

  return (
    <div className="container-page flex justify-center py-16">
      <form onSubmit={handleSubmit(onSubmit)} className="card w-full max-w-md space-y-4 p-8">
        <div className="text-center">
          <PackageSearch className="mx-auto h-12 w-12 text-coral-500" />
          <h1 className="mt-3 text-2xl font-bold">Tra cứu đơn hàng</h1>
          <p className="mt-1 text-sm text-slate-500">Nhập mã đơn và số điện thoại đã dùng khi đặt hàng</p>
        </div>
        <Field label="Mã đơn hàng" error={errors.code?.message}>
          <Input placeholder="VD: FAB2610011234" {...register('code', { required: 'Vui lòng nhập mã đơn' })} />
        </Field>
        <Field label="Số điện thoại" error={errors.phone?.message}>
          <Input type="tel" placeholder="0901234567" {...register('phone', { required: 'Vui lòng nhập số điện thoại' })} />
        </Field>
        <Button type="submit" size="lg" className="w-full">Tra cứu</Button>
      </form>
    </div>
  );
}
