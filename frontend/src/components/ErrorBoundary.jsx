import { Component } from 'react';

// Bắt lỗi khi render để không bị "trắng trang" - hiển thị thông báo thân thiện thay vào đó
// (Error boundary hiện vẫn phải viết bằng class component)
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Lỗi giao diện:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-2xl font-bold">Đã có lỗi xảy ra</h1>
          <p className="max-w-md text-slate-500">{this.state.error.message}</p>
          <button onClick={() => (window.location.href = '/')} className="rounded-xl bg-ocean-900 px-4 py-2 text-white">
            Về trang chủ
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
