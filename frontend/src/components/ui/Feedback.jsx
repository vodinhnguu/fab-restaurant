import clsx from 'clsx';
import { ChevronLeft, ChevronRight, LoaderCircle, Star } from 'lucide-react';

export function Spinner({ className }) {
  return (
    <div className={clsx('flex justify-center py-16', className)}>
      <LoaderCircle className="h-8 w-8 animate-spin text-ocean-500" />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      {Icon && (
        <div className="mb-4 rounded-full bg-ocean-50 p-4">
          <Icon className="h-8 w-8 text-ocean-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="py-16 text-center">
      <p className="text-red-600">{error?.message || 'Đã có lỗi xảy ra'}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 text-sm font-medium text-ocean-600 hover:underline">
          Thử lại
        </button>
      )}
    </div>
  );
}

export function Rating({ value = 0, count, size = 'sm' }) {
  const cls = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={clsx(cls, i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
        ))}
      </span>
      {count !== undefined && <span className="text-xs text-slate-500">({count})</span>}
    </span>
  );
}

export function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded-lg border border-slate-200 bg-white p-2 disabled:opacity-40"
        aria-label="Trang trước"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="px-2 text-sm text-slate-600">
        Trang {page} / {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="rounded-lg border border-slate-200 bg-white p-2 disabled:opacity-40"
        aria-label="Trang sau"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
