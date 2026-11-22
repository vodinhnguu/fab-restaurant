// Ghi chú khẩu vị của từng món (S06, S07, S08). Lưu trong giỏ, gửi lên khi đặt đơn.
//
//   noteSuggestions('Tôm hùm')             → ['Ít cay', 'Không hành', 'Làm sạch sẵn', 'Chặt nhỏ', 'Bóc vỏ sẵn']
//   appendNote('Ít cay', 'Không hành')     → 'Ít cay, Không hành'
//   appendNote('2 phần ít cay', 'Ít cay')  → '2 phần ít cay'   (đã có thì bỏ qua)

/// Ghi chú mỗi món tối đa 200 ký tự (mục S07 docs/16).
const maxNoteLength = 200;

/// Chip gợi ý theo danh mục của món (12 nhóm ở backend/prisma/menu.js). So tên danh mục, không phân biệt hoa thường.
List<String> noteSuggestions(String? categoryName) {
  switch (categoryName?.trim().toLowerCase()) {
    case 'tôm hùm':
    case 'tôm sú':
    case 'tôm tít':
    case 'cua':
      return const ['Ít cay', 'Không hành', 'Làm sạch sẵn', 'Chặt nhỏ', 'Bóc vỏ sẵn'];
    case 'cá mú':
      return const ['Ít xương', 'Chiên giòn', 'Hấp xì dầu', 'Không hành'];
    case 'hàu':
    case 'sò điệp':
      return const ['Ít cay', 'Không hành', 'Không đậu phộng', 'Nướng kỹ'];
    case 'nghêu':
      return const ['Ít cay', 'Không hành', 'Nhiều sả', 'Kèm bánh mì'];
    case 'cháo':
      return const ['Ít tiêu', 'Không hành', 'Không rau răm', 'Nhiều gừng'];
    case 'cơm':
      return const ['Ít dầu', 'Không hành', 'Thêm trứng'];
    case 'rau':
      return const ['Ít dầu', 'Ít tỏi', 'Không bột ngọt'];
    case 'nước uống':
      return const ['Ướp lạnh', 'Kèm ly đá', 'Không lấy đá'];
    default:
      return const ['Ít cay', 'Không hành', 'Không rau thơm'];
  }
}

/// Nối [addition] vào ghi chú [current] bằng ", ". Ý nào đã có trong ghi chú thì bỏ qua
/// (không phân biệt hoa thường). Kết quả bỏ khoảng trắng thừa, cắt ở [maxNoteLength] ký tự.
String appendNote(String current, String addition) {
  var result = current.trim();
  for (final raw in addition.split(',')) {
    final part = raw.trim();
    if (part.isEmpty || result.toLowerCase().contains(part.toLowerCase())) continue;
    result = result.isEmpty ? part : '$result, $part';
  }
  return result.length > maxNoteLength ? result.substring(0, maxNoteLength) : result;
}
