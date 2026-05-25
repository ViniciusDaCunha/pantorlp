// app/blog/categoria/[categoria]/page.tsx - Server Component (SSG)
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostList } from '@/components/organisms/PostList/PostList';
import type { BlogPost } from '@/domain/blog/entities';
import { blogRepository } from '@/lib/blog/contentlayer';
import type { BlogCategoryParams, BlogPostSummary } from '@/types/blog';
import styles from './page.module.css';

export const dynamic = 'force-static';
export const revalidate = false;

interface PageProps {
  readonly params: Promise<BlogCategoryParams>;
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

export async function generateStaticParams(): Promise<BlogCategoryParams[]> {
  const categories = await blogRepository.getAllCategories();
  return categories.map(category => ({ categoria: category.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { categoria } = await params;
  const categories = await blogRepository.getAllCategories();
  const category = categories.find(candidate => candidate.slug === categoria);
  if (!category) return {};

  return {
    title: `${category.label} - Blog Pantor`,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
}: PageProps) {
  const { categoria } = await params;
  const categories = await blogRepository.getAllCategories();
  const category = categories.find(candidate => candidate.slug === categoria);

  if (!category) notFound();

  const posts = await blogRepository.getPostsByCategory(categoria);
  const summaries = posts.map(toPostSummary);

  return (
    <section className={styles.container} aria-label={`Artigos de ${category.label}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>{category.label}</h1>
        <p className={styles.description}>{category.description}</p>
        <p className={styles.count}>
          {summaries.length} {summaries.length === 1 ? 'artigo' : 'artigos'}
        </p>
      </header>

      <PostList posts={summaries} variant='list' />
    </section>
  );
}
