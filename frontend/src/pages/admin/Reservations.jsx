import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { LayoutGrid, List } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import PageHeader from '../../components/PageHeader';
import TableMap, { TableLegend } from '../../components/TableMap';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState, Pagination, Spinner } from '../../components/ui/Feedback';
import { Field, Input, Select, Textarea } from '../../components/ui/Form';
import Modal from '../../components/ui/Modal';
import { Table, Td, Th } from '../../components/ui/Table';
import { RESERVATION_STATUS } from '../../lib/constants';
import { formatDateTime } from '../../lib/format';
import { useDocumentTitle, useInfo } from '../../lib/hooks';
import { useCan } from '../../lib/permissions';
import { timeSlots, toVnIso } from '../../lib/reservation';
import { reservationApi } from '../../services';

// Hành động hợp lệ cho từng trạng thái
const ACTIONS = {
  PENDING: [['CONFIRMED', 'Xác nhận', 'primary'], ['CANCELLED', 'Hủy', 'outline']],
  CONFIRMED: [['COMPLETED', 'Khách đã đến', 'primary'], ['CANCELLED', 'Hủy', 'outline']],
};

// Lý do hủy có sẵn để bấm nhanh; "Lý do khác" thì tự gõ
const CANCEL_REASONS = ['Hết bàn vào khung giờ này', 'Nhà hàng có sự kiện / đóng cửa', 'Không liên lạc được với khách'];
const OTHER = 'Lý do khác';

// ---------- Hộp thoại hủy lịch: bắt buộc chọn / nhập lý do để khách biết mà đặt lại ----------
function CancelDialog({ reservation, loading, onClose, onConfirm }) {
  const [choice, setChoice] = useState('');
  const [text, setText] = useState('');
  const reason = (choice === OTHER ? text : choice).trim();

  return (
    <Modal
      open
      onClose={onClose}
      title={`Hủy lịch ${reservation.code}`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Đóng</Button>
          <Button variant="danger" disabled={!reason} loading={loading} onClick={() => onConfirm(reason)}>Hủy lịch</Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-slate-600">
        {reservation.name} · {formatDateTime(reservation.date)} · {reservation.guests} khách.
        Lý do sẽ hiện cho khách xem để đặt lại ngày giờ khác.
      </p>
      <div className="flex flex-wrap gap-2">
        {[...CANCEL_REASONS, OTHER].map((r) => (
          <button key={r} type="button" onClick={() => setChoice(r)}
            className={clsx('rounded-full border px-3 py-1.5 text-sm', choice === r ? 'border-ocean-900 bg-ocean-900 text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-100')}>
            {r}
          </button>
        ))}
      </div>
      {choice === OTHER && (
        <Field label="Lý do" className="mt-4" required>
          <Textarea autoFocus maxLength={300} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ghi lý do cho khách..." />
        </Field>
      )}
    </Modal>
  );
}

// Giờ gần nhất trong danh sách khung giờ (để sơ đồ mở ra đúng lúc đang phục vụ)
function nearestSlot(slots) {
  const now = dayjs().format('HH:mm');
  return [...slots].reverse().find((t) => t <= now) ?? slots[0];
}

// ---------- Sơ đồ bàn: xem bàn trống / đã có khách tại 1 thời điểm ----------
function TableMapView({ update, onAction }) {
  const can = useCan();
  const { data: info } = useInfo();
  const slots = timeSlots(info?.openingHours.open, info?.openingHours.close);
  const [day, setDay] = useState(dayjs().format('YYYY-MM-DD'));
  const [time, setTime] = useState(() => nearestSlot(slots));
  const [selected, setSelected] = useState(null);
  const when = toVnIso(day, time);
  const { data, isLoading } = useQuery({
    queryKey: ['table-map', when],
    queryFn: () => reservationApi.tables(when),
    refetchInterval: 30000,
  });

  const count = (tables, ...st) => tables.filter((t) => st.includes(t.status)).length;
  const all = data?.areas.flatMap((a) => a.tables) ?? [];
  const r = selected?.reservation;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input type="date" value={day} onChange={(e) => e.target.value && setDay(e.target.value)} className="w-44" />
        <Select value={time} onChange={(e) => setTime(e.target.value)} className="w-28">
          {slots.map((t) => <option key={t}>{t}</option>)}
        </Select>
        <Button variant="ghost" onClick={() => { setDay(dayjs().format('YYYY-MM-DD')); setTime(nearestSlot(slots)); }}>Bây giờ</Button>
        {data && (
          <p className="ml-auto text-sm text-slate-600">
            Trống <b className="text-green-700">{count(all, 'free')}</b> · Chờ xác nhận <b className="text-amber-600">{count(all, 'pending')}</b> · Có khách <b className="text-red-600">{count(all, 'occupied')}</b> / {all.length} bàn
          </p>
        )}
      </div>
      <div className="mb-4"><TableLegend keys={['free', 'pending', 'occupied', 'inactive']} /></div>
      <p className="mb-4 text-xs text-slate-500">Mỗi lượt đặt giữ bàn {data?.diningMinutes ?? 120} phút. Bấm vào bàn để xem khách đã đặt.</p>

      {isLoading ? <Spinner /> : (
        <div className="grid gap-6 xl:grid-cols-2">
          {data.areas.map((a) => (
            <div key={a.name} className={clsx(a.tables.length <= 4 && 'xl:col-span-2')}>
              <h3 className="mb-2 flex items-baseline justify-between font-semibold">
                {a.name}
                <span className="text-xs font-normal text-slate-500">trống {count(a.tables, 'free')}/{a.tables.length}</span>
              </h3>
              <TableMap area={a} selectBusy onSelect={setSelected} />
            </div>
          ))}
        </div>
      )}

      {selected && (
        <Modal open onClose={() => setSelected(null)} title={`Bàn ${selected.code} · ${selected.seats} ghế`} size="sm">
          {!r ? (
            <p className="text-slate-600">{selected.status === 'inactive' ? 'Bàn đang tạm ngưng phục vụ.' : `Bàn trống lúc ${time} ngày ${dayjs(day).format('DD/MM')}.`}</p>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono">{r.code}</span>
                <StatusBadge map={RESERVATION_STATUS} value={r.status} />
              </div>
              <p className="text-base font-semibold">{r.name}</p>
              <p><a href={`tel:${r.phone}`} className="text-ocean-600">{r.phone}</a></p>
              <p>{formatDateTime(r.date)} · {r.guests} khách</p>
              {can('RESERVATIONS', 'edit') && ACTIONS[r.status] && (
                <div className="flex gap-2 border-t border-slate-100 pt-3">
                  {ACTIONS[r.status].map(([s, label, variant]) => (
                    <Button key={s} size="sm" variant={variant} loading={update.isPending}
                      onClick={() => onAction(r, s, () => setSelected(null))}>{label}</Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

export default function Reservations() {
  useDocumentTitle('Quản trị - Đặt bàn');
  const [filters, setFilters] = useState({ status: '', date: '', search: '', page: 1 });
  const qc = useQueryClient();
  const can = useCan();

  const query = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reservations', query],
    queryFn: () => reservationApi.list(query),
    placeholderData: keepPreviousData,
  });

  const update = useMutation({
    mutationFn: ({ id, status, reason }) => reservationApi.updateStatus(id, status, reason),
    onSuccess: () => {
      toast.success('Đã cập nhật');
      qc.invalidateQueries({ queryKey: ['admin-reservations'] });
      qc.invalidateQueries({ queryKey: ['table-map'] });
    },
    onError: (e) => toast.error(e.message),
  });

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: k === 'page' ? v : 1 }));
  const [view, setView] = useState('list'); // 'list' | 'map'
  const [cancelling, setCancelling] = useState(null); // lịch đang mở hộp thoại hủy

  // Bấm nút hành động: Hủy thì mở hộp thoại hỏi lý do, còn lại cập nhật luôn
  const onAction = (r, status, onDone) => {
    if (status === 'CANCELLED') {
      onDone?.();
      setCancelling(r);
    } else {
      update.mutate({ id: r.id, status }, { onSuccess: onDone });
    }
  };

  return (
    <>
      <PageHeader
        title="Đặt bàn"
        subtitle="Quản lý lịch đặt bàn của khách"
        actions={
          <div className="flex rounded-xl border border-slate-300 bg-white p-0.5">
            {[['list', 'Danh sách', List], ['map', 'Sơ đồ bàn', LayoutGrid]].map(([key, label, Icon]) => (
              <button key={key} onClick={() => setView(key)}
                className={clsx('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium', view === key ? 'bg-ocean-900 text-white' : 'text-slate-600 hover:bg-slate-100')}>
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
        }
      />

      {cancelling && (
        <CancelDialog
          reservation={cancelling}
          loading={update.isPending}
          onClose={() => setCancelling(null)}
          onConfirm={(reason) => update.mutate({ id: cancelling.id, status: 'CANCELLED', reason }, { onSuccess: () => setCancelling(null) })}
        />
      )}

      {view === 'map' ? <TableMapView update={update} onAction={onAction} /> : (<>

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
              <tr><Th>Mã</Th><Th>Khách</Th><Th>Thời gian</Th><Th>Số khách</Th><Th>Khu vực / Bàn</Th><Th>Ghi chú</Th><Th>Trạng thái</Th><Th /></tr>
            </thead>
            <tbody>
              {data.data.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <Td className="font-mono">{r.code}</Td>
                  <Td><p className="font-medium">{r.name}</p><a href={`tel:${r.phone}`} className="text-xs text-ocean-600">{r.phone}</a></Td>
                  <Td className="whitespace-nowrap">{formatDateTime(r.date)}</Td>
                  <Td className="text-center">{r.guests}</Td>
                  <Td>{r.area || '-'}{r.table && <p className="text-xs font-semibold text-ocean-700">Bàn {r.table.code}</p>}</Td>
                  <Td className="max-w-48 truncate text-slate-500" title={r.note}>{r.note || '-'}</Td>
                  <Td>
                    <StatusBadge map={RESERVATION_STATUS} value={r.status} />
                    {r.cancelReason && <p className="mt-1 max-w-48 text-xs text-red-600" title={r.cancelReason}>Lý do: {r.cancelReason}</p>}
                  </Td>
                  <Td className="whitespace-nowrap">
                    <div className="flex gap-1">
                      {can('RESERVATIONS', 'edit') && ACTIONS[r.status]?.map(([s, label, variant]) => (
                        <Button key={s} size="sm" variant={variant} onClick={() => onAction(r, s)}>{label}</Button>
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
      </>)}
    </>
  );
}
