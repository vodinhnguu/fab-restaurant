import { z } from 'zod';

const itemIds = z
  .array(z.coerce.number().int().positive(), { error: 'Chưa chọn món nào' })
  .min(1, 'Chưa chọn món nào')
  .max(200);

// Nhân viên ghi món cho bàn ("Gửi bếp")
export const addItemsSchema = z.object({
  tableId: z.coerce.number({ error: 'Vui lòng chọn bàn' }).int().positive('Vui lòng chọn bàn'),
  note: z.string().trim().max(500).optional().nullable(),
  items: z
    .array(
      z.object({
        dishId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().min(1).max(50),
        // Món bán theo kg: số kg phục vụ ghi trên app (mặc định 1). Hồ hải sản cân thật rồi xác nhận / sửa lại.
        // Món theo phần thì bỏ qua ô này.
        weight: z.coerce
          .number()
          .min(0.05, 'Món theo kg ít nhất 0,05 kg')
          .max(30, 'Món theo kg nhiều nhất 30 kg')
          .optional()
          .nullable(),
        note: z.string().trim().max(200, 'Ghi chú món tối đa 200 ký tự').optional().nullable(),
      }),
    )
    .min(1, 'Chưa chọn món nào'),
});

// "Check món": served = true tick đã mang ra bàn, false = bỏ tick
export const serveItemsSchema = z.object({
  itemIds,
  served: z.boolean().default(true),
});

// "Hủy món": quantity bỏ trống = hủy cả dòng. reason bắt buộc khi bếp đã làm (kiểm ở service)
export const cancelItemSchema = z.object({
  quantity: z.coerce.number().int().min(1, 'Số phần hủy ít nhất là 1').optional(),
  reason: z.string().trim().max(200, 'Lý do tối đa 200 ký tự').optional().nullable(),
});

// Bếp "Nhận làm"
export const kitchenStartSchema = z.object({ itemIds });

// Hồ hải sản cân món bán theo kg: số kg thực tế (vd 1.25)
export const weighItemSchema = z.object({
  weight: z.coerce
    .number({ error: 'Nhập số kg' })
    .min(0.05, 'Ít nhất 0,05 kg')
    .max(30, 'Nhiều nhất 30 kg, kiểm tra lại số cân'),
});
