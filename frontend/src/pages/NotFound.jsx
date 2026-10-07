import { Fish } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { EmptyState } from '../components/ui/Feedback';
import { useDocumentTitle } from '../lib/hooks';

export default function NotFound() {
  useDocumentTitle('Không tìm thấy trang');
  return (
    <EmptyState
      icon={Fish}
      title="404 - Trang không tồn tại"
      description="Có vẻ con cá này đã bơi đi mất rồi..."
      action={<Button as={Link} to="/">Về trang chủ</Button>}
    />
  );
}
