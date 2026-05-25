// app/blog/tag/[tag]/page.tsx - Server Component (SSG)
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostList } from '@/components/organisms/PostList/PostList';
import type { BlogPost } from '@/domain/blog/entities';
import { createTag } from '@/domain/blog/value-objects';
import { blogRepository } from '@/lib/blog/contentlayer';
import type { BlogPostSummary, BlogTagParams } from '@/types/blog';
import styles from './page.module.css';

export const dynamic = 'force-static';
export const revalidate = false;

interface PageProps {
  readonly params: Promise<BlogTagParams>;
}

function toPostSummary(post: BlogPost): BlogPostSummary {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt.toISOString(),
    readingTime: post.readingTime.minutes,
    category: post.category.label,
    tags: post.tags.map(tag => tag),
    author: post.author.slug,
  };
}

export async function generateStaticParams(): Promise<BlogTagParams[]> {
  const tags = await blogRepository.getAllTags();
  return tags.map(tag => ({ tag }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag } = await params;

  return {
    title: `#${tag} - Blog Pantor`,
    description: `Artigos sobre ${tag} no Blog da Pantor.`,
  };
}

export default async function TagPage({
  params,
}: PageProps) {
  const { tag: tagParam } = await params;
  const tag = createTag(tagParam);
  const posts = await blogRepository.getPostsByTag(tag);

  if (posts.length === 0) notFound();

  const summaries = posts.map(toPostSummary);

  return (
    <section className={styles.container} aria-label={`Artigos com tag ${tagParam}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>#{tagParam}</h1>
        <p className={styles.count}>
          {summaries.length} {summaries.length === 1 ? 'artigo' : 'artigos'}
        </p>
      </header>

      <PostList posts={summaries} variant='list' />
    </section>
  );
}
