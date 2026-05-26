// components/atoms/MDXErrorBoundary/MDXErrorBoundary.tsx
// Error Boundary para componentes que renderizam MDX ou conteúdo dinâmico.
// Class component obrigatório: hooks não podem capturar erros de render.
'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import styles from './MDXErrorBoundary.module.css';

interface Props {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
}

interface State {
  readonly hasError: boolean;
}

export class MDXErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[MDXErrorBoundary] render error', {
      message: error.message,
      componentStack: info.componentStack?.split('\n')[1]?.trim(),
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className={styles.fallback} role='alert'>
          <p>Erro ao renderizar o conteúdo.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className={styles.retry}
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
