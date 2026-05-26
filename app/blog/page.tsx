// app/blog/page.tsx - Server Component (SSG)
// force-static: HTML gerado em build time, nunca em runtime.
import type { Metadata } from 'next';
import { BlogHeader } from '@/components/organisms/BlogHeader/BlogHeader';
import { PostList } from '@/components/organisms/PostList/PostList';
import { blogRepository, toSummary } from '@/lib/blog/contentlayer';
import { generateBlogListMetadata } from '@/lib/blog/seo';
import styles from './page.module.css';

export const dynamic    = 'force-static';
export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  const posts = await blogRepository.getPublishedPosts();
  return generateBlogListMetadata(posts.length);
}

export default async function BlogPage() {
  const posts = await blogRepository.getPublishedPosts();
  const summaries = posts.map(toSummary);

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
