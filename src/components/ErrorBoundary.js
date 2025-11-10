// 新增文件：通用错误边界
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unexpected error' };
  }

  componentDidCatch(error, info) {
    // 可接入监控，如 Sentry
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, textAlign: 'center', color: '#dc2626' }}>
          <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
          <div style={{ marginBottom: 16 }}>{this.state.message}</div>
          <button
            onClick={this.handleReset}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#6366f1',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;