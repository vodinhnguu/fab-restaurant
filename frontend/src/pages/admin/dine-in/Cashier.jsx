import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { BanknoteIcon, BellRing, CreditCard, HandCoins, Minus, Plus, Printer, Search, TriangleAlert, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { isWeighedLine, lineAmount, mergeBillItems, openBillPrint, waitingCount, weighingCount } from '../../../components/dine-in/bill';
import { DINE_IN_REFRESH_MS } from '../../../components/dine-in/useDineInAlerts';
import PageHeader from '../../../components/PageHeader';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { EmptyState, ErrorState, Spinner } from '../../../components/ui/Feedback';
import { Input } from '../../../components/ui/Form';
import Modal from '../../../components/ui/Modal';
import { DINE_IN_ITEM_STATUS } from '../../../lib/constants';
import { formatDuration, formatKg, formatPrice, fromNow } from '../../../lib/format';
import { useDocumentTitle } from '../../../lib/hooks';
import { useCan } from '../../../lib/permissions';
import { dineInApi, dishApi } from '../../../services';

// Thanh toán tại bàn (thu ngân). Tài liệu: docs/23-app-nhan-vien-phuc-vu.md
// Phục vụ bấm "Gửi thanh toán" trên app -> bàn hiện ở mục "Chờ thanh toán" + chuông + số đỏ trên menu.
// Thu ngân bấm vào bàn -> xem chi tiết bill, chỉnh số lượng, thêm món -> chọn Tiền mặt / Thẻ -> "Đã thu tiền".
export default function Cashier() {
  useDocumentTitle('Thanh toán tại bàn');
  const can = useCan();
  const qc = useQueryClient();
  const [reviewing, setReviewing] = useState(null);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dine-in', 'bills'],
    queryFn: dineInApi.bills,
    refetchInterval: DINE_IN_REFRESH_MS,
  });

  const refreshAndUpdate = useCallback((orderId) => {
    qc.invalidateQueries({ queryKey: ['dine-in'] });
    if (reviewing?.id === orderId) {
      dineInApi.bill(orderId).then(setReviewing).catch(() => {});
    }
  }, [qc, reviewing]);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const requested = data.filter((o) => o.billRequestedAt);
  const eating = data.filter((o) => !o.billRequestedAt);
  const canPay = can('PAYMENTS', 'edit');

  return (
    <>
      <PageHeader title="Thanh toán tại bàn" subtitle="Bàn phục vụ gửi thanh toán từ app · tự cập nhật mỗi 10 giây" />

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-semibold">
          <BellRing className="h-5 w-5 text-coral-500" /> Chờ thanh toán
          {requested.length > 0 && <Badge color="coral">{requested.length} bàn</Badge>}
        </h2>
        {requested.length === 0 ? (
          <p className="card px-4 py-6 text-center text-sm text-slate-500">Chưa có bàn nào gửi thanh toán. Có bàn gửi là trang báo bằng chuông.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {requested.map((o) => <BillCard key={o.id} order={o} highlight onReview={setReviewing} />)}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-semibold">Bàn đang ăn ({eating.length})</h2>
        {eating.length === 0 ? (
          <EmptyState icon={HandCoins} title="Không có bàn nào đang ăn" />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {eating.map((o) => <BillCard key={o.id} order={o} onReview={setReviewing} />)}
          </div>
        )}
      </section>

      {reviewing && (
        <BillReviewModal
          order={reviewing}
          canPay={canPay}
          onClose={() => setReviewing(null)}
          onUpdate={refreshAndUpdate}
        />
      )}
    </>
  );
}

function BillCard({ order, highlight, onReview }) {
  const lines = mergeBillItems(order.items);
  const waiting = waitingCount(order.items);
  const shown = lines.slice(0, 5);

  return (
    <div
      className={clsx('card flex cursor-pointer flex-col p-4 transition hover:shadow-md', highlight && 'bg-coral-50/40 ring-2 ring-coral-400')}
      onClick={() => onReview(order)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-bold">Bàn {order.table?.code}</p>
          <p className="text-sm text-slate-500">{order.table?.area} · {order.staff?.name ?? 'Phục vụ'}</p>
        </div>
        <p className="text-xl font-bold text-coral-600">{formatPrice(order.total)}</p>
      </div>

      <p className="mt-1 text-sm text-slate-500">
        {highlight
          ? <>Gửi thanh toán <b className="text-coral-700">{fromNow(order.billRequestedAt)}</b> ({dayjs(order.billRequestedAt).format('HH:mm')})</>
          : <>Mở bàn {dayjs(order.createdAt).format('HH:mm')} · đã ngồi {formatDuration(order.createdAt, dayjs())}</>}
      </p>

      <ul className="mt-3 flex-1 space-y-1 text-sm">
        {shown.map((l) => (
          <li key={l.key} className="flex justify-between gap-2">
            <span className="min-w-0 truncate">
              <b>{l.byWeight ? (l.weight != null ? formatKg(l.weight) : 'Chờ cân') : `${l.quantity}×`}</b> {l.name}
              {l.weighing && l.weight != null && <span className="text-cyan-700"> (tạm, chờ cân)</span>}
            </span>
            <span className="shrink-0 text-slate-600">{l.byWeight && l.weight == null ? '—' : formatPrice(l.amount)}</span>
          </li>
        ))}
        {lines.length > shown.length && <li className="text-slate-400">… và {lines.length - shown.length} món khác</li>}
      </ul>

      <div className="mt-3 flex flex-wrap gap-2">
        {weighingCount(order.items) > 0 && <Badge color="cyan">Còn {weighingCount(order.items)} món chờ cân</Badge>}
        {waiting > 0 && <Badge color="amber">Còn {waiting} phần chưa lên</Badge>}
        {order.billPrintedAt && <Badge color="green">Đã in {dayjs(order.billPrintedAt).format('HH:mm')}</Badge>}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={(e) => { e.stopPropagation(); openBillPrint(order.id); }}><Printer className="h-4 w-4" /> In bill</Button>
        <Button variant={highlight ? 'primary' : 'dark'} onClick={(e) => { e.stopPropagation(); onReview(order); }}>
          <HandCoins className="h-4 w-4" /> Xem bill
        </Button>
      </div>
    </div>
  );
}

// Modal chi tiết bill: danh sách món, chỉnh số lượng, thêm món, chọn hình thức thanh toán
function BillReviewModal({ order, canPay, onClose, onUpdate }) {
  const qc = useQueryClient();
  const [method, setMethod] = useState('COD');
  const [addingDish, setAddingDish] = useState(false);

  const liveItems = order.items.filter((i) => i.status !== 'CANCELLED');
  const liveTotal = liveItems.reduce((s, i) => s + lineAmount(i), 0);
  const waiting = waitingCount(order.items);

  const adjust = useMutation({
    mutationFn: ({ itemId, quantity }) => dineInApi.adjustItem(order.id, itemId, { quantity }),
    onSuccess: (res) => { toast.success(res.message); onUpdate(order.id); },
    onError: (e) => toast.error(e.message),
  });

  const addItems = useMutation({
    mutationFn: (items) => dineInApi.addBillItems(order.id, items),
    onSuccess: (res) => { toast.success(res.message); setAddingDish(false); onUpdate(order.id); },
    onError: (e) => toast.error(e.message),
  });

  const pay = useMutation({
    mutationFn: () => dineInApi.pay(order.id, { paymentMethod: method }),
    onSuccess: (res) => { toast.success(res.message); onClose(); qc.invalidateQueries({ queryKey: ['dine-in'] }); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`Bill bàn ${order.table?.code} — ${order.table?.area}`}
      footer={
        canPay && (
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Thanh toán:</span>
              <button
                onClick={() => setMethod('COD')}
                className={clsx('flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition',
                  method === 'COD' ? 'border-ocean-500 bg-ocean-50 text-ocean-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}
              >
                <BanknoteIcon className="h-4 w-4" /> Tiền mặt
              </button>
              <button
                onClick={() => setMethod('CARD')}
                className={clsx('flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition',
                  method === 'CARD' ? 'border-ocean-500 bg-ocean-50 text-ocean-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}
              >
                <CreditCard className="h-4 w-4" /> Thẻ
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => openBillPrint(order.id)}><Printer className="h-4 w-4" /> In bill</Button>
              <Button loading={pay.isPending} onClick={() => pay.mutate()}>
                <HandCoins className="h-4 w-4" /> Đã thu {formatPrice(liveTotal)}
              </Button>
            </div>
          </div>
        )
      }
    >
      <div className="space-y-4">
        {/* Thông tin đơn */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          <span>Mã đơn: <b className="font-mono text-slate-700">{order.code}</b></span>
          <span>Phục vụ: <b className="text-slate-700">{order.staff?.name ?? '—'}</b></span>
          <span>Mở bàn: <b className="text-slate-700">{dayjs(order.createdAt).format('HH:mm')}</b></span>
          {order.billRequestedAt && <span>Gửi TT: <b className="text-coral-700">{dayjs(order.billRequestedAt).format('HH:mm')}</b></span>}
        </div>

        {/* Cảnh báo */}
        {waiting > 0 && (
          <p className="flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <TriangleAlert className="h-4 w-4 shrink-0 mt-0.5" /> Còn {waiting} phần chưa mang ra bàn.
          </p>
        )}

        {/* Bảng món */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Món</th>
                <th className="px-3 py-2 text-center font-medium">SL</th>
                <th className="px-3 py-2 text-right font-medium">Đơn giá</th>
                <th className="px-3 py-2 text-right font-medium">Thành tiền</th>
                <th className="px-3 py-2 font-medium">TT</th>
                {canPay && <th className="px-3 py-2 text-center font-medium w-24">Sửa</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item) => {
                const cancelled = item.status === 'CANCELLED';
                const weighted = isWeighedLine(item);
                const status = DINE_IN_ITEM_STATUS[item.status];
                return (
                  <tr key={item.id} className={clsx(cancelled && 'bg-slate-50 text-slate-400 line-through')}>
                    <td className="px-3 py-2">
                      <span className="font-medium">{item.name}</span>
                      {item.note && <p className="text-xs text-slate-400 italic">{item.note}</p>}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {weighted ? (item.weight != null ? formatKg(item.weight) : 'Chờ cân') : item.quantity}
                    </td>
                    <td className="px-3 py-2 text-right">{formatPrice(item.price)}{weighted ? '/kg' : ''}</td>
                    <td className="px-3 py-2 text-right font-semibold">{cancelled ? '—' : formatPrice(lineAmount(item))}</td>
                    <td className="px-3 py-2">
                      {status && <Badge color={status.color} className="text-xs">{status.label}</Badge>}
                    </td>
                    {canPay && (
                      <td className="px-3 py-2 text-center">
                        {!cancelled && !weighted && (
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => adjust.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                              disabled={adjust.isPending}
                              className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              title={item.quantity === 1 ? 'Xóa món' : 'Giảm 1'}
                            >
                              {item.quantity === 1 ? <X className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                            </button>
                            <span className="w-6 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => adjust.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                              disabled={adjust.isPending}
                              className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-green-50 hover:text-green-600 disabled:opacity-50"
                              title="Tăng 1"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-semibold">
                <td colSpan={3} className="px-3 py-2 text-right">Tổng cộng</td>
                <td className="px-3 py-2 text-right text-lg text-coral-600">{formatPrice(liveTotal)}</td>
                <td colSpan={canPay ? 2 : 1} />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Nút thêm món */}
        {canPay && (
          addingDish
            ? <AddDishPanel onAdd={(items) => addItems.mutate(items)} loading={addItems.isPending} onCancel={() => setAddingDish(false)} />
            : <Button variant="outline" size="sm" onClick={() => setAddingDish(true)}><Plus className="h-4 w-4" /> Thêm món (bia, nước...)</Button>
        )}
      </div>
    </Modal>
  );
}

// Panel tìm và thêm món vào bill
function AddDishPanel({ onAdd, loading, onCancel }) {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const { data: dishes } = useQuery({
    queryKey: ['dishes', 'cashier-search'],
    queryFn: () => dishApi.list({ limit: 200 }),
    staleTime: 60_000,
  });

  const filtered = (dishes?.data ?? []).filter((d) =>
    d.isAvailable && d.unit !== 'kg' && d.name.toLowerCase().includes(search.toLowerCase()),
  ).slice(0, 12);

  const toggle = (dish) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.dishId === dish.id);
      if (idx >= 0) {
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      }
      return [...prev, { dishId: dish.id, name: dish.name, price: dish.salePrice ?? dish.price, quantity: 1 }];
    });
  };

  const changeQty = (dishId, qty) => {
    setCart((prev) => prev.map((c) => (c.dishId === dishId ? { ...c, quantity: Math.max(1, qty) } : c)));
  };

  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-slate-400" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm món (bia, coca, cơm...)" className="flex-1" autoFocus />
        <Button variant="ghost" size="sm" onClick={onCancel}><X className="h-4 w-4" /></Button>
      </div>

      {search && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((d) => {
            const inCart = cart.find((c) => c.dishId === d.id);
            return (
              <button
                key={d.id}
                onClick={() => toggle(d)}
                className={clsx(
                  'rounded-lg border p-2 text-left text-sm transition',
                  inCart ? 'border-ocean-500 bg-ocean-50' : 'border-slate-200 hover:bg-slate-50',
                )}
              >
                <p className="font-medium truncate">{d.name}</p>
                <p className="text-xs text-slate-500">{formatPrice(d.salePrice ?? d.price)}</p>
              </button>
            );
          })}
          {filtered.length === 0 && <p className="col-span-full text-sm text-slate-400">Không tìm thấy món phù hợp</p>}
        </div>
      )}

      {cart.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600">Sẽ thêm:</p>
          {cart.map((c) => (
            <div key={c.dishId} className="flex items-center gap-2 text-sm">
              <span className="flex-1">{c.name} — {formatPrice(c.price)}</span>
              <div className="inline-flex items-center gap-1">
                <button onClick={() => changeQty(c.dishId, c.quantity - 1)} className="grid h-6 w-6 place-items-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50"><Minus className="h-3 w-3" /></button>
                <span className="w-6 text-center font-semibold">{c.quantity}</span>
                <button onClick={() => changeQty(c.dishId, c.quantity + 1)} className="grid h-6 w-6 place-items-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50"><Plus className="h-3 w-3" /></button>
              </div>
              <button onClick={() => toggle(c)} className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
            </div>
          ))}
          <Button size="sm" loading={loading} onClick={() => onAdd(cart.map(({ dishId, quantity }) => ({ dishId, quantity })))}>
            <Plus className="h-4 w-4" /> Thêm {cart.length} món
          </Button>
        </div>
      )}
    </div>
  );
}
