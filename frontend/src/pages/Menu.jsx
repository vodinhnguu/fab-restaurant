import { keepPreviousData, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { Search, UtensilsCrossed } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DishCard from '../components/DishCard';
import { Select } from '../components/ui/Form';
import { EmptyState, ErrorState, Pagination, Spinner } from '../components/ui/Feedback';
import { SORT_OPTIONS } from '../lib/constants';
import { useCategories, useDocumentTitle } from '../lib/hooks';
import { dishApi } from '../services';

export default function Menu() {
  useDocumentTitle('Thực đơn');
  // Bộ lọc lưu trên URL (?category=tom&sort=popular&page=2) -> chia sẻ link được, F5 không mất
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'popular';
  const page = Number(params.get('page')) || 1;
  const search = params.get('search') || '';
  const [keyword, setKeyword] = useState(search);

  const { data: categories } = useCategories();

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  // Debounce ô tìm kiếm: chờ người dùng ngừng gõ 400ms mới gọi API
  useEffect(() => {
    const t = setTimeout(() => keyword !== search && updateParam('search', keyword.trim()), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const query = { category, sort, page, search, limit: 12 };
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['dishes', query],
    queryFn: () => dishApi.list(query),
    placeholderData: keepPreviousData, // Giữ dữ liệu cũ khi chuyển trang -> không bị nháy
  });

  const chip = (active) =>
    clsx(
      'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition',
      active ? 'bg-ocean-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-ocean-300',
    );

  return (
    <div className="container-page py-10">
      <div className="mb-8 text-center">
        <h1 className="heading-display text-4xl">Thực đơn</h1>
        <p className="mt-2 text-slate-500">Hải sản tươi sống - chế biến theo yêu cầu</p>
      </div>

      <div className="sticky top-16 z-20 -mx-4 mb-6 bg-sand-50/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:px-0">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            <button className={chip(!category)} onClick={() => updateParam('category', '')}>
              Tất cả
            </button>
            {categories?.map((c) => (
              <button key={c.id} className={chip(category === c.slug)} onClick={() => updateParam('category', c.slug)}>
                {c.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1 md:w-64 md:flex-none">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm món..."
                className="h-10 w-full rounded-xl border border-slate-300 bg-white pr-3 pl-9 text-sm focus:border-ocean-500 focus:outline-none"
              />
            </div>
            <Select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="w-36 shrink-0">
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data.data.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title="Không tìm thấy món nào" description="Hãy thử từ khóa hoặc danh mục khác." />
      ) : (
        <>
          <div className={clsx('grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', isFetching && 'opacity-60')}>
            {data.data.map((d) => <DishCard key={d.id} dish={d} />)}
          </div>
          <Pagination page={page} totalPages={data.meta.totalPages} onChange={(p) => updateParam('page', String(p))} />
        </>
      )}
    </div>
  );
}
