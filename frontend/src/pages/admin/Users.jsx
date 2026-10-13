import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, KeyRound, RefreshCw, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import PageHeader from '../../components/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Pagination, Spinner } from '../../components/ui/Feedback';
import { Field, Input, Select } from '../../components/ui/Form';
import Modal from '../../components/ui/Modal';
import { Table, Td, Th } from '../../components/ui/Table';
import { formatDate } from '../../lib/format';
import { useDocumentTitle } from '../../lib/hooks';
import { ROLE_LABEL, useCan } from '../../lib/permissions';
import { permissionApi, userApi } from '../../services';
import { useAuthStore } from '../../stores/auth';

// Mật khẩu ngẫu nhiên dễ đọc (bỏ các ký tự dễ nhầm như 0/O, 1/l/I)
const randomPassword = () => {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  return Array.from(crypto.getRandomValues(new Uint32Array(8)), (n) => chars[n % chars.length]).join('');
};

// Sau khi tạo / đặt lại mật khẩu: hiện thông tin đăng nhập để admin đưa cho nhân viên
function Credentials({ email, password, onClose }) {
  const text = `Trang quản trị: ${window.location.origin}/login\nEmail: ${email}\nMật khẩu: ${password}`;
  const copy = () => navigator.clipboard.writeText(text).then(() => toast.success('Đã sao chép'), () => toast.error('Không sao chép được, hãy chép tay'));
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Gửi thông tin này cho nhân viên. Mật khẩu chỉ hiện <b>một lần</b>, đóng cửa sổ là không xem lại được.</p>
      <pre className="rounded-xl bg-slate-50 p-4 font-mono text-sm whitespace-pre-wrap ring-1 ring-slate-200">{text}</pre>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={copy}><Copy className="h-4 w-4" /> Sao chép</Button>
        <Button onClick={onClose}>Xong</Button>
      </div>
    </div>
  );
}

// ---------- Thêm nhân viên: admin tạo tài khoản, nhân viên không cần tự đăng ký ----------
function CreateStaffModal({ staffRoles, isAdmin, onClose }) {
  const qc = useQueryClient();
  const [done, setDone] = useState(null); // { email, password } sau khi tạo xong
  const defaultRole = staffRoles.find((r) => r.key === 'WAITER')?.id ?? '';
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { name: '', email: '', phone: '', role: 'STAFF', staffRoleId: defaultRole, password: randomPassword() },
  });

  const save = useMutation({
    mutationFn: (v) => userApi.create({ ...v, staffRoleId: v.role === 'STAFF' ? Number(v.staffRoleId) : undefined }),
    onSuccess: (res, v) => {
      toast.success('Đã tạo tài khoản nhân viên');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['permissions'] });
      setDone({ email: res.data.email, password: v.password });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Modal open onClose={onClose} title={done ? 'Đã tạo tài khoản' : 'Thêm nhân viên'} size="lg"
      footer={!done && <><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={handleSubmit((v) => save.mutate(v))} loading={save.isPending}>Tạo tài khoản</Button></>}
    >
      {done ? <Credentials {...done} onClose={onClose} /> : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Họ tên" required error={errors.name?.message}>
              <Input invalid={errors.name} {...register('name', { required: 'Nhập họ tên', minLength: { value: 2, message: 'Tối thiểu 2 ký tự' } })} />
            </Field>
            <Field label="Số điện thoại" error={errors.phone?.message}>
              <Input {...register('phone')} placeholder="Không bắt buộc" />
            </Field>
          </div>
          <Field label="Email đăng nhập" required error={errors.email?.message}>
            <Input type="email" invalid={errors.email} {...register('email', { required: 'Nhập email' })} placeholder="vd: thungan2@fab.vn" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Loại tài khoản">
              <Select {...register('role')}>
                <option value="STAFF">Nhân viên</option>
                {isAdmin && <option value="ADMIN">Quản trị (toàn quyền)</option>}
              </Select>
            </Field>
            {watch('role') === 'STAFF' && (
              <Field label="Vai trò / bộ phận" required error={errors.staffRoleId?.message}>
                <Select {...register('staffRoleId', { required: 'Chọn vai trò' })}>
                  <option value="">-- Chọn vai trò --</option>
                  {staffRoles.filter((r) => isAdmin || r.key !== 'OWNER').map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              </Field>
            )}
          </div>
          <Field label="Mật khẩu ban đầu" required error={errors.password?.message} hint="Đã tạo sẵn mật khẩu ngẫu nhiên, có thể sửa. Nhân viên nên tự đổi sau khi đăng nhập.">
            <div className="flex gap-2">
              <Input className="font-mono" invalid={errors.password} {...register('password', { required: 'Nhập mật khẩu', minLength: { value: 6, message: 'Tối thiểu 6 ký tự' } })} />
              <Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => setValue('password', randomPassword())} aria-label="Tạo mật khẩu khác" title="Tạo mật khẩu khác"><RefreshCw className="h-4 w-4" /></Button>
            </div>
          </Field>
        </div>
      )}
    </Modal>
  );
}

// ---------- Đặt lại mật khẩu khi nhân viên quên ----------
function ResetPasswordModal({ user, onClose }) {
  const [password, setPassword] = useState(randomPassword);
  const [done, setDone] = useState(false);
  const reset = useMutation({
    mutationFn: () => userApi.resetPassword(user.id, password),
    onSuccess: () => { toast.success('Đã đặt lại mật khẩu'); setDone(true); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Modal open onClose={onClose} title={`Đặt lại mật khẩu: ${user.name}`}
      footer={!done && <><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={() => (password.length < 6 ? toast.error('Mật khẩu tối thiểu 6 ký tự') : reset.mutate())} loading={reset.isPending}>Đặt lại</Button></>}
    >
      {done ? <Credentials email={user.email} password={password} onClose={onClose} /> : (
        <Field label="Mật khẩu mới" hint="Mật khẩu cũ sẽ không dùng được nữa.">
          <div className="flex gap-2">
            <Input className="font-mono" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => setPassword(randomPassword())} aria-label="Tạo mật khẩu khác" title="Tạo mật khẩu khác"><RefreshCw className="h-4 w-4" /></Button>
          </div>
        </Field>
      )}
    </Modal>
  );
}

export default function Users() {
  useDocumentTitle('Quản trị - Người dùng');
  const me = useAuthStore((s) => s.user);
  const [filters, setFilters] = useState({ search: '', role: '', staffRoleId: '', page: 1 });
  const qc = useQueryClient();
  const query = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
  const { data, isLoading } = useQuery({ queryKey: ['admin-users', query], queryFn: () => userApi.list(query), placeholderData: keepPreviousData });
  const { data: matrix } = useQuery({ queryKey: ['permissions'], queryFn: permissionApi.list });
  const staffRoles = matrix?.roles ?? [];
  const can = useCan();
  const isAdmin = me.role === 'ADMIN';

  // Được sửa dòng này không: không tự sửa mình; nhân viên không đụng tới ADMIN / Chủ nhà hàng
  const editable = (u) =>
    u.id !== me.id && can('STAFF', 'edit') && (isAdmin || (u.role !== 'ADMIN' && staffRoles.find((r) => r.id === u.staffRole?.id)?.key !== 'OWNER'));

  // Đổi loại tài khoản; chuyển sang Nhân viên thì gán tạm vai trò "Nhân viên phục vụ" để chọn lại sau
  const changeRole = (u, role) => {
    if (role !== 'STAFF') return update.mutate({ id: u.id, body: { role } });
    const fallback = staffRoles.find((r) => r.key === 'WAITER') ?? staffRoles.find((r) => r.key !== 'OWNER');
    update.mutate({ id: u.id, body: { role, staffRoleId: u.staffRole?.id ?? fallback?.id } });
  };

  const update = useMutation({
    mutationFn: ({ id, body }) => userApi.update(id, body),
    onSuccess: () => { toast.success('Đã cập nhật'); qc.invalidateQueries({ queryKey: ['admin-users'] }); qc.invalidateQueries({ queryKey: ['permissions'] }); },
    onError: (e) => toast.error(e.message),
  });

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: k === 'page' ? v : 1 }));
  const [creating, setCreating] = useState(false);
  const [resetting, setResetting] = useState(null); // user đang đặt lại mật khẩu

  return (
    <>
      <PageHeader
        title="Người dùng"
        subtitle={data && `${data.meta.total} tài khoản`}
        actions={can('STAFF', 'create') && <Button onClick={() => setCreating(true)}><UserPlus className="h-4 w-4" /> Thêm nhân viên</Button>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input value={filters.search} onChange={(e) => set('search', e.target.value)} placeholder="Tìm tên, email, SĐT..." className="w-64" />
        <Select value={filters.role} onChange={(e) => set('role', e.target.value)} className="w-40">
          <option value="">Tất cả vai trò</option>
          {Object.entries(ROLE_LABEL).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
        </Select>
        {filters.role === 'STAFF' && (
          <Select value={filters.staffRoleId ?? ''} onChange={(e) => set('staffRoleId', e.target.value)} className="w-48">
            <option value="">Tất cả bộ phận</option>
            {staffRoles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
        )}
      </div>
      {isLoading ? <Spinner /> : (
        <>
          <Table>
            <thead><tr><Th>Người dùng</Th><Th>SĐT</Th><Th>Vai trò</Th><Th className="text-center">Đơn hàng</Th><Th className="text-center">Đặt bàn</Th><Th>Ngày tạo</Th><Th>Trạng thái</Th><Th /></tr></thead>
            <tbody>
              {data.data.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <Td><p className="font-medium">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></Td>
                  <Td>{u.phone || '-'}</Td>
                  <Td>
                    {!editable(u) ? (
                      <Badge color={u.role === 'ADMIN' ? 'blue' : u.role === 'STAFF' ? 'coral' : 'slate'}>{ROLE_LABEL[u.role]}{u.id === me.id && ' (bạn)'}</Badge>
                    ) : (
                      <Select value={u.role} onChange={(e) => changeRole(u, e.target.value)} className="h-8 w-44 text-xs">
                        {Object.entries(ROLE_LABEL)
                          .filter(([v]) => isAdmin || v !== 'ADMIN')
                          .map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                      </Select>
                    )}
                    {u.role === 'STAFF' && (!editable(u) ? (
                      <p className="mt-1 text-xs text-slate-500">{u.staffRole?.name ?? 'Chưa gán vai trò'}</p>
                    ) : (
                      <Select value={u.staffRole?.id ?? ''} onChange={(e) => update.mutate({ id: u.id, body: { staffRoleId: Number(e.target.value) } })} className="mt-1 h-8 w-44 text-xs">
                        {!u.staffRole && <option value="">-- Chọn vai trò --</option>}
                        {staffRoles
                          .filter((r) => isAdmin || r.key !== 'OWNER')
                          .map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </Select>
                    ))}
                  </Td>
                  <Td className="text-center">{u._count.orders}</Td>
                  <Td className="text-center">{u._count.reservations}</Td>
                  <Td>{formatDate(u.createdAt)}</Td>
                  <Td>{u.isActive ? <Badge color="green">Hoạt động</Badge> : <Badge color="red">Đã khóa</Badge>}</Td>
                  <Td>
                    {editable(u) && (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setResetting(u)} aria-label="Đặt lại mật khẩu" title="Đặt lại mật khẩu"><KeyRound className="h-4 w-4" /></Button>
                        <Button size="sm" variant="outline" onClick={() => update.mutate({ id: u.id, body: { isActive: !u.isActive } })}>
                          {u.isActive ? 'Khóa' : 'Mở khóa'}
                        </Button>
                      </div>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={filters.page} totalPages={data.meta.totalPages} onChange={(p) => set('page', p)} />
        </>
      )}
      {creating && <CreateStaffModal staffRoles={staffRoles} isAdmin={isAdmin} onClose={() => setCreating(false)} />}
      {resetting && <ResetPasswordModal user={resetting} onClose={() => setResetting(null)} />}
    </>
  );
}
