import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
    
    // Error tracking servisine gönder (Sentry, LogRocket vb.)
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { contexts: { react: errorInfo } });
    // }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            backgroundColor: '#EEF2F6',
            fontFamily: 'Open Sans, sans-serif',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '40px',
              maxWidth: '600px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textAlign: 'center',
            }}
          >
            <h2 style={{ color: '#dc3545', marginBottom: '16px' }}>
              Bir şeyler yanlış gitti
            </h2>
            <p style={{ color: '#6c757d', marginBottom: '24px' }}>
              Üzr istəyirik, gözlənilməz bir xəta baş verdi.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details
                style={{
                  marginTop: '20px',
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  textAlign: 'left',
                  fontSize: '12px',
                  maxHeight: '300px',
                  overflow: 'auto',
                }}
              >
                <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                  Xəta detalları (Development mode)
                </summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#155EEF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Sayfayı Yenilə
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Yenidən Cəhd Et
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

