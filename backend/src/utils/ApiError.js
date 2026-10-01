// Lỗi có kèm HTTP status code. Ném (throw) ở bất kỳ đâu, middleware error sẽ bắt và trả JSON.
export class ApiError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }

  static badRequest(msg = 'Dữ liệu không hợp lệ', errors) {
    return new ApiError(400, msg, errors);
  }
  static unauthorized(msg = 'Vui lòng đăng nhập') {
    return new ApiError(401, msg);
  }
  static forbidden(msg = 'Bạn không có quyền thực hiện thao tác này') {
    return new ApiError(403, msg);
  }
  static notFound(msg = 'Không tìm thấy dữ liệu') {
    return new ApiError(404, msg);
  }
  static conflict(msg) {
    return new ApiError(409, msg);
  }
}
