// components/organisms/RelatedPosts/RelatedPosts.tsx - Server Component
import { PostCard } from '@/components/molecules/PostCard/PostCard';
import type { BlogPost } from '@/domain/blog/entities';
import { toSummary } from '@/lib/blog/contentlayer';
import styles from './RelatedPosts.module.css';

interface RelatedPostsProps {
  readonly posts: ReadonlyArray<BlogPost>;
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className={styles.section} aria-label='Artigos relacionados'>
      <h2 className={styles.title}>Artigos relacionados</h2>
      <ul className={styles.list} role='list'>
        {posts.map(post => (
          <li key={post.slug}>
            <PostCard post={toSummary(post)} variant='compact' />
          </li>
        ))}
      </ul>
    </section>
  );
}
