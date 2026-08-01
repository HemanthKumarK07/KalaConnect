import { Component } from 'react';
import Button from './Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-8)',
          textAlign: 'center',
          background: 'var(--color-bg)',
          color: 'var(--color-text-primary)'
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }}>Something went wrong.</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>We are sorry for the inconvenience. Please try refreshing the page.</p>
          <Button variant="accent" onClick={() => window.location.href = '/'}>
            Return to Home
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
