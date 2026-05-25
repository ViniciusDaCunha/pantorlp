// components/molecules/PostCard/PostCard.tsx - Server Component
// SRP: exibe resumo de post. Nao faz fetch, nao tem estado.
import React from 'react';
import Link from 'next/link';
import { ReadingTime } from '@/components/molecules/ReadingTime/ReadingTime';
import { TagBadge } from '@/components/molecules/TagBadge/TagBadge';
import type { BlogPostSummary } from '@/types/blog';
import styles from './PostCard.module.css';

interface PostCardProps {
  readonly post: BlogPostSummary;
  readonly variant?: 'default' | 'featured' | 'compact';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function PostCard({ post, variant = 'default' }: PostCardProps) {
  return (
    <article className={[styles.card, styles[variant]].join(' ')} aria-label={post.title}>
      <span className={styles.category}>{post.category}</span>

      <h2 className={styles.title}>
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>

      <p className={styles.description}>{post.description}</p>

      <footer className={styles.meta}>
        <ReadingTime minutes={post.readingTime} />
        <time dateTime={post.publishedAt} className={styles.date}>
          {formatDate(post.publishedAt)}
        </time>
      </footer>

      {post.tags.length > 0 && (
        <ul className={styles.tags} aria-label='Tags do artigo'>
          {post.tags.map(tag => (
            <li key={tag}>
              <TagBadge tag={tag} />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
