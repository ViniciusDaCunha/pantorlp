// components/organisms/PostList/PostList.tsx - Server Component
// Grid de PostCards. Suporte a variante: 'grid' | 'list'.
import { PostCard } from '@/components/molecules/PostCard/PostCard';
import type { BlogPostSummary } from '@/types/blog';
import styles from './PostList.module.css';

interface PostListProps {
  readonly posts: ReadonlyArray<BlogPostSummary>;
  readonly variant?: 'grid' | 'list';
  readonly emptyMessage?: string;
}

export function PostList({
  posts,
  variant = 'grid',
  emptyMessage = 'Nenhum artigo encontrado.',
}: PostListProps) {
  const variantClass = variant === 'list' ? styles.listMode : styles.grid;

  if (posts.length === 0) {
    return (
      <p className={styles.empty} role='status'>
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className={[styles.list, variantClass].join(' ')} role='list'>
      {posts.map((post, index) => (
        <li key={post.slug}>
          <PostCard
            post={post}
            variant={index === 0 && variant === 'grid' ? 'featured' : 'default'}
          />
        </li>
      ))}
    </ul>
  );
}
