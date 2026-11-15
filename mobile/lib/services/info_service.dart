// GET /info: thông tin nhà hàng (tên, hotline, giờ mở cửa, khu vực, phí ship, VNPay bật chưa).

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/restaurant_info.dart';
import '../state/app_providers.dart';
import 'api_client.dart';

class InfoService {
  InfoService(this._api);
  final ApiClient _api;

  Future<RestaurantInfo> fetch() async {
    final res = await _api.get('/info');
    return RestaurantInfo.fromJson(res.data as Map<String, dynamic>);
  }
}

final infoServiceProvider = Provider<InfoService>((ref) => InfoService(ref.watch(apiClientProvider)));
