// Khung GIỮ CHỖ cho các màn chưa làm (Bước 0).
//
// Mỗi màn hiện mã (vd "S05"), tên màn và các nút đi tới màn kế tiếp theo
// sơ đồ chuyển màn (mục 1.3 docs/16). Làm thật màn nào thì trong file màn đó
// thay PlaceholderScreen bằng giao diện thật. Khi cả 25 màn đã làm xong thì xóa file này.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

/// Dữ liệu mẫu cho các nút thử trong màn giữ chỗ (khớp dữ liệu seed của backend).
class Demo {
  Demo._();
  static const orderCode = 'FAB261027123456';
  static const reservationCode = 'RSV261027123456';
  static const phone = '0901234567';
  static const dishSlug = 'tom-su-hap-bia';
  static const dishName = 'Tôm sú hấp bia';
  static const categorySlug = 'tom';
}

/// Một nút chuyển màn trong khung giữ chỗ.
class PlaceholderLink {
  const PlaceholderLink(this.label, this.onTap);
  final String label;
  final void Function(BuildContext context) onTap;
}

/// Màn giữ chỗ có thanh tiêu đề (dùng cho màn mở toàn màn hình hoặc màn đầu của tab).
class PlaceholderScreen extends StatelessWidget {
  const PlaceholderScreen({
    super.key,
    required this.code,
    required this.title,
    this.note,
    this.links = const [],
    this.isTabRoot = false,
  });

  final String code;
  final String title;
  final String? note;
  final List<PlaceholderLink> links;

  /// Màn đầu của 1 tab dưới: không có nút quay lại / về trang chủ.
  final bool isTabRoot;

  @override
  Widget build(BuildContext context) {
    final canPop = context.canPop();
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        automaticallyImplyLeading: !isTabRoot,
        // Màn mở bằng context.go (không quay lại được), vd S13 sau khi đặt hàng:
        // hiện nút về Trang chủ để khỏi bị kẹt.
        leading: !isTabRoot && !canPop
            ? IconButton(
                tooltip: 'Về trang chủ',
                icon: const Icon(Icons.home_rounded),
                onPressed: () => context.go('/home'),
              )
            : null,
      ),
      body: PlaceholderBody(code: code, title: title, note: note, links: links),
    );
  }
}

/// Phần thân giữ chỗ, không có thanh tiêu đề (dùng cho tab con như S15, S20).
class PlaceholderBody extends StatelessWidget {
  const PlaceholderBody({
    super.key,
    required this.code,
    required this.title,
    this.note,
    this.links = const [],
  });

  final String code;
  final String title;
  final String? note;
  final List<PlaceholderLink> links;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 32),
      children: [
        _CodeBadge(code),
        const SizedBox(height: 12),
        Text(title, textAlign: TextAlign.center, style: AppText.pageTitle()),
        const SizedBox(height: 6),
        Text(
          'Màn hình giữ chỗ. Xem mục $code trong docs/16-dac-ta-app-mobile-stitch.md',
          textAlign: TextAlign.center,
          style: const TextStyle(color: AppColors.slate500, fontSize: 13),
        ),
        if (note != null) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.ocean50,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(note!, style: const TextStyle(color: AppColors.ocean700)),
          ),
        ],
        if (links.isNotEmpty) ...[
          const SizedBox(height: 24),
          const Text(
            'ĐI TỚI',
            style: TextStyle(
              color: AppColors.ocean500,
              fontSize: 12,
              fontWeight: FontWeight.w700,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 8),
          for (final link in links)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: OutlinedButton(
                onPressed: () => link.onTap(context),
                child: Text(link.label),
              ),
            ),
        ],
      ],
    );
  }
}

/// Bottom sheet giữ chỗ (S07, S10, S14).
class PlaceholderSheet extends StatelessWidget {
  const PlaceholderSheet({super.key, required this.code, required this.title, this.note});

  final String code;
  final String title;
  final String? note;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _CodeBadge(code),
            const SizedBox(height: 12),
            Text(title, textAlign: TextAlign.center, style: AppText.sectionTitle()),
            if (note != null) ...[
              const SizedBox(height: 8),
              Text(note!, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.slate500)),
            ],
            const SizedBox(height: 20),
            FilledButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Xong')),
          ],
        ),
      ),
    );
  }
}

class _CodeBadge extends StatelessWidget {
  const _CodeBadge(this.code);
  final String code;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.coral50,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: AppColors.coral500),
        ),
        child: Text(
          code,
          style: const TextStyle(color: AppColors.coral600, fontWeight: FontWeight.w800, fontSize: 16),
        ),
      ),
    );
  }
}
