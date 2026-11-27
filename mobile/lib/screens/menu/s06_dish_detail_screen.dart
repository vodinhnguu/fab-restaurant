// S06. Chi tiết món: docs/23-app-nhan-vien-phuc-vu.md mục 2 (giao diện như mục S06 docs/16)
// API: GET /dishes/:slug → món + category + reviews[] + related[]
// Thiết kế: design/S06.png
//
// Mở từ S05 khi đang ghi món cho 1 bàn: nhân viên cho khách xem ảnh, mô tả, đánh giá rồi thêm vào phiếu.
//
// Từ trên xuống:
//   parts/dish_app_bar  – ảnh lớn + nút ←, nút phiếu (cuộn lên thì thu lại thành thanh có tên món)
//   parts/dish_header   – danh mục, tên món, sao | đã bán, giá, mô tả
//   "Ghi chú khẩu vị": chip gợi ý + ô nhập (widgets/note_input.dart)
//   parts/dish_reviews – "Đánh giá từ thực khách" (chỉ xem)
//   "Món cùng loại" (widgets/dish_strip.dart)
//   dưới cùng: thanh phiếu nổi (khi phiếu có món) + [ − ] 1 [ + ] "Thêm vào phiếu · 250.000đ"
//              món hết hàng: khối xám "Món này tạm hết"

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../models/dish.dart';
import '../../models/dish_detail.dart';
import '../../services/api_exception.dart';
import '../../services/dish_service.dart';
import '../../state/cart_state.dart';
import '../../theme/app_colors.dart';
import '../../utils/format.dart';
import '../../widgets/app_snackbar.dart';
import '../../widgets/bottom_panel.dart';
import '../../widgets/dish_strip.dart';
import '../../widgets/floating_cart_bar.dart';
import '../../widgets/note_input.dart';
import '../../widgets/quantity_stepper.dart';
import '../../widgets/section_header.dart';
import '../../widgets/state_views.dart';
import 'parts/dish_app_bar.dart';
import 'parts/dish_header.dart';
import 'parts/dish_reviews.dart';

/// Chi tiết 1 món theo slug. autoDispose: rời màn thì bỏ dữ liệu, mở lại thì tải mới.
final dishDetailProvider = FutureProvider.autoDispose.family<DishDetail, String>(
  (ref, slug) => ref.watch(dishServiceProvider).detail(slug),
);

class DishDetailScreen extends ConsumerStatefulWidget {
  const DishDetailScreen({super.key, required this.tableId, required this.slug});

  final int tableId; // bàn đang ghi món
  final String slug;

  @override
  ConsumerState<DishDetailScreen> createState() => _DishDetailScreenState();
}

class _DishDetailScreenState extends ConsumerState<DishDetailScreen> {
  final _note = TextEditingController();
  int _quantity = 1; // món theo phần
  double _weight = 1; // món theo kg: mặc định 1 kg, sửa được (vd 0,98)

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  void _reload() => ref.invalidate(dishDetailProvider(widget.slug));

  /// "Thêm vào phiếu": cộng dồn nếu món đã có (ghi chú mới nối vào ghi chú cũ), rồi số lượng về 1 (1 phần / 1 kg).
  void _addToCart(Dish dish) {
    final cart = ref.read(cartProvider.notifier);
    if (!dish.soldByWeight) {
      final inCart = cart.quantityOf(dish.id);
      if (inCart + _quantity > CartNotifier.maxQuantity) {
        showAppSnack('Mỗi món tối đa ${CartNotifier.maxQuantity} phần, phiếu đang có $inCart phần', error: true);
        return;
      }
    }
    cart.add(dish.toCartItem(quantity: _quantity, weight: _weight, note: _note.text));
    showAppSnack(
      dish.soldByWeight ? 'Đã thêm ${formatKg(_weight)} ${dish.name}' : 'Đã thêm $_quantity × ${dish.name}',
      action: 'Xem phiếu',
      onAction: () {
        if (mounted) context.push(AppRoutes.ticket(widget.tableId));
      },
    );
    FocusScope.of(context).unfocus();
    _note.clear();
    setState(() {
      _quantity = 1;
      _weight = 1;
    });
  }

  @override
  Widget build(BuildContext context) {
    return ref.watch(dishDetailProvider(widget.slug)).when(
          skipLoadingOnRefresh: true,
          skipLoadingOnReload: true,
          loading: () => const _LoadingView(),
          error: (e, _) => Scaffold(
            appBar: AppBar(),
            body: e is ApiException && e.isNotFound
                ? EmptyView(
                    icon: Icons.no_food_outlined,
                    title: 'Không tìm thấy món ăn',
                    message: 'Món này có thể đã ngừng bán.',
                    actionLabel: 'Quay lại chọn món',
                    onAction: () => context.go(AppRoutes.menu(widget.tableId)),
                  )
                : ErrorView(error: e, onRetry: _reload),
          ),
          data: _content,
        );
  }

  Widget _content(DishDetail detail) {
    final dish = detail.dish;
    final description = dish.description?.trim() ?? '';

    return Scaffold(
      body: CustomScrollView(
        keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
        slivers: [
          DishAppBar(dish: dish, tableId: widget.tableId),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
            sliver: SliverList.list(
              children: [
                DishHeader(dish),
                if (dish.tankStockKg != null) ...[
                  const SizedBox(height: 14),
                  _TankStockCard(dish),
                ],
                if (description.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  DishDescription(description),
                ],
                if (dish.isAvailable && !dish.tankEmpty) ...[
                  const SizedBox(height: 24),
                  _NoteSection(controller: _note, dish: dish),
                ],
                const SizedBox(height: 28),
                DishReviews(dish: dish, reviews: detail.reviews),
              ],
            ),
          ),
          if (detail.related.isNotEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: SectionHeader(title: 'Món cùng loại'),
                    ),
                    const SizedBox(height: 12),
                    DishStrip(dishes: detail.related, tableId: widget.tableId, widthFactor: 0.46),
                  ],
                ),
              ),
            ),
        ],
      ),
      bottomNavigationBar: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          FloatingCartBar(tableId: widget.tableId),
          if (!dish.isAvailable)
            const _SoldOutBar()
          else if (dish.tankEmpty)
            const _TankEmptyBar()
          else
            _AddToCartBar(
              byWeight: dish.soldByWeight,
              quantity: _quantity,
              weight: _weight,
              // món theo kg: tiền tạm theo số kg đang chọn, cân thật tại hồ sau
              total: dish.soldByWeight ? (dish.effectivePrice * _weight).round() : dish.effectivePrice * _quantity,
              onQuantityChanged: (q) => setState(() => _quantity = q),
              onWeightChanged: (kg) => setState(() => _weight = kg),
              onAdd: () => _addToCart(dish),
            ),
        ],
      ),
    );
  }
}

/// "Ghi chú khẩu vị (không bắt buộc)": gửi kèm khi bấm "Thêm vào phiếu".
class _NoteSection extends StatelessWidget {
  const _NoteSection({required this.controller, required this.dish});
  final TextEditingController controller;
  final Dish dish;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text.rich(
          TextSpan(
            children: [
              TextSpan(
                text: 'Ghi chú khẩu vị',
                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: AppColors.ocean950),
              ),
              TextSpan(text: ' (không bắt buộc)', style: TextStyle(color: AppColors.slate500, fontSize: 13)),
            ],
          ),
        ),
        const SizedBox(height: 10),
        NoteInput(controller: controller, dishName: dish.name, categoryName: dish.categoryName),
      ],
    );
  }
}

/// Thanh dưới cố định: [ − ] 1 [ + ] + "Thêm vào phiếu · 250.000đ" (tiền = giá × số lượng).
/// Món theo kg: [ − ] 1 kg [ + ] + "Thêm vào phiếu · 1.890.000đ" (tiền tạm = giá 1 kg × số kg).
class _AddToCartBar extends StatelessWidget {
  const _AddToCartBar({
    required this.byWeight,
    required this.quantity,
    required this.weight,
    required this.total,
    required this.onQuantityChanged,
    required this.onWeightChanged,
    required this.onAdd,
  });

  final bool byWeight;
  final int quantity;
  final double weight;
  final int total;
  final ValueChanged<int> onQuantityChanged;
  final ValueChanged<double> onWeightChanged;
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    return BottomPanel(
      child: Row(
        children: [
          if (byWeight)
            WeightStepper(
              value: weight,
              min: CartNotifier.minWeight,
              max: CartNotifier.maxWeight,
              step: CartNotifier.weightStep,
              onChanged: onWeightChanged,
            )
          else
            QuantityStepper(value: quantity, max: CartNotifier.maxQuantity, onChanged: onQuantityChanged),
          const SizedBox(width: 12),
          Expanded(
            child: FilledButton(
              onPressed: onAdd,
              child: FittedBox(fit: BoxFit.scaleDown, child: Text('Thêm vào phiếu · ${formatMoney(total)}')),
            ),
          ),
        ],
      ),
    );
  }
}

/// Món hết hàng: thay thanh "Thêm vào phiếu" bằng khối xám.
class _SoldOutBar extends StatelessWidget {
  const _SoldOutBar();

  @override
  Widget build(BuildContext context) {
    return BottomPanel(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: AppColors.slate200, borderRadius: BorderRadius.circular(12)),
        child: const Row(
          children: [
            Icon(Icons.do_not_disturb_on_outlined, color: AppColors.slate500),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                'Món này tạm hết, mời khách chọn món khác',
                style: TextStyle(color: AppColors.slate500, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Hồ hải sản hết loại này: không cho ghi món.
class _TankEmptyBar extends StatelessWidget {
  const _TankEmptyBar();

  @override
  Widget build(BuildContext context) {
    return BottomPanel(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.danger.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.danger.withValues(alpha: 0.3)),
        ),
        child: const Row(
          children: [
            Icon(Icons.set_meal_rounded, color: AppColors.danger),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                'Hồ đang hết loại này, không thể ghi món',
                style: TextStyle(color: AppColors.danger, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Khung xương lúc đang tải: ảnh + vài dòng chữ.
class _LoadingView extends StatelessWidget {
  const _LoadingView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: ListView(
        physics: const NeverScrollableScrollPhysics(),
        children: [
          SkeletonBox(height: MediaQuery.sizeOf(context).width * 3 / 4 - kToolbarHeight, radius: 0),
          const Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SkeletonBox(width: 60, height: 12),
                SizedBox(height: 10),
                SkeletonBox(width: 230, height: 28),
                SizedBox(height: 14),
                SkeletonBox(width: 180, height: 22),
                SizedBox(height: 16),
                SkeletonBox(width: 150, height: 28),
                SizedBox(height: 16),
                SkeletonBox(height: 96),
              ],
            ),
          ),
        ],
      ),
    );
  }
}


/// Món bán theo kg: khung cho phục vụ biết hồ còn bao nhiêu kg loại hải sản này (docs/27-ton-ho-hai-san.md).
/// Hồ hết (stockKg ≤ 0) → chặn ghi món (_TankEmptyBar). Hồ gần hết / còn hàng → chỉ cảnh báo.
class _TankStockCard extends StatelessWidget {
  const _TankStockCard(this.dish);
  final Dish dish;

  @override
  Widget build(BuildContext context) {
    final kg = dish.tankStockKg!;
    final (text, detail, color) = dish.tankEmpty
        ? ('Hồ hết hàng', 'Hỏi hồ hải sản trước khi hứa với khách.', AppColors.danger)
        : dish.tankLow
            ? ('Hồ gần hết · ${formatKg(kg)}', 'Còn ít, nên xem hồ rồi mới nhận order lớn.', AppColors.amber.foreground)
            : ('Hồ còn ${formatKg(kg)}', 'Dẫn khách ra hồ chọn con rồi cân.', AppColors.success);
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(Icons.set_meal_rounded, size: 20, color: color),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('$text${dish.tankName != null ? ' (${dish.tankName})' : ''}',
                    style: TextStyle(color: color, fontWeight: FontWeight.w700)),
                Text(detail, style: const TextStyle(color: AppColors.slate500, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
