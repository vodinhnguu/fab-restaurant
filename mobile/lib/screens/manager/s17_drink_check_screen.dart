// S17. Quản lý · Kiểm bia nước: docs/29-kiem-bia-nuoc.md
// API: GET /drinks/check?date=, PUT /drinks/check
//
// Thu ngân / quản lý đứng ở quầy, cuối ngày mở màn này:
//   - mỗi loại 1 thẻ: xuất bao nhiêu THÙNG ra quầy, bán bao nhiêu (tự tính theo đơn), trả lại bao nhiêu
//   - lệch = (bán + trả lại) − xuất:  0 = khớp, ÂM = thiếu hàng, DƯƠNG = thừa
//   - bấm thẻ → sheet nhập số thùng / lon lẻ / trả lại + ghi chú
//
// Đầu màn có khung tổng kết ngày: đã kiểm mấy loại, tổng lệch, loại nào lệch.
// Chọn ngày bằng nút ở thanh tiêu đề (xem lại hôm qua, không ghi được cho ngày chưa tới).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/drink_check.dart';
import '../../services/api_exception.dart';
import '../../services/drink_service.dart';
import '../../state/auth_state.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../utils/format.dart';
import '../../widgets/app_snackbar.dart';
import '../../widgets/quantity_stepper.dart';
import '../../widgets/state_views.dart';

/// yyyy-MM-dd theo giờ Việt Nam.
String _ymd(DateTime d) =>
    '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

class DrinkCheckScreen extends ConsumerStatefulWidget {
  const DrinkCheckScreen({super.key});

  @override
  ConsumerState<DrinkCheckScreen> createState() => _DrinkCheckScreenState();
}

class _DrinkCheckScreenState extends ConsumerState<DrinkCheckScreen> {
  /// '' = hôm nay (để backend tự lấy ngày theo giờ VN).
  String _date = '';

  DateTime get _shownDay => _date.isEmpty ? DateTime.now() : DateTime.parse(_date);

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _shownDay,
      firstDate: now.subtract(const Duration(days: 90)),
      lastDate: now, // không kiểm cho ngày chưa tới
      helpText: 'Chọn ngày kiểm',
    );
    if (picked == null) return;
    setState(() => _date = _ymd(picked) == _ymd(now) ? '' : _ymd(picked));
  }

  Future<void> _edit(DrinkCheckRow row) async {
    final saved = await showDrinkCheckSheet(context, row: row, date: _date);
    if (saved == null || !mounted) return;
    showAppSnack(saved);
    ref.invalidate(drinkCheckProvider(_date));
  }

  @override
  Widget build(BuildContext context) {
    final value = ref.watch(drinkCheckProvider(_date));
    final user = ref.watch(currentUserProvider);
    final canEdit = user?.canCheckDrinks ?? false;
    final isToday = _date.isEmpty;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Kiểm bia nước'),
            Text(
              isToday ? 'Hôm nay ${formatDate(DateTime.now())}' : formatDate(_shownDay),
              style: const TextStyle(fontSize: 12, color: AppColors.slate500, fontWeight: FontWeight.w400),
            ),
          ],
        ),
        actions: [
          IconButton(tooltip: 'Chọn ngày', onPressed: _pickDate, icon: const Icon(Icons.calendar_today_rounded)),
          IconButton(
            tooltip: 'Tải lại',
            onPressed: () => ref.invalidate(drinkCheckProvider(_date)),
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: AsyncView(
        value: value,
        onRetry: () => ref.invalidate(drinkCheckProvider(_date)),
        data: (day) => RefreshIndicator(
          color: AppColors.coral500,
          onRefresh: () async => ref.invalidate(drinkCheckProvider(_date)),
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
            children: [
              _DaySummary(day),
              const SizedBox(height: 8),
              if (!canEdit)
                const Padding(
                  padding: EdgeInsets.only(bottom: 8),
                  child: Text(
                    'Tài khoản của bạn chỉ xem. Ghi số xuất / trả lại cần quyền Sửa "Bia nước & kiểm kho quầy".',
                    style: TextStyle(color: AppColors.slate500, fontSize: 12),
                  ),
                ),
              for (final row in day.rows)
                _DrinkTile(row: row, canEdit: canEdit, onTap: canEdit ? () => _edit(row) : null),
            ],
          ),
        ),
      ),
    );
  }
}

/// Khung tổng kết ngày: đã kiểm mấy loại, tổng lệch, loại nào lệch.
class _DaySummary extends StatelessWidget {
  const _DaySummary(this.day);
  final DrinkDayCheck day;

  @override
  Widget build(BuildContext context) {
    final diff = day.diff;
    final (color, text) = day.checked == 0
        ? (AppColors.slate500, 'Chưa kiểm loại nào')
        : diff < 0
            ? (AppColors.danger, 'Thiếu ${diff.abs()} lon / chai')
            : diff > 0
                ? (AppColors.amber.foreground, 'Thừa $diff lon / chai')
                : (AppColors.success, 'Khớp hết');

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                day.checked == 0
                    ? Icons.pending_actions_rounded
                    : diff == 0
                        ? Icons.check_circle_rounded
                        : Icons.warning_amber_rounded,
                color: color,
              ),
              const SizedBox(width: 8),
              Expanded(child: Text(text, style: TextStyle(fontWeight: FontWeight.w800, color: color, fontSize: 16))),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'Đã kiểm ${day.checked}/${day.total} loại'
            '${day.mismatched > 0 ? ' · ${day.mismatched} loại lệch' : ''}',
            style: const TextStyle(color: AppColors.slate500, fontSize: 13),
          ),
          Text(
            'Cả ngày: xuất ${day.issued} · bán ${day.sold} · trả lại ${day.returned}',
            style: const TextStyle(color: AppColors.slate500, fontSize: 13),
          ),
        ],
      ),
    );
  }
}

/// 1 loại đồ uống: xuất / bán / trả lại / lệch. Bấm để nhập số (nếu có quyền).
class _DrinkTile extends StatelessWidget {
  const _DrinkTile({required this.row, required this.canEdit, this.onTap});
  final DrinkCheckRow row;
  final bool canEdit;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final color = !row.checked
        ? AppColors.slate500
        : row.isMissing
            ? AppColors.danger
            : row.isExtra
                ? AppColors.amber.foreground
                : AppColors.success;

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          row.name,
                          style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.ocean900),
                        ),
                        Text(
                          'Thùng ${row.packSize} ${row.unit}',
                          style: const TextStyle(color: AppColors.slate500, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      row.diffLabel,
                      style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 12),
                    ),
                  ),
                  if (canEdit) const Icon(Icons.chevron_right_rounded, color: AppColors.slate500),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  _Cell(
                    label: 'Xuất ra quầy',
                    value: row.checked ? '${row.issued}' : '—',
                    sub: row.checked && row.issuedPacks > 0 ? '${row.issuedPacks} thùng' : null,
                  ),
                  _Cell(label: 'Bán theo đơn', value: '${row.sold}', color: AppColors.ocean900),
                  _Cell(label: 'Trả lại', value: row.checked ? '${row.returned}' : '—'),
                ],
              ),
              if (row.note != null && row.note!.trim().isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text('Ghi chú: ${row.note}', style: const TextStyle(color: AppColors.ocean700, fontSize: 12)),
                ),
              if (row.by != null)
                Text('Người kiểm: ${row.by}', style: const TextStyle(color: AppColors.slate500, fontSize: 12)),
            ],
          ),
        ),
      ),
    );
  }
}

class _Cell extends StatelessWidget {
  const _Cell({required this.label, required this.value, this.sub, this.color});
  final String label;
  final String value;
  final String? sub;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(label, style: const TextStyle(color: AppColors.slate500, fontSize: 11)),
          Text(
            value,
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: color ?? AppColors.slate800, height: 1.2),
          ),
          Text(sub ?? '', style: const TextStyle(color: AppColors.slate500, fontSize: 11)),
        ],
      ),
    );
  }
}

/// Sheet nhập số: thùng xuất ra quầy, lon lẻ, số trả lại cuối ngày. Trả về câu thông báo nếu đã lưu.
Future<String?> showDrinkCheckSheet(BuildContext context, {required DrinkCheckRow row, required String date}) =>
    showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.75,
        maxChildSize: 0.95,
        builder: (context, scroll) => _CheckSheet(row: row, date: date, scroll: scroll),
      ),
    );

class _CheckSheet extends ConsumerStatefulWidget {
  const _CheckSheet({required this.row, required this.date, required this.scroll});
  final DrinkCheckRow row;
  final String date;
  final ScrollController scroll;

  @override
  ConsumerState<_CheckSheet> createState() => _CheckSheetState();
}

class _CheckSheetState extends ConsumerState<_CheckSheet> {
  late int _packs = widget.row.issuedPacks;
  late int _units = widget.row.issuedUnits;
  late int _returned = widget.row.returned;
  late final TextEditingController _note = TextEditingController(text: widget.row.note ?? '');
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  int get _issued => _packs * widget.row.packSize + _units;
  int get _diff => widget.row.sold + _returned - _issued;

  Future<void> _save() async {
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final message = await ref.read(drinkServiceProvider).saveCheck(
            productId: widget.row.productId,
            date: widget.date.isEmpty ? null : widget.date,
            issuedPacks: _packs,
            issuedUnits: _units,
            returnedUnits: _returned,
            note: _note.text,
          );
      if (mounted) Navigator.pop(context, message);
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final r = widget.row;
    final color = _diff < 0 ? AppColors.danger : (_diff > 0 ? AppColors.amber.foreground : AppColors.success);
    final text = _diff == 0 ? 'Khớp' : (_diff < 0 ? 'Thiếu ${_diff.abs()} ${r.unit}' : 'Thừa $_diff ${r.unit}');

    return Column(
      children: [
        Expanded(
          child: ListView(
            controller: widget.scroll,
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
            children: [
              Text(r.name, style: AppText.sectionTitle()),
              Text(
                'Thùng ${r.packSize} ${r.unit} · đã bán theo đơn: ${r.sold} ${r.unit}',
                style: const TextStyle(color: AppColors.slate500, fontSize: 13),
              ),
              const SizedBox(height: 16),

              _Field(
                label: 'Xuất ra quầy (số thùng)',
                hint: '$_packs thùng × ${r.packSize} = ${_packs * r.packSize} ${r.unit}',
                child: QuantityStepper(
                  value: _packs,
                  min: 0,
                  max: 200,
                  onChanged: _saving ? (_) {} : (v) => setState(() => _packs = v),
                ),
              ),
              _Field(
                label: 'Xuất thêm lẻ (${r.unit})',
                hint: 'Lấy thêm ngoài thùng, không có thì để 0',
                child: QuantityStepper(
                  value: _units,
                  min: 0,
                  max: 500,
                  onChanged: _saving ? (_) {} : (v) => setState(() => _units = v),
                ),
              ),
              _Field(
                label: 'Trả lại kho cuối ngày (${r.unit})',
                hint: 'Số còn nguyên mang về kho',
                child: QuantityStepper(
                  value: _returned,
                  min: 0,
                  max: 2000,
                  onChanged: _saving ? (_) {} : (v) => setState(() => _returned = v),
                ),
              ),

              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: color.withValues(alpha: 0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(text, style: TextStyle(fontWeight: FontWeight.w800, color: color, fontSize: 16)),
                    Text(
                      'bán ${r.sold} + trả lại $_returned − xuất $_issued = ${_diff > 0 ? '+' : ''}$_diff',
                      style: const TextStyle(color: AppColors.slate500, fontSize: 12),
                    ),
                    if (_diff < 0)
                      const Text(
                        'Thiếu: hàng ra khỏi quầy mà không bán, không trả lại.',
                        style: TextStyle(color: AppColors.slate500, fontSize: 12),
                      ),
                    if (_diff > 0)
                      const Text(
                        'Thừa: bán + trả lại nhiều hơn số đã ghi xuất (lấy thêm từ kho chưa ghi?).',
                        style: TextStyle(color: AppColors.slate500, fontSize: 12),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _note,
                maxLength: 300,
                maxLines: 2,
                enabled: !_saving,
                decoration: const InputDecoration(
                  labelText: 'Ghi chú',
                  hintText: 'vd: 2 lon bị móp, đổi cho khách',
                ),
              ),
            ],
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (_error != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Text(
                      _error!,
                      style: const TextStyle(color: AppColors.danger, fontWeight: FontWeight.w600),
                    ),
                  ),
                FilledButton.icon(
                  onPressed: _saving ? null : _save,
                  icon: _saving
                      ? const SizedBox.square(
                          dimension: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.white),
                        )
                      : const Icon(Icons.save_rounded),
                  label: Text(_saving ? 'Đang lưu...' : 'Lưu phiếu kiểm'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _Field extends StatelessWidget {
  const _Field({required this.label, required this.hint, required this.child});
  final String label;
  final String hint;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.slate800)),
                Text(hint, style: const TextStyle(color: AppColors.slate500, fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          child,
        ],
      ),
    );
  }
}
