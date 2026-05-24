import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-500 bg-red-500/10 border border-red-500/20 rounded-md text-center m-4">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-sm font-mono whitespace-pre-wrap">{this.state.error?.toString()}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
