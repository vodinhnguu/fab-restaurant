import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import { Field, Input } from '../../components/ui/Form';
import { useDocumentTitle } from '../../lib/hooks';
import { authApi } from '../../services';
import { useAuthStore } from '../../stores/auth';

function ProfileForm() {
  const { user, setUser } = useAuthStore();
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    defaultValues: { name: user.name, phone: user.phone || '', address: user.address || '' },
  });
  const mutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (u) => { setUser(u); toast.success('Đã cập nhật thông tin'); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="card space-y-4 p-6">
      <h2 className="text-lg font-semibold">Thông tin cá nhân</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Họ tên" error={errors.name?.message}>
          <Input {...register('name', { required: 'Vui lòng nhập họ tên' })} />
        </Field>
        <Field label="Số điện thoại" error={errors.phone?.message}>
          <Input type="tel" {...register('phone', { pattern: { value: /^((0|\+84)\d{9,10})?$/, message: 'Số điện thoại không hợp lệ' } })} />
        </Field>
      </div>
      <Field label="Địa chỉ mặc định" hint="Dùng để điền sẵn khi đặt hàng">
        <Input {...register('address')} />
      </Field>
      <Button type="submit" loading={mutation.isPending} disabled={!isDirty}>Lưu thay đổi</Button>
    </form>
  );
}

function PasswordForm() {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const mutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => { toast.success('Đổi mật khẩu thành công'); reset(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <form onSubmit={handleSubmit(({ currentPassword, newPassword }) => mutation.mutate({ currentPassword, newPassword }))} className="card space-y-4 p-6">
      <h2 className="text-lg font-semibold">Đổi mật khẩu</h2>
      <Field label="Mật khẩu hiện tại" error={errors.currentPassword?.message}>
        <Input type="password" {...register('currentPassword', { required: 'Bắt buộc' })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mật khẩu mới" error={errors.newPassword?.message}>
          <Input type="password" {...register('newPassword', { required: 'Bắt buộc', minLength: { value: 6, message: 'Tối thiểu 6 ký tự' } })} />
        </Field>
        <Field label="Nhập lại" error={errors.confirm?.message}>
          <Input type="password" {...register('confirm', { validate: (v) => v === watch('newPassword') || 'Không khớp' })} />
        </Field>
      </div>
      <Button type="submit" variant="dark" loading={mutation.isPending}>Đổi mật khẩu</Button>
    </form>
  );
}

export default function Profile() {
  useDocumentTitle('Tài khoản');
  return (
    <div className="space-y-6">
      <ProfileForm />
      <PasswordForm />
    </div>
  );
}
