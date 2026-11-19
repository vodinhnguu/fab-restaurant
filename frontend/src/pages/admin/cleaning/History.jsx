import { keepPreviousData, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { CircleCheck, CircleX, History as HistoryIcon, MapPin, Timer } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '../../../components/PageHeader';
import Badge from '../../../components/ui/Badge';
import { EmptyState, ErrorState, Pagination, Spinner } from '../../../components/ui/Feedback';
import { Field, Input, Select } from '../../../components/ui/Form';
import { formatDuration } from '../../../lib/format';
import { useDocumentTitle } from '../../../lib/hooks';
import { cleaningApi } from '../../../services';
import { useAuthStore } from '../../../stores/auth';

const ymd = (d) => dayjs(d).format('YYYY-MM-DD');
// "thứ tư, 19/11/2026" -> "Thứ tư, 19/11/2026"
const dayLabel = (d) => {
  const s = dayjs(d).format('dddd, DD/MM/YYYY');
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// Lịch sử công việc: việc đã xong (hoặc đã hủy), lọc theo ngày / người làm / khu vực
export default function CleaningHistory() {
  useDocumentTitle('Vệ sinh - Lịch sử công việc');
  const me = useAuthStore((s) => s.user);
  // Mặc định 7 ngày gần nhất (hàm khởi tạo chỉ chạy 1 lần khi mở trang)
  const [filter, setFilter] = useState(() => ({ from: ymd(dayjs().subtract(6, 'day')), to: ymd(dayjs()), userId: '', areaId: '', status: 'DONE', page: 1 }));
  const set = (patch) => setFilter((f) => ({ ...f, page: 1, ...patch }));

  const params = Object.fromEntries(Object.entries(filter).filter(([, v]) => v !== ''));
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['cleaning', 'history', params],
    queryFn: () => cleaningApi.history(params),
    placeholderData: keepPreviousData,
  });
  const { data: staff = [] } = useQuery({ queryKey: ['cleaning', 'staff'], queryFn: cleaningApi.staff, staleTime: 5 * 60 * 1000 });
  const { data: areas = [] } = useQuery({ queryKey: ['cleaning', 'areas', false], queryFn: () => cleaningApi.areas() });

  // Gom theo ngày hoàn thành để dễ đọc
  const groups = [];
  for (const t of data?.data ?? []) {
    const key = ymd(t.completedAt);
    if (groups.at(-1)?.key !== key) groups.push({ key, items: [] });
    groups.at(-1).items.push(t);
  }
  const cancelled = filter.status === 'CANCELLED';

  return (
    <>
      <PageHeader title="Lịch sử công việc" subtitle="Việc vệ sinh đã làm xong, mới nhất ở trên" />

      <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Từ ngày"><Input type="date" value={filter.from} max={filter.to} onChange={(e) => e.target.value && set({ from: e.target.value })} /></Field>
        <Field label="Đến ngày"><Input type="date" value={filter.to} min={filter.from} onChange={(e) => e.target.value && set({ to: e.target.value })} /></Field>
        <Field label="Người làm">
          <Select value={filter.userId} onChange={(e) => set({ userId: e.target.value })}>
            <option value="">Tất cả</option>
            {me && <option value={me.id}>Của tôi</option>}
            {staff.filter((u) => u.id !== me?.id).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </Select>
        </Field>
        <Field label="Khu vực">
          <Select value={filter.areaId} onChange={(e) => set({ areaId: e.target.value })}>
            <option value="">Mọi khu vực</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
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
          {/* Tổng số việc theo người trong khoảng ngày đang lọc */}
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold">Tổng {data.meta.total} việc {cancelled ? 'đã hủy' : 'đã xong'}</span>
            {!cancelled && data.meta.byUser.map((r) => (
              <Badge key={r.user?.id ?? 0} color={r.user?.id === me?.id ? 'blue' : 'slate'}>{r.user?.name ?? 'Không rõ'}: {r.count}</Badge>
            ))}
          </div>

          {groups.length === 0 ? (
            <EmptyState icon={HistoryIcon} title="Chưa có việc nào" description="Thử chọn khoảng ngày khác hoặc bỏ bớt bộ lọc." />
          ) : (
            <div className="space-y-5">
              {groups.map((g) => (
                <section key={g.key}>
                  <h2 className="mb-2 text-sm font-semibold text-slate-600">{dayLabel(g.key)}</h2>
                  <ul className="card divide-y divide-slate-100">
                    {g.items.map((t) => {
                      const took = formatDuration(t.startedAt, t.completedAt);
                      return (
                        <li key={t.id} className="flex gap-3 px-4 py-3 text-sm">
                          <span className="w-12 shrink-0 pt-0.5 font-mono text-xs text-slate-500">{dayjs(t.completedAt).format('HH:mm')}</span>
                          {cancelled ? <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> : <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium break-words">
                              {t.title} {t.priority === 'URGENT' && <Badge color="red" className="ml-1">Gấp</Badge>}
                            </p>
                            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {t.area.name}</span>
                              {!cancelled && <span>{t.assignee ? (t.assignee.id === me?.id ? 'Bạn làm' : t.assignee.name) : 'Không rõ người làm'}</span>}
                              {took && <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> {took}</span>}
                              {t.createdBy && t.createdBy.id !== t.assigneeId && <span>{t.createdBy.name} báo / giao</span>}
                            </p>
                            {t.resultNote && <p className="mt-1 text-xs break-words text-slate-600">{cancelled ? 'Lý do hủy: ' : 'Ghi chú: '}{t.resultNote}</p>}
                          </div>
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
