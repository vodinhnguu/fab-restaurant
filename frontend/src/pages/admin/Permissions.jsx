import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Check, Eye, Grid3x3, LayoutList, Lock, Minus, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import PageHeader from '../../components/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { ErrorState, Spinner } from '../../components/ui/Feedback';
import { Field, Input, Textarea } from '../../components/ui/Form';
import Modal from '../../components/ui/Modal';
import { Table, Td, Th } from '../../components/ui/Table';
import { useDocumentTitle } from '../../lib/hooks';
import { permissionApi } from '../../services';
import { useAuthStore } from '../../stores/auth';

// Màu cho từng quyền: Xem / Thêm / Sửa / Xóa
const ACTION_COLOR = { view: 'blue', create: 'green', edit: 'amber', delete: 'red' };
// Viết tắt trong bảng tổng (Xem và Xóa cùng chữ X nên Xóa dùng "Xó")
const ACTION_SHORT = { view: 'X', create: 'T', edit: 'S', delete: 'Xó' };

// Số chức năng vai trò này được truy cập (có ít nhất 1 quyền)
const countModules = (role) => Object.values(role.permissions).filter((p) => Object.values(p).some(Boolean)).length;

function Tick({ on }) {
  return on ? (
    <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-green-100 text-green-700"><Check className="h-4 w-4" /></span>
  ) : (
    <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-slate-300"><Minus className="h-4 w-4" /></span>
  );
}

// ---------- Form thêm / sửa vai trò ----------
function RoleForm({ role, modules, actions, onClose, onSaved }) {
  const qc = useQueryClient();
  const locked = role?.isLocked;
  const [name, setName] = useState(role?.name ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [perms, setPerms] = useState(
    () => role?.permissions ?? Object.fromEntries(modules.map((m) => [m.key, { view: false, create: false, edit: false, delete: false }])),
  );

  // Có quyền Thêm/Sửa/Xóa thì phải Xem được; bỏ Xem thì bỏ hết
  const toggle = (module, action) =>
    setPerms((prev) => {
      const p = { ...prev[module], [action]: !prev[module][action] };
      if (action === 'view' && !p.view) Object.assign(p, { create: false, edit: false, delete: false });
      if (action !== 'view' && p[action]) p.view = true;
      return { ...prev, [module]: p };
    });
  const setRow = (module, value) =>
    setPerms((prev) => ({ ...prev, [module]: Object.fromEntries(actions.map((a) => [a.key, value])) }));
  const setColumn = (action, value) =>
    setPerms((prev) => {
      const next = {};
      for (const m of modules) {
        const p = { ...prev[m.key], [action]: value };
        if (action === 'view' && !value) Object.assign(p, { create: false, edit: false, delete: false });
        if (action !== 'view' && value) p.view = true;
        next[m.key] = p;
      }
      return next;
    });

  const save = useMutation({
    mutationFn: () => {
      const body = { name, description: description || null, permissions: perms };
      return role ? permissionApi.update(role.id, body) : permissionApi.create(body);
    },
    onSuccess: (res) => {
      toast.success(role ? 'Đã cập nhật quyền' : 'Đã thêm vai trò');
      qc.invalidateQueries({ queryKey: ['permissions'] });
      onSaved?.(res.data);
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={role ? `Sửa quyền: ${role.name}` : 'Thêm vai trò mới'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={() => (name.trim().length < 2 ? toast.error('Nhập tên vai trò') : save.mutate())} loading={save.isPending}>Lưu</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên vai trò / bộ phận" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="vd: Bảo vệ" />
          </Field>
          <Field label="Công việc chính">
            <Textarea rows={1} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Bộ phận này làm gì?" />
          </Field>
        </div>

        {locked && (
          <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <Lock className="h-4 w-4" /> Chủ nhà hàng luôn có toàn quyền, chỉ sửa được tên và mô tả.
          </p>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-3 py-2 text-left">Chức năng</th>
                {actions.map((a) => {
                  const all = modules.every((m) => perms[m.key][a.key]);
                  return (
                    <th key={a.key} className="px-2 py-2 text-center">
                      <button type="button" disabled={locked} onClick={() => setColumn(a.key, !all)} className="hover:text-ocean-600 disabled:pointer-events-none" title="Bấm để chọn / bỏ cả cột">
                        {a.label}
                      </button>
                    </th>
                  );
                })}
                <th className="px-2 py-2 text-center">Tất cả</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((m) => {
                const p = perms[m.key];
                const all = actions.every((a) => p[a.key]);
                return (
                  <tr key={m.key} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.description}</p>
                    </td>
                    {actions.map((a) => (
                      <td key={a.key} className="px-2 py-2 text-center">
                        <input type="checkbox" className="h-4 w-4 accent-ocean-600" disabled={locked} checked={p[a.key]} onChange={() => toggle(m.key, a.key)} aria-label={`${a.label} ${m.name}`} />
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" className="h-4 w-4 accent-coral-500" disabled={locked} checked={all} onChange={() => setRow(m.key, !all)} aria-label={`Tất cả quyền ${m.name}`} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">Mẹo: bấm vào tên cột (Xem, Thêm...) để chọn / bỏ cả cột. Chọn Thêm / Sửa / Xóa sẽ tự bật quyền Xem.</p>
      </div>
    </Modal>
  );
}

// ---------- Chi tiết 1 vai trò: bộ phận này làm được gì ----------
function RoleDetail({ role, modules, actions, canEdit, onEdit, onDelete }) {
  return (
    <div id="role-detail" className="card scroll-mt-20 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            {role.name} {role.isLocked && <Lock className="h-4 w-4 text-amber-500" />}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{role.description || 'Chưa có mô tả công việc'}</p>
          <p className="mt-2 text-xs text-slate-400">Mã: <span className="font-mono">{role.key}</span> · Truy cập {countModules(role)}/{modules.length} chức năng · {role.userCount} nhân viên</p>
        </div>
        {canEdit && <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}><Pencil className="h-4 w-4" /> Sửa</Button>
          {!role.isSystem && (
            <Button variant="outline" size="sm" className="text-red-600" onClick={onDelete}><Trash2 className="h-4 w-4" /> Xóa</Button>
          )}
        </div>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-slate-500 uppercase">
            <tr className="border-b border-slate-200">
              <th className="py-2 pr-3 text-left">Chức năng</th>
              {actions.map((a) => <th key={a.key} className="px-2 py-2 text-center">{a.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {modules.map((m) => {
              const p = role.permissions[m.key];
              const none = !Object.values(p).some(Boolean);
              return (
                <tr key={m.key} className={clsx('border-b border-slate-100', none && 'opacity-50')}>
                  <td className="py-2.5 pr-3">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.description}</p>
                  </td>
                  {actions.map((a) => <td key={a.key} className="px-2 py-2.5 text-center"><Tick on={p[a.key]} /></td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Bảng tổng: tất cả vai trò × tất cả chức năng ----------
function FullMatrix({ roles, modules, actions, onPick }) {
  return (
    <>
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        {actions.map((a) => <Badge key={a.key} color={ACTION_COLOR[a.key]}>{ACTION_SHORT[a.key]} = {a.label}</Badge>)}
      </div>
      <Table>
        <thead>
          <tr>
            <Th className="sticky left-0 z-10">Vai trò</Th>
            {modules.map((m) => <Th key={m.key} className="text-center normal-case">{m.name}</Th>)}
          </tr>
        </thead>
        <tbody>
          {roles.map((r) => (
            <tr key={r.id} className="cursor-pointer hover:bg-slate-50" onClick={() => onPick(r)}>
              <Td className="sticky left-0 bg-white font-medium whitespace-nowrap">{r.name}</Td>
              {modules.map((m) => {
                const p = r.permissions[m.key];
                const on = actions.filter((a) => p[a.key]);
                return (
                  <Td key={m.key} className="text-center whitespace-nowrap">
                    {on.length === 0 ? <span className="text-slate-300">—</span> : (
                      <span className="inline-flex gap-0.5">
                        {on.map((a) => <Badge key={a.key} color={ACTION_COLOR[a.key]} className="px-1.5">{ACTION_SHORT[a.key]}</Badge>)}
                      </span>
                    )}
                  </Td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </Table>
      <p className="mt-2 text-xs text-slate-500">Bấm vào 1 dòng để xem chi tiết và sửa quyền của vai trò đó.</p>
    </>
  );
}

export default function Permissions() {
  useDocumentTitle('Quản trị - Phân quyền');
  const qc = useQueryClient();
  // Sửa ma trận chỉ dành cho ADMIN (backend cũng chặn); nhân viên chỉ được xem
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['permissions'], queryFn: permissionApi.list });
  const [view, setView] = useState('roles'); // 'roles' | 'matrix'
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(null); // null = đóng, {} = thêm mới, role = sửa

  const remove = useMutation({
    mutationFn: permissionApi.remove,
    onSuccess: () => {
      toast.success('Đã xóa vai trò');
      setSelectedId(null);
      qc.invalidateQueries({ queryKey: ['permissions'] });
    },
    onError: (e) => toast.error(e.message),
  });

  // Màn hình nhỏ: chi tiết nằm dưới danh sách -> tự cuộn xuống cho người dùng thấy ngay
  const pickRole = (id) => {
    setSelectedId(id);
    if (window.innerWidth < 1024) requestAnimationFrame(() => document.getElementById('role-detail')?.scrollIntoView({ behavior: 'smooth' }));
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const { roles, modules, actions } = data;
  const selected = roles.find((r) => r.id === selectedId) ?? roles[0];

  return (
    <>
      <PageHeader
        title="Ma trận phân quyền"
        subtitle="Mỗi bộ phận được Xem / Thêm / Sửa / Xóa những chức năng nào"
        actions={
          <>
            <div className="flex rounded-xl border border-slate-300 bg-white p-0.5">
              {[['roles', 'Theo vai trò', LayoutList], ['matrix', 'Toàn bộ ma trận', Grid3x3]].map(([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className={clsx('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium', view === key ? 'bg-ocean-900 text-white' : 'text-slate-600 hover:bg-slate-100')}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
            {isAdmin && <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Thêm vai trò</Button>}
          </>
        }
      />

      {!isAdmin && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <Lock className="h-4 w-4" /> Bạn chỉ được xem. Chỉ quản trị viên (ADMIN) mới sửa được ma trận phân quyền.
        </p>
      )}

      {view === 'matrix' ? (
        <FullMatrix roles={roles} modules={modules} actions={actions} onPick={(r) => { setSelectedId(r.id); setView('roles'); }} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Danh sách vai trò: bấm để xem bộ phận đó làm gì */}
          <div className="space-y-2">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => pickRole(r.id)}
                className={clsx(
                  'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition',
                  r.id === selected?.id ? 'border-ocean-500 bg-ocean-50' : 'border-slate-200 bg-white hover:border-ocean-300',
                )}
              >
                <span className={clsx('grid h-9 w-9 shrink-0 place-items-center rounded-full', r.isLocked ? 'bg-amber-100 text-amber-700' : 'bg-ocean-100 text-ocean-700')}>
                  {r.isLocked ? <ShieldCheck className="h-5 w-5" /> : <Eye className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{r.name}</span>
                  <span className="block text-xs text-slate-500">{countModules(r)}/{modules.length} chức năng · {r.userCount} người</span>
                </span>
                {!r.isSystem && <Badge color="coral">Tự tạo</Badge>}
              </button>
            ))}
          </div>

          {selected && (
            <RoleDetail
              role={selected}
              modules={modules}
              actions={actions}
              canEdit={isAdmin}
              onEdit={() => setEditing(selected)}
              onDelete={() => window.confirm(`Xóa vai trò "${selected.name}"?`) && remove.mutate(selected.id)}
            />
          )}
        </div>
      )}

      {editing && (
        <RoleForm
          role={editing.id ? editing : null}
          modules={modules}
          actions={actions}
          onClose={() => setEditing(null)}
          onSaved={(r) => setSelectedId(r.id)}
        />
      )}
    </>
  );
}
