// S05. Chọn món (ghi món cho 1 bàn): docs/23-app-nhan-vien-phuc-vu.md mục 2
// API: GET /categories, GET /dishes?search=&category=<slug>&sort=&page=&limit=12
// Thiết kế: design/S05.png (màn Thực đơn cũ của app khách, giữ nguyên lưới món)
//
// Mở từ S04 ("Ghi món" / "Thêm món"), phiếu gọi món đã gắn sẵn vào bàn (ticketTableProvider).
//
// Từ trên xuống:
//   thanh trên: "Ghi món" + "Bàn B05", nút phiếu (có số món) → S08
//   parts/menu_toolbar    – ô tìm món + nút sắp xếp (bottom sheet "Sắp xếp theo")
//   parts/category_chips  – dải chip danh mục, ghim trên đầu khi cuộn
//   lưới thẻ món          – widgets/dish_card.dart: nút "+" thêm 1 phần vào phiếu, bấm thẻ → S06
//   dưới cùng: thanh "Bàn B05 · 3 món · 850.000đ   Xem phiếu ›" (khi phiếu có món)
//
// Bộ lọc (từ khóa, danh mục, cách sắp xếp) giữ trong màn: mở S06 rồi quay lại vẫn còn nguyên, kể cả vị trí cuộn.

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../models/dish.dart';
import '../../services/api_exception.dart';
import '../../services/dish_service.dart';
import '../../state/cart_state.dart';
import '../../state/catalog_state.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_snackbar.dart';
import '../../widgets/cart_icon_button.dart';
import '../../widgets/dish_card.dart';
import '../../widgets/floating_cart_bar.dart';
import '../../widgets/state_views.dart';
import 'parts/category_chips.dart';
import 'parts/menu_toolbar.dart';

class MenuScreen extends ConsumerStatefulWidget {
  const MenuScreen({super.key, required this.tableId});

  /// Bàn đang ghi món (lấy từ đường đi /tables/:id/menu).
  final int tableId;

  @override
  ConsumerState<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends ConsumerState<MenuScreen> {
  static const _searchDelay = Duration(milliseconds: 400); // gõ xong 0,4 giây mới tìm
  static const _gridGap = 12.0;

  final _searchController = TextEditingController();
  final _scroll = ScrollController();
  final _headerKey = GlobalKey(); // khối phía trên dải chip, để biết khối này cao bao nhiêu
  Timer? _searchTimer;

  // Bộ lọc
  String? _category; // slug danh mục, null = "Tất cả"
  String _search = '';
  DishSort _sort = DishSort.popular;

  // Danh sách món đã tải
  final _dishes = <Dish>[];
  int _page = 0; // trang cuối đã tải xong
  bool _hasMore = true;
  bool _loading = false;
  Object? _error;

  /// Tăng lên mỗi lần đổi bộ lọc. Lần tải cũ về trễ thì bỏ kết quả, không trộn vào danh sách mới.
  int _requestId = 0;

  @override
  void initState() {
    super.initState();
    _scroll.addListener(_onScroll);
    _restart();
  }

  @override
  void dispose() {
    _searchTimer?.cancel();
    _searchController.dispose();
    _scroll.dispose();
    super.dispose();
  }

  // ---------- Tải danh sách ----------

  /// Tải trang [page] theo bộ lọc hiện tại, xong thì vẽ lại.
  /// Lúc bắt đầu chỉ đổi biến chứ chưa vẽ lại "đang tải": nơi gọi tự setState
  /// (trừ initState, vì sau hàm này màn luôn vẽ lại).
  Future<void> _load(int page) async {
    final id = _requestId;
    _loading = true;
    _error = null;
    try {
      final result = await ref.read(dishServiceProvider).dishes(
            search: _search,
            category: _category,
            sort: _sort,
            page: page,
          );
      if (!mounted || id != _requestId) return; // bộ lọc đã đổi trong lúc chờ
      setState(() {
        if (page == 1) _dishes.clear();
        _dishes.addAll(result.items);
        _page = page;
        _hasMore = result.hasMore;
        _loading = false;
      });
      // Danh sách quá ngắn, chưa cuộn được: kiểm tra luôn xem có cần tải tiếp không.
      WidgetsBinding.instance.addPostFrameCallback((_) => _onScroll());
    } catch (e) {
      if (!mounted || id != _requestId) return;
      // Kéo để tải lại bị lỗi mà đang có món: giữ danh sách cũ, chỉ báo lỗi.
      final keepOld = page == 1 && _dishes.isNotEmpty;
      setState(() {
        _loading = false;
        if (!keepOld) _error = e;
      });
      if (keepOld) showAppSnack(e is ApiException ? e.message : 'Không tải được dữ liệu', error: true);
    }
  }

  /// Bộ lọc vừa đổi: xóa danh sách, tải lại từ trang 1.
  void _restart() {
    _requestId++;
    _dishes.clear();
    _page = 0;
    _hasMore = true;
    _load(1);
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToChips());
  }

  /// Kéo xuống để tải lại: tải lại danh mục và trang 1, vẫn hiện danh sách cũ trong lúc chờ.
  Future<void> _refresh() {
    ref.invalidate(categoriesProvider);
    _requestId++;
    final done = _load(1);
    setState(() {});
    return done;
  }

  /// Cuộn gần tới cuối (còn dưới 600 điểm ảnh) thì tải trang tiếp.
  void _onScroll() {
    if (!_scroll.hasClients || _loading || !_hasMore || _error != null || _dishes.isEmpty) return;
    if (_scroll.position.extentAfter > 600) return;
    _load(_page + 1);
    setState(() {});
  }

  /// Nút "Thử lại": tải lại đúng trang vừa lỗi.
  void _retry() {
    _load(_dishes.isEmpty ? 1 : _page + 1);
    setState(() {});
  }

  /// Đang cuộn sâu mà đổi bộ lọc: đưa về chỗ dải chip vừa ghim trên đầu, thấy ngay món đầu tiên.
  void _scrollToChips() {
    // S05 nằm dưới S06 (mở thẳng đường dẫn món) thì chưa được vẽ, chưa có kích thước: bỏ qua
    final box = _headerKey.currentContext?.findRenderObject();
    if (box is! RenderBox || !box.hasSize || !_scroll.hasClients) return;
    final headerHeight = box.size.height;
    if (_scroll.offset > headerHeight) _scroll.jumpTo(headerHeight);
  }

  // ---------- Bộ lọc ----------

  void _onSearchChanged(String text) {
    _searchTimer?.cancel();
    _searchTimer = Timer(_searchDelay, () => _applySearch(text));
  }

  /// Tìm theo [text]: hết 0,4 giây chờ, hoặc bấm nút tìm trên bàn phím thì tìm ngay.
  void _applySearch(String text) {
    _searchTimer?.cancel();
    final keyword = text.trim();
    if (keyword == _search) return;
    _search = keyword;
    _restart();
    setState(() {});
  }

  void _clearSearch() {
    _searchController.clear();
    _applySearch('');
  }

  void _changeSort(DishSort sort) {
    _sort = sort;
    _restart();
    setState(() {});
  }

  /// Bấm chip: đổi danh mục, tải lại từ trang 1.
  void _selectCategory(String? slug) {
    if (slug == _category) return;
    _category = slug;
    _restart();
    setState(() {});
  }

  /// Nút "Xem tất cả món" khi không tìm thấy: bỏ từ khóa và danh mục.
  void _clearFilters() {
    _searchTimer?.cancel();
    _searchController.clear();
    _search = '';
    _category = null;
    _restart();
    setState(() {});
  }

  // ---------- Giao diện ----------

  @override
  Widget build(BuildContext context) {
    final table = ref.watch(ticketTableProvider);
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Ghi món'),
            if (table != null)
              Text(
                'Bàn ${table.code}',
                style: const TextStyle(fontSize: 12, color: AppColors.slate500, fontWeight: FontWeight.w400),
              ),
          ],
        ),
        actions: [CartIconButton(tableId: widget.tableId), const SizedBox(width: 4)],
      ),
      bottomNavigationBar: FloatingCartBar(tableId: widget.tableId),
      body: RefreshIndicator(
        color: AppColors.coral500,
        onRefresh: _refresh,
        child: CustomScrollView(
          controller: _scroll,
          // Luôn kéo được (kể cả khi trống / lỗi) để kéo-tải-lại hoạt động.
          physics: const AlwaysScrollableScrollPhysics(),
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                key: _headerKey,
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    MenuToolbar(
                      searchController: _searchController,
                      onSearchChanged: _onSearchChanged,
                      onSearchSubmitted: _applySearch,
                      onSearchCleared: _clearSearch,
                      sort: _sort,
                      onSortChanged: _changeSort,
                    ),
                  ],
                ),
              ),
            ),
            // Dải chip ghim trên đầu khi cuộn xuống.
            PinnedHeaderSliver(
              child: DecoratedBox(
                decoration: const BoxDecoration(
                  color: AppColors.sand50,
                  border: Border(bottom: BorderSide(color: AppColors.slate200)),
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  child: CategoryChips(
                    categories: ref.watch(categoriesProvider),
                    selected: _category,
                    onSelected: _selectCategory,
                  ),
                ),
              ),
            ),
            ..._content(),
          ],
        ),
      ),
    );
  }

  /// Phần dưới dải chip: khung xương / lỗi / trống / lưới món.
  List<Widget> _content() {
    if (_dishes.isEmpty) {
      if (_loading) {
        return [_grid(itemCount: 4, builder: (_) => const SkeletonBox(height: double.infinity, radius: 16))];
      }
      if (_error != null) {
        return [SliverFillRemaining(hasScrollBody: false, child: ErrorView(error: _error!, onRetry: _retry))];
      }
      final filtered = _search.isNotEmpty || _category != null;
      return [
        SliverFillRemaining(
          hasScrollBody: false,
          child: EmptyView(
            icon: Icons.restaurant_rounded,
            title: 'Không tìm thấy món nào',
            message: 'Hãy thử từ khóa hoặc danh mục khác.',
            actionLabel: filtered ? 'Xem tất cả món' : null,
            onAction: _clearFilters,
          ),
        ),
      ];
    }

    return [
      _grid(itemCount: _dishes.length, builder: (i) => DishCard(dish: _dishes[i], tableId: widget.tableId)),
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        sliver: SliverToBoxAdapter(child: _footer()),
      ),
    ];
  }

  /// Cuối danh sách: đang tải trang tiếp / lỗi tải trang tiếp / đã hết món.
  Widget _footer() {
    if (_loading) return const LoadingView();
    if (_error != null) return InlineError(error: _error!, onRetry: _retry);
    if (_hasMore) return const SizedBox.shrink();
    return const _CustomCookingCard();
  }

  /// Lưới thẻ món: điện thoại 2 cột, máy tính bảng 3–4 cột. Thẻ cao bằng nhau (DishCard.heightFor).
  Widget _grid({required int itemCount, required Widget Function(int) builder}) {
    return SliverPadding(
      padding: const EdgeInsets.all(16),
      sliver: SliverLayoutBuilder(
        builder: (context, constraints) {
          final width = constraints.crossAxisExtent;
          final columns = (width / 220).floor().clamp(2, 4);
          final cardWidth = (width - _gridGap * (columns - 1)) / columns;
          return SliverGrid.builder(
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: columns,
              crossAxisSpacing: _gridGap,
              mainAxisSpacing: 16,
              mainAxisExtent: DishCard.heightFor(cardWidth, MediaQuery.textScalerOf(context)),
            ),
            itemCount: itemCount,
            itemBuilder: (_, i) => builder(i),
          );
        },
      ),
    );
  }
}

/// Ô cuối danh sách (thiết kế S05): nhắc món nào cũng chế biến được theo khẩu vị khách
/// (ghi chú khi thêm món ở S06 / S07).
class _CustomCookingCard extends StatelessWidget {
  const _CustomCookingCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.sand100,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.slate200),
      ),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 22,
            backgroundColor: AppColors.ocean100,
            child: Icon(Icons.set_meal_rounded, color: AppColors.ocean700),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Chế biến theo khẩu vị',
                  style: GoogleFonts.playfairDisplay(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: AppColors.ocean950,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Hấp sả, rang muối tuyết, sốt tiêu đen hoặc nướng bơ tỏi tùy ý quý khách.',
                  style: TextStyle(color: AppColors.slate500, fontSize: 13, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
