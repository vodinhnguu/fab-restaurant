import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { CalendarClock, CircleCheck, Plus, Refrigerator, UserRound, Wrench } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import TicketActionDialog from '../../../components/maintenance/TicketActionDialog';
import TicketCard from '../../../components/maintenance/TicketCard';
import TicketFormModal from '../../../components/maintenance/TicketFormModal';
import PageHeader from '../../../components/PageHeader';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { ErrorState, Spinner } from '../../../components/ui/Feedback';
import { formatCompactPrice, formatDate } from '../../../lib/format';
import { useDocumentTitle } from '../../../lib/hooks';
import { maintenanceApi } from '../../../services';

function StatCard({ icon: Icon, label, value, sub, to, tone = 'ocean' }) {
  const tones = { ocean: 'bg-ocean-50 text-ocean-600', red: 'bg-red-50 text-red-600', green: 'bg-green-50 text-green-600', amber: 'bg-amber-50 text-amber-600' };
  return (
    <Link to={to} className="card flex items-start gap-4 p-5 transition hover:shadow-md">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
      </div>
    </Link>
  );
}

function Section({ title, link, children }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        {link && <Link to={link.to} className="text-sm text-ocean-600 hover:underline">{link.label}</Link>}
      </div>
      {children}
    </section>
  );
}

const Empty = ({ children }) => <p className="card px-4 py-6 text-center text-sm text-slate-500">{children}</p>;
const Cards = ({ list }) => <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{list.map((t) => <TicketCard key={t.id} ticket={t} />)}</div>;

// Tổng quan kỹ thuật (trang đầu của nhân viên kỹ thuật)
export default function MaintenanceOverview() {
  useDocumentTitle('Kỹ thuật - Tổng quan');
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [maintaining, setMaintaining] = useState(null); // thiết bị đang ghi bảo trì
  // Tự tải lại mỗi 30 giây: nhân viên vừa báo hỏng là kỹ thuật thấy ngay
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['maintenance', 'overview'], queryFn: maintenanceApi.overview, refetchInterval: 30000 });

  const maintain = useMutation({
    mutationFn: ({ id, ...body }) => maintenanceApi.maintain(id, body),
    onSuccess: (res) => { toast.success(res.message); setMaintaining(null); qc.invalidateQueries({ queryKey: ['maintenance'] }); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  const c = data.counts;
  const active = c.open + c.inProgress + c.waiting;

  return (
    <>
      <PageHeader
        title="Tổng quan"
        subtitle={`Thiết bị & sửa chữa, ${dayjs().format('DD/MM/YYYY')}`}
        actions={<Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Tạo phiếu</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={UserRound} label="Phiếu của tôi" value={c.mine} sub={`Cả tổ hôm nay sửa xong ${c.doneToday} phiếu`} to="/admin/maintenance/tickets?tab=mine" />
        <StatCard icon={Wrench} label="Phiếu đang mở" value={active} tone={c.urgent ? 'red' : 'ocean'}
          sub={[c.urgent && `${c.urgent} gấp`, c.open && `${c.open} chưa ai nhận`, c.waiting && `${c.waiting} chờ linh kiện`].filter(Boolean).join(' · ') || 'Không có sự cố'}
          to="/admin/maintenance/tickets" />
        <StatCard icon={Refrigerator} label="Thiết bị cần chú ý" value={`${c.broken + c.overdue} / ${c.equipment}`} tone={c.broken || c.overdue ? 'amber' : 'green'}
          sub={`${c.broken} có sự cố · ${c.overdue} quá hạn bảo trì · ${c.dueSoon} sắp đến hạn`} to="/admin/maintenance/equipment" />
        <StatCard icon={CircleCheck} label="Xong tháng này" value={c.doneMonth} tone="green" sub={`Chi phí ${formatCompactPrice(c.costMonth)}`} to="/admin/maintenance/history" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title="Phiếu gấp" link={{ to: '/admin/maintenance/tickets', label: 'Xem tất cả phiếu' }}>
            {data.urgentTickets.length ? <Cards list={data.urgentTickets} /> : <Empty>Không có sự cố gấp.</Empty>}
          </Section>
          <Section title="Phiếu của tôi">
            {data.myTickets.length ? <Cards list={data.myTickets} /> : <Empty>Bạn chưa nhận phiếu nào.</Empty>}
          </Section>
          {data.newTickets.length > 0 && (
            <Section title="Mới báo, chưa ai nhận">
              <Cards list={data.newTickets} />
            </Section>
          )}
        </div>

        <div className="space-y-6">
          <Section title="Bảo trì đến hạn" link={{ to: '/admin/maintenance/equipment?filter=due', label: 'Xem thiết bị' }}>
            <div className="card divide-y divide-slate-100">
              {data.maintenanceDue.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">{e.name}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      <CalendarClock className="h-3.5 w-3.5" /> Hạn {formatDate(e.nextDueAt)}
                      <Badge color={e.maintenance === 'overdue' ? 'red' : 'amber'} className="ml-1">
                        {e.daysLeft < 0 ? `Quá ${-e.daysLeft} ngày` : e.daysLeft === 0 ? 'Hôm nay' : `Còn ${e.daysLeft} ngày`}
                      </Badge>
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setMaintaining(e)}>Đã bảo trì</Button>
                </div>
              ))}
              {!data.maintenanceDue.length && <p className="px-4 py-4 text-sm text-green-700">Không thiết bị nào đến hạn trong {data.dueSoonDays} ngày tới.</p>}
            </div>
          </Section>

          <Section title="Vừa sửa xong" link={{ to: '/admin/maintenance/history', label: 'Lịch sử' }}>
            <div className="card divide-y divide-slate-100">
              {data.recentDone.map((t) => (
                <div key={t.id} className="px-4 py-3 text-sm">
                  <p className="flex items-start justify-between gap-2">
                    <span><CircleCheck className="mr-1 inline h-3.5 w-3.5 text-green-600" />{t.title}</span>
                    <span className="shrink-0 text-xs text-slate-500">{dayjs(t.completedAt).format('HH:mm DD/MM')}</span>
                  </p>
                  <p className="text-xs text-slate-500">{t.equipment.name} · {t.assignee?.name}{t.cost ? ` · ${formatCompactPrice(t.cost)}` : ''}</p>
                </div>
              ))}
              {!data.recentDone.length && <p className="px-4 py-4 text-sm text-slate-500">Tháng này chưa có phiếu nào xong.</p>}
            </div>
          </Section>
        </div>
      </div>

      {adding && <TicketFormModal title="Tạo phiếu sửa chữa" onClose={() => setAdding(false)} />}
      {maintaining && (
        <TicketActionDialog
          mode="maintain"
          title={`Bảo trì: ${maintaining.name}`}
          description="Ghi lại lần bảo trì định kỳ vào lịch sử, hạn bảo trì tiếp theo được tính lại từ hôm nay."
          openTickets={maintaining.openTickets}
          loading={maintain.isPending}
          onClose={() => setMaintaining(null)}
          onConfirm={(body) => maintain.mutate({ id: maintaining.id, ...body })}
        />
      )}
    </>
  );
}
