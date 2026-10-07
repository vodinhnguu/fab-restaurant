import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { CalendarCheck, Clock, Phone, Users } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Button from '../components/ui/Button';
import { Field, Input, Select, Textarea } from '../components/ui/Form';
import { formatDateTime } from '../lib/format';
import { useDocumentTitle, useInfo } from '../lib/hooks';
import { reservationApi } from '../services';
import { useAuthStore } from '../stores/auth';

const IMG = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80&auto=format&fit=crop';

// Tạo danh sách khung giờ 30 phút một, từ giờ mở cửa đến trước giờ đóng 1 tiếng
function timeSlots(open = '10:00', close = '22:00') {
  const slots = [];
  const [oh, om] = open.split(':').map(Number);
  const [ch] = close.split(':').map(Number);
  for (let m = oh * 60 + om; m <= (ch - 1) * 60; m += 30) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  }
  return slots;
}

export default function Reservation() {
  useDocumentTitle('Đặt bàn');
  const user = useAuthStore((s) => s.user);
  const { data: info } = useInfo();
  const [success, setSuccess] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      day: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      time: '19:00',
      guests: 2,
      area: '',
      note: '',
    },
  });

  const mutation = useMutation({
    mutationFn: reservationApi.create,
    onSuccess: (data) => {
      setSuccess(data);
      reset();
    },
    onError: (e) => toast.error(e.message),
  });

  const onSubmit = ({ day, time, ...rest }) => {
    // Ghép ngày + giờ theo múi giờ Việt Nam rồi gửi dạng ISO
    mutation.mutate({ ...rest, date: new Date(`${day}T${time}:00+07:00`).toISOString() });
  };

  if (success) {
    return (
      <div className="container-page flex justify-center py-16">
        <div className="card w-full max-w-md p-8 text-center">
          <CalendarCheck className="mx-auto h-14 w-14 text-green-500" />
          <h1 className="mt-4 text-2xl font-bold">Đặt bàn thành công!</h1>
          <p className="mt-2 text-slate-600">Nhà hàng sẽ gọi xác nhận trong ít phút.</p>
          {!user && <p className="mt-1 text-xs text-slate-500">Hãy lưu lại mã đặt bàn để tra cứu hoặc hủy lịch ở mục <b>Tra cứu</b>.</p>}
          <div className="mt-6 space-y-2 rounded-xl bg-ocean-50 p-4 text-left text-sm">
            <p>Mã đặt bàn: <b className="font-mono">{success.code}</b></p>
            <p>Thời gian: <b>{formatDateTime(success.date)}</b></p>
            <p>Số khách: <b>{success.guests}</b></p>
            {success.area && <p>Khu vực: <b>{success.area}</b></p>}
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <Button as={Link} to={`/reservations/${success.code}?phone=${encodeURIComponent(success.phone)}`} variant="outline">Xem chi tiết</Button>
            <Button onClick={() => setSuccess(null)}>Đặt thêm</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="grid overflow-hidden rounded-3xl bg-white shadow-sm lg:grid-cols-2">
        <div className="relative hidden lg:block">
          <img src={IMG} alt="Không gian nhà hàng" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/90 to-ocean-950/20" />
          <div className="absolute right-8 bottom-8 left-8 space-y-3 text-white">
            <h2 className="heading-display text-3xl text-white">Giữ chỗ cho khoảnh khắc đặc biệt</h2>
            <p className="flex items-center gap-2 text-ocean-100"><Clock className="h-4 w-4" /> {info?.openingHours.open} - {info?.openingHours.close} hằng ngày</p>
            <p className="flex items-center gap-2 text-ocean-100"><Phone className="h-4 w-4" /> Đoàn trên 20 người: gọi {info?.phone}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 sm:p-10">
          <h1 className="heading-display text-3xl">Đặt bàn</h1>
          <p className="text-slate-500">Điền thông tin, chúng tôi sẽ xác nhận qua điện thoại.</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Họ tên" required error={errors.name?.message}>
              <Input invalid={errors.name} {...register('name', { required: 'Vui lòng nhập họ tên' })} />
            </Field>
            <Field label="Số điện thoại" required error={errors.phone?.message}>
              <Input type="tel" invalid={errors.phone} {...register('phone', { required: 'Vui lòng nhập số điện thoại', pattern: { value: /^(0|\+84)\d{9,10}$/, message: 'Số điện thoại không hợp lệ' } })} />
            </Field>
          </div>
          <Field label="Email (không bắt buộc)">
            <Input type="email" {...register('email')} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Ngày" required>
              <Input type="date" min={dayjs().format('YYYY-MM-DD')} {...register('day', { required: true })} />
            </Field>
            <Field label="Giờ" required>
              <Select {...register('time')}>
                {timeSlots(info?.openingHours.open, info?.openingHours.close).map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Số khách" required error={errors.guests?.message}>
              <div className="relative">
                <Users className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="number" min={1} max={50} className="pl-9" {...register('guests', { valueAsNumber: true, min: { value: 1, message: 'Ít nhất 1 khách' }, max: { value: 50, message: 'Tối đa 50' } })} />
              </div>
            </Field>
          </div>
          <Field label="Khu vực mong muốn">
            <Select {...register('area')}>
              <option value="">Không yêu cầu</option>
              {info?.reservationAreas.map((a) => <option key={a}>{a}</option>)}
            </Select>
          </Field>
          <Field label="Ghi chú">
            <Textarea placeholder="Sinh nhật, ghế trẻ em, dị ứng thực phẩm..." {...register('note')} />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>Xác nhận đặt bàn</Button>
        </form>
      </div>
    </div>
  );
}
