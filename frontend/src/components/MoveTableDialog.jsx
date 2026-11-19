import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { ArrowRight, History } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatDateTime } from '../lib/format';
import { reservationApi } from '../services';
import TableMap, { TableLegend } from './TableMap';
import Button from './ui/Button';
import { Spinner } from './ui/Feedback';
import { Input } from './ui/Form';
import Modal from './ui/Modal';

// Lý do hay gặp để bấm nhanh (không bắt buộc, chỉ nhân viên xem)
const REASONS = ['Khách muốn đổi chỗ', 'Khách muốn ngồi view biển', 'Thêm khách, cần bàn lớn hơn', 'Bàn cũ hỏng / chưa dọn xong', 'Nhường bàn cho đoàn đông'];

// Lễ tân chuyển bàn (lịch đã có bàn) hoặc xếp bàn (lịch chưa có bàn). Tài liệu: docs/21-le-tan-chuyen-ban.md
// - Sơ đồ mở đúng giờ khách đến: bàn hiện tại tô tím, bàn trống đủ ghế mới bấm được
// - reservation: { id, code, name, date, guests, table?, area?, tableChanges? }
export default function MoveTableDialog({ reservation: r, onClose }) {
  const qc = useQueryClient();
  const [target, setTarget] = useState(null); // bàn mới đang chọn (kèm tên khu vực)
  const [reason, setReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['table-map', r.date],
    queryFn: () => reservationApi.tables(r.date),
    refetchInterval: 30000,
  });

  const move = useMutation({
    mutationFn: () => reservationApi.moveTable(r.id, target.id, reason.trim() || null),
    onSuccess: (res) => {
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: ['admin-reservations'] });
      qc.invalidateQueries({ queryKey: ['table-map'] });
      onClose();
    },
    onError: (e) => {
      toast.error(e.message);
      setTarget(null);
      qc.invalidateQueries({ queryKey: ['table-map'] }); // bàn vừa bị người khác lấy -> tải lại sơ đồ
    },
  });

  const verb = r.table ? 'Chuyển bàn' : 'Xếp bàn';

  return (
    <Modal
      open
      onClose={onClose}
      title={`${verb} · ${r.code}`}
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Đóng</Button>
          <Button disabled={!target} loading={move.isPending} onClick={() => move.mutate()}>
            {target ? `${verb} sang ${target.code}` : 'Chọn bàn mới trên sơ đồ'}
          </Button>
        </>
      }
    >
      <div className="mb-4 rounded-xl bg-slate-50 p-3 text-sm">
        <p><b>{r.name}</b> · {formatDateTime(r.date)} · {r.guests} khách</p>
        <p className="mt-1 flex flex-wrap items-center gap-2">
          {r.table ? <span className="font-semibold text-violet-700">Bàn {r.table.code} · {r.table.area}</span> : <span className="text-amber-700">Chưa có bàn{r.area ? ` (khách muốn: ${r.area})` : ''}</span>}
          {target && (
            <>
              <ArrowRight className="h-4 w-4 text-slate-400" />
              <span className="font-semibold text-ocean-700">Bàn {target.code} · {target.area} · {target.seats} ghế</span>
            </>
          )}
        </p>
      </div>

      <div className="mb-3"><TableLegend keys={['current', 'selected', 'free', 'pending', 'occupied', 'small']} /></div>
      <p className="mb-4 text-xs text-slate-500">Trạng thái bàn tính đúng giờ khách đến (mỗi lượt giữ bàn {data?.diningMinutes ?? 120} phút). Chỉ bấm được bàn trống đủ ghế.</p>

      {isLoading ? <Spinner /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.areas.map((a) => (
            <div key={a.name} className={clsx(a.tables.length <= 4 && 'lg:col-span-2')}>
              <h3 className="mb-2 text-sm font-semibold">{a.name}</h3>
              <TableMap
                area={a}
                guests={r.guests}
                currentId={r.table?.id}
                selectedId={target?.id}
                onSelect={(t) => setTarget(target?.id === t.id ? null : { ...t, area: a.name })}
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-5">
        <p className="mb-1.5 text-sm font-medium text-slate-700">Lý do (không bắt buộc, khách không thấy)</p>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {REASONS.map((x) => (
            <button key={x} type="button" onClick={() => setReason(reason === x ? '' : x)}
              className={clsx('rounded-full border px-2.5 py-1 text-xs', reason === x ? 'border-ocean-900 bg-ocean-900 text-white' : 'border-slate-300 text-slate-600 hover:bg-slate-100')}>
              {x}
            </button>
          ))}
        </div>
        <Input value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} placeholder="Hoặc tự ghi lý do..." />
      </div>

      {r.tableChanges?.length > 0 && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700"><History className="h-4 w-4" /> Lịch sử chuyển bàn</p>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {r.tableChanges.map((c) => (
              <li key={c.id}>
                <span className="text-slate-400">{formatDateTime(c.createdAt)}</span> · {c.fromTableCode ? `${c.fromTableCode} → ${c.toTableCode}` : `Xếp bàn ${c.toTableCode}`}
                {c.changedBy && ` · ${c.changedBy.name}`}{c.reason && ` · ${c.reason}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}
