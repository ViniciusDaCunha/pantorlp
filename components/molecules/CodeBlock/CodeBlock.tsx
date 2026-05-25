// 'use client' - requer useState para feedback visual do botao copiar
// e navigator.clipboard, disponivel apenas no browser.
'use client';

import { useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import styles from './CodeBlock.module.css';

interface CodeBlockProps {
  readonly children: ReactNode;
  readonly className?: string;
}

interface CodeChildProps {
  readonly children?: ReactNode;
}

function getCodeText(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }

  if (isCodeElement(children)) {
    return getCodeText(children.props.children);
  }

  if (Array.isArray(children)) {
    return children.map(getCodeText).join('');
  }

  return '';
}

function isCodeElement(value: ReactNode): value is ReactElement<CodeChildProps> {
  return typeof value === 'object' && value !== null && 'props' in value;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy(): void {
    const text = getCodeText(children);

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }

  const language = className?.replace('language-', '') ?? '';

  return (
    <div className={styles.wrapper}>
      {language && (
        <span className={styles.language} aria-hidden>
          {language}
        </span>
      )}
      <button
        type='button'
        onClick={handleCopy}
        className={styles.copyButton}
        aria-label={copied ? 'Copiado!' : 'Copiar codigo'}
        title={copied ? 'Copiado!' : 'Copiar codigo'}
      >
        {copied ? 'ok' : 'copy'}
      </button>
      <pre className={className}>{children}</pre>
    </div>
  );
}
