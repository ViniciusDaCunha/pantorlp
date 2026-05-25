// app/blog/page.tsx - Server Component (SSG)
// force-static: HTML gerado em build time, nunca em runtime.
import type { Metadata } from 'next';
import { BlogHeader } from '@/components/organisms/BlogHeader/BlogHeader';
import { PostList } from '@/components/organisms/PostList/PostList';
import type { BlogPost } from '@/domain/blog/entities';
import { blogRepository } from '@/lib/blog/contentlayer';
import type { BlogPostSummary } from '@/types/blog';
import styles from './page.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pantor.dev';

export const dynamic    = 'force-static';
export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title:       'Blog - Observabilidade e Wide Events',
    description: 'Artigos tecnicos sobre observabilidade, wide events, OpenTelemetry e desenvolvimento continuo para times modernos.',
    alternates:  { canonical: `${SITE_URL}/blog` },
    openGraph: {
      type:   'website',
      url:    `${SITE_URL}/blog`,
      title:  'Blog Tecnico - Pantor',
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
  };
}

function toPostSummary(post: BlogPost): BlogPostSummary {
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

export default async function BlogPage() {
  const posts = await blogRepository.getPublishedPosts();
  const summaries = posts.map(toPostSummary);

  return (
    <section
      className={styles.container}
      aria-label='Lista de artigos do blog'
    >
      <BlogHeader
        title='Blog'
        description='Artigos sobre observabilidade, wide events e desenvolvimento contínuo.'
        postCount={summaries.length}
      />
      <PostList posts={summaries} />
    </section>
  );
}
