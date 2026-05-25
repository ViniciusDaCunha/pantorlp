// components/organisms/RelatedPosts/RelatedPosts.tsx - Server Component
import { PostCard } from '@/components/molecules/PostCard/PostCard';
import type { BlogPost } from '@/domain/blog/entities';
import type { BlogPostSummary } from '@/types/blog';
import styles from './RelatedPosts.module.css';

interface RelatedPostsProps {
  readonly posts: ReadonlyArray<BlogPost>;
}

function toSummary(post: BlogPost): BlogPostSummary {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt.toISOString(),
    readingTime: post.readingTime.minutes,
    category: post.category.slug,
    tags: post.tags.map(tag => tag),
    author: post.author.slug,
  };
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
