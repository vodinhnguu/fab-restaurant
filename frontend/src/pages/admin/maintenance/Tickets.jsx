import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { Plus, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TicketCard from '../../../components/maintenance/TicketCard';
import TicketFormModal from '../../../components/maintenance/TicketFormModal';
import PageHeader from '../../../components/PageHeader';
import Button from '../../../components/ui/Button';
import { EmptyState, ErrorState, Spinner } from '../../../components/ui/Feedback';
import { Select } from '../../../components/ui/Form';
import { EQUIPMENT_CATEGORIES } from '../../../lib/constants';
import { useDocumentTitle } from '../../../lib/hooks';
import { maintenanceApi } from '../../../services';

// Các tab lọc: [giá trị trên URL, nhãn, tham số gửi API]
const TABS = [
  ['all', 'Tất cả', { status: 'ACTIVE' }],
  ['mine', 'Của tôi', { status: 'ACTIVE', mine: true }],
  ['open', 'Mới báo', { status: 'OPEN' }],
  ['doing', 'Đang sửa', { status: 'IN_PROGRESS' }],
  ['waiting', 'Chờ linh kiện', { status: 'WAITING_PARTS' }],
];

// Phiếu sửa chữa chưa xong: phiếu gấp lên đầu, rồi phiếu báo lâu nhất
export default function MaintenanceTickets() {
  useDocumentTitle('Kỹ thuật - Phiếu sửa chữa');
  const [params, setParams] = useSearchParams();
  const [adding, setAdding] = useState(false);

  // Lọc lưu trên URL (?tab=mine&category=Bếp) để bấm từ Tổng quan sang là đúng tab
  const tab = params.get('tab') ?? 'all';
  const category = params.get('category') ?? '';
  const query = { ...TABS.find((t) => t[0] === tab)?.[2], ...(category && { category }) };
  const setFilter = (next) => {
    const p = { tab, category, ...next };
    setParams(Object.fromEntries(Object.entries({ tab: p.tab === 'all' ? '' : p.tab, category: p.category }).filter(([, v]) => v)), { replace: true });
  };

  const { data: tickets, isLoading, error, refetch } = useQuery({
    queryKey: ['maintenance', 'tickets', query],
    queryFn: () => maintenanceApi.tickets(query),
    refetchInterval: 30000,
  });

  return (
    <>
      <PageHeader
        title="Phiếu sửa chữa"
        subtitle="Sự cố nhân viên báo. Phiếu gấp ở trên cùng, bấm Nhận sửa để nhận phiếu."
        actions={<Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Tạo phiếu</Button>}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
          {TABS.map(([key, label]) => (
            <button key={key} onClick={() => setFilter({ tab: key })}
              className={clsx('shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition', tab === key ? 'bg-white text-ocean-900 shadow-sm' : 'text-slate-600 hover:text-slate-900')}>
              {label}
            </button>
          ))}
        </div>
        <Select value={category} onChange={(e) => setFilter({ category: e.target.value })} className="w-full sm:w-52">
          <option value="">Mọi nhóm thiết bị</option>
          {EQUIPMENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </Select>
      </div>

      {isLoading ? <Spinner /> : error ? <ErrorState error={error} onRetry={refetch} /> : tickets.length === 0 ? (
        <EmptyState icon={ThumbsUp} title={tab === 'mine' ? 'Bạn không còn phiếu nào' : 'Không có sự cố nào'}
          description={tab === 'mine' ? 'Xem tab Tất cả để nhận phiếu mới.' : 'Mọi thiết bị đang hoạt động bình thường.'} />
      ) : (
        <>
          <p className="mb-3 text-sm text-slate-500">{tickets.length} phiếu</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {tickets.map((t) => <TicketCard key={t.id} ticket={t} />)}
          </div>
        </>
      )}

      {adding && <TicketFormModal title="Tạo phiếu sửa chữa" onClose={() => setAdding(false)} />}
    </>
  );
}
