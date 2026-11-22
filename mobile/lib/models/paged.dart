// Một trang dữ liệu có phân trang: khớp { data: [...], meta: { page, totalPages, total } }.

class Paged<T> {
  const Paged({required this.items, this.page = 1, this.totalPages = 1, this.total = 0});

  final List<T> items;
  final int page;
  final int totalPages;
  final int total;

  /// Còn trang sau không (cuộn tới cuối thì tải tiếp ở S05).
  bool get hasMore => page < totalPages;
}
