import { AlertTriangle } from 'lucide-react';
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Client error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-xl rounded-[2rem] border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-primary-600">
            Unexpected error
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            Something went wrong
          </h1>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            The app hit an unexpected problem. Reload the page or head back home to keep working.
          </p>

          {process.env.NODE_ENV !== 'production' && this.state.error?.message ? (
            <pre className="mt-6 overflow-x-auto rounded-2xl bg-gray-900 px-4 py-3 text-left text-xs text-gray-100">
              {this.state.error.message}
            </pre>
          ) : null}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload Page
            </button>
            <a href="/" className="btn-secondary">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
