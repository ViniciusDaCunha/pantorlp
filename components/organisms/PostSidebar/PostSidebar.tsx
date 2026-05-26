// 'use client' - requer useTableOfContents (IntersectionObserver) e useReadingProgress.
'use client';

import { BlogNewsletter } from '@/components/organisms/BlogNewsletter/BlogNewsletter';
import type { BlogPost } from '@/domain/blog/entities';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useTableOfContents } from '@/hooks/useTableOfContents';
import { trackEvent } from '@/lib/supabase';
import styles from './PostSidebar.module.css';

interface PostSidebarProps {
  readonly post: BlogPost;
}

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

export function PostSidebar({ post }: PostSidebarProps) {
  const headings = post.headings;
  const { activeId } = useTableOfContents(headings);
  const progress = useReadingProgress();
  const slug = post.slug as string;

  function handleNewsletterLinkClick(): void {
    void trackEvent('cta_click_blog', getOrCreateSessionId(), {
      source_slug: slug,
    }).catch(() => {
      console.warn('[PostSidebar] cta_click_blog tracking failed');
    });
  }

  return (
    <aside className={styles.sidebar} aria-label='Navegação do artigo'>
      <progress
        className={styles.progress}
        value={progress}
        max={100}
        aria-label='Progresso de leitura'
      />

      {headings.length > 0 && (
        <nav aria-label='Índice do artigo' className={styles.toc}>
          <p className={styles.tocTitle}>Neste artigo</p>
          <ol className={styles.tocList}>
            {headings.map(heading => (
              <li
                key={heading.id}
                className={[
                  styles.tocItem,
                  styles[`level${heading.level}`],
                  activeId === heading.id ? styles.active : '',
                ].join(' ')}
              >
                <a href={`#${heading.id}`}>{heading.text}</a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className={styles.newsletter} aria-label='Newsletter'>
        <a
          href='#blog-newsletter'
          className={styles.newsletterLink}
          onClick={handleNewsletterLinkClick}
        >
          Receber artigos por email
        </a>
        <div id='blog-newsletter'>
          <BlogNewsletter sourceSlug={slug} />
        </div>
      </div>
    </aside>
  );
}
