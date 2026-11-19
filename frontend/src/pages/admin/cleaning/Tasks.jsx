import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TaskCard from '../../../components/cleaning/TaskCard';
import TaskFormModal from '../../../components/cleaning/TaskFormModal';
import PageHeader from '../../../components/PageHeader';
import Button from '../../../components/ui/Button';
import { EmptyState, ErrorState, Spinner } from '../../../components/ui/Feedback';
import { Select } from '../../../components/ui/Form';
import { useDocumentTitle } from '../../../lib/hooks';
import { useCan } from '../../../lib/permissions';
import { cleaningApi } from '../../../services';

// Các tab lọc: [giá trị trên URL, nhãn, tham số gửi API]
const TABS = [
  ['all', 'Tất cả', { status: 'OPEN' }],
  ['mine', 'Việc của tôi', { status: 'OPEN', mine: true }],
  ['todo', 'Chờ làm', { status: 'TODO' }],
  ['doing', 'Đang làm', { status: 'IN_PROGRESS' }],
];

// Danh sách việc chưa xong: việc gấp lên đầu, rồi việc đang làm, rồi việc tạo sớm nhất
export default function CleaningTasks() {
  useDocumentTitle('Vệ sinh - Nhiệm vụ');
  const can = useCan();
  const [params, setParams] = useSearchParams();
  const [adding, setAdding] = useState(false);

  // Lọc lưu trên URL (?mine=true&area=3) để bấm từ trang Tổng quan sang là đúng tab
  const tab = params.get('mine') === 'true' ? 'mine' : (params.get('tab') ?? 'all');
  const areaId = params.get('area') ?? '';
  const query = { ...TABS.find((t) => t[0] === tab)?.[2], ...(areaId && { areaId }) };
  const setFilter = (next) => {
    const p = { tab, area: areaId, ...next };
    setParams(Object.fromEntries(Object.entries({ tab: p.tab === 'all' ? '' : p.tab, area: p.area }).filter(([, v]) => v)), { replace: true });
  };

  const { data: tasks, isLoading, error, refetch } = useQuery({
    queryKey: ['cleaning', 'tasks', query],
    queryFn: () => cleaningApi.tasks(query),
    refetchInterval: 30000,
  });
  const { data: areas = [] } = useQuery({ queryKey: ['cleaning', 'areas', false], queryFn: () => cleaningApi.areas() });

  return (
    <>
      <PageHeader
        title="Nhiệm vụ vệ sinh"
        subtitle="Việc cần làm. Việc gấp ở trên cùng, bấm Bắt đầu để nhận việc."
        actions={can('CLEANING', 'create') && <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Thêm việc</Button>}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Điện thoại hẹp: tab cuộn ngang thay vì rớt dòng */}
        <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
          {TABS.map(([key, label]) => (
            <button key={key} onClick={() => setFilter({ tab: key })}
              className={clsx('shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition',tab === key ? 'bg-white text-ocean-900 shadow-sm' : 'text-slate-600 hover:text-slate-900')}>
              {label}
            </button>
          ))}
        </div>
        <Select value={areaId} onChange={(e) => setFilter({ area: e.target.value })} className="w-full sm:w-60">
          <option value="">Mọi khu vực</option>
          {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </Select>
      </div>

      {isLoading ? <Spinner /> : error ? <ErrorState error={error} onRetry={refetch} /> : tasks.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={tab === 'mine' ? 'Bạn không còn việc nào' : 'Không còn việc nào'}
          description={tab === 'mine' ? 'Xem tab Tất cả để nhận việc chưa ai làm.' : 'Mọi khu vực đều đã được dọn. Đi một vòng kiểm tra ở trang Khu vực cần dọn nhé.'}
        />
      ) : (
        <>
          <p className="mb-3 text-sm text-slate-500">{tasks.length} việc</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {tasks.map((t) => <TaskCard key={t.id} task={t} />)}
          </div>
        </>
      )}

      {adding && <TaskFormModal areaId={areaId || undefined} onClose={() => setAdding(false)} />}
    </>
  );
}
