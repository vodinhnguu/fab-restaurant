import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Logo from '../components/layout/Logo';
import Button from '../components/ui/Button';
import { Field, Input } from '../components/ui/Form';
import { useDocumentTitle } from '../lib/hooks';
import { authApi } from '../services';
import { useAuthStore } from '../stores/auth';

export default function Register() {
  useDocumentTitle('Đăng ký');
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data);
      toast.success('Đăng ký thành công!');
      navigate(location.state?.from || '/', { replace: true });
    },
    onError: (e) => toast.error(e.message),
  });

  // eslint-disable-next-line no-unused-vars
  const onSubmit = ({ confirm, phone, ...rest }) => mutation.mutate({ ...rest, ...(phone && { phone }) });

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <form onSubmit={handleSubmit(onSubmit)} className="card w-full max-w-md space-y-4 p-8">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="text-center text-2xl font-bold">Tạo tài khoản</h1>
        <Field label="Họ tên" required error={errors.name?.message}>
          <Input invalid={errors.name} {...register('name', { required: 'Vui lòng nhập họ tên', minLength: { value: 2, message: 'Tối thiểu 2 ký tự' } })} />
        </Field>
        <Field label="Email" required error={errors.email?.message}>
          <Input type="email" invalid={errors.email} {...register('email', { required: 'Vui lòng nhập email' })} />
        </Field>
        <Field label="Số điện thoại" error={errors.phone?.message}>
          <Input type="tel" invalid={errors.phone} {...register('phone', { pattern: { value: /^(0|\+84)\d{9,10}$/, message: 'Số điện thoại không hợp lệ' } })} />
        </Field>
        <Field label="Mật khẩu" required error={errors.password?.message}>
          <Input type="password" autoComplete="new-password" invalid={errors.password} {...register('password', { required: 'Vui lòng nhập mật khẩu', minLength: { value: 6, message: 'Tối thiểu 6 ký tự' } })} />
        </Field>
        <Field label="Nhập lại mật khẩu" required error={errors.confirm?.message}>
          <Input type="password" autoComplete="new-password" invalid={errors.confirm} {...register('confirm', { validate: (v) => v === watch('password') || 'Mật khẩu không khớp' })} />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>Đăng ký</Button>
        <p className="text-center text-sm text-slate-500">
          Đã có tài khoản? <Link to="/login" state={location.state} className="font-medium text-ocean-700 hover:underline">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}
