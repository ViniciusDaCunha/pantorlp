// lib/blog/seo.ts
// Centraliza toda a geração de metadata para as rotas do blog.
// Nenhuma página define título, descrição ou OG inline — tudo passa aqui.

import type { Metadata } from 'next';
import type { BlogCategory, BlogPost } from '@/domain/blog/entities';

const SITE_NAME = 'Pantor';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pantor.dev';

export function generateBlogListMetadata(postCount: number): Metadata {
  const title = `Blog — Observabilidade e Wide Events | ${SITE_NAME}`;
  const description = `${postCount} artigos técnicos sobre observabilidade, wide events, OpenTelemetry e engenharia de produção.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/blog` },
    openGraph:  {
      type:        'website',
      title,
      description,
      url:         `${SITE_URL}/blog`,
      siteName:    SITE_NAME,
      images:      [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630 }],
    },
  };
}

export function generatePostMetadata(post: BlogPost): Metadata {
  const slug = post.slug as string;
  const ogImageUrl = post.ogImage ?? `${SITE_URL}/api/blog/og?slug=${slug}`;

  return {
    title:       `${post.title} | ${SITE_NAME}`,
    description: post.description,
    alternates:  { canonical: `${SITE_URL}/blog/${slug}` },
    openGraph:   {
      type:          'article',
      title:         post.title,
      description:   post.description,
      url:           `${SITE_URL}/blog/${slug}`,
      siteName:      SITE_NAME,
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime:  post.updatedAt.toISOString(),
      authors:       [post.author.name],
      tags:          post.tags.map(tag => tag as string),
      images:        [{ url: ogImageUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       post.title,
      description: post.description,
      images:      [ogImageUrl],
    },
  };
}

export function generateCategoryMetadata(category: BlogCategory): Metadata {
  const title = `${category.label} — Blog ${SITE_NAME}`;

  return {
    title,
    description: category.description,
    alternates:  { canonical: `${SITE_URL}/blog/categoria/${category.slug}` },
    openGraph:   {
      type:        'website',
      title,
      description: category.description,
      siteName:    SITE_NAME,
    },
  };
}

export function generateTagMetadata(tag: string): Metadata {
  const title = `#${tag} — Blog ${SITE_NAME}`;
  const description = `Artigos sobre ${tag} no Blog da ${SITE_NAME}.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/blog/tag/${tag}` },
    openGraph:  {
      type: 'website',
      title,
      description,
      siteName: SITE_NAME,
    },
  };
}

export function generatePostJsonLd(post: BlogPost): Record<string, unknown> {
  const slug = post.slug as string;

  return {
    '@context':    'https://schema.org',
    '@type':       'Article',
    headline:      post.title,
    description:   post.description,
    datePublished: post.publishedAt.toISOString(),
    dateModified:  post.updatedAt.toISOString(),
    author:        {
      '@type': 'Organization',
      name:    post.author.name,
      url:     SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name:    SITE_NAME,
      url:     SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
    image:            post.ogImage ?? `${SITE_URL}/api/blog/og?slug=${slug}`,
  };
}
