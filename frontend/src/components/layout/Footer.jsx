import { Clock, Globe, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInfo } from '../../lib/hooks';
import Logo from './Logo';

export default function Footer() {
  const { data: info } = useInfo();

  return (
    <footer className="mt-20 bg-ocean-950 text-ocean-100">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed text-ocean-200">
            {info?.slogan}. Nguyên liệu được tuyển chọn từ các làng chài miền Trung mỗi sáng sớm.
          </p>
          <div className="mt-4 flex gap-2">
            {info?.socials &&
              [
                [info.socials.facebook, Globe, 'Facebook'],
                [info.socials.instagram, MessageCircle, 'Instagram'],
              ].map(([href, Icon, label]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="rounded-full bg-white/10 p-2 hover:bg-coral-500">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white">Khám phá</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/menu" className="hover:text-coral-300">Thực đơn</Link></li>
            <li><Link to="/reservation" className="hover:text-coral-300">Đặt bàn</Link></li>
            <li><Link to="/track" className="hover:text-coral-300">Tra cứu đơn hàng</Link></li>
            <li><Link to="/account" className="hover:text-coral-300">Tài khoản</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Liên hệ</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-coral-400" /> {info?.address}</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-coral-400" /> {info?.phone}</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-coral-400" /> {info?.email}</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Giờ mở cửa</h4>
          <p className="mt-4 flex gap-2 text-sm">
            <Clock className="h-4 w-4 shrink-0 text-coral-400" />
            Thứ 2 - Chủ nhật: {info?.openingHours.open} - {info?.openingHours.close}
          </p>
          <p className="mt-2 text-sm text-ocean-300">Miễn phí giao hàng cho đơn từ 500.000đ</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-ocean-300">
        © {new Date().getFullYear()} FAB Seafood. Dự án học tập FAB.
      </div>
    </footer>
  );
}
