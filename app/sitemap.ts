// app/sitemap.ts — Server Component (Next.js Metadata API)
// Gerado em build time — SSG automático pelo Next.js.
import type { MetadataRoute } from 'next';
import { blogRepository } from '@/lib/blog/contentlayer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pantor.dev';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, categories, tags] = await Promise.all([
    blogRepository.getAllSlugs(),
    blogRepository.getAllCategories(),
    blogRepository.getAllTags(),
  ]);

  const postEntries = slugs.map(slug => ({
    url:             `${SITE_URL}/blog/${slug as string}`,
    lastModified:    new Date(),
    changeFrequency: 'weekly' as const,
    priority:        0.8,
  }));

  const categoryEntries = categories.map(category => ({
    url:             `${SITE_URL}/blog/categoria/${category.slug}`,
    lastModified:    new Date(),
    changeFrequency: 'weekly' as const,
    priority:        0.6,
  }));

  const tagEntries = tags.map(tag => ({
    url:             `${SITE_URL}/blog/tag/${tag as string}`,
    lastModified:    new Date(),
    changeFrequency: 'monthly' as const,
    priority:        0.4,
  }));

  return [
    {
      url:             `${SITE_URL}/blog`,
      lastModified:    new Date(),
      changeFrequency: 'daily',
      priority:        1,
    },
    ...postEntries,
    ...categoryEntries,
    ...tagEntries,
  ];
}
