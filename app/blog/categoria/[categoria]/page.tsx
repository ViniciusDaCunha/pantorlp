// app/blog/categoria/[categoria]/page.tsx - Server Component (SSG)
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostList } from '@/components/organisms/PostList/PostList';
import { blogRepository, toSummary } from '@/lib/blog/contentlayer';
import { generateCategoryMetadata } from '@/lib/blog/seo';
import type { BlogCategoryParams } from '@/types/blog';
import styles from './page.module.css';

export const dynamic = 'force-static';
export const revalidate = false;

interface PageProps {
  readonly params: Promise<BlogCategoryParams>;
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

  return generateCategoryMetadata(category);
}

export default async function CategoryPage({
  params,
}: PageProps) {
  const { categoria } = await params;
  const categories = await blogRepository.getAllCategories();
  const category = categories.find(candidate => candidate.slug === categoria);

  if (!category) notFound();

  const posts = await blogRepository.getPostsByCategory(categoria);
  const summaries = posts.map(toSummary);

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
