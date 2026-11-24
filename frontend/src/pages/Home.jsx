import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Award, CalendarDays, ChefHat, Fish, Flame, MapPin, Quote, Scale, Ticket, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import DishCard from '../components/DishCard';
import Reveal from '../components/Reveal';
import Button from '../components/ui/Button';
import { Spinner } from '../components/ui/Feedback';
import { isSoldByWeight } from '../lib/constants';
import { formatPrice, imageUrl } from '../lib/format';
import { useCategories, useDocumentTitle, useInfo } from '../lib/hooks';
import { couponApi, dishApi } from '../services';

const HERO = 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=1800&q=80&auto=format&fit=crop';
const ABOUT_1 = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&auto=format&fit=crop';
const ABOUT_2 = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80&auto=format&fit=crop';

const FEATURES = [
  { icon: Fish, title: 'Tươi sống mỗi ngày', text: 'Nhập hải sản từ làng chài lúc 5h sáng' },
  { icon: ChefHat, title: 'Đầu bếp 15 năm', text: 'Kết hợp vị Việt và kỹ thuật Âu - Nhật' },
  // Mức miễn phí giao hàng lấy từ API (/info, cấu hình ở backend/.env) để chỉ phải sửa 1 nơi
  { icon: Truck, title: 'Giao nhanh 45 phút', text: (info) => (info ? `Miễn phí cho đơn từ ${formatPrice(info.freeShippingMin)}` : '') },
  { icon: Award, title: 'Top 10 Đà Nẵng', text: 'Hơn 20.000 lượt khách hài lòng' },
];

// Khu "Chọn con nào, cân con đó": điểm khác biệt của quán (món bán theo kg, docs/24-thuc-don-ban-theo-kg.md)
const STEPS = [
  { icon: Fish, title: 'Chọn con tại hồ', text: 'Tôm hùm, tôm sú, cua, cá mú, tôm tít bơi trong hồ cả ngày. Bạn tự chọn con ưng ý.' },
  { icon: Scale, title: 'Cân trước mặt bạn', text: 'Nhân viên hồ hải sản cân ngay tại chỗ, tiền tính đúng theo số kg, không ước chừng.' },
  { icon: ChefHat, title: 'Chế biến theo ý', text: 'Nướng phô mai, sốt bơ tỏi, hấp bia, rang muối hay sashimi: đầu bếp làm ngay khi bạn chọn.' },
];

const TESTIMONIALS = [
  { name: 'Minh Thư', text: 'Tôm hùm nướng phô mai ngọt thịt, được tự chọn con tại hồ và cân trước mặt. Không gian view biển cực chill!', rating: 5 },
  { name: 'Anh Tuấn', text: 'Đặt bàn online tiện, đến nơi có bàn ngay. Nhân viên phục vụ chu đáo.', rating: 5 },
  { name: 'Hồng Nhung', text: 'Cua gạch hấp bia chắc thịt, hàu nướng mỡ hành béo ngậy. Lần sau sẽ dẫn cả gia đình đến.', rating: 5 },
];

export default function Home() {
  useDocumentTitle();
  const { data: info } = useInfo();
  const { data: allCategories } = useCategories();
  const categories = allCategories?.filter((c) => c._count?.dishes > 0); // ẩn danh mục không còn món đang bán
  // Best seller = món admin bật ô "Best seller" (cột isFeatured), món bán chạy nhất đứng trước
  const featured = useQuery({
    queryKey: ['dishes', { featured: 'true', limit: 8 }],
    queryFn: () => dishApi.list({ featured: 'true', limit: 8, sort: 'popular' }),
  });
  const { data: coupons } = useQuery({ queryKey: ['coupons', 'public'], queryFn: couponApi.public });

  // Thẻ nổi trên ảnh bìa: món Best seller bán theo kg đắt nhất (thường là tôm hùm), không có thì món Best seller đầu tiên
  const bestSellers = featured.data?.data ?? [];
  const signature = [...bestSellers].filter(isSoldByWeight).sort((a, b) => b.price - a.price)[0] ?? bestSellers[0];
  const dishTotal = categories?.reduce((sum, c) => sum + (c._count?.dishes ?? 0), 0);

  return (
    <>
      {/* ===== HERO: ảnh phóng to chậm, 2 nhãn, Đặt bàn là nút chính, số liệu thật, thẻ món nổi bật bên phải ===== */}
      <section className="relative isolate overflow-hidden">
        <img src={HERO} alt="Hải sản tươi sống" className="animate-slow-zoom absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ocean-950/95 via-ocean-950/75 to-ocean-950/30" />
        <div className="container-page grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_360px] lg:py-32">
          <div className="max-w-2xl text-white">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur">
                <MapPin className="h-4 w-4 text-coral-300" /> Biển Mỹ Khê, Đà Nẵng
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-coral-500/90 px-3 py-1 text-sm font-semibold">
                <Scale className="h-4 w-4" /> Chọn con tại hồ, cân tại chỗ
              </span>
            </div>
            <h1 className="heading-display mt-5 text-4xl leading-tight text-white sm:text-6xl">
              Hương vị đại dương <br />
              <span className="text-coral-400">trên bàn ăn của bạn</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ocean-100">
              Tôm hùm, cua, cá mú bơi tại hồ: bạn chọn con, nhân viên cân tại chỗ, đầu bếp chế biến theo ý bạn. Đặt bàn chỉ với vài cú chạm, hoặc đặt hàu, sò điệp, cơm, cháo giao tận nơi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to="/reservation" size="lg">
                <CalendarDays className="h-5 w-5" /> Đặt bàn ngay
              </Button>
              <Button as={Link} to="/menu" size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                Xem thực đơn <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6">
              {[
                [dishTotal || '…', 'món hải sản & ăn kèm'],
                [categories?.length || '…', 'nhóm món'],
                [info ? `${info.openingHours.open.slice(0, 2)}h-${info.openingHours.close.slice(0, 2)}h` : '…', 'mở cửa mỗi ngày'],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="text-2xl font-bold whitespace-nowrap text-white sm:text-3xl">{value}</dd>
                  <p className="text-xs text-ocean-200 sm:text-sm">{label}</p>
                </div>
              ))}
            </dl>
          </div>
          {signature && <SignatureCard dish={signature} />}
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
                <p className="text-sm text-slate-500">{typeof text === 'function' ? text(info) : text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BEST SELLER (nổi bật ngay dưới ảnh bìa) ===== */}
      <section className="mt-16 bg-ocean-950 py-16">
        <div className="container-page">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-coral-500 px-3 py-1 text-sm font-bold text-white">
                <Flame className="h-4 w-4" /> Best seller
              </p>
              <h2 className="heading-display mt-3 text-3xl text-white sm:text-4xl">Món khách gọi nhiều nhất tại FAB</h2>
              <p className="mt-2 text-ocean-200">Hải sản sống chọn tại hồ, cân tại chỗ, chế biến theo ý bạn</p>
            </div>
            <Link to="/menu?best=1" className="flex items-center gap-1 font-medium text-coral-300 hover:text-coral-200">
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
        </div>
      </section>

      {/* ===== CHỌN CON TẠI HỒ: 3 bước ===== */}
      <section className="container-page mt-20">
        <Reveal className="text-center">
          <p className="text-sm font-semibold tracking-widest text-coral-500 uppercase">Tươi sống tại hồ</p>
          <h2 className="heading-display mt-2 text-3xl sm:text-4xl">Chọn con nào, cân con đó</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Hải sản sống bán theo kg: bạn thấy tận mắt con mình chọn, thấy số cân, rồi mới chế biến.
          </p>
        </Reveal>
        <div className="relative mt-10 grid gap-6 md:grid-cols-3">
          {/* đường nối 3 bước (chỉ màn rộng) */}
          <div className="absolute top-16 right-[17%] left-[17%] hidden border-t-2 border-dashed border-coral-300 md:block" />
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 150} className="card relative p-6 text-center transition hover:-translate-y-1 hover:shadow-lg">
              <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-coral-50 text-coral-500 ring-8 ring-white">
                <step.icon className="h-9 w-9" />
                <span className="absolute -top-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-ocean-900 text-sm font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8 text-center">
          <Button as={Link} to="/reservation" size="lg">
            <CalendarDays className="h-5 w-5" /> Đặt bàn để chọn hải sản
          </Button>
        </Reveal>
      </section>

      {/* ===== CATEGORIES ===== */}
      <Reveal as="section" className="container-page mt-20">
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
      </Reveal>

      {/* ===== COUPONS ===== */}
      {coupons?.length > 0 && (
        <Reveal as="section" className="container-page mt-20">
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
        </Reveal>
      )}

      {/* ===== ABOUT ===== */}
      <Reveal as="section" className="container-page mt-20 grid items-center gap-10 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          <img src={ABOUT_1} alt="Không gian nhà hàng" loading="lazy" className="aspect-[3/4] w-full rounded-2xl object-cover" />
          <img src={ABOUT_2} alt="Khu vực ngoài trời" loading="lazy" className="mt-10 aspect-[3/4] w-full rounded-2xl object-cover" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-widest text-coral-500 uppercase">Về chúng tôi</p>
          <h2 className="heading-display mt-2 text-3xl sm:text-4xl">Từ biển khơi đến bàn ăn trong vài giờ</h2>
          <p className="mt-5 leading-relaxed text-slate-600">
            Ngưu Quán ra đời từ tình yêu với biển miền Trung. Mỗi sáng, đội ngũ của chúng tôi trực tiếp chọn hải sản tại cảng cá, đảm bảo từng con tôm, con cá đến tay thực khách còn giữ nguyên vị ngọt tự nhiên.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[['10+', 'Năm kinh nghiệm'], [dishTotal || '70', 'Món trong thực đơn'], ['20K+', 'Khách hài lòng']].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-ocean-50 p-4">
                <p className="text-2xl font-bold text-ocean-900">{n}</p>
                <p className="text-xs text-slate-500">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ===== TESTIMONIALS ===== */}
      <Reveal as="section" className="container-page mt-20">
        <h2 className="heading-display text-center text-3xl sm:text-4xl">Khách hàng nói gì</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="card relative p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <Quote className="absolute top-5 right-5 h-8 w-8 text-ocean-100" />
              <p className="text-lg text-amber-400">{'★'.repeat(t.rating)}</p>
              <blockquote className="mt-3 leading-relaxed text-slate-600">“{t.text}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-ocean-900 font-semibold text-white">{t.name.charAt(0)}</span>
                <span>
                  <span className="block font-semibold">{t.name}</span>
                  <span className="text-xs text-slate-500">Khách của Ngưu Quán</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Reveal>

      {/* ===== CTA RESERVATION ===== */}
      <Reveal as="section" className="container-page mt-20">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-ocean-900 p-8 text-center sm:p-12 md:flex-row md:text-left">
          <div>
            <h2 className="heading-display text-3xl text-white">Đặt bàn cho buổi tối tuyệt vời</h2>
            <p className="mt-2 text-ocean-200">Phòng VIP, khu ngoài trời view biển - giữ chỗ miễn phí, xác nhận trong 15 phút.</p>
          </div>
          <Button as={Link} to="/reservation" size="lg">
            <CalendarDays className="h-5 w-5" /> Đặt bàn ngay
          </Button>
        </div>
      </Reveal>

      {/* ===== MAP ===== */}
      {info?.mapEmbedUrl && (
        <section className="container-page mt-20">
          <iframe title="Bản đồ" src={info.mapEmbedUrl} className="h-80 w-full rounded-3xl border-0" loading="lazy" />
        </section>
      )}
    </>
  );
}

// Thẻ kính mờ bồng bềnh bên phải ảnh bìa (màn rộng): món đỉnh của quán, bấm vào xem chi tiết món
function SignatureCard({ dish }) {
  return (
    <Link
      to={`/menu/${dish.slug}`}
      className="animate-float group hidden overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-3 text-white shadow-2xl backdrop-blur-md lg:block"
    >
      <div className="relative overflow-hidden rounded-2xl">
        <img src={imageUrl(dish.image)} alt={dish.name} className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-coral-500 px-2.5 py-1 text-xs font-bold text-white shadow">
          <Flame className="h-3.5 w-3.5" /> Best seller
        </span>
      </div>
      <div className="px-2 pt-4 pb-2">
        <p className="text-xs font-semibold tracking-widest text-coral-300 uppercase">Món đỉnh của Ngưu Quán</p>
        <p className="mt-1 font-display text-2xl font-bold text-white">{dish.name}</p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <p>
            <span className="text-2xl font-bold text-coral-300">{formatPrice(dish.salePrice ?? dish.price)}</span>
            <span className="text-sm text-ocean-100"> /{dish.unit}</span>
          </p>
          <span className="flex items-center gap-1 text-sm font-medium text-white/90 group-hover:text-coral-300">
            Xem món <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
