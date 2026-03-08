import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; message: string; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center" role="alert">
          <h1 className="text-2xl font-['Playfair_Display'] text-[var(--color-primary)]">Something went wrong</h1>
          <p className="text-[var(--color-text)] opacity-70">{this.state.message}</p>
          <button
            onClick={() => { this.setState({ hasError: false, message: '' }); window.location.hash = '#/'; }}
            className="px-6 py-2 mt-4 rounded bg-[var(--color-primary)] text-[var(--color-bg)] font-medium hover:opacity-90 transition-opacity"
          >
            Return to Menu
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
