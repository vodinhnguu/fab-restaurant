import clsx from 'clsx';

const colors = {
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  green: 'bg-green-50 text-green-700 ring-green-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  slate: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  coral: 'bg-coral-50 text-coral-700 ring-coral-600/20',
};

export default function Badge({ color = 'slate', className, children }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset',
        colors[color],
        className,
      )}
    >
      {children}
    </span>
  );
}

// Hiển thị badge từ 1 map trạng thái, vd: <StatusBadge map={ORDER_STATUS} value="PENDING" />
export function StatusBadge({ map, value }) {
  const s = map[value] ?? { label: value, color: 'slate' };
  return <Badge color={s.color}>{s.label}</Badge>;
}
