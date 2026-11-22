import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { Clock, Scale } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DINE_IN_REFRESH_MS } from '../../../components/dine-in/useDineInAlerts';
import PageHeader from '../../../components/PageHeader';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { EmptyState, ErrorState, Spinner } from '../../../components/ui/Feedback';
import { DINE_IN_ITEM_STATUS } from '../../../lib/constants';
import { formatKg, formatPrice, fromNow } from '../../../lib/format';
import { useDocumentTitle } from '../../../lib/hooks';
import { useCan } from '../../../lib/permissions';
import { dineInApi } from '../../../services';

// Cân hải sản (docs/24-thuc-don-ban-theo-kg.md): món bán theo kg phục vụ gửi từ app nằm ở "Chờ cân",
// kèm số kg phục vụ ghi (mặc định 1 kg, đã tính tiền tạm). Ô nhập điền sẵn số đó.
// Nhân viên hồ hải sản bắt con khách chọn, cân, xác nhận / sửa số kg -> tiền = giá 1 kg × số kg, món sang "Chờ bếp".
// Nhập nhầm thì "Cân lại" ở bảng "Đã cân hôm nay" khi bếp chưa nhận làm.
export default function Weighing() {
  useDocumentTitle('Cân hải sản');
  const canWeigh = useCan()('SEAFOOD_TANK', 'edit');
  const qc = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dine-in', 'weighing'],
    queryFn: dineInApi.weighing,
    refetchInterval: DINE_IN_REFRESH_MS,
  });

  const weigh = useMutation({
    mutationFn: dineInApi.weigh,
    onSuccess: (res) => {
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: ['dine-in'] });
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="Cân hải sản"
        subtitle={`${data.waiting.length} món chờ cân · tự cập nhật mỗi 10 giây`}
      />

      {data.waiting.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="Chưa có món nào chờ cân"
          description="Phục vụ gọi món bán theo kg (tôm hùm, tôm sú, cua, cá mú, tôm tít) là món hiện ở đây, kèm tiếng chuông."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.waiting.map((item) => (
            <WaitingCard key={item.id} item={item} canWeigh={canWeigh} weigh={weigh} />
          ))}
        </div>
      )}

      <h2 className="mt-10 mb-3 text-lg font-bold">Đã cân hôm nay</h2>
      {data.weighed.length === 0 ? (
        <p className="text-sm text-slate-500">Chưa cân món nào hôm nay.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Giờ cân</th>
                <th className="px-4 py-2 font-medium">Bàn</th>
                <th className="px-4 py-2 font-medium">Món</th>
                <th className="px-4 py-2 text-right font-medium">Số kg</th>
                <th className="px-4 py-2 text-right font-medium">Thành tiền</th>
                <th className="px-4 py-2 font-medium">Trạng thái</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.weighed.map((item) => (
                <WeighedRow key={item.id} item={item} canWeigh={canWeigh} weigh={weigh} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// Ô nhập số kg + xem trước thành tiền. Enter để xác nhận.
function WeightInput({ item, weigh, initial = '', onDone, autoFocus }) {
  const [value, setValue] = useState(initial);
  const kg = Number(String(value).replace(',', '.'));
  const valid = kg >= 0.05 && kg <= 30;
  const busy = weigh.isPending && weigh.variables?.id === item.id;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return toast.error('Số kg từ 0,05 đến 30');
    weigh.mutate({ id: item.id, weight: kg }, { onSuccess: () => onDone?.() });
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="decimal"
          placeholder="vd 1,25"
          autoFocus={autoFocus}
          aria-label={`Số kg ${item.name}`}
          className="h-10 w-28 rounded-xl border border-slate-300 bg-white pr-9 pl-3 text-right font-semibold focus:border-ocean-500 focus:outline-none"
        />
        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-400">kg</span>
      </div>
      <Button type="submit" size="sm" loading={busy} disabled={!valid}>
        <Scale className="h-4 w-4" /> Xác nhận cân
      </Button>
      {valid && <span className="text-sm text-slate-500">= <b className="text-coral-600">{formatPrice(Math.round(item.price * kg))}</b></span>}
    </form>
  );
}

function WaitingCard({ item, canWeigh, weigh }) {
  const waitMinutes = dayjs().diff(item.createdAt, 'minute');
  return (
    <div className="card flex flex-col gap-3 p-4 ring-2 ring-cyan-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-bold">Bàn {item.order.table?.code}</p>
          <p className="text-sm text-slate-500">{item.order.table?.area} · {item.order.staff?.name ?? 'Phục vụ'}</p>
        </div>
        <span className={clsx('flex items-center gap-1 text-sm', waitMinutes >= 10 ? 'font-semibold text-red-600' : 'text-slate-500')}>
          <Clock className="h-4 w-4" /> {fromNow(item.createdAt)}
        </span>
      </div>
      <div>
        <p className="text-lg font-semibold text-ocean-900">{item.quantity > 1 ? `${item.quantity} × ` : ''}{item.name}</p>
        <p className="text-sm text-slate-500">{formatPrice(item.price)} / kg · gọi lúc {dayjs(item.createdAt).format('HH:mm')}</p>
        {item.weight != null && (
          <p className="text-sm text-slate-600">
            Phục vụ ghi <b>{formatKg(item.weight)}</b> (tạm tính {formatPrice(Math.round(item.price * item.weight))})
          </p>
        )}
        {item.note && <p className="mt-1 text-sm text-coral-700 italic">{item.note}</p>}
      </div>
      {canWeigh ? (
        // Điền sẵn số kg phục vụ ghi: cân đúng thì bấm Xác nhận, khác thì sửa (vd 1 -> 0,98)
        <WeightInput item={item} weigh={weigh} initial={item.weight != null ? String(item.weight).replace('.', ',') : ''} />
      ) : (
        <p className="text-sm text-slate-500">Bạn chỉ có quyền xem.</p>
      )}
    </div>
  );
}

function WeighedRow({ item, canWeigh, weigh }) {
  const [editing, setEditing] = useState(false);
  const status = DINE_IN_ITEM_STATUS[item.status];
  // Cân lại được khi bếp chưa nhận làm
  const canReweigh = canWeigh && item.status === 'PENDING';
  return (
    <tr>
      <td className="px-4 py-2 text-slate-500">{dayjs(item.weighedAt).format('HH:mm')}</td>
      <td className="px-4 py-2 font-semibold">{item.order.table?.code}</td>
      <td className="px-4 py-2">{item.name}</td>
      <td className="px-4 py-2 text-right font-semibold">{formatKg(item.weight)}</td>
      <td className="px-4 py-2 text-right">{formatPrice(Math.round(item.price * item.weight))}</td>
      <td className="px-4 py-2">{status && <Badge color={status.color}>{status.label}</Badge>}</td>
      <td className="px-4 py-2 text-right">
        {editing ? (
          <WeightInput item={item} weigh={weigh} initial={String(item.weight).replace('.', ',')} onDone={() => setEditing(false)} autoFocus />
        ) : (
          canReweigh && <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Cân lại</Button>
        )}
      </td>
    </tr>
  );
}
