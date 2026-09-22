import React, { Component, ErrorInfo, ReactNode } from 'react';
import { db } from '../../services/db';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CampusHub Uncaught Error Boundary caught:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleResetAndReload = () => {
    try {
      db.resetData();
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {
      // Ignore clear errors
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center border border-rose-200 dark:border-rose-900/60 shadow-xs">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Application Recovered
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                CampusHub encountered an unexpected rendering error. You can reload the page or reset cached session data to continue.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-left border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 font-mono overflow-x-auto max-h-32">
                {this.state.error.message || 'Unknown runtime error'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleResetAndReload}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                Reset Data & Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
