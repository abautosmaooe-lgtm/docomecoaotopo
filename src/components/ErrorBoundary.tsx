import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-stone-950 text-white">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Ocorreu um erro inesperado</h2>
          <p className="text-zinc-400 mb-6 max-w-md">
            Pedimos desculpas pelo inconveniente. A aplicação encontrou um problema ao tentar carregar ou salvar dados.
          </p>
          <button
            onClick={() => {
              window.localStorage.clear();
              window.location.reload();
            }}
            className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl transition"
          >
            Limpar Cache e Recarregar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
