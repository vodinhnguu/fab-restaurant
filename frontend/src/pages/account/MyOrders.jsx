import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ChevronRight, Receipt } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState, Pagination, Spinner } from '../../components/ui/Feedback';
import { ORDER_STATUS } from '../../lib/constants';
import { formatDateTime, formatPrice, imageUrl } from '../../lib/format';
import { useDocumentTitle } from '../../lib/hooks';
import { orderApi } from '../../services';

export default function MyOrders() {
  useDocumentTitle('Đơn hàng của tôi');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', page],
    queryFn: () => orderApi.my({ page }),
    placeholderData: keepPreviousData,
  });

  if (isLoading) return <Spinner />;
  if (!data.data.length) {
    return <EmptyState icon={Receipt} title="Bạn chưa có đơn hàng nào" action={<Button as={Link} to="/menu">Đặt món ngay</Button>} />;
  }

  return (
    <div className="space-y-4">
      {data.data.map((o) => (
        <Link key={o.id} to={`/orders/${o.code}`} className="card block p-5 transition hover:shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-mono font-semibold">{o.code}</span>
              <span className="ml-3 text-sm text-slate-500">{formatDateTime(o.createdAt)}</span>
            </div>
            <StatusBadge map={ORDER_STATUS} value={o.status} />
          </div>
          <div className="mt-4 flex items-center gap-2">
            {o.items.slice(0, 4).map((i) => (
              <img key={i.id} src={imageUrl(i.dish?.image)} alt={i.name} title={i.name} className="h-12 w-12 rounded-lg object-cover" />
            ))}
            {o.items.length > 4 && <span className="text-sm text-slate-500">+{o.items.length - 4}</span>}
            <div className="ml-auto flex items-center gap-1 text-right">
              <span className="font-bold text-coral-600">{formatPrice(o.total)}</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </Link>
      ))}
      <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />
    </div>
  );
}
