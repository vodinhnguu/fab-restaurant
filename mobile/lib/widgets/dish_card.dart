// Thẻ món dùng chung S05 (lưới 2 cột), S06 (món gợi ý), khi nhân viên ghi món cho 1 bàn.
// Theo thiết kế design/S05.png và mục S05 docs/16:
// - Ảnh 4:3. Góc trái: "-15%" (khi giảm giá). Góc phải: "🔥 Best seller" (món nổi bật, giống web).
// - Tên danh mục in hoa màu Ocean 500, tên món 1 dòng (chữ Playfair).
// - Sao + (số đánh giá) + "· Đã bán 120" (ẩn nếu chưa bán).
// - Giá gốc gạch ngang (khi giảm giá), giá bán màu cam + "/phần", nút tròn "+" thêm 1 phần vào phiếu gọi món.
// - Bấm thẻ → S06 Chi tiết món.
//
// Mọi thẻ cao bằng nhau (món không giảm giá vẫn chừa chỗ dòng giá gốc), nên trong lưới
// các thẻ cùng hàng thẳng nhau. Nơi đặt thẻ tính chiều cao bằng DishCard.heightFor(...).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../app/routes.dart';
import '../models/dish.dart';
import '../state/cart_state.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';
import 'app_network_image.dart';
import 'app_snackbar.dart';

class DishCard extends ConsumerWidget {
  const DishCard({super.key, required this.dish, required this.tableId});

  final Dish dish;
  final int tableId; // bàn đang ghi món: mở S06, S08 của đúng bàn

  /// Chiều cao nên cho 1 thẻ rộng [width]: ảnh 4:3 + phần chữ (chữ to theo cài đặt máy thì cao thêm).
  /// Không cần chính xác tuyệt đối: thẻ tự co ảnh lại cho vừa phần chữ.
  /// Phần chữ ≈ 60 (lề, nút "+", khoảng cách) + 84 (4 dòng chữ, to lên theo cỡ chữ của máy).
  static double heightFor(double width, TextScaler textScaler) => width * 3 / 4 + 60 + textScaler.scale(84);

  /// Thêm 1 phần (món theo kg: 1 kg, sửa số kg ở S08) vào phiếu gọi món + snackbar có nút "Xem phiếu".
  void _addToCart(BuildContext context, WidgetRef ref) {
    ref.read(cartProvider.notifier).add(dish.toCartItem());
    showAppSnack(
      dish.soldByWeight ? 'Đã thêm 1 kg "${dish.name}", sửa số kg ở phiếu' : 'Đã thêm "${dish.name}" vào phiếu',
      action: 'Xem phiếu',
      onAction: () {
        if (context.mounted) context.push(AppRoutes.ticket(tableId));
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final image = Stack(
      fit: StackFit.expand,
      children: [
        AppNetworkImage(dish.image),
        Positioned(top: 8, left: 8, right: 8, child: _Badges(dish)),
      ],
    );

    // Thẻ được cho sẵn chiều cao (dải ngang S04, lưới S05): ảnh co giãn lấp phần còn lại,
    // nên chữ to hay font khác cũng không bị tràn. Không giới hạn chiều cao: ảnh đúng tỉ lệ 4:3.
    return LayoutBuilder(
      builder: (context, box) => Card(
        clipBehavior: Clip.antiAlias,
        shadowColor: AppColors.ocean950.withValues(alpha: 0.08),
        elevation: 2,
        child: InkWell(
          onTap: () => context.push(AppRoutes.dish(tableId, dish.slug)),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (box.hasBoundedHeight)
                Expanded(child: image)
              else
                AspectRatio(aspectRatio: 4 / 3, child: image),
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 10, 10, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      (dish.categoryName ?? '').toUpperCase(),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: AppColors.ocean500,
                        fontSize: 11,
                        height: 1.4,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      dish.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.playfairDisplay(
                        fontSize: 16,
                        height: 1.3,
                        fontWeight: FontWeight.w700,
                        color: AppColors.ocean950,
                      ),
                    ),
                    const SizedBox(height: 4),
                    _RatingLine(dish),
                    const SizedBox(height: 8),
                    // Giá gốc gạch ngang. Món không giảm giá: ẩn nhưng vẫn giữ chỗ để thẻ cao bằng nhau.
                    Visibility.maintain(
                      visible: dish.isOnSale,
                      child: Text(
                        formatMoney(dish.price),
                        maxLines: 1,
                        style: const TextStyle(
                          color: AppColors.slate500,
                          fontSize: 12,
                          height: 1.4,
                          decoration: TextDecoration.lineThrough,
                          decorationColor: AppColors.slate500,
                        ),
                      ),
                    ),
                    Row(
                      children: [
                        Expanded(child: _Price(dish)),
                        const SizedBox(width: 6),
                        _AddButton(onPressed: () => _addToCart(context, ref)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Nhãn góc ảnh: "-15%" bên trái (khi giảm giá), "🔥 Best seller" bên phải (món nổi bật).
class _Badges extends StatelessWidget {
  const _Badges(this.dish);
  final Dish dish;

  @override
  Widget build(BuildContext context) {
    // spaceBetween: nhãn giảm giá sát trái, "Best seller" sát phải và được lấy hết chỗ còn lại
    // (chỉ cắt "..." khi thẻ quá hẹp). Không giảm giá thì giữ 1 ô rỗng bên trái.
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        if (dish.isOnSale)
          _Pill(
            text: '-${dish.discountPercent}%',
            background: AppColors.coral600,
            foreground: AppColors.white,
          )
        else
          const SizedBox.shrink(),
        if (dish.isFeatured)
          const Flexible(
            child: _Pill(
              text: 'Best seller',
              background: AppColors.coral500,
              foreground: AppColors.white,
              icon: Icons.local_fire_department_rounded,
            ),
          ),
      ],
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.text, required this.background, required this.foreground, this.icon});
  final String text;
  final Color background;
  final Color foreground;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
        boxShadow: [BoxShadow(color: AppColors.ocean950.withValues(alpha: 0.12), blurRadius: 4)],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 13, color: foreground),
            const SizedBox(width: 2),
          ],
          Flexible(
            child: Text(
              text,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(color: foreground, fontSize: 11, fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}

/// ★ 4.8 (120) · Đã bán 120
class _RatingLine extends StatelessWidget {
  const _RatingLine(this.dish);
  final Dish dish;

  @override
  Widget build(BuildContext context) {
    const muted = TextStyle(color: AppColors.slate500, fontSize: 12, height: 1.4);
    return Row(
      children: [
        const Icon(Icons.star_rounded, size: 16, color: AppColors.star),
        const SizedBox(width: 2),
        Flexible(
          child: Text.rich(
            TextSpan(
              children: [
                if (dish.ratingCount > 0) ...[
                  TextSpan(
                    text: dish.ratingAvg.toStringAsFixed(1),
                    style: muted.copyWith(color: AppColors.slate800, fontWeight: FontWeight.w700),
                  ),
                  TextSpan(text: ' (${dish.ratingCount})', style: muted),
                ] else
                  const TextSpan(text: 'Chưa có đánh giá', style: muted),
                if (dish.soldCount > 0)
                  TextSpan(text: ' · Đã bán ${dish.soldCount}', style: muted),
              ],
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}

/// "250.000đ/phần": giá bán cam đậm + đơn vị xám. Thẻ hẹp thì tự thu nhỏ chữ cho vừa 1 dòng.
class _Price extends StatelessWidget {
  const _Price(this.dish);
  final Dish dish;

  @override
  Widget build(BuildContext context) {
    return FittedBox(
      fit: BoxFit.scaleDown,
      alignment: Alignment.centerLeft,
      child: Text.rich(
        TextSpan(
          children: [
            TextSpan(
              text: formatMoney(dish.effectivePrice),
              style: const TextStyle(color: AppColors.coral600, fontSize: 17, fontWeight: FontWeight.w800),
            ),
            TextSpan(
              text: '/${dish.unit}',
              style: const TextStyle(color: AppColors.slate500, fontSize: 12),
            ),
          ],
        ),
        maxLines: 1,
        style: const TextStyle(height: 1.3),
      ),
    );
  }
}

class _AddButton extends StatelessWidget {
  const _AddButton({required this.onPressed});
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox.square(
      dimension: 34,
      child: IconButton.filled(
        tooltip: 'Thêm vào giỏ',
        onPressed: onPressed,
        padding: EdgeInsets.zero,
        style: IconButton.styleFrom(
          backgroundColor: AppColors.ocean900,
          foregroundColor: AppColors.white,
        ),
        icon: const Icon(Icons.add_rounded, size: 20),
      ),
    );
  }
}
