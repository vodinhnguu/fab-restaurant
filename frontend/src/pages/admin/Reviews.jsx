import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/ui/Button';
import { EmptyState, Pagination, Rating, Spinner } from '../../components/ui/Feedback';
import { Table, Td, Th } from '../../components/ui/Table';
import { formatDateTime } from '../../lib/format';
import { reviewApi } from '../../services';

export default function Reviews() {
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-reviews', page], queryFn: () => reviewApi.list({ page }), placeholderData: keepPreviousData });
  const remove = useMutation({
    mutationFn: reviewApi.remove,
    onSuccess: () => { toast.success('Đã xóa đánh giá'); qc.invalidateQueries({ queryKey: ['admin-reviews'] }); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader title="Đánh giá" subtitle="Kiểm duyệt đánh giá của khách hàng" />
      {isLoading ? <Spinner /> : data.data.length === 0 ? <EmptyState title="Chưa có đánh giá" /> : (
        <>
          <Table>
            <thead><tr><Th>Khách hàng</Th><Th>Món</Th><Th>Đánh giá</Th><Th>Nội dung</Th><Th>Thời gian</Th><Th /></tr></thead>
            <tbody>
              {data.data.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <Td><p className="font-medium">{r.user.name}</p><p className="text-xs text-slate-500">{r.user.email}</p></Td>
                  <Td><Link to={`/menu/${r.dish.slug}`} target="_blank" className="text-ocean-600 hover:underline">{r.dish.name}</Link></Td>
                  <Td><Rating value={r.rating} /></Td>
                  <Td className="max-w-xs text-slate-600">{r.comment || '-'}</Td>
                  <Td className="whitespace-nowrap text-slate-500">{formatDateTime(r.createdAt)}</Td>
                  <Td><Button size="icon" variant="ghost" className="text-red-500" onClick={() => window.confirm('Xóa đánh giá này?') && remove.mutate(r.id)} aria-label="Xóa"><Trash2 className="h-4 w-4" /></Button></Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />
        </>
      )}
    </>
  );
}
