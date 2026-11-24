import { Clock, Fish, Phone } from 'lucide-react';
import { useInfo } from '../../lib/hooks';

// Dải thông tin mỏng trên cùng trang khách: hải sản sống mỗi ngày · giờ mở cửa · hotline (bấm là gọi).
// Cuộn xuống thì dải này trôi đi, thanh menu (Header, dính trên cùng) vẫn ở lại.
// Giờ mở cửa, số điện thoại lấy từ API /info (backend/src/config/restaurant.js).
export default function TopBar() {
  const { data: info } = useInfo();
  return (
    <div className="bg-ocean-950 text-xs text-ocean-100">
      <div className="container-page flex h-9 items-center justify-between gap-4">
        <p className="flex min-w-0 items-center gap-1.5">
          <Fish className="h-3.5 w-3.5 shrink-0 text-coral-400" />
          <span className="truncate">Hải sản sống tại hồ mỗi ngày · chọn con, cân tại chỗ</span>
        </p>
        <div className="flex shrink-0 items-center gap-5">
          {info && (
            <span className="hidden items-center gap-1.5 sm:flex">
              <Clock className="h-3.5 w-3.5 text-coral-400" /> Mở cửa {info.openingHours.open} - {info.openingHours.close}
            </span>
          )}
          {info?.phone && (
            <a href={`tel:${info.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 font-semibold text-white hover:text-coral-300">
              <Phone className="h-3.5 w-3.5 text-coral-400" /> {info.phone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
