import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Logo from '../components/layout/Logo';
import Button from '../components/ui/Button';
import { Field, Input } from '../components/ui/Form';
import { useDocumentTitle } from '../lib/hooks';
import { canAccessAdmin } from '../lib/permissions';
import { authApi } from '../services';
import { useAuthStore } from '../stores/auth';

export default function Login() {
  useDocumentTitle('Đăng nhập');
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data);
      toast.success(`Xin chào, ${data.user.name}!`);
      const from = location.state?.from;
      navigate(from || (canAccessAdmin(data.user) ? '/admin' : '/'), { replace: true });
    },
    onError: (e) => toast.error(e.message),
  });

  const fillDemo = (email, password) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="card w-full max-w-md space-y-4 p-8">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="text-center text-2xl font-bold">Đăng nhập</h1>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" invalid={errors.email} {...register('email', { required: 'Vui lòng nhập email' })} />
        </Field>
        <Field label="Mật khẩu" error={errors.password?.message}>
          <Input type="password" autoComplete="current-password" invalid={errors.password} {...register('password', { required: 'Vui lòng nhập mật khẩu' })} />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>Đăng nhập</Button>
        <p className="text-center text-sm text-slate-500">
          Chưa có tài khoản? <Link to="/register" state={location.state} className="font-medium text-ocean-700 hover:underline">Đăng ký</Link>
        </p>

        {/* Tài khoản demo - xóa khi đưa vào sử dụng thật */}
        <div className="rounded-xl bg-sand-100 p-3 text-xs text-slate-600">
          {/* Danh sách nhân viên khớp với backend/prisma/seed-staff.js (mật khẩu 123456) */}
          {[
            ['Tài khoản demo:', [
              ['Admin', 'admin@fab.vn', 'admin123'],
              ['Khách hàng', 'khach@fab.vn', '123456'],
            ]],
            ['Nhân viên (mật khẩu 123456):', [
              ['Chủ nhà hàng', 'chunha@fab.vn'],
              ['Quản lý', 'quanly@fab.vn'],
              ['Tổ trưởng', 'totruong@fab.vn'],
              ['Phục vụ', 'phucvu@fab.vn'],
              ['Lễ tân', 'letan@fab.vn'],
              ['Thu ngân', 'thungan@fab.vn'],
              ['Kỹ thuật', 'kythuat@fab.vn'],
              ['Tạp vụ', 'tapvu@fab.vn'],
              ['Bếp', 'bep@fab.vn'],
              ['Tiếp thực', 'tiepthuc@fab.vn'],
              ['Hồ hải sản', 'hohaisan@fab.vn'],
            ]],
          ].map(([heading, accounts]) => (
            <div key={heading} className="mt-2 first:mt-0">
              <p className="mb-2 font-semibold">{heading}</p>
              <div className="flex flex-wrap gap-2">
                {accounts.map(([label, email, password = '123456']) => (
                  <button key={email} type="button" onClick={() => fillDemo(email, password)} className="rounded-lg bg-white px-2 py-1 ring-1 ring-slate-200 hover:ring-ocean-300">{label}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
