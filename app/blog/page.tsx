// app/blog/page.tsx - Server Component (SSG)
// force-static: HTML gerado em build time, nunca em runtime.
// PostList organism completo criado na Fase 2 (T25).
// Esta implementacao e o card minimo para validar o pipeline.
import type { Metadata }  from 'next';
import { blogRepository } from '@/lib/blog/contentlayer';
import styles             from './page.module.css';

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

export default async function BlogPage() {
  const posts = await blogRepository.getPublishedPosts();

  return (
    <section
      className={styles.container}
      aria-label='Lista de artigos do blog'
    >
      <header className={styles.header}>
        <h1 className={styles.title}>Blog</h1>
        <p className={styles.subtitle}>
          {posts.length} {posts.length === 1 ? 'artigo' : 'artigos'} sobre
          observabilidade, wide events e desenvolvimento continuo.
        </p>
      </header>

      <ul className={styles.list} role='list'>
        {posts.map(post => (
          // TODO Fase 2 (T25): substituir por <PostList posts={posts} />
          <li key={post.slug as string}>
            <article aria-label={post.title}>
              <h2>
                <a href={`/blog/${post.slug as string}`}>{post.title}</a>
              </h2>
              <p>{post.description}</p>
              <time dateTime={post.publishedAt.toISOString()}>
                {post.publishedAt.toLocaleDateString('pt-BR')}
              </time>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
