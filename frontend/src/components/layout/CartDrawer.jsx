import { ShoppingBag, Trash2, X } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice, imageUrl } from '../../lib/format';
import { selectSubtotal, useCartStore } from '../../stores/cart';
import Button from '../ui/Button';
import { EmptyState } from '../ui/Feedback';
import QuantityInput from '../ui/QuantityInput';

export default function CartDrawer() {
  const { items, isOpen, close, setQuantity, remove } = useCartStore();
  const subtotal = useCartStore(selectSubtotal);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={close} />
      <aside className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-lg font-semibold">Giỏ hàng của bạn</h3>
          <button onClick={close} className="rounded-lg p-1 hover:bg-slate-100" aria-label="Đóng">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Giỏ hàng trống"
            description="Hãy chọn vài món hải sản tươi ngon nhé!"
            action={
              <Button onClick={() => { close(); navigate('/menu'); }}>Xem thực đơn</Button>
            }
          />
        ) : (
          <>
            <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.dishId} className="flex gap-3 py-4">
                  <img src={imageUrl(item.image)} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link to={`/menu/${item.slug}`} onClick={close} className="line-clamp-2 text-sm font-medium hover:text-coral-600">
                        {item.name}
                      </Link>
                      <button onClick={() => remove(item.dishId)} className="text-slate-400 hover:text-red-500" aria-label="Xóa">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-xs text-slate-500">{formatPrice(item.price)} / {item.unit}</span>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QuantityInput size="sm" value={item.quantity} min={0} onChange={(q) => setQuantity(item.dishId, q)} />
                      <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-100 p-5">
              <div className="mb-4 flex justify-between text-base">
                <span>Tạm tính</span>
                <span className="font-bold text-coral-600">{formatPrice(subtotal)}</span>
              </div>
              <Button size="lg" className="w-full" onClick={() => { close(); navigate('/checkout'); }}>
                Tiến hành đặt món
              </Button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
