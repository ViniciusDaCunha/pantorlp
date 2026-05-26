// app/blog/[slug]/page.tsx - Server Component (SSG)
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostContent } from '@/components/organisms/PostContent/PostContent';
import { PostSidebar } from '@/components/organisms/PostSidebar/PostSidebar';
import { RelatedPosts } from '@/components/organisms/RelatedPosts/RelatedPosts';
import { createSlug } from '@/domain/blog/value-objects';
import { blogRepository } from '@/lib/blog/contentlayer';
import { incrementPostView } from '@/lib/blog/db';
import { generatePostJsonLd, generatePostMetadata } from '@/lib/blog/seo';
import type { BlogSlugParams } from '@/types/blog';
import styles from './page.module.css';

export const dynamic = 'force-static';
export const revalidate = false;

interface PageProps {
  readonly params: Promise<BlogSlugParams>;
}

export async function generateStaticParams(): Promise<BlogSlugParams[]> {
  const slugs = await blogRepository.getAllSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await blogRepository.getPostBySlug(createSlug(slug));
  if (!post) return {};

  return generatePostMetadata(post);
}

export default async function PostPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const post = await blogRepository.getPostBySlug(createSlug(slug));
  if (!post || post.draft) notFound();

  const jsonLd = generatePostJsonLd(post);
  const related = await blogRepository.getRelatedPosts(post, 3);

  void incrementPostView(slug).catch(() => {
    console.warn('[PostPage] post_view tracking failed');
  });

  return (
    <div className={styles.layout}>
      <article className={styles.article} aria-label={post.title}>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PostContent post={post} />
        <RelatedPosts posts={related} />
      </article>
      <aside className={styles.sidebar} aria-label='Navegação do artigo'>
        <PostSidebar post={post} />
      </aside>
    </div>
  );
}
