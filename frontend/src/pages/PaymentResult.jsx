import { useQuery } from '@tanstack/react-query';
import { CircleCheck, CircleX } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Spinner } from '../components/ui/Feedback';
import { formatPrice } from '../lib/format';
import { useDocumentTitle } from '../lib/hooks';
import { paymentApi } from '../services';

// /payment/vnpay-return?vnp_Amount=...&vnp_ResponseCode=...&vnp_SecureHash=...
// VNPay đưa khách về đây sau khi thanh toán. KHÔNG tự đọc vnp_ResponseCode để báo thành công
// (ai cũng sửa được URL) - gửi nguyên query lên backend kiểm tra chữ ký rồi mới tin.
export default function PaymentResult() {
  useDocumentTitle('Kết quả thanh toán');
  const { search } = useLocation();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['vnpay-return', search],
    queryFn: () => paymentApi.vnpayReturn(search),
    retry: false,
    staleTime: Infinity,
  });

  if (isLoading) return <Spinner className="py-32" />;

  const detailUrl = data && `/orders/${data.orderCode}?phone=${encodeURIComponent(data.phone)}`;

  return (
    <div className="container-page max-w-lg py-16 text-center">
      {data?.paid ? (
        <CircleCheck className="mx-auto h-16 w-16 text-green-500" />
      ) : (
        <CircleX className="mx-auto h-16 w-16 text-red-500" />
      )}
      <h1 className="mt-4 text-2xl font-bold">{data?.paid ? 'Thanh toán thành công!' : 'Thanh toán chưa thành công'}</h1>
      <p className="mt-2 text-slate-600">{isError ? error.message : data.message}</p>

      {data && (
        <dl className="card mx-auto mt-6 space-y-2 p-5 text-left text-sm">
          <div className="flex justify-between"><dt className="text-slate-500">Mã đơn</dt><dd className="font-mono font-semibold">{data.orderCode}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Số tiền</dt><dd className="font-semibold">{formatPrice(data.amount)}</dd></div>
          {data.transactionNo && data.transactionNo !== '0' && (
            <div className="flex justify-between"><dt className="text-slate-500">Mã giao dịch VNPay</dt><dd className="font-mono">{data.transactionNo}</dd></div>
          )}
          {data.bankCode && <div className="flex justify-between"><dt className="text-slate-500">Ngân hàng</dt><dd>{data.bankCode}</dd></div>}
        </dl>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {data ? (
          <Button as={Link} to={detailUrl} replace>
            {data.paid ? 'Xem đơn hàng' : 'Xem đơn & thanh toán lại'}
          </Button>
        ) : (
          <Button as={Link} to="/track">Tra cứu đơn hàng</Button>
        )}
        <Button as={Link} to="/menu" variant="outline">Tiếp tục đặt món</Button>
      </div>
    </div>
  );
}
