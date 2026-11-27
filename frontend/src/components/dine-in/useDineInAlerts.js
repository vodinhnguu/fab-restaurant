import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatPrice } from '../../lib/format';
import { can } from '../../lib/permissions';
import { dineInApi } from '../../services';

// Cứ 10 giây hỏi server 1 lần (không cần server realtime). Tài liệu: docs/23-app-nhan-vien-phuc-vu.md
export const DINE_IN_REFRESH_MS = 10000;

// Tiếng "ting ting" ngắn bằng Web Audio, không cần file âm thanh.
// Trình duyệt chặn âm thanh khi người dùng chưa bấm gì trên trang -> bỏ qua lỗi.
export function playDing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + i * 0.18;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
    setTimeout(() => ctx.close(), 1000);
  } catch {
    // không phát được thì thôi, vẫn còn thông báo trên màn hình
  }
}

// Dùng trong AdminLayout (mọi trang admin): đếm số để hiện chấm đỏ trên menu + báo khi có việc mới.
//  - Thu ngân (quyền Xem "Thanh toán"): bàn vừa "Gửi thanh toán" -> thông báo + chuông
//  - Bếp (quyền Xem "Phiếu bếp"): bàn vừa gửi món mới -> thông báo + chuông
//  - Hồ hải sản (quyền Sửa "Hồ hải sản"): món bán theo kg mới chờ cân -> thông báo + chuông
//    (phục vụ nhập số kg tại hồ trên app; chuông để hồ hải sản biết có khách ra hồ chọn con)
// Chỉ người có quyền Sửa (làm được việc đó) mới nghe chuông. Lần tải đầu chỉ ghi nhớ, không báo.
export function useDineInAlerts(user) {
  const navigate = useNavigate();
  const bills = useQuery({
    queryKey: ['dine-in', 'bills'],
    queryFn: dineInApi.bills,
    enabled: can(user, 'PAYMENTS'),
    refetchInterval: DINE_IN_REFRESH_MS,
  });
  const kitchen = useQuery({
    queryKey: ['dine-in', 'kitchen'],
    queryFn: dineInApi.kitchen,
    enabled: can(user, 'KITCHEN'),
    refetchInterval: DINE_IN_REFRESH_MS,
  });
  const bar = useQuery({
    queryKey: ['dine-in', 'bar'],
    queryFn: dineInApi.bar,
    enabled: can(user, 'DRINKS'),
    refetchInterval: DINE_IN_REFRESH_MS,
  });
  const ringWeighing = can(user, 'SEAFOOD_TANK', 'edit');
  const weighing = useQuery({
    queryKey: ['dine-in', 'weighing'],
    queryFn: dineInApi.weighing,
    enabled: ringWeighing,
    refetchInterval: DINE_IN_REFRESH_MS,
  });
  const ringCashier = can(user, 'PAYMENTS', 'edit');
  const ringKitchen = can(user, 'KITCHEN', 'edit');
  const ringBar = can(user, 'DRINKS', 'edit');

  // Bàn gửi thanh toán. Khóa = id + giờ gửi: rút lại rồi gửi lại thì vẫn báo lần nữa
  const seenBills = useRef(null);
  useEffect(() => {
    if (!bills.data) return;
    const requested = bills.data.filter((o) => o.billRequestedAt);
    const keyOf = (o) => `${o.id}@${o.billRequestedAt}`;
    if (seenBills.current && ringCashier) {
      const fresh = requested.filter((o) => !seenBills.current.has(keyOf(o)));
      for (const o of fresh) {
        toast.warning(`Bàn ${o.table?.code} gửi thanh toán`, {
          description: `${o.table?.area} · Tổng ${formatPrice(o.total)}`,
          duration: 20000,
          action: { label: 'Xem', onClick: () => navigate('/admin/cashier') },
        });
      }
      if (fresh.length) playDing();
    }
    seenBills.current = new Set(requested.map(keyOf));
  }, [bills.data, ringCashier, navigate]);

  // Món mới gửi bếp (theo từng dòng món đang chờ)
  const seenItems = useRef(null);
  useEffect(() => {
    if (!kitchen.data) return;
    const pending = kitchen.data.flatMap((o) => o.items.filter((i) => i.status === 'PENDING').map((i) => ({ ...i, table: o.table })));
    if (seenItems.current && ringKitchen) {
      const fresh = pending.filter((i) => !seenItems.current.has(i.id));
      const tables = [...new Set(fresh.map((i) => i.table?.code))];
      if (tables.length) {
        toast.info(`Món mới: bàn ${tables.join(', ')}`, {
          duration: 15000,
          action: { label: 'Xem', onClick: () => navigate('/admin/kitchen') },
        });
        playDing();
      }
    }
    seenItems.current = new Set(pending.map((i) => i.id));
  }, [kitchen.data, ringKitchen, navigate]);

  // Món mới chờ cân
  const seenWeighing = useRef(null);
  useEffect(() => {
    if (!weighing.data) return;
    const waiting = weighing.data.waiting;
    if (seenWeighing.current) {
      const fresh = waiting.filter((i) => !seenWeighing.current.has(i.id));
      if (fresh.length) {
        toast.info(`Cần cân: ${fresh.map((i) => `${i.name} (bàn ${i.order.table?.code})`).join(', ')}`, {
          duration: 15000,
          action: { label: 'Cân', onClick: () => navigate('/admin/weighing') },
        });
        playDing();
      }
    }
    seenWeighing.current = new Set(waiting.map((i) => i.id));
  }, [weighing.data, navigate]);

  // Đồ uống mới chờ lấy
  const seenBar = useRef(null);
  useEffect(() => {
    if (!bar.data) return;
    const pending = bar.data.flatMap((o) => o.items.filter((i) => i.status === 'PENDING').map((i) => ({ ...i, table: o.table })));
    if (seenBar.current && ringBar) {
      const fresh = pending.filter((i) => !seenBar.current.has(i.id));
      const tables = [...new Set(fresh.map((i) => i.table?.code))];
      if (tables.length) {
        toast.info(`Đồ uống mới: bàn ${tables.join(', ')}`, {
          duration: 15000,
          action: { label: 'Xem', onClick: () => navigate('/admin/bar') },
        });
        playDing();
      }
    }
    seenBar.current = new Set(pending.map((i) => i.id));
  }, [bar.data, ringBar, navigate]);

  return {
    weighing: weighing.data?.waiting.length ?? 0,
    cashier: bills.data?.filter((o) => o.billRequestedAt).length ?? 0,
    kitchen: kitchen.data?.filter((o) => o.items.some((i) => i.status === 'PENDING')).length ?? 0,
    bar: bar.data?.filter((o) => o.items.some((i) => i.status === 'PENDING')).length ?? 0,
  };
}
