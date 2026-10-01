import { cn } from '../../lib/cn';

const base =
  'w-full rounded-xl border bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 transition ' +
  'focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 focus:outline-none disabled:bg-slate-50';

// Bọc 1 ô nhập: nhãn + nội dung + thông báo lỗi
export function Field({ label, error, hint, required, className, children }) {
  return (
    <label className={cn('block', className)}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          {label} {required && <span className="text-coral-600">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      )}
    </label>
  );
}

// ref là prop thường trong React 19 -> react-hook-form register() dùng được trực tiếp
export function Input({ className, invalid, ...props }) {
  return <input className={cn(base, 'h-10', invalid ? 'border-red-400' : 'border-slate-300', className)} {...props} />;
}

export function Textarea({ className, invalid, rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(base, 'py-2.5', invalid ? 'border-red-400' : 'border-slate-300', className)}
      {...props}
    />
  );
}

export function Select({ className, invalid, children, ...props }) {
  return (
    <select className={cn(base, 'h-10 pr-8', invalid ? 'border-red-400' : 'border-slate-300', className)} {...props}>
      {children}
    </select>
  );
}

export function Checkbox({ label, className, ...props }) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700', className)}>
      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-ocean-600" {...props} />
      {label}
    </label>
  );
}
