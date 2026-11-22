import { keepPreviousData, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Banknote, CircleCheck, CircleX, FileClock, Timer, Wrench } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '../../../components/PageHeader';
import Badge from '../../../components/ui/Badge';
import { EmptyState, ErrorState, Pagination, Spinner } from '../../../components/ui/Feedback';
import { Field, Input, Select } from '../../../components/ui/Form';
import { formatDuration, formatPrice } from '../../../lib/format';
import { useDocumentTitle } from '../../../lib/hooks';
import { maintenanceApi } from '../../../services';
import { useAuthStore } from '../../../stores/auth';

const ymd = (d) => dayjs(d).format('YYYY-MM-DD');
const dayLabel = (d) => {
  const s = dayjs(d).format('dddd, DD/MM/YYYY');
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// Lịch sử sửa chữa: phiếu đã xong + các lần bảo trì định kỳ, kèm chi phí
export default function MaintenanceHistory() {
  useDocumentTitle('Kỹ thuật - Lịch sử sửa chữa');
  const me = useAuthStore((s) => s.user);
  // Mặc định 30 ngày gần nhất (hàm khởi tạo chỉ chạy 1 lần khi mở trang)
  const [filter, setFilter] = useState(() => ({ from: ymd(dayjs().subtract(29, 'day')), to: ymd(dayjs()), type: '', userId: '', equipmentId: '', status: 'DONE', page: 1 }));
  const set = (patch) => setFilter((f) => ({ ...f, page: 1, ...patch }));

  const params = Object.fromEntries(Object.entries(filter).filter(([, v]) => v !== ''));
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['maintenance', 'history', params],
    queryFn: () => maintenanceApi.history(params),
    placeholderData: keepPreviousData,
  });
  const { data: staff = [] } = useQuery({ queryKey: ['maintenance', 'staff'], queryFn: maintenanceApi.staff, staleTime: 5 * 60 * 1000 });
  const { data: equipment = [] } = useQuery({ queryKey: ['maintenance', 'equipment', false], queryFn: () => maintenanceApi.equipment() });

  const groups = [];
  for (const t of data?.data ?? []) {
    const key = ymd(t.completedAt);
    if (groups.at(-1)?.key !== key) groups.push({ key, items: [] });
    groups.at(-1).items.push(t);
  }
  const cancelled = filter.status === 'CANCELLED';

  return (
    <>
      <PageHeader title="Lịch sử sửa chữa" subtitle="Phiếu đã sửa xong và các lần bảo trì định kỳ, mới nhất ở trên" />

      <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Field label="Từ ngày"><Input type="date" value={filter.from} max={filter.to} onChange={(e) => e.target.value && set({ from: e.target.value })} /></Field>
        <Field label="Đến ngày"><Input type="date" value={filter.to} min={filter.from} onChange={(e) => e.target.value && set({ to: e.target.value })} /></Field>
        <Field label="Loại">
          <Select value={filter.type} onChange={(e) => set({ type: e.target.value })}>
            <option value="">Tất cả</option>
            <option value="REPAIR">Sửa chữa</option>
            <option value="MAINTENANCE">Bảo trì định kỳ</option>
          </Select>
        </Field>
        <Field label="Người sửa">
          <Select value={filter.userId} onChange={(e) => set({ userId: e.target.value })}>
            <option value="">Tất cả</option>
            {me && <option value={me.id}>Của tôi</option>}
            {staff.filter((u) => u.id !== me?.id).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </Select>
        </Field>
        <Field label="Thiết bị">
          <Select value={filter.equipmentId} onChange={(e) => set({ equipmentId: e.target.value })}>
            <option value="">Mọi thiết bị</option>
            {equipment.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </Select>
        </Field>
        <Field label="Trạng thái">
          <Select value={filter.status} onChange={(e) => set({ status: e.target.value })}>
            <option value="DONE">Đã xong</option>
            <option value="CANCELLED">Đã hủy</option>
          </Select>
        </Field>
      </div>

      {isLoading ? <Spinner /> : error ? <ErrorState error={error} onRetry={refetch} /> : (
        <>
          {/* Tổng số phiếu + chi phí trong khoảng ngày đang lọc */}
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold">Tổng {data.meta.total} phiếu {cancelled ? 'đã hủy' : 'đã xong'}</span>
            {!cancelled && <Badge color="coral"><Banknote className="mr-1 h-3.5 w-3.5" /> Chi phí {formatPrice(data.meta.totalCost)}</Badge>}
            {!cancelled && data.meta.byUser.map((r) => (
              <Badge key={r.user?.id ?? 0} color={r.user?.id === me?.id ? 'blue' : 'slate'}>
                {r.user?.name ?? 'Không rõ'}: {r.count} phiếu{r.cost ? ` · ${formatPrice(r.cost)}` : ''}
              </Badge>
            ))}
          </div>

          {groups.length === 0 ? (
            <EmptyState icon={FileClock} title="Chưa có phiếu nào" description="Thử chọn khoảng ngày khác hoặc bỏ bớt bộ lọc." />
          ) : (
            <div className="space-y-5">
              {groups.map((g) => (
                <section key={g.key}>
                  <h2 className="mb-2 text-sm font-semibold text-slate-600">{dayLabel(g.key)}</h2>
                  <ul className="card divide-y divide-slate-100">
                    {g.items.map((t) => {
                      // Sửa chữa: tính từ lúc báo tới lúc xong (khách / nhân viên phải chờ bao lâu)
                      const took = t.type === 'REPAIR' ? formatDuration(t.createdAt, t.completedAt) : null;
                      return (
                        <li key={t.id} className="flex gap-3 px-4 py-3 text-sm">
                          <span className="w-12 shrink-0 pt-0.5 font-mono text-xs text-slate-500">{dayjs(t.completedAt).format('HH:mm')}</span>
                          {cancelled ? <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> : <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium break-words">
                              {t.title}
                              {t.type === 'MAINTENANCE' && <Badge color="cyan" className="ml-1.5">Bảo trì</Badge>}
                              {t.priority === 'URGENT' && <Badge color="red" className="ml-1.5">Gấp</Badge>}
                            </p>
                            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><Wrench className="h-3 w-3" /> {t.equipment.name}</span>
                              {!cancelled && <span>{t.assignee ? (t.assignee.id === me?.id ? 'Bạn sửa' : t.assignee.name) : 'Không rõ người sửa'}</span>}
                              {took && <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> xử lý trong {took}</span>}
                              {t.type === 'REPAIR' && t.reportedBy && <span>{t.reportedBy.name} báo</span>}
                            </p>
                            {t.resolution && <p className="mt-1 text-xs break-words text-slate-600">{cancelled ? 'Lý do hủy: ' : 'Cách xử lý: '}{t.resolution}</p>}
                          </div>
                          {t.cost > 0 && <span className="shrink-0 text-sm font-semibold text-coral-700">{formatPrice(t.cost)}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
          <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={(page) => setFilter((f) => ({ ...f, page }))} />
        </>
      )}
    </>
  );
}
