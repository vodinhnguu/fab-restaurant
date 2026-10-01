import { Flame, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { formatPrice, imageUrl } from '../lib/format';
import { useCartStore } from '../stores/cart';
import { Rating } from './ui/Feedback';

export default function DishCard({ dish }) {
  const add = useCartStore((s) => s.add);
  const onSale = dish.salePrice && dish.salePrice < dish.price;

  const handleAdd = (e) => {
    e.preventDefault();
    add(dish);
    toast.success(`Đã thêm "${dish.name}" vào giỏ`);
  };

  return (
    <Link
      to={`/menu/${dish.slug}`}
      className="group card flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ocean-50">
        <img
          src={imageUrl(dish.image)}
          alt={dish.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {onSale && (
            <span className="rounded-full bg-coral-500 px-2.5 py-1 text-xs font-semibold text-white">
              -{Math.round(100 - (dish.salePrice / dish.price) * 100)}%
            </span>
          )}
          {dish.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ocean-900 backdrop-blur">
              <Flame className="h-3 w-3 text-coral-500" /> Đặc biệt
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium tracking-wide text-ocean-500 uppercase">{dish.category?.name}</p>
        <h3 className="mt-1 line-clamp-1 font-semibold text-ocean-950">{dish.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <Rating value={dish.ratingAvg} count={dish.ratingCount} />
          {dish.soldCount > 0 && <span className="text-xs text-slate-400">· Đã bán {dish.soldCount}</span>}
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <span className="text-lg font-bold text-coral-600">{formatPrice(dish.salePrice ?? dish.price)}</span>
            <span className="text-xs text-slate-400"> /{dish.unit}</span>
            {onSale && <div className="text-xs text-slate-400 line-through">{formatPrice(dish.price)}</div>}
          </div>
          <button
            onClick={handleAdd}
            className="grid h-10 w-10 place-items-center rounded-full bg-ocean-900 text-white transition hover:bg-coral-500"
            aria-label={`Thêm ${dish.name} vào giỏ`}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </Link>
  );
}
