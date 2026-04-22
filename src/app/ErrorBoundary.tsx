import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level error boundary — catches render errors so the app doesn't
 * disappear into a white screen. Log to a real error tracker (Sentry)
 * once that's wired up.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info);
  }

  override render() {
    if (this.state.error) {
      return (
        <main
          role="alert"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--sp-6)',
            textAlign: 'center',
          }}
        >
          <h1 style={{ color: 'var(--c-error)' }}>خطأ غير متوقع</h1>
          <p style={{ color: 'var(--c-text-secondary)' }}>
            حدث خطأ في التطبيق. حاول إعادة تحميل الصفحة.
          </p>
          <pre
            style={{
              marginTop: 'var(--sp-4)',
              padding: 'var(--sp-3)',
              background: 'var(--c-surface-sunken)',
              borderRadius: 'var(--r-md)',
              maxWidth: '600px',
              overflow: 'auto',
              direction: 'ltr',
              textAlign: 'left',
              fontSize: 'var(--fs-sm)',
            }}
          >
            {this.state.error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 'var(--sp-4)',
              padding: 'var(--sp-3) var(--sp-5)',
              background: 'var(--c-accent)',
              color: 'white',
              borderRadius: 'var(--r-md)',
              fontWeight: 700,
            }}
          >
            إعادة التحميل
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
