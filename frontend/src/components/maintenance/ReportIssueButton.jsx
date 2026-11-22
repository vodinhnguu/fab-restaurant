import { Wrench } from 'lucide-react';
import { useState } from 'react';
import Button from '../ui/Button';
import TicketFormModal from './TicketFormModal';

// Nút "Báo hỏng" trên thanh tiêu đề trang admin (AdminLayout), hiện cho ai có quyền Thêm ở "Thiết bị & bảo trì".
// Làm thành nút thay vì mục menu để menu của tạp vụ, phục vụ, lễ tân không dài thêm.
export default function ReportIssueButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} title="Báo thiết bị hỏng cho bộ phận kỹ thuật">
        <Wrench className="h-4 w-4" /> <span className="hidden sm:inline">Báo hỏng</span>
      </Button>
      {open && <TicketFormModal showMyReports onClose={() => setOpen(false)} />}
    </>
  );
}
