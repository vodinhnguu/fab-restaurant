import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Printer, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { mergeBillItems } from '../../../components/dine-in/bill';
import Button from '../../../components/ui/Button';
import { ErrorState, Spinner } from '../../../components/ui/Feedback';
import { formatKg, formatPrice } from '../../../lib/format';
import { useDocumentTitle, useInfo } from '../../../lib/hooks';
import { dineInApi } from '../../../services';

// Khổ giấy máy in nhiệt 80mm; khi in chỉ còn tờ bill (ẩn nút)
const PRINT_CSS = '@media print { @page { size: 80mm auto; margin: 3mm; } body { background: #fff !important; } }';

const Line = () => <div className="my-2 border-t border-dashed border-black" />;
const Row = ({ label, value, bold }) => (
  <div className={`flex justify-between gap-2 ${bold ? 'font-bold' : ''}`}><span>{label}</span><span className="text-right">{value}</span></div>
);

// Bill thanh toán của 1 bàn (docs/23-app-nhan-vien-phuc-vu.md). Mở từ trang Thanh toán tại bàn ở tab mới,
// tải xong tự bật hộp thoại in và ghi nhận "đã in" (thu ngân thấy "Đã in 19:42" trên thẻ bàn).
export default function BillPrint() {
  const { id } = useParams();
  const { data: info } = useInfo();
  const { data: order, isLoading, error, refetch } = useQuery({ queryKey: ['dine-in', 'bill', id], queryFn: () => dineInApi.bill(id) });
  useDocumentTitle(order ? `Bill bàn ${order.table?.code}` : 'In bill');

  const printed = useRef(false);
  useEffect(() => {
    if (!order || !info || printed.current) return;
    printed.current = true;
    dineInApi.markPrinted(order.id).catch(() => {});
    setTimeout(() => window.print(), 300); // chờ trình duyệt vẽ xong bill
  }, [order, info]);

  if (isLoading) return <Spinner className="py-32" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const lines = mergeBillItems(order.items);
  const paid = order.paymentStatus === 'PAID';

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:py-0">
      <style>{PRINT_CSS}</style>
      <div className="mx-auto mb-4 flex w-[80mm] gap-2 print:hidden">
        <Button className="flex-1" onClick={() => window.print()}><Printer className="h-4 w-4" /> In lại</Button>
        <Button variant="outline" onClick={() => window.close()}><X className="h-4 w-4" /> Đóng</Button>
      </div>

      <div className="mx-auto w-[80mm] bg-white p-4 font-mono text-[12px] leading-snug text-black shadow print:w-full print:p-0 print:shadow-none">
        <div className="text-center">
          <p className="text-base font-bold uppercase">{info?.name ?? 'FAB Seafood'}</p>
          {info?.address && <p>{info.address}</p>}
          {info?.phone && <p>ĐT: {info.phone}</p>}
        </div>
        <Line />
        <p className="text-center text-sm font-bold">{paid ? 'HÓA ĐƠN (ĐÃ THANH TOÁN)' : 'PHIẾU THANH TOÁN'}</p>
        <div className="mt-2 space-y-0.5">
          <Row label="Bàn:" value={`${order.table?.code} (${order.table?.area})`} />
          <Row label="Mã đơn:" value={order.code} />
          <Row label="Giờ vào:" value={dayjs(order.createdAt).format('HH:mm DD/MM/YYYY')} />
          <Row label="Giờ in:" value={dayjs().format('HH:mm DD/MM/YYYY')} />
          {order.staff && <Row label="Phục vụ:" value={order.staff.name} />}
        </div>
        <Line />

        <div className="flex justify-between font-bold"><span>Món</span><span>Thành tiền</span></div>
        <div className="mt-1 space-y-1.5">
          {lines.map((l) => (
            <div key={l.key}>
              <p>{l.name}</p>
              <div className="flex justify-between pl-3">
                <span>
                  {l.byWeight
                    ? l.weight != null
                      ? `${formatKg(l.weight)} x ${l.price.toLocaleString('vi-VN')}/kg${l.weighing ? ' (tạm, chưa cân)' : ''}`
                      : 'Chưa cân'
                    : `${l.quantity} x ${l.price.toLocaleString('vi-VN')}`}
                </span>
                <span>{l.byWeight && l.weight == null ? '—' : l.amount.toLocaleString('vi-VN')}</span>
              </div>
            </div>
          ))}
        </div>
        <Line />

        <div className="space-y-0.5">
          <Row label="Tạm tính:" value={formatPrice(order.subtotal)} />
          {order.discount > 0 && <Row label="Giảm giá:" value={`-${formatPrice(order.discount)}`} />}
          <div className="text-sm"><Row label="TỔNG CỘNG:" value={formatPrice(order.total)} bold /></div>
        </div>
        <Line />
        <p className="text-center">Cảm ơn quý khách! Hẹn gặp lại.</p>
      </div>
    </div>
  );
}
