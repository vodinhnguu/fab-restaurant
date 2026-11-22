// S08 – 1 dòng món trong phiếu gọi món (thiết kế design/S08.png):
//   ảnh vuông 80 (bấm → S07)  | tên món (bấm → S06)            🗑
//                             | 250.000đ / phần
//                             | 📝 ghi chú (hoặc "Thêm ghi chú khẩu vị", bấm → S07)
//   [ − ] 2 [ + ]                                   500.000đ
// Món theo kg: [ − ] 1 kg [ + ] (mặc định 1 kg, bấm số để gõ vd 0,98) + tiền tạm = giá 1 kg × số kg.
// Bấm vào con số để gõ số mới. Giảm số phần về 0 = xóa món (màn S08 lo snackbar "Hoàn tác").

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../models/cart_item.dart';
import '../../../state/cart_state.dart';
import '../../../theme/app_colors.dart';
import '../../../utils/format.dart';
import '../../../widgets/app_network_image.dart';
import '../../../widgets/quantity_stepper.dart';

class CartItemTile extends StatelessWidget {
  const CartItemTile({
    super.key,
    required this.item,
    required this.onQuantityChanged,
    required this.onWeightChanged,
    required this.onRemove,
    required this.onEditNote,
    required this.onOpenDish,
  });

  final CartItem item;
  final ValueChanged<int> onQuantityChanged;
  final ValueChanged<double> onWeightChanged; // món theo kg
  final VoidCallback onRemove;
  final VoidCallback onEditNote;
  final VoidCallback onOpenDish;

  @override
  Widget build(BuildContext context) {
    final hasNote = item.note.trim().isNotEmpty;
    return Card(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 14, 6, 14),
        child: Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                InkWell(
                  onTap: onEditNote,
                  borderRadius: BorderRadius.circular(12),
                  child: SizedBox.square(
                    dimension: 80,
                    child: AppNetworkImage(item.image, borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  // Nút thùng rác nổi ở góc phải (Stack) để không đẩy dòng giá xuống thấp.
                  child: Stack(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(right: 40), // chừa chỗ nút thùng rác
                            child: InkWell(
                              onTap: onOpenDish,
                              child: Text(
                                item.name,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.playfairDisplay(
                                  fontSize: 18,
                                  height: 1.3,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.ocean950,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            item.soldByWeight
                                ? '${formatMoney(item.price)} / kg · hồ hải sản cân lại'
                                : '${formatMoney(item.price)} / ${item.unit ?? 'phần'}',
                            style: const TextStyle(color: AppColors.slate500, fontSize: 13),
                          ),
                          const SizedBox(height: 4),
                          // Dòng ghi chú: bấm để mở S07
                          InkWell(
                            onTap: onEditNote,
                            borderRadius: BorderRadius.circular(8),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Icon(
                                    Icons.edit_note_rounded,
                                    size: 18,
                                    color: hasNote ? AppColors.ocean700 : AppColors.slate500,
                                  ),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      hasNote ? item.note : 'Thêm ghi chú khẩu vị',
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: hasNote ? AppColors.ocean700 : AppColors.slate500,
                                        fontWeight: hasNote ? FontWeight.w600 : FontWeight.w400,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      Positioned(
                        top: -6,
                        right: 0,
                        child: IconButton(
                          tooltip: 'Xóa món',
                          onPressed: onRemove,
                          visualDensity: VisualDensity.compact,
                          icon: const Icon(Icons.delete_outline_rounded, color: AppColors.slate500),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Row(
                children: [
                  if (item.soldByWeight)
                    WeightStepper(
                      value: item.weight,
                      min: CartNotifier.minWeight,
                      max: CartNotifier.maxWeight,
                      step: CartNotifier.weightStep,
                      small: true,
                      onChanged: onWeightChanged,
                    )
                  else
                    QuantityStepper(
                      value: item.quantity,
                      min: 0, // về 0 = xóa món
                      max: CartNotifier.maxQuantity,
                      small: true,
                      onChanged: onQuantityChanged,
                    ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerRight,
                      child: Text(
                        formatMoney(item.lineTotal),
                        style: const TextStyle(color: AppColors.coral600, fontSize: 17, fontWeight: FontWeight.w800),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
