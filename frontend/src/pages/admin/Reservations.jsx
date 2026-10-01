import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState, Pagination, Spinner } from '../../components/ui/Feedback';
import { Input, Select } from '../../components/ui/Form';
import { Table, Td, Th } from '../../components/ui/Table';
import { RESERVATION_STATUS } from '../../lib/constants';
import { formatDateTime } from '../../lib/format';
import { reservationApi } from '../../services';

// Hành động hợp lệ cho từng trạng thái
const ACTIONS = {
  PENDING: [['CONFIRMED', 'Xác nhận', 'primary'], ['CANCELLED', 'Hủy', 'outline']],
  CONFIRMED: [['COMPLETED', 'Khách đã đến', 'primary'], ['CANCELLED', 'Hủy', 'outline']],
};

export default function Reservations() {
  const [filters, setFilters] = useState({ status: '', date: '', search: '', page: 1 });
  const qc = useQueryClient();

  const query = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reservations', query],
    queryFn: () => reservationApi.list(query),
    placeholderData: keepPreviousData,
  });

  const update = useMutation({
    mutationFn: ({ id, status }) => reservationApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Đã cập nhật');
      qc.invalidateQueries({ queryKey: ['admin-reservations'] });
    },
    onError: (e) => toast.error(e.message),
  });

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: k === 'page' ? v : 1 }));

  return (
    <>
      <PageHeader title="Đặt bàn" subtitle="Quản lý lịch đặt bàn của khách" />

      <div className="mb-4 flex flex-wrap gap-2">
        <Input type="date" value={filters.date} onChange={(e) => set('date', e.target.value)} className="w-44" />
        <Select value={filters.status} onChange={(e) => set('status', e.target.value)} className="w-44">
          <option value="">Tất cả trạng thái</option>
          {Object.entries(RESERVATION_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </Select>
        <Input value={filters.search} onChange={(e) => set('search', e.target.value)} placeholder="Tìm tên, SĐT, mã..." className="w-60" />
        {(filters.date || filters.status || filters.search) && (
          <Button variant="ghost" onClick={() => setFilters({ status: '', date: '', search: '', page: 1 })}>Xóa lọc</Button>
        )}
      </div>

      {isLoading ? (
        <Spinner />
      ) : data.data.length === 0 ? (
        <EmptyState title="Không có lịch đặt bàn" />
      ) : (
        <>
          <Table>
            <thead>
              <tr><Th>Mã</Th><Th>Khách</Th><Th>Thời gian</Th><Th>Số khách</Th><Th>Khu vực</Th><Th>Ghi chú</Th><Th>Trạng thái</Th><Th /></tr>
            </thead>
            <tbody>
              {data.data.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <Td className="font-mono">{r.code}</Td>
                  <Td><p className="font-medium">{r.name}</p><a href={`tel:${r.phone}`} className="text-xs text-ocean-600">{r.phone}</a></Td>
                  <Td className="whitespace-nowrap">{formatDateTime(r.date)}</Td>
                  <Td className="text-center">{r.guests}</Td>
                  <Td>{r.area || '-'}</Td>
                  <Td className="max-w-48 truncate text-slate-500" title={r.note}>{r.note || '-'}</Td>
                  <Td><StatusBadge map={RESERVATION_STATUS} value={r.status} /></Td>
                  <Td className="whitespace-nowrap">
                    <div className="flex gap-1">
                      {ACTIONS[r.status]?.map(([s, label, variant]) => (
                        <Button key={s} size="sm" variant={variant} onClick={() => update.mutate({ id: r.id, status: s })}>{label}</Button>
                      ))}
                    </div>
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
