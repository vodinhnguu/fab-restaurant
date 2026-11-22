// Dải thẻ món cuộn ngang: S06 "Món cùng loại".
// Thẻ hẹp hơn màn hình để thấy hé thẻ kế tiếp, gợi ý cuộn ngang.
//
//   DishStrip(dishes: related, tableId: 5, widthFactor: 0.46)   // mỗi thẻ rộng 46% màn hình
//   DishStrip.skeleton()                             // khung xương lúc đang tải

import 'package:flutter/material.dart';

import '../models/dish.dart';
import 'dish_card.dart';
import 'state_views.dart';

class DishStrip extends StatelessWidget {
  const DishStrip({super.key, required List<Dish> this.dishes, required this.tableId, this.widthFactor = 0.66});

  /// Khung xương: 2 ô xám cỡ thẻ món.
  const DishStrip.skeleton({super.key, this.widthFactor = 0.66}) : dishes = null, tableId = 0;

  final List<Dish>? dishes;
  final int tableId; // bàn đang ghi món

  /// Thẻ rộng bằng bao nhiêu phần màn hình (0.66 = 2/3).
  final double widthFactor;

  @override
  Widget build(BuildContext context) {
    final cardWidth = (MediaQuery.sizeOf(context).width * widthFactor).clamp(160.0, 300.0);
    final items = dishes;
    return SizedBox(
      height: DishCard.heightFor(cardWidth, MediaQuery.textScalerOf(context)),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: items?.length ?? 2,
        separatorBuilder: (_, _) => const SizedBox(width: 12),
        itemBuilder: (_, i) => SizedBox(
          width: cardWidth,
          child: items == null
              ? const SkeletonBox(height: double.infinity, radius: 16)
              : DishCard(dish: items[i], tableId: tableId),
        ),
      ),
    );
  }
}
