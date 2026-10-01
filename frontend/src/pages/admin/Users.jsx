import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import PageHeader from '../../components/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Pagination, Spinner } from '../../components/ui/Feedback';
import { Input, Select } from '../../components/ui/Form';
import { Table, Td, Th } from '../../components/ui/Table';
import { formatDate } from '../../lib/format';
import { userApi } from '../../services';
import { useAuthStore } from '../../stores/auth';

export default function Users() {
  const me = useAuthStore((s) => s.user);
  const [filters, setFilters] = useState({ search: '', role: '', page: 1 });
  const qc = useQueryClient();
  const query = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
  const { data, isLoading } = useQuery({ queryKey: ['admin-users', query], queryFn: () => userApi.list(query), placeholderData: keepPreviousData });

  const update = useMutation({
    mutationFn: ({ id, body }) => userApi.update(id, body),
    onSuccess: () => { toast.success('Đã cập nhật'); qc.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: (e) => toast.error(e.message),
  });

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: k === 'page' ? v : 1 }));

  return (
    <>
      <PageHeader title="Người dùng" subtitle={data && `${data.meta.total} tài khoản`} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input value={filters.search} onChange={(e) => set('search', e.target.value)} placeholder="Tìm tên, email, SĐT..." className="w-64" />
        <Select value={filters.role} onChange={(e) => set('role', e.target.value)} className="w-40">
          <option value="">Tất cả vai trò</option>
          <option value="CUSTOMER">Khách hàng</option>
          <option value="ADMIN">Quản trị</option>
        </Select>
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
                    {u.id === me.id ? <Badge color="blue">Quản trị (bạn)</Badge> : (
                      <Select value={u.role} onChange={(e) => update.mutate({ id: u.id, body: { role: e.target.value } })} className="h-8 w-36 text-xs">
                        <option value="CUSTOMER">Khách hàng</option>
                        <option value="ADMIN">Quản trị</option>
                      </Select>
                    )}
                  </Td>
                  <Td className="text-center">{u._count.orders}</Td>
                  <Td className="text-center">{u._count.reservations}</Td>
                  <Td>{formatDate(u.createdAt)}</Td>
                  <Td>{u.isActive ? <Badge color="green">Hoạt động</Badge> : <Badge color="red">Đã khóa</Badge>}</Td>
                  <Td>
                    {u.id !== me.id && (
                      <Button size="sm" variant="outline" onClick={() => update.mutate({ id: u.id, body: { isActive: !u.isActive } })}>
                        {u.isActive ? 'Khóa' : 'Mở khóa'}
                      </Button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={filters.page} totalPages={data.meta.totalPages} onChange={(p) => set('page', p)} />
        </>
      )}
    </>
  );
}
