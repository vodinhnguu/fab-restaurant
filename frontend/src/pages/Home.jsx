import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Award, CalendarDays, ChefHat, Clock, Fish, MapPin, Ticket, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import DishCard from '../components/DishCard';
import Button from '../components/ui/Button';
import { Spinner } from '../components/ui/Feedback';
import { formatPrice, imageUrl } from '../lib/format';
import { useCategories, useInfo } from '../lib/hooks';
import { couponApi, dishApi } from '../services';

const HERO = 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=1800&q=80&auto=format&fit=crop';
const ABOUT_1 = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&auto=format&fit=crop';
const ABOUT_2 = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80&auto=format&fit=crop';

const FEATURES = [
  { icon: Fish, title: 'Tươi sống mỗi ngày', text: 'Nhập hải sản từ làng chài lúc 5h sáng' },
  { icon: ChefHat, title: 'Đầu bếp 15 năm', text: 'Kết hợp vị Việt và kỹ thuật Âu - Nhật' },
  { icon: Truck, title: 'Giao nhanh 45 phút', text: 'Miễn phí cho đơn từ 500.000đ' },
  { icon: Award, title: 'Top 10 Đà Nẵng', text: 'Hơn 20.000 lượt khách hài lòng' },
];

const TESTIMONIALS = [
  { name: 'Minh Thư', text: 'Tôm hấp bia ngọt thịt, mâm hải sản nướng đáng tiền. Không gian view biển cực chill!', rating: 5 },
  { name: 'Anh Tuấn', text: 'Đặt bàn online tiện, đến nơi có bàn ngay. Nhân viên phục vụ chu đáo.', rating: 5 },
  { name: 'Hồng Nhung', text: 'Sashimi cá hồi tươi, dày miếng. Lần sau sẽ dẫn cả gia đình đến.', rating: 5 },
];

export default function Home() {
  const { data: info } = useInfo();
  const { data: categories } = useCategories();
  const featured = useQuery({
    queryKey: ['dishes', { featured: 'true', limit: 8 }],
    queryFn: () => dishApi.list({ featured: 'true', limit: 8, sort: 'popular' }),
  });
  const { data: coupons } = useQuery({ queryKey: ['coupons', 'public'], queryFn: couponApi.public });

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative isolate overflow-hidden">
        <img src={HERO} alt="Hải sản tươi sống" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ocean-950/90 via-ocean-950/70 to-ocean-950/20" />
        <div className="container-page py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur">
              <MapPin className="h-4 w-4 text-coral-300" /> Biển Mỹ Khê, Đà Nẵng
            </span>
            <h1 className="heading-display mt-5 text-4xl leading-tight text-white sm:text-6xl">
              Hương vị đại dương <br />
              <span className="text-coral-400">trên bàn ăn của bạn</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ocean-100">
              Hải sản tươi sống chọn lọc mỗi sáng, chế biến bởi đầu bếp giàu kinh nghiệm. Đặt món giao tận nơi hoặc đặt bàn chỉ với vài cú chạm.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to="/menu" size="lg">
                Đặt món ngay <ArrowRight className="h-5 w-5" />
              </Button>
              <Button as={Link} to="/reservation" size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                <CalendarDays className="h-5 w-5" /> Đặt bàn
              </Button>
            </div>
            {info && (
              <p className="mt-8 flex items-center gap-2 text-sm text-ocean-200">
                <Clock className="h-4 w-4" /> Mở cửa {info.openingHours.open} - {info.openingHours.close} hằng ngày · Hotline {info.phone}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="container-page -mt-10 relative z-10">
        <div className="card grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-coral-50 text-coral-500">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-slate-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="container-page mt-20">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold tracking-widest text-coral-500 uppercase">Thực đơn</p>
          <h2 className="heading-display mt-2 text-3xl sm:text-4xl">Khám phá theo danh mục</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories?.map((c) => (
            <Link key={c.id} to={`/menu?category=${c.slug}`} className="group relative aspect-[4/3] overflow-hidden rounded-2xl">
              <img src={imageUrl(c.image)} alt={c.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/80 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white">
                <h3 className="font-semibold text-white">{c.name}</h3>
                <p className="text-xs text-ocean-100">{c._count?.dishes} món</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== FEATURED DISHES ===== */}
      <section className="container-page mt-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-widest text-coral-500 uppercase">Được yêu thích</p>
            <h2 className="heading-display mt-2 text-3xl sm:text-4xl">Món đặc biệt của FAB</h2>
          </div>
          <Link to="/menu" className="flex items-center gap-1 font-medium text-ocean-700 hover:text-coral-600">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {featured.isLoading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.data?.data.map((d) => <DishCard key={d.id} dish={d} />)}
          </div>
        )}
      </section>

      {/* ===== COUPONS ===== */}
      {coupons?.length > 0 && (
        <section className="container-page mt-20">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-coral-500 to-coral-600 p-8 text-white sm:p-10">
            <div className="flex items-center gap-2">
              <Ticket className="h-6 w-6" />
              <h2 className="text-2xl font-bold text-white">Ưu đãi đang diễn ra</h2>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {coupons.map((c) => (
                <div key={c.code} className="rounded-2xl border border-dashed border-white/50 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-bold">
                    {c.type === 'PERCENT' ? `-${c.value}%` : `-${formatPrice(c.value)}`}
                  </p>
                  <p className="mt-1 text-sm text-coral-50">{c.description}</p>
                  <p className="mt-3 inline-block rounded-lg bg-white px-3 py-1 font-mono text-sm font-bold text-coral-600">{c.code}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== ABOUT ===== */}
      <section className="container-page mt-20 grid items-center gap-10 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          <img src={ABOUT_1} alt="Không gian nhà hàng" loading="lazy" className="aspect-[3/4] w-full rounded-2xl object-cover" />
          <img src={ABOUT_2} alt="Khu vực ngoài trời" loading="lazy" className="mt-10 aspect-[3/4] w-full rounded-2xl object-cover" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-widest text-coral-500 uppercase">Về chúng tôi</p>
          <h2 className="heading-display mt-2 text-3xl sm:text-4xl">Từ biển khơi đến bàn ăn trong vài giờ</h2>
          <p className="mt-5 leading-relaxed text-slate-600">
            FAB Seafood ra đời từ tình yêu với biển miền Trung. Mỗi sáng, đội ngũ của chúng tôi trực tiếp chọn hải sản tại cảng cá, đảm bảo từng con tôm, con cá đến tay thực khách còn giữ nguyên vị ngọt tự nhiên.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[['10+', 'Năm kinh nghiệm'], ['50+', 'Món hải sản'], ['20K+', 'Khách hài lòng']].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-ocean-50 p-4">
                <p className="text-2xl font-bold text-ocean-900">{n}</p>
                <p className="text-xs text-slate-500">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="container-page mt-20">
        <h2 className="heading-display text-center text-3xl sm:text-4xl">Khách hàng nói gì</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="card p-6">
              <p className="text-amber-400">{'★'.repeat(t.rating)}</p>
              <blockquote className="mt-3 text-slate-600">“{t.text}”</blockquote>
              <figcaption className="mt-4 font-semibold">{t.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ===== CTA RESERVATION ===== */}
      <section className="container-page mt-20">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-ocean-900 p-8 text-center sm:p-12 md:flex-row md:text-left">
          <div>
            <h2 className="heading-display text-3xl text-white">Đặt bàn cho buổi tối tuyệt vời</h2>
            <p className="mt-2 text-ocean-200">Phòng VIP, khu ngoài trời view biển - giữ chỗ miễn phí, xác nhận trong 15 phút.</p>
          </div>
          <Button as={Link} to="/reservation" size="lg">
            <CalendarDays className="h-5 w-5" /> Đặt bàn ngay
          </Button>
        </div>
      </section>

      {/* ===== MAP ===== */}
      {info?.mapEmbedUrl && (
        <section className="container-page mt-20">
          <iframe title="Bản đồ" src={info.mapEmbedUrl} className="h-80 w-full rounded-3xl border-0" loading="lazy" />
        </section>
      )}
    </>
  );
}
