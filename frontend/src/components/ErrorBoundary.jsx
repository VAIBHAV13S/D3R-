import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Log to monitoring service in production
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 60, textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 24, marginBottom: 12 }}>Something went wrong</h2>
          <p style={{ color: '#64748b', marginBottom: 24 }}>
            We're sorry for the inconvenience. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '12px 24px', background: '#667eea', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: 24, textAlign: 'left', background: '#fee2e2', padding: 16, borderRadius: 8 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: 8 }}>Error Details</summary>
              <pre style={{ fontSize: 12, overflow: 'auto' }}>{this.state.error.toString()}</pre>
              <pre style={{ fontSize: 12, overflow: 'auto', marginTop: 8 }}>{this.state.errorInfo?.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
