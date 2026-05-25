// 'use client' - requer useTableOfContents (IntersectionObserver) e useReadingProgress.
'use client';

import type { BlogPost } from '@/domain/blog/entities';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useTableOfContents, type TocEntry } from '@/hooks/useTableOfContents';
import styles from './PostSidebar.module.css';

interface PostSidebarProps {
  readonly post: BlogPost;
}

function extractHeadings(bodyCode: string): TocEntry[] {
  const compiledHeadingPattern = /\b\w\(\w\.(h[23]),\{id:"([^"]+)",children:(?:\w\(\w\.a,\{href:"#[^"]+",children:"([^"]+)"\}\)|"([^"]+)")/g;
  const createElementHeadingPattern = /createElement\("(h[23])"[^}]*id:"([^"]+)"[^}]*,\s*"([^"]+)"/g;
  const matches = [
    ...bodyCode.matchAll(compiledHeadingPattern),
    ...bodyCode.matchAll(createElementHeadingPattern),
  ];

  return matches.flatMap(match => {
    const tag = match[1];
    const id = match[2];
    const text = match[3] ?? match[4];

    if (!tag || !id || !text) return [];

    return [{
      id,
      text,
      level: Number(tag.slice(1)) as 2 | 3,
    }];
  });
}

export function PostSidebar({ post }: PostSidebarProps) {
  const headings = extractHeadings(post.body);
  const { activeId } = useTableOfContents(headings);
  const progress = useReadingProgress();

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

      <div className={styles.newsletterPlaceholder} aria-label='Newsletter'>
        <p className={styles.newsletterTitle}>Receba novos artigos</p>
        <p className={styles.newsletterText}>
          Integração de newsletter disponível em breve.
        </p>
      </div>
    </aside>
  );
}
