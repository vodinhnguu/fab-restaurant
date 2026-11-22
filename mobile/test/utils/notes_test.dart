// Ghi chú khẩu vị: chip gợi ý theo danh mục, nối ghi chú (bỏ ý trùng, tối đa 200 ký tự).

import 'package:flutter_test/flutter_test.dart';

import 'package:fab_seafood/utils/notes.dart';

void main() {
  test('Chip gợi ý theo danh mục (bảng mục S07 docs/16)', () {
    expect(noteSuggestions('Tôm hùm'), contains('Bóc vỏ sẵn'));
    expect(noteSuggestions('cua'), contains('Chặt nhỏ')); // không phân biệt hoa thường
    expect(noteSuggestions('Cá mú'), contains('Ít xương'));
    expect(noteSuggestions('Hàu'), contains('Không đậu phộng'));
    expect(noteSuggestions('Nước uống'), ['Ướp lạnh', 'Kèm ly đá', 'Không lấy đá']);
    expect(noteSuggestions('Ngừng bán (thực đơn cũ)'), ['Ít cay', 'Không hành', 'Không rau thơm']);
    expect(noteSuggestions(null), ['Ít cay', 'Không hành', 'Không rau thơm']);
  });

  test('Nối ghi chú bằng ", ", ý đã có thì bỏ qua (không phân biệt hoa thường)', () {
    expect(appendNote('', 'Ít cay'), 'Ít cay');
    expect(appendNote('Ít cay', 'Không hành'), 'Ít cay, Không hành');
    expect(appendNote('2 phần ít cay', 'Ít cay'), '2 phần ít cay');
    expect(appendNote('Ít cay', 'không hành, ÍT CAY'), 'Ít cay, không hành');
    expect(appendNote('  Ít cay ', '  '), 'Ít cay');
  });

  test('Nối ghi chú cắt ở 200 ký tự', () {
    expect(appendNote('a' * 195, 'Không hành').length, maxNoteLength);
  });
}
