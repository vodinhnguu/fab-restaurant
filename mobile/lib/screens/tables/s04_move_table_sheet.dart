// Bottom sheet "Chuyển bàn": sơ đồ bàn theo khu vực, bấm bàn trống để chuyển đơn sang.
// Bàn có khách mờ đi, bàn hiện tại đánh dấu "Bàn này". Bàn trống bấm được → xác nhận chuyển.
// Mở từ S04 menu ⋮: final result = await showMoveTableSheet(context, ref: ref, fromTable: table);

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/dining_table.dart';
import '../../services/dine_in_service.dart';
import '../../theme/app_colors.dart';

class MoveTableResult {
  const MoveTableResult({required this.tableId, this.reason});
  final int tableId;
  final String? reason;
}

Future<MoveTableResult?> showMoveTableSheet(
  BuildContext context, {
  required WidgetRef ref,
  required DiningTable fromTable,
}) async {
  final areas = await ref.read(floorProvider.future);
  if (!context.mounted) return null;
  return showModalBottomSheet<MoveTableResult>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (_) => DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.8,
      maxChildSize: 0.92,
      builder: (context, scroll) => _MoveTableSheet(
        areas: areas,
        fromTable: fromTable,
        scroll: scroll,
      ),
    ),
  );
}

class _MoveTableSheet extends StatefulWidget {
  const _MoveTableSheet({required this.areas, required this.fromTable, required this.scroll});

  final List<FloorArea> areas;
  final DiningTable fromTable;
  final ScrollController scroll;

  @override
  State<_MoveTableSheet> createState() => _MoveTableSheetState();
}

class _MoveTableSheetState extends State<_MoveTableSheet> {
  int? _selectedId;
  String? _selectedCode;
  late String _currentArea;
  final _reason = TextEditingController();

  @override
  void initState() {
    super.initState();
    _currentArea = widget.fromTable.area ?? widget.areas.first.name;
  }

  @override
  void dispose() {
    _reason.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final area = widget.areas.firstWhere((a) => a.name == _currentArea, orElse: () => widget.areas.first);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Tiêu đề
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'Chuyển bàn ${widget.fromTable.code}',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
          ),
        ),
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 4, 16, 12),
          child: Text('Bấm vào bàn trống để chuyển đơn sang', style: TextStyle(color: AppColors.slate500, fontSize: 13)),
        ),

        // Chú thích màu
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Wrap(
            spacing: 14,
            runSpacing: 6,
            children: [
              _legendDot(AppColors.white, 'Trống', border: AppColors.slate300),
              _legendDot(AppColors.ocean900, 'Có khách'),
              _legendDot(AppColors.success, 'Đã chọn'),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // Chọn khu
        SizedBox(
          height: 36,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: widget.areas.length,
            separatorBuilder: (_, i) => const SizedBox(width: 8),
            itemBuilder: (_, i) {
              final a = widget.areas[i];
              final active = a.name == _currentArea;
              final emptyCount = a.tables.where((t) => !t.isBusy && t.id != widget.fromTable.id).length;
              final shortName = a.name.replaceAll(' - view biển', '').replaceAll(' - View biển', '');
              return ChoiceChip(
                label: Text('$shortName ($emptyCount)'),
                selected: active,
                onSelected: (_) => setState(() => _currentArea = a.name),
                selectedColor: AppColors.ocean900,
                labelStyle: TextStyle(
                  color: active ? AppColors.white : AppColors.ocean900,
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                ),
                side: BorderSide(color: active ? AppColors.ocean900 : AppColors.slate300),
                visualDensity: VisualDensity.compact,
                showCheckmark: false,
              );
            },
          ),
        ),
        const SizedBox(height: 12),

        // Sơ đồ bàn
        Expanded(
          child: ListView(
            controller: widget.scroll,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: [
              _buildAreaMap(area),
              const SizedBox(height: 12),
            ],
          ),
        ),

        // Lý do + nút chuyển
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
          child: TextField(
            controller: _reason,
            maxLength: 200,
            decoration: const InputDecoration(
              hintText: 'Lý do chuyển bàn (không bắt buộc)',
              counterText: '',
              isDense: true,
            ),
          ),
        ),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: FilledButton.icon(
              onPressed: _selectedId == null
                  ? null
                  : () => Navigator.pop(
                        context,
                        MoveTableResult(
                          tableId: _selectedId!,
                          reason: _reason.text.trim().isEmpty ? null : _reason.text.trim(),
                        ),
                      ),
              icon: const Icon(Icons.swap_horiz_rounded),
              label: Text(_selectedId == null ? 'Chọn bàn trống trên sơ đồ' : 'Chuyển sang bàn $_selectedCode'),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAreaMap(FloorArea area) {
    const gap = 8.0;
    final tables = area.tables;
    final placed = tables.every((t) => t.x > 0 && t.y > 0);
    final cols = placed ? tables.map((t) => t.x).reduce((a, b) => a > b ? a : b) : 4;
    final rows = placed
        ? tables.map((t) => t.y).reduce((a, b) => a > b ? a : b)
        : (tables.length / cols).ceil();

    DiningTable? at(int x, int y) => placed
        ? tables.where((t) => t.x == x && t.y == y).firstOrNull
        : tables.elementAtOrNull((y - 1) * cols + (x - 1));

    return Column(
      children: [
        for (var y = 1; y <= rows; y++) ...[
          if (y > 1) const SizedBox(height: gap),
          Row(
            children: [
              for (var x = 1; x <= cols; x++) ...[
                if (x > 1) const SizedBox(width: gap),
                Expanded(
                  child: switch (at(x, y)) {
                    final t? => _buildTableTile(t),
                    null => const SizedBox(height: _tileHeight),
                  },
                ),
              ],
            ],
          ),
        ],
      ],
    );
  }

  static const _tileHeight = 88.0;

  Widget _buildTableTile(DiningTable table) {
    final isFrom = table.id == widget.fromTable.id;
    final isBusy = table.isBusy && !isFrom;
    final isSelected = table.id == _selectedId;
    final canSelect = !table.isBusy && !isFrom;

    final Color bg;
    final Color fg;
    final String label;

    if (isFrom) {
      bg = AppColors.coral500;
      fg = AppColors.white;
      label = 'Bàn này';
    } else if (isSelected) {
      bg = AppColors.success;
      fg = AppColors.white;
      label = 'Chuyển tới';
    } else if (isBusy) {
      bg = AppColors.ocean900;
      fg = AppColors.white.withValues(alpha: 0.5);
      label = 'Có khách';
    } else {
      bg = AppColors.white;
      fg = AppColors.ocean900;
      label = '${table.seats} ghế · Trống';
    }

    return GestureDetector(
      onTap: canSelect ? () => setState(() { _selectedId = table.id; _selectedCode = table.code; }) : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: _tileHeight,
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.success : (isFrom ? AppColors.coral500 : (isBusy ? bg : AppColors.slate300)),
            width: isSelected || isFrom ? 2.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              table.code,
              style: TextStyle(color: fg, fontSize: 15, fontWeight: FontWeight.w800),
            ),
            const Spacer(),
            if (isSelected)
              const Icon(Icons.check_circle_rounded, color: AppColors.white, size: 18),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(color: fg, fontSize: 11, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }

  static Widget _legendDot(Color color, String label, {Color? border}) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(3),
              border: Border.all(color: border ?? color),
            ),
          ),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(color: AppColors.slate500, fontSize: 12)),
        ],
      );
}
