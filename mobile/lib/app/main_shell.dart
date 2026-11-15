// Khung chính của app: 5 tab dưới (mục 1.3 docs/16).
//
// Mỗi tab giữ lịch sử riêng: đang ở Thực đơn, sang tab Đặt bàn rồi quay lại
// thì Thực đơn vẫn giữ nguyên chỗ đang xem.
//
// Thanh giỏ hàng nổi (FloatingCartBar) sẽ thêm vào đây ở Bước 3.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class MainShell extends StatelessWidget {
  const MainShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) => navigationShell.goBranch(
          index,
          // Bấm lại tab đang mở thì quay về màn đầu của tab đó.
          initialLocation: index == navigationShell.currentIndex,
        ),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_rounded), label: 'Trang chủ'),
          NavigationDestination(icon: Icon(Icons.restaurant_menu_rounded), label: 'Thực đơn'),
          NavigationDestination(icon: Icon(Icons.event_seat_rounded), label: 'Đặt bàn'),
          NavigationDestination(icon: Icon(Icons.receipt_long_rounded), label: 'Hoạt động'),
          NavigationDestination(icon: Icon(Icons.person_rounded), label: 'Tài khoản'),
        ],
      ),
    );
  }
}
