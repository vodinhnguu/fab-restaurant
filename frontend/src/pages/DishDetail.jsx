import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { ChevronRight, ShoppingBag, Star } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import DishCard from '../components/DishCard';
import Button from '../components/ui/Button';
import { EmptyState, ErrorState, Rating, Spinner } from '../components/ui/Feedback';
import { Textarea } from '../components/ui/Form';
import QuantityInput from '../components/ui/QuantityInput';
import { formatPrice, fromNow, imageUrl } from '../lib/format';
import { reviewApi, dishApi } from '../services';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';

function ReviewForm({ dishId, slug }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => reviewApi.create({ dishId, rating, comment }),
    onSuccess: () => {
      toast.success('Cảm ơn bạn đã đánh giá!');
      setComment('');
      qc.invalidateQueries({ queryKey: ['dish', slug] });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
      className="card space-y-3 p-5"
    >
      <p className="font-medium">Đánh giá của bạn</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button type="button" key={i} onClick={() => setRating(i)} aria-label={`${i} sao`}>
            <Star className={clsx('h-7 w-7', i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
          </button>
        ))}
      </div>
      <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Chia sẻ cảm nhận về món ăn..." />
      <Button type="submit" loading={mutation.isPending}>Gửi đánh giá</Button>
    </form>
  );
}

export default function DishDetail() {
  const { slug } = useParams();
  const [qty, setQty] = useState(1);
  const add = useCartStore((s) => s.add);
  const openCart = useCartStore((s) => s.open);
  const user = useAuthStore((s) => s.user);

  const { data: dish, isLoading, isError, error } = useQuery({
    queryKey: ['dish', slug],
    queryFn: () => dishApi.detail(slug),
  });

  if (isLoading) return <Spinner className="py-32" />;
  if (isError) return <ErrorState error={error} />;

  const onSale = dish.salePrice && dish.salePrice < dish.price;
  const handleAdd = () => {
    add(dish, qty);
    toast.success(`Đã thêm ${qty} × ${dish.name}`, { action: { label: 'Xem giỏ', onClick: openCart } });
  };

  return (
    <div className="container-page py-8">
      <nav className="mb-6 flex items-center gap-1 text-sm text-slate-500">
        <Link to="/menu" className="hover:text-ocean-700">Thực đơn</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to={`/menu?category=${dish.category.slug}`} className="hover:text-ocean-700">{dish.category.name}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-800">{dish.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <img src={imageUrl(dish.image)} alt={dish.name} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lg" />

        <div>
          <p className="text-sm font-semibold tracking-wide text-ocean-500 uppercase">{dish.category.name}</p>
          <h1 className="heading-display mt-2 text-4xl">{dish.name}</h1>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <Rating value={dish.ratingAvg} size="md" />
            <span className="text-slate-500">{dish.ratingAvg.toFixed(1)} ({dish.ratingCount} đánh giá)</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">Đã bán {dish.soldCount}</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-coral-600">{formatPrice(dish.salePrice ?? dish.price)}</span>
            <span className="text-slate-500">/ {dish.unit}</span>
            {onSale && <span className="text-lg text-slate-400 line-through">{formatPrice(dish.price)}</span>}
          </div>

          <p className="mt-6 leading-relaxed text-slate-600">{dish.description}</p>

          {dish.isAvailable ? (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <QuantityInput value={qty} onChange={setQty} />
              <Button size="lg" onClick={handleAdd} className="flex-1 sm:flex-none">
                <ShoppingBag className="h-5 w-5" /> Thêm vào giỏ · {formatPrice((dish.salePrice ?? dish.price) * qty)}
              </Button>
            </div>
          ) : (
            <p className="mt-8 rounded-xl bg-slate-100 p-4 text-center font-medium text-slate-600">Món này tạm hết, vui lòng quay lại sau</p>
          )}
        </div>
      </div>

      {/* Đánh giá */}
      <section className="mt-16 grid gap-8 lg:grid-cols-3">
        <div>
          <h2 className="text-2xl font-bold">Đánh giá</h2>
          <div className="mt-4 flex items-center gap-4">
            <span className="text-5xl font-bold text-ocean-900">{dish.ratingAvg.toFixed(1)}</span>
            <div>
              <Rating value={dish.ratingAvg} size="md" />
              <p className="text-sm text-slate-500">{dish.ratingCount} lượt đánh giá</p>
            </div>
          </div>
          <div className="mt-6">
            {user ? (
              <ReviewForm dishId={dish.id} slug={slug} />
            ) : (
              <p className="text-sm text-slate-500">
                <Link to="/login" state={{ from: `/menu/${slug}` }} className="font-medium text-ocean-700 underline">Đăng nhập</Link> để đánh giá món ăn bạn đã thưởng thức.
              </p>
            )}
          </div>
        </div>
        <div className="space-y-4 lg:col-span-2">
          {dish.reviews.length === 0 ? (
            <EmptyState icon={Star} title="Chưa có đánh giá" description="Hãy là người đầu tiên đánh giá món này!" />
          ) : (
            dish.reviews.map((r) => (
              <div key={r.id} className="card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-ocean-100 font-semibold text-ocean-800">{r.user.name.charAt(0)}</span>
                    <div>
                      <p className="font-medium">{r.user.name}</p>
                      <Rating value={r.rating} />
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{fromNow(r.createdAt)}</span>
                </div>
                {r.comment && <p className="mt-3 text-slate-600">{r.comment}</p>}
              </div>
            ))
          )}
        </div>
      </section>

      {dish.related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">Có thể bạn cũng thích</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dish.related.map((d) => <DishCard key={d.id} dish={{ ...d, category: dish.category }} />)}
          </div>
        </section>
      )}
    </div>
  );
}
