// app/blog/tag/[tag]/page.tsx - Server Component (SSG)
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostList } from '@/components/organisms/PostList/PostList';
import { createTag } from '@/domain/blog/value-objects';
import { blogRepository, toSummary } from '@/lib/blog/contentlayer';
import { generateTagMetadata } from '@/lib/blog/seo';
import type { BlogTagParams } from '@/types/blog';
import styles from './page.module.css';

export const dynamic = 'force-static';
export const revalidate = false;

interface PageProps {
  readonly params: Promise<BlogTagParams>;
}

export async function generateStaticParams(): Promise<BlogTagParams[]> {
  const tags = await blogRepository.getAllTags();
  return tags.map(tag => ({ tag }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag } = await params;

  return generateTagMetadata(tag);
}

export default async function TagPage({
  params,
}: PageProps) {
  const { tag: tagParam } = await params;
  const tag = createTag(tagParam);
  const posts = await blogRepository.getPostsByTag(tag);

  if (posts.length === 0) notFound();

  const summaries = posts.map(toSummary);

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
