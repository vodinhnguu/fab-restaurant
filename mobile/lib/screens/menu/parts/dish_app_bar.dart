// S06 – Ảnh món tràn mép trên + nút ←, nút phiếu gọi món nổi trên ảnh.
// Cuộn lên: thu thành thanh nền cát có tên món và viền mảnh phía dưới.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../app/routes.dart';
import '../../../models/dish.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/app_network_image.dart';
import '../../../widgets/cart_icon_button.dart';

/// Ảnh lớn tràn mép trên + nút ←, nút phiếu nổi trên ảnh. Cuộn lên: thu thành thanh nền cát có tên món.
class DishAppBar extends StatelessWidget {
  const DishAppBar({super.key, required this.dish, required this.tableId});
  final Dish dish;
  final int tableId;

  void _back(BuildContext context) => context.canPop() ? context.pop() : context.go(AppRoutes.menu(tableId));

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.paddingOf(context).top;
    return SliverAppBar(
      pinned: true,
      expandedHeight: MediaQuery.sizeOf(context).width * 3 / 4,
      backgroundColor: AppColors.sand50,
      surfaceTintColor: Colors.transparent,
      automaticallyImplyLeading: false,
      leading: Padding(
        padding: const EdgeInsets.all(8),
        child: _RoundButton(
          child: BackButton(color: AppColors.ocean900, onPressed: () => _back(context)),
        ),
      ),
      actions: [
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: SizedBox.square(dimension: 40, child: _RoundButton(child: CartIconButton(tableId: tableId))),
        ),
      ],
      // LayoutBuilder: biết thanh đang mở to hay đã thu lại để đổi màu chữ thanh trạng thái và hiện tên món.
      flexibleSpace: LayoutBuilder(
        builder: (context, box) {
          final collapsed = box.maxHeight <= kToolbarHeight + topPadding + 12;
          return AnnotatedRegion<SystemUiOverlayStyle>(
            value: collapsed ? SystemUiOverlayStyle.dark : SystemUiOverlayStyle.light,
            child: Stack(
              fit: StackFit.expand,
              children: [
                FlexibleSpaceBar(
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      AppNetworkImage(dish.image),
                      // Dải tối mờ phía trên để chữ thanh trạng thái (giờ, pin) dễ đọc trên ảnh.
                      const DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment(0, -0.4),
                            colors: [Color(0x66000000), Color(0x00000000)],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                // Đã thu lại: viền mảnh phía dưới để tách thanh với nội dung đang cuộn qua.
                if (collapsed)
                  const Positioned(
                    left: 0,
                    right: 0,
                    bottom: 0,
                    child: Divider(height: 1, thickness: 1, color: AppColors.slate200),
                  ),
                if (collapsed)
                  Positioned(
                    left: 64,
                    right: 64,
                    bottom: 0,
                    height: kToolbarHeight,
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        dish.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 17, color: AppColors.ocean900),
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

/// Nút tròn nền trắng nổi trên ảnh.
class _RoundButton extends StatelessWidget {
  const _RoundButton({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) => DecoratedBox(
        decoration: BoxDecoration(
          color: AppColors.white,
          shape: BoxShape.circle,
          boxShadow: [BoxShadow(color: AppColors.ocean950.withValues(alpha: 0.18), blurRadius: 8)],
        ),
        child: child,
      );
}
