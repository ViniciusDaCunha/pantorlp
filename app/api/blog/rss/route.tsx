// app/api/blog/rss/route.tsx
import { blogRepository } from '@/lib/blog/contentlayer';
import { generateRssFeed } from '@/lib/blog/feed';

export const dynamic = 'force-static';
export const revalidate = false;

const RSS_HEADERS = {
  'Content-Type':           'application/rss+xml; charset=utf-8',
  'Cache-Control':          'public, max-age=3600, s-maxage=3600',
  'X-Content-Type-Options': 'nosniff',
} as const;

export async function GET() {
  const posts = await blogRepository.getPublishedPosts();
  const xml = generateRssFeed(posts);

  return new Response(xml, { headers: RSS_HEADERS });
}
