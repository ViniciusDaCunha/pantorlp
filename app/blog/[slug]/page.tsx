// app/blog/[slug]/page.tsx - Server Component (SSG)
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostContent } from '@/components/organisms/PostContent/PostContent';
import { PostSidebar } from '@/components/organisms/PostSidebar/PostSidebar';
import { RelatedPosts } from '@/components/organisms/RelatedPosts/RelatedPosts';
import { createSlug } from '@/domain/blog/value-objects';
import { blogRepository } from '@/lib/blog/contentlayer';
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pantor.dev';

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${siteUrl}/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      url: `${siteUrl}/blog/${post.slug}`,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      tags: post.tags.map(tag => tag),
      images: post.ogImage
        ? [{ url: `${siteUrl}${post.ogImage}`, width: 1200, height: 630 }]
        : [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630 }],
    },
  };
}

export default async function PostPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const post = await blogRepository.getPostBySlug(createSlug(slug));
  if (!post || post.draft) notFound();

  const related = await blogRepository.getRelatedPosts(post, 3);

  return (
    <div className={styles.layout}>
      <article className={styles.article} aria-label={post.title}>
        <PostContent post={post} />
        <RelatedPosts posts={related} />
      </article>
      <aside className={styles.sidebar} aria-label='Navegação do artigo'>
        <PostSidebar post={post} />
      </aside>
    </div>
  );
}
