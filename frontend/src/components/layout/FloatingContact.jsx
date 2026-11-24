import { CalendarDays, Phone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useInfo } from '../../lib/hooks';

// Nút liên hệ luôn thấy ở mọi trang khách (khách web nhà hàng hay bấm nhất):
//   - Máy tính / máy tính bảng (từ sm): nút nổi góc dưới phải: "Đặt bàn" + nút tròn gọi hotline có vòng sóng.
//   - Điện thoại: thanh cố định ở đáy màn hình "Gọi ngay | Đặt bàn" (nút nổi sẽ che chữ trên màn nhỏ).
//     CustomerLayout chừa khoảng trống pb-16 ở đáy trang để thanh này không che chân trang.
// Đang ở trang Đặt bàn thì ẩn nút "Đặt bàn". Máy bật "giảm chuyển động" thì vòng sóng không nhấp nháy.
export default function FloatingContact() {
  const { data: info } = useInfo();
  const { pathname } = useLocation();
  const phone = info?.phone?.replace(/\s/g, '');
  const showBook = !pathname.startsWith('/reservation');

  return (
    <>
      {/* Máy tính: nút nổi góc phải */}
      <div className="fixed right-6 bottom-6 z-30 hidden flex-col items-end gap-3 sm:flex">
        {showBook && (
          <Link
            to="/reservation"
            className="flex items-center gap-2 rounded-full bg-ocean-900 py-3 pr-5 pl-4 text-sm font-semibold text-white shadow-lg shadow-ocean-950/30 transition hover:-translate-y-0.5 hover:bg-ocean-800"
          >
            <CalendarDays className="h-5 w-5 text-coral-300" /> Đặt bàn
          </Link>
        )}
        {phone && (
          <a
            href={`tel:${phone}`}
            aria-label={`Gọi hotline ${info.phone}`}
            title={`Gọi ${info.phone}`}
            className="relative grid h-14 w-14 place-items-center rounded-full bg-coral-500 text-white shadow-lg shadow-coral-500/40 transition hover:bg-coral-600"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-coral-400 opacity-50 motion-reduce:hidden" />
            <Phone className="relative h-6 w-6" />
          </a>
        )}
      </div>

      {/* Điện thoại: thanh dưới đáy */}
      {(phone || showBook) && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-slate-200 bg-white/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-coral-500 font-semibold text-coral-600"
            >
              <Phone className="h-5 w-5" /> Gọi ngay
            </a>
          )}
          {showBook && (
            <Link
              to="/reservation"
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-coral-500 font-semibold text-white shadow-sm shadow-coral-500/30"
            >
              <CalendarDays className="h-5 w-5" /> Đặt bàn
            </Link>
          )}
        </div>
      )}
    </>
  );
}
