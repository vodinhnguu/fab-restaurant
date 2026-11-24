import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { ArrowDownToLine, Fish, Minus, Plus, ScanLine, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import PageHeader from '../../../components/PageHeader';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { EmptyState, ErrorState, Spinner } from '../../../components/ui/Feedback';
import { Field, Input, Select, Textarea } from '../../../components/ui/Form';
import Modal from '../../../components/ui/Modal';
import { TANK_ENTRY_TYPE } from '../../../lib/constants';
import { formatKg, formatPrice, fromNow } from '../../../lib/format';
import { useDocumentTitle } from '../../../lib/hooks';
import { useCan } from '../../../lib/permissions';
import { tankApi } from '../../../services';

// Tồn hồ hải sản (docs/27-ton-ho-hai-san.md): hồ nuôi 6 loại hải sản sống bán theo kg.
// Trang này trả lời 3 câu: NHẬP bao nhiêu · BÁN bao nhiêu · CÒN LẠI bao nhiêu.
//
//   Nhập hàng  (+kg, có giá nhập)  : xe hàng về
//   Kiểm hồ    (±kg)               : cân / đếm thực tế, hệ thống ghi phần lệch
//   Hao hụt    (−kg, bắt buộc lý do): hải sản chết, thất thoát
//   Bán / Trả lại hồ               : TỰ ĐỘNG khi phục vụ nhập số kg ở app (hoặc hủy món đã cân)
//
// Quyền: Xem = vào trang (hồ hải sản, bếp, quản lý, tổ trưởng, phục vụ - để tư vấn khách còn hàng không);
//        Sửa = ghi 3 loại phiếu trên; Thêm = thêm loại; Xóa = tắt / bật loại.

// Gõ "1,5" hay "1.5" đều được
const parseKg = (text) => {
  const n = Number(String(text).replace(',', '.').trim());
  return Number.isFinite(n) ? n : null;
};

export default function Tank() {
  useDocumentTitle('Tồn hồ hải sản');
  const can = useCan();
  const canEdit = can('SEAFOOD_TANK', 'edit');
  const canCreate = can('SEAFOOD_TANK', 'create');
  const canDisable = can('SEAFOOD_TANK', 'delete');
  const qc = useQueryClient();
  const [showOff, setShowOff] = useState(false);
  const [sheet, setSheet] = useState(null); // { kind: 'import' | 'audit' | 'loss' | 'new', item }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tank', { all: showOff }],
    queryFn: () => tankApi.list(showOff),
    refetchInterval: 30000, // phục vụ cân ở hồ làm tồn đổi liên tục
  });

  const done = (res) => {
    toast.success(res.message);
    qc.invalidateQueries({ queryKey: ['tank'] });
    setSheet(null);
  };
  const failed = (e) => toast.error(e.message);
  const importStock = useMutation({ mutationFn: tankApi.import, onSuccess: done, onError: failed });
  const audit = useMutation({ mutationFn: tankApi.audit, onSuccess: done, onError: failed });
  const loss = useMutation({ mutationFn: tankApi.loss, onSuccess: done, onError: failed });
  const create = useMutation({ mutationFn: tankApi.create, onSuccess: done, onError: failed });
  const setActive = useMutation({
    mutationFn: tankApi.setActive,
    onSuccess: (res) => {
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: ['tank'] });
    },
    onError: failed,
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const active = data.filter((i) => i.isActive);
  const totalStock = active.reduce((s, i) => s + i.stockKg, 0);
  const todaySold = active.reduce((s, i) => s + i.today.sold, 0);
  const todayImported = active.reduce((s, i) => s + i.today.imported, 0);
  const lowItems = active.filter((i) => i.isLow);

  return (
    <>
      <PageHeader
        title="Tồn hồ hải sản"
        subtitle={`${active.length} loại · còn ${formatKg(totalStock)} · hôm nay nhập ${formatKg(todayImported)}, bán ${formatKg(todaySold)}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setShowOff((v) => !v)}>
              {showOff ? 'Chỉ loại đang nuôi' : 'Hiện cả loại đã tắt'}
            </Button>
            {canCreate && (
              <Button onClick={() => setSheet({ kind: 'new' })}>
                <Plus size={16} /> Thêm loại
              </Button>
            )}
          </div>
        }
      />

      {lowItems.length > 0 && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <TriangleAlert size={18} className="mt-0.5 shrink-0" />
          <p>
            <b>Cần nhập hàng:</b>{' '}
            {lowItems.map((i) => `${i.name} (còn ${formatKg(i.stockKg)})`).join(', ')}. Phục vụ vẫn ghi món được, nhưng
            nên báo bếp và hồ để khỏi hứa với khách rồi không có hàng.
          </p>
        </div>
      )}

      {data.length === 0 ? (
        <EmptyState
          icon={Fish}
          title="Hồ chưa có loại hải sản nào"
          description="Chạy lệnh npm --prefix backend run db:seed-tank để tạo 6 loại mặc định, hoặc bấm Thêm loại."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((item) => (
            <TankCard
              key={item.id}
              item={item}
              canEdit={canEdit}
              canDisable={canDisable}
              onAction={(kind) => setSheet({ kind, item })}
              onToggle={() => setActive.mutate({ id: item.id, isActive: !item.isActive })}
              toggling={setActive.isPending}
            />
          ))}
        </div>
      )}

      <EntryTable />

      <ImportModal
        open={sheet?.kind === 'import'}
        item={sheet?.item}
        pending={importStock.isPending}
        onClose={() => setSheet(null)}
        onSubmit={(body) => importStock.mutate({ id: sheet.item.id, ...body })}
      />
      <AuditModal
        open={sheet?.kind === 'audit'}
        item={sheet?.item}
        pending={audit.isPending}
        onClose={() => setSheet(null)}
        onSubmit={(body) => audit.mutate({ id: sheet.item.id, ...body })}
      />
      <LossModal
        open={sheet?.kind === 'loss'}
        item={sheet?.item}
        pending={loss.isPending}
        onClose={() => setSheet(null)}
        onSubmit={(body) => loss.mutate({ id: sheet.item.id, ...body })}
      />
      <NewItemModal
        open={sheet?.kind === 'new'}
        pending={create.isPending}
        onClose={() => setSheet(null)}
        onSubmit={(body) => create.mutate(body)}
      />
    </>
  );
}

/** 1 loại hải sản: còn lại bao nhiêu + hôm nay nhập / bán / hao hụt + 3 nút ghi phiếu. */
function TankCard({ item, canEdit, canDisable, onAction, onToggle, toggling }) {
  return (
    <div className={clsx('card p-4', !item.isActive && 'opacity-60', item.isActive && item.isEmpty && 'ring-2 ring-red-200')}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-ocean-900">{item.name}</h3>
          <p className="text-xs text-slate-500">{item.dishCount} món trên thực đơn</p>
        </div>
        {!item.isActive ? (
          <Badge color="slate">Đã tắt</Badge>
        ) : item.isEmpty ? (
          <Badge color="red">Hết hàng</Badge>
        ) : item.isLow ? (
          <Badge color="amber">Gần hết</Badge>
        ) : (
          <Badge color="green">Còn hàng</Badge>
        )}
      </div>

      <p className="mt-3 text-3xl font-extrabold text-ocean-900">{formatKg(item.stockKg)}</p>
      <p className="text-xs text-slate-500">còn lại trong hồ · báo "gần hết" khi dưới {formatKg(item.lowStockKg)}</p>

      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center text-sm">
        <div>
          <dt className="text-xs text-slate-500">Nhập hôm nay</dt>
          <dd className="font-bold text-green-700">+{formatKg(item.today.imported)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Bán hôm nay</dt>
          <dd className="font-bold text-ocean-700">−{formatKg(item.today.sold)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Hao hụt</dt>
          <dd className={clsx('font-bold', item.today.lost > 0 ? 'text-red-600' : 'text-slate-400')}>
            −{formatKg(item.today.lost)}
          </dd>
        </div>
      </dl>

      {item.note && <p className="mt-3 text-xs text-slate-500">{item.note}</p>}

      {(canEdit || canDisable) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {canEdit && item.isActive && (
            <>
              <Button size="sm" onClick={() => onAction('import')}>
                <ArrowDownToLine size={15} /> Nhập hàng
              </Button>
              <Button size="sm" variant="outline" onClick={() => onAction('audit')}>
                <ScanLine size={15} /> Kiểm hồ
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onAction('loss')}>
                <Minus size={15} /> Hao hụt
              </Button>
            </>
          )}
          {canDisable && (
            <Button size="sm" variant="ghost" disabled={toggling} onClick={onToggle}>
              {item.isActive ? 'Tắt loại' : 'Bật lại'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/** Sổ nhập - xuất: lọc theo loại phiếu / ngày, mới nhất lên đầu. */
function EntryTable() {
  const [type, setType] = useState('');
  const [date, setDate] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['tank', 'entries', { type, date }],
    queryFn: () => tankApi.entries({ type: type || undefined, date: date || undefined, limit: 30 }),
  });
  const rows = data?.data ?? [];

  return (
    <section className="mt-10">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-lg font-bold">Sổ nhập - xuất hồ</h2>
        <Select value={type} onChange={(e) => setType(e.target.value)} className="w-auto">
          <option value="">Mọi loại phiếu</option>
          {Object.entries(TANK_ENTRY_TYPE).map(([key, t]) => (
            <option key={key} value={key}>
              {t.label}
            </option>
          ))}
        </Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
        {date && (
          <Button variant="ghost" size="sm" onClick={() => setDate('')}>
            Mọi ngày
          </Button>
        )}
      </div>

      {isLoading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-500">Chưa có phiếu nào. Nhập hàng hoặc để phục vụ cân món là sổ có dòng.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">Lúc</th>
                <th className="p-3">Loại hải sản</th>
                <th className="p-3">Phiếu</th>
                <th className="p-3 text-right">Số kg</th>
                <th className="p-3 text-right">Còn lại</th>
                <th className="p-3">Ghi chú</th>
                <th className="p-3">Người ghi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const t = TANK_ENTRY_TYPE[e.type] ?? { label: e.type, color: 'slate' };
                return (
                  <tr key={e.id} className="border-b border-slate-50 last:border-0">
                    <td className="p-3 whitespace-nowrap text-slate-500">
                      {dayjs(e.createdAt).format('HH:mm DD/MM')}
                      <span className="ml-1 text-xs">({fromNow(e.createdAt)})</span>
                    </td>
                    <td className="p-3 font-semibold">{e.tankItem.name}</td>
                    <td className="p-3">
                      <Badge color={t.color}>{t.label}</Badge>
                    </td>
                    <td className={clsx('p-3 text-right font-bold', e.deltaKg >= 0 ? 'text-green-700' : 'text-red-600')}>
                      {e.deltaKg >= 0 ? '+' : '−'}
                      {formatKg(Math.abs(e.deltaKg))}
                    </td>
                    <td className="p-3 text-right text-slate-600">{formatKg(e.stockAfter)}</td>
                    <td className="p-3 text-slate-600">
                      {e.order && (
                        <span className="mr-1">
                          Bàn {e.order.table?.code ?? '?'} · {e.order.code}
                        </span>
                      )}
                      {e.unitCost ? <span className="mr-1">Giá nhập {formatPrice(e.unitCost)}/kg.</span> : null}
                      {e.supplier ? <span className="mr-1">{e.supplier}.</span> : null}
                      {e.note}
                    </td>
                    <td className="p-3 text-slate-500">{e.user?.name ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** Nhập hàng: xe hàng về. Kèm giá nhập để biết tiền hàng. */
function ImportModal({ open, item, pending, onClose, onSubmit }) {
  const [kg, setKg] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [supplier, setSupplier] = useState('');
  const [note, setNote] = useState('');
  const n = parseKg(kg);
  const cost = Number(String(unitCost).replace(/\D/g, ''));

  // Mở modal cho loại khác thì xóa số cũ
  const key = `${open}-${item?.id}`;
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    setKg('');
    setUnitCost('');
    setSupplier('');
    setNote('');
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Nhập hàng · ${item?.name ?? ''}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button
            disabled={pending || !n || n <= 0}
            onClick={() => onSubmit({ kg: n, unitCost: cost || null, supplier: supplier || null, note: note || null })}
          >
            {pending ? 'Đang lưu...' : 'Nhập vào hồ'}
          </Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-slate-600">
        Tồn đang có <b>{formatKg(item?.stockKg ?? 0)}</b>. Nhập xong tồn thành{' '}
        <b>{formatKg((item?.stockKg ?? 0) + (n || 0))}</b>.
      </p>
      <Field label="Số kg nhập" required hint='Gõ "12" hoặc "12,5"'>
        <Input autoFocus value={kg} onChange={(e) => setKg(e.target.value)} placeholder="12,5" inputMode="decimal" />
      </Field>
      <Field label="Giá nhập 1 kg (VNĐ)" hint={cost ? `Tiền hàng: ${formatPrice(cost * (n || 0))}` : 'Không bắt buộc'}>
        <Input value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="1200000" inputMode="numeric" />
      </Field>
      <Field label="Nhà cung cấp / xe hàng">
        <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Vựa Sông Cầu" />
      </Field>
      <Field label="Ghi chú">
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Cỡ 1,2 kg/con, hàng tươi" />
      </Field>
    </Modal>
  );
}

/** Kiểm hồ: nhập số kg đếm / cân thực tế, hệ thống ghi phần lệch. */
function AuditModal({ open, item, pending, onClose, onSubmit }) {
  const [actual, setActual] = useState('');
  const [note, setNote] = useState('');
  const n = parseKg(actual);
  const diff = n == null ? null : Math.round((n - (item?.stockKg ?? 0)) * 1000) / 1000;

  const key = `${open}-${item?.id}`;
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    setActual('');
    setNote('');
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Kiểm hồ · ${item?.name ?? ''}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button disabled={pending || n == null || n < 0} onClick={() => onSubmit({ actualKg: n, note: note || null })}>
            {pending ? 'Đang lưu...' : 'Lưu số kiểm'}
          </Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-slate-600">
        Sổ đang ghi <b>{formatKg(item?.stockKg ?? 0)}</b>. Cân / đếm thực tế trong hồ rồi nhập số đúng vào đây.
      </p>
      <Field label="Số kg đếm được" required hint="Hồ hết loại này thì gõ 0">
        <Input autoFocus value={actual} onChange={(e) => setActual(e.target.value)} placeholder="8,5" inputMode="decimal" />
      </Field>
      {diff != null && diff !== 0 && (
        <p className={clsx('mb-3 text-sm font-semibold', diff > 0 ? 'text-green-700' : 'text-red-600')}>
          {diff > 0 ? `Thừa ${formatKg(diff)} so với sổ` : `Thiếu ${formatKg(Math.abs(diff))} so với sổ`} — sẽ ghi 1 phiếu
          Kiểm hồ.
        </p>
      )}
      {diff === 0 && <p className="mb-3 text-sm text-slate-500">Khớp với sổ, không cần ghi phiếu.</p>}
      <Field label="Ghi chú">
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Cân lại cả hồ cuối ngày" />
      </Field>
    </Modal>
  );
}

/** Hao hụt: hải sản chết / thất thoát. Bắt buộc lý do. */
function LossModal({ open, item, pending, onClose, onSubmit }) {
  const [kg, setKg] = useState('');
  const [note, setNote] = useState('');
  const n = parseKg(kg);

  const key = `${open}-${item?.id}`;
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    setKg('');
    setNote('');
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Hao hụt · ${item?.name ?? ''}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="danger"
            disabled={pending || !n || n <= 0 || note.trim().length < 3}
            onClick={() => onSubmit({ kg: n, note: note.trim() })}
          >
            {pending ? 'Đang lưu...' : 'Ghi hao hụt'}
          </Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-slate-600">
        Hải sản chết hoặc mất. Tồn đang có <b>{formatKg(item?.stockKg ?? 0)}</b>, ghi xong còn{' '}
        <b>{formatKg(Math.max(0, (item?.stockKg ?? 0) - (n || 0)))}</b>.
      </p>
      <Field label="Số kg hao hụt" required>
        <Input autoFocus value={kg} onChange={(e) => setKg(e.target.value)} placeholder="0,8" inputMode="decimal" />
      </Field>
      <Field label="Lý do" required hint="Bắt buộc, để quản lý đối chiếu cuối ngày">
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="1 con tôm hùm chết sáng nay" />
      </Field>
    </Modal>
  );
}

/** Thêm loại hải sản mới vào hồ (tồn ban đầu 0, nhập hàng sau). */
function NewItemModal({ open, pending, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [low, setLow] = useState('2');
  const [note, setNote] = useState('');

  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    setName('');
    setLow('2');
    setNote('');
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Thêm loại hải sản vào hồ"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button
            disabled={pending || name.trim().length < 2}
            onClick={() => onSubmit({ name: name.trim(), lowStockKg: parseKg(low) ?? 2, note: note || null })}
          >
            {pending ? 'Đang lưu...' : 'Thêm loại'}
          </Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-slate-600">
        Loại mới có tồn 0 kg. Muốn món trên thực đơn trừ đúng loại này thì khai báo thêm trong{' '}
        <code>backend/src/config/tank.js</code> rồi chạy <code>db:seed-tank</code>.
      </p>
      <Field label="Tên loại" required>
        <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Ốc hương" />
      </Field>
      <Field label='Ngưỡng "gần hết" (kg)' hint="Còn ít hơn số này thì trang báo cần nhập hàng">
        <Input value={low} onChange={(e) => setLow(e.target.value)} inputMode="decimal" />
      </Field>
      <Field label="Ghi chú">
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ốc hương sống, cỡ 25 con/kg" />
      </Field>
    </Modal>
  );
}
