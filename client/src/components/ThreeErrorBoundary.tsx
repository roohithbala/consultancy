import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ThreeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Three.js Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center border border-red-500/50 rounded-lg">
          <div className="w-12 h-12 rounded-full border border-red-500 flex items-center justify-center text-red-500 mb-4 animate-pulse">
            !
          </div>
          <h3 className="text-lg font-serif mb-2">3D Component Error</h3>
          <p className="text-xs text-gray-400 max-w-xs mb-4">
            {this.state.error?.message || 'Something went wrong while rendering the 3D scene.'}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ThreeErrorBoundary;
