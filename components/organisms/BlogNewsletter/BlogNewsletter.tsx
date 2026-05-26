// 'use client' — requer useState para controle do formulário e feedback de envio.
'use client';

import { useState, type FormEvent } from 'react';
import { trackEvent } from '@/lib/supabase';
import styles from './BlogNewsletter.module.css';

interface BlogNewsletterProps {
  readonly sourceSlug?: string;
}

type FormState = 'idle' | 'loading' | 'success' | 'error' | 'invalid';

function getOrCreateSessionId(): string | null {
  if (typeof window === 'undefined') return null;

  const key = 'pantor_session_id';
  let sessionId = sessionStorage.getItem(key);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
}

export function BlogNewsletter({ sourceSlug = '' }: BlogNewsletterProps) {
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Validação client-side (UX) — servidor valida novamente (SRE-P1).
    if (!email.includes('@') || email.length < 3) {
      setFormState('invalid');
      return;
    }

    setFormState('loading');

    try {
      const response = await fetch('/api/blog/newsletter', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, sourceSlug }),
      });

      if (response.ok) {
        setFormState('success');
        setEmail('');
        void trackEvent('newsletter_subscribe', getOrCreateSessionId(), {
          source_slug: sourceSlug || null,
        }).catch(() => {
          console.warn('[BlogNewsletter] newsletter_subscribe tracking failed');
        });
        return;
      }

      setFormState('error');
    } catch {
      setFormState('error');
    }
  }

  if (formState === 'success') {
    return (
      <div className={styles.success} role='status'>
        <p>Inscrito com sucesso! Novos artigos no seu inbox.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>Receba novos artigos</p>
      <p className={styles.description}>
        Conteúdo técnico sobre observabilidade e wide events, direto no seu email.
      </p>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <label htmlFor='newsletter-email' className={styles.label}>
          Email
        </label>
        <div className={styles.inputRow}>
          <input
            id='newsletter-email'
            type='email'
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder='seu@email.com'
            className={styles.input}
            disabled={formState === 'loading'}
            aria-describedby={
              formState === 'invalid' ? 'newsletter-error'
              : formState === 'error' ? 'newsletter-error'
              : undefined
            }
            required
          />
          <button
            type='submit'
            className={styles.button}
            disabled={formState === 'loading'}
            aria-busy={formState === 'loading'}
          >
            {formState === 'loading' ? 'Enviando...' : 'Inscrever'}
          </button>
        </div>

        {(formState === 'invalid' || formState === 'error') && (
          <p id='newsletter-error' className={styles.error} role='alert'>
            {formState === 'invalid'
              ? 'Email inválido. Verifique o endereço.'
              : 'Erro ao inscrever. Tente novamente.'}
          </p>
        )}
      </form>
    </div>
  );
}
