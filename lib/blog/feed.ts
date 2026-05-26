// lib/blog/feed.ts
// Geração de XML RSS 2.0. Função pura — recebe posts, retorna string.
// Zero dependências de terceiros. Encoding manual para controle total.

import type { BlogPost } from '@/domain/blog/entities';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pantor.dev';
const SITE_NAME = 'Pantor Blog';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateRssFeed(posts: ReadonlyArray<BlogPost>): string {
  const items = posts.map(post => {
    const slug = post.slug as string;
    const url = `${SITE_URL}/blog/${slug}`;
    const categories = post.tags
      .map(tag => `<category>${escapeXml(tag as string)}</category>`)
      .join('\n      ');

    return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${post.publishedAt.toUTCString()}</pubDate>
      <author>noreply@pantor.dev (${escapeXml(post.author.name)})</author>
      ${categories}
    </item>`.trim();
  }).join('\n    ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}/blog</link>
    <description>Artigos técnicos sobre observabilidade, wide events e engenharia de produção.</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/blog/rss" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
}
