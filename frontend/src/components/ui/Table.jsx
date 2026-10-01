import clsx from 'clsx';

// Bảng dữ liệu đơn giản cho trang admin, cuộn ngang trên màn hình nhỏ
export function Table({ children }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ className, children }) {
  return <th className={clsx('border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold tracking-wide whitespace-nowrap text-slate-500 uppercase', className)}>{children}</th>;
}

export function Td({ className, children, ...props }) {
  return <td className={clsx('border-b border-slate-100 px-4 py-3 align-middle', className)} {...props}>{children}</td>;
}
