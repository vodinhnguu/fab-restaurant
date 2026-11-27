import { useQuery } from '@tanstack/react-query';
import { Ban, CalendarDays, Clock, Receipt, TrendingUp, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../../components/PageHeader';
import { StatusBadge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Feedback';
import { Select } from '../../components/ui/Form';
import { ORDER_STATUS, ORDER_TYPE, orderStatusMap } from '../../lib/constants';
import { formatCompactPrice, formatPrice, fromNow } from '../../lib/format';
import { useDocumentTitle } from '../../lib/hooks';
import { statsApi } from '../../services';

const SERIES = '#1f7aa3'; // ocean-500 - 1 chuỗi dữ liệu nên chỉ dùng 1 màu
const short = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}tr` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : n);

function StatCard({ icon: Icon, label, value, sub, to }) {
  const content = (
    <div className="card flex items-start gap-4 p-5 transition hover:shadow-md">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ocean-50 text-ocean-600">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 truncate text-2xl font-bold text-slate-900">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-slate-800">{label}</p>
      <p className="text-slate-600">Doanh thu: <b>{formatPrice(p.revenue)}</b></p>
      <p className="text-slate-600">Số đơn: <b>{p.orders}</b></p>
    </div>
  );
}

export default function Dashboard() {
  useDocumentTitle('Quản trị - Tổng quan');
  const [days, setDays] = useState(30);
  const { data, isLoading } = useQuery({ queryKey: ['stats', days], queryFn: () => statsApi.overview(days) });
  const { data: mgr } = useQuery({ queryKey: ['stats-manager'], queryFn: () => statsApi.manager() });

  if (isLoading) return <Spinner />;

  const chartData = data.revenueByDay.map((d) => ({ ...d, label: d.day.slice(8, 10) + '/' + d.day.slice(5, 7) }));

  return (
    <>
      <PageHeader
        title="Tổng quan"
        subtitle="Tình hình kinh doanh của nhà hàng"
        actions={
          <Select value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-40">
            <option value={7}>7 ngày qua</option>
            <option value={30}>30 ngày qua</option>
            <option value={90}>90 ngày qua</option>
          </Select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wallet} label="Doanh thu" value={formatCompactPrice(data.totalRevenue)} sub={`${formatPrice(data.totalRevenue)} · ${data.completedOrders} đơn hoàn thành (online + tại quán)`} />
        <StatCard icon={Receipt} label="Tổng đơn hàng" value={data.orderCount} sub={`${days} ngày qua`} to="/admin/orders" />
        <StatCard icon={Clock} label="Đơn chờ xác nhận" value={data.pendingOrders} sub="Cần xử lý ngay" to="/admin/orders?status=PENDING" />
        <StatCard icon={CalendarDays} label="Đặt bàn hôm nay" value={data.todayReservations} sub={`${data.customerCount} khách hàng đã đăng ký`} to="/admin/reservations" />
      </div>

      {mgr && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">Doanh thu hôm nay</h2>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatCompactPrice(mgr.today.revenue)}</p>
            <p className="mt-1 text-sm text-slate-500">{formatPrice(mgr.today.revenue)}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-xs text-slate-400">Tại quán</p>
                <p className="font-semibold">{formatCompactPrice(mgr.today.dineIn.revenue)}</p>
                <p className="text-xs text-slate-400">{mgr.today.dineIn.orders} đơn</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-xs text-slate-400">Online</p>
                <p className="font-semibold">{formatCompactPrice(mgr.today.online.revenue)}</p>
                <p className="text-xs text-slate-400">{mgr.today.online.orders} đơn</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">TB/đơn: {formatPrice(mgr.today.avgPerOrder)}</p>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Wallet className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">Doanh thu tháng này</h2>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatCompactPrice(mgr.month.revenue)}</p>
            <p className="mt-1 text-sm text-slate-500">{formatPrice(mgr.month.revenue)}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-xs text-slate-400">Tại quán</p>
                <p className="font-semibold">{formatCompactPrice(mgr.month.dineIn.revenue)}</p>
                <p className="text-xs text-slate-400">{mgr.month.dineIn.orders} đơn</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-xs text-slate-400">Online</p>
                <p className="font-semibold">{formatCompactPrice(mgr.month.online.revenue)}</p>
                <p className="text-xs text-slate-400">{mgr.month.online.orders} đơn</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">TB/đơn: {formatPrice(mgr.month.avgPerOrder)}</p>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600">
                <Ban className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">Đơn / món đã hủy</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase">Hôm nay</p>
                <div className="mt-1 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-lg bg-red-50 p-2.5 text-center">
                    <p className="text-lg font-bold text-red-600">{mgr.cancelled.today.orders}</p>
                    <p className="text-xs text-slate-500">đơn hủy</p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-2.5 text-center">
                    <p className="text-lg font-bold text-red-600">{mgr.cancelled.today.items}</p>
                    <p className="text-xs text-slate-500">món hủy</p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-2.5 text-center">
                    <p className="text-sm font-bold text-red-600">{formatCompactPrice(mgr.cancelled.today.amount)}</p>
                    <p className="text-xs text-slate-500">giá trị</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase">Tháng này</p>
                <div className="mt-1 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                    <p className="text-lg font-bold text-slate-700">{mgr.cancelled.month.orders}</p>
                    <p className="text-xs text-slate-500">đơn hủy</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                    <p className="text-lg font-bold text-slate-700">{mgr.cancelled.month.items}</p>
                    <p className="text-xs text-slate-500">món hủy</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                    <p className="text-sm font-bold text-slate-700">{formatCompactPrice(mgr.cancelled.month.amount)}</p>
                    <p className="text-xs text-slate-500">giá trị</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <h2 className="font-semibold">Doanh thu theo ngày</h2>
          <p className="text-xs text-slate-500">Chỉ tính đơn đã hoàn thành</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SERIES} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={SERIES} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} minTickGap={16} />
                <YAxis tickFormatter={short} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} width={48} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#94a3b8', strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="revenue" stroke={SERIES} strokeWidth={2} fill="url(#rev)" activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold">Món bán chạy</h2>
          <p className="text-xs text-slate-500">Số lượng bán ra, {days} ngày qua</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topDishes} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: '#334155' }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(v) => [`${v} phần`, 'Đã bán']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="quantity" fill={SERIES} radius={[0, 4, 4, 0]} barSize={18} label={{ position: 'right', fontSize: 11, fill: '#334155' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-4">
        <div className="card p-5">
          <h2 className="font-semibold">Doanh thu theo kênh</h2>
          <p className="text-xs text-slate-500">Đơn hoàn thành, {days} ngày qua</p>
          <ul className="mt-4 space-y-4">
            {data.revenueByType.map((t) => {
              const percent = data.totalRevenue > 0 ? Math.round((t.revenue / data.totalRevenue) * 100) : 0;
              return (
                <li key={t.type}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm text-slate-600">{ORDER_TYPE[t.type]}</span>
                    <span className="font-semibold whitespace-nowrap">{formatCompactPrice(t.revenue)}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-ocean-500" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{percent}% · {t.orders} đơn</p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-semibold">Đơn theo trạng thái</h2>
          <ul className="space-y-3">
            {Object.keys(ORDER_STATUS).map((s) => {
              const count = data.ordersByStatus.find((x) => x.status === s)?.count ?? 0;
              return (
                <li key={s} className="flex items-center justify-between">
                  <StatusBadge map={ORDER_STATUS} value={s} />
                  <span className="font-semibold">{count}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Đơn hàng mới nhất</h2>
            <Link to="/admin/orders" className="text-sm text-ocean-600 hover:underline">Xem tất cả</Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {data.recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-mono font-medium">{o.code}</p>
                  <p className="text-xs text-slate-500">{o.customerName} · {fromNow(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatPrice(o.total)}</span>
                  {/* Đơn ăn tại quán dùng chữ riêng: "Đã lên món" thay cho "Đang giao" */}
                  <StatusBadge map={orderStatusMap(o.type)} value={o.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
