import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { CircleCheck, ClipboardList, Clock, MapPinned, Plus, Sparkles, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import TaskCard from '../../../components/cleaning/TaskCard';
import TaskFormModal from '../../../components/cleaning/TaskFormModal';
import PageHeader from '../../../components/PageHeader';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { ErrorState, Spinner } from '../../../components/ui/Feedback';
import { fromNow } from '../../../lib/format';
import { useDocumentTitle } from '../../../lib/hooks';
import { useCan } from '../../../lib/permissions';
import { cleaningApi } from '../../../services';

function StatCard({ icon: Icon, label, value, sub, to, tone = 'ocean' }) {
  const tones = { ocean: 'bg-ocean-50 text-ocean-600', red: 'bg-red-50 text-red-600', green: 'bg-green-50 text-green-600', amber: 'bg-amber-50 text-amber-600' };
  return (
    <Link to={to} className="card flex items-start gap-4 p-5 transition hover:shadow-md">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
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

// Tổng quan công việc vệ sinh hôm nay (trang đầu tiên của tạp vụ)
export default function CleaningOverview() {
  useDocumentTitle('Vệ sinh - Tổng quan');
  const can = useCan();
  const [adding, setAdding] = useState(false);
  // Tự tải lại mỗi 30 giây: phục vụ / lễ tân vừa báo cần dọn thì tạp vụ thấy ngay
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['cleaning', 'overview'], queryFn: cleaningApi.overview, refetchInterval: 30000 });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  const c = data.counts;
  const open = c.todo + c.inProgress;

  return (
    <>
      <PageHeader
        title="Tổng quan"
        subtitle={`Công việc vệ sinh hôm nay, ${dayjs().format('DD/MM/YYYY')}`}
        actions={can('CLEANING', 'create') && <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Thêm việc</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={UserRound} label="Việc của tôi" value={c.mine} sub={`Hôm nay bạn đã xong ${c.myDoneToday} việc`} to="/admin/cleaning/tasks?mine=true" />
        <StatCard icon={ClipboardList} label="Việc đang chờ" value={open} tone={c.urgent ? 'red' : 'ocean'}
          sub={[c.urgent && `${c.urgent} việc gấp`, c.unassigned && `${c.unassigned} chưa ai nhận`, c.inProgress && `${c.inProgress} đang làm`].filter(Boolean).join(' · ') || 'Không còn việc nào'}
          to="/admin/cleaning/tasks" />
        <StatCard icon={MapPinned} label="Khu vực cần dọn" value={`${c.dirtyAreas} / ${c.areas}`} tone={c.dirtyAreas ? 'amber' : 'green'}
          sub={data.staleAreas.length ? `${data.staleAreas.length} khu quá ${data.staleHours} tiếng chưa dọn` : 'Các khu đều mới được dọn'} to="/admin/cleaning/areas" />
        <StatCard icon={CircleCheck} label="Đã xong hôm nay" value={c.doneToday} tone="green" sub="Cả nhóm tạp vụ" to="/admin/cleaning/history" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title="Việc gấp" link={{ to: '/admin/cleaning/tasks', label: 'Xem tất cả việc' }}>
            {data.urgentTasks.length ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{data.urgentTasks.map((t) => <TaskCard key={t.id} task={t} />)}</div>
            ) : <Empty>Không có việc gấp.</Empty>}
          </Section>

          <Section title="Việc của tôi" link={c.mine > data.myTasks.length && { to: '/admin/cleaning/tasks?mine=true', label: `Xem cả ${c.mine} việc` }}>
            {data.myTasks.length ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{data.myTasks.map((t) => <TaskCard key={t.id} task={t} />)}</div>
            ) : <Empty>Chưa có việc nào giao cho bạn. Xem <Link to="/admin/cleaning/tasks" className="text-ocean-600 hover:underline">việc đang chờ</Link> để nhận.</Empty>}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Khu vực cần dọn" link={{ to: '/admin/cleaning/areas', label: 'Xem sơ đồ' }}>
            <div className="card divide-y divide-slate-100">
              {data.dirtyAreas.map((a) => (
                <Link key={a.id} to="/admin/cleaning/areas" className="flex items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-slate-50">
                  <span className="font-medium">{a.name}</span>
                  <span className="flex items-center gap-1.5">
                    {a.urgent && <Badge color="red">Gấp</Badge>}
                    <Badge color="amber">{a.openCount} việc</Badge>
                  </span>
                </Link>
              ))}
              {!data.dirtyAreas.length && (
                <p className="flex items-center gap-2 px-4 py-4 text-sm text-green-700"><Sparkles className="h-4 w-4" /> Không khu nào đang báo cần dọn</p>
              )}
            </div>
          </Section>

          {data.staleAreas.length > 0 && (
            <Section title={`Lâu chưa dọn (quá ${data.staleHours} tiếng)`}>
              <div className="card divide-y divide-slate-100">
                {data.staleAreas.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
                    <span>{a.name}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" /> {a.lastCleanedAt ? fromNow(a.lastCleanedAt) : 'Chưa dọn lần nào'}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="Hôm nay đã làm" link={{ to: '/admin/cleaning/history', label: 'Lịch sử' }}>
            <div className="card p-4">
              {data.doneTodayByUser.length ? (
                <ul className="space-y-2 text-sm">
                  {data.doneTodayByUser.map((r) => (
                    <li key={r.user?.id ?? 0} className="flex justify-between">
                      <span>{r.user?.name ?? 'Không rõ'}</span>
                      <span className="font-semibold">{r.count} việc</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-slate-500">Hôm nay chưa có việc nào xong.</p>}
              {data.recentDone.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  {data.recentDone.map((t) => (
                    <li key={t.id} className="flex justify-between gap-2">
                      <span className="truncate"><CircleCheck className="mr-1 inline h-3.5 w-3.5 text-green-600" />{t.title} · {t.area.name}</span>
                      <span className="shrink-0">{dayjs(t.completedAt).format('HH:mm')}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Section>
        </div>
      </div>

      {adding && <TaskFormModal onClose={() => setAdding(false)} />}
    </>
  );
}
