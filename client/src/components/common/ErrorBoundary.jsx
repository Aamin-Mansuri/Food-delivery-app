import React, { Component } from 'react';
import { AlertTriangle, RotateCcw, Home, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error,
      errorInfo,
    });
    // You can also log error messages to an error reporting service here
    console.error('Uncaught Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8 text-center space-y-6 animate-fade-in">
            {/* Error Icon */}
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Error Message Header */}
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Oops! Something went wrong
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                We ran into an unexpected problem while rendering this page. Don’t worry, your data is safe.
              </p>
            </div>

            {/* Collapsible Error Technical Details */}
            {this.state.error && (
              <div className="text-left bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden">
                <button
                  onClick={this.toggleDetails}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <span>Technical Error Details</span>
                  {this.state.showDetails ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {this.state.showDetails && (
                  <div className="px-4 pb-4 pt-1 space-y-2 text-[11px] font-mono text-red-600 border-t border-slate-200/60 overflow-x-auto">
                    <p className="font-bold">{this.state.error.toString()}</p>
                    {this.state.errorInfo?.componentStack && (
                      <pre className="text-[10px] text-slate-600 whitespace-pre-wrap max-h-36 overflow-y-auto bg-slate-100 p-2 rounded-xl">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-orange-600 text-white font-extrabold text-xs hover:bg-orange-700 shadow-md shadow-orange-200 transition-all flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-extrabold text-xs hover:bg-slate-200 border border-slate-200 transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition-all flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Go to Homepage</span>
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
