// lib/blog/contentlayer.ts
// Implementacao de IBlogRepository usando Velite como fonte de dados.
// DIP: paginas importam o singleton tipado pela interface do dominio.

import { posts }                                  from '../../.velite';
import type { Post as VelitePost }                from '../../.velite';
import type { BlogAuthor, BlogCategory, BlogPost } from '@/domain/blog/entities';
import type { IBlogRepository }                   from '@/domain/blog/repository';
import type { Slug, Tag }                         from '@/domain/blog/value-objects';
import type { BlogPostSummary }                   from '@/types/blog';
import { createSlug, createTag }                  from '@/domain/blog/value-objects';
import { computeReadingTime }                     from './reading-time';

export const AUTHORS: Record<string, BlogAuthor> = {
  'pantor-team': {
    slug:   'pantor-team',
    name:   'Time Pantor',
    bio:    'Engenharia e produto da Pantor - plataforma de observabilidade baseada em wide events.',
    avatar: '/authors/pantor-team.png',
    links:  [
      { platform: 'github',   url: 'https://github.com/pantor-dev'       },
      { platform: 'linkedin', url: 'https://linkedin.com/company/pantor' },
    ],
  },
};

export const CATEGORIES: ReadonlyArray<BlogCategory> = [
  { slug: 'wide-events',     label: 'Wide Events',     description: 'Eventos contextuais e observabilidade moderna' },
  { slug: 'observabilidade', label: 'Observabilidade', description: 'Monitoring, tracing e logging na pratica' },
  { slug: 'opentelemetry',   label: 'OpenTelemetry',   description: 'Instrumentacao e coleta de telemetria' },
  { slug: 'engenharia',      label: 'Engenharia',      description: 'Boas praticas de desenvolvimento de software' },
];

function getAuthor(authorSlug: string): BlogAuthor {
  return AUTHORS[authorSlug] ?? AUTHORS['pantor-team'];
}

function getCategory(categorySlug: string): BlogCategory {
  return CATEGORIES.find(category => category.slug === categorySlug) ?? CATEGORIES[0];
}

function byPublishedAtDesc(a: VelitePost, b: VelitePost): number {
  return +new Date(b.publishedAt) - +new Date(a.publishedAt);
}

function toDomainPost(raw: VelitePost): BlogPost {
  return {
    slug:        createSlug(raw.slug),
    title:       raw.title,
    description: raw.description,
    body:        raw.body,
    author:      getAuthor(raw.author),
    category:    getCategory(raw.category),
    tags:        raw.tags.map(createTag),
    publishedAt: new Date(raw.publishedAt),
    updatedAt:   new Date(raw.updatedAt ?? raw.publishedAt),
    readingTime: computeReadingTime(raw.raw),
    headings:    raw.headings ?? [],
    featured:    raw.featured,
    draft:       raw.draft,
    ogImage:     raw.ogImage ?? null,
    series: raw.seriesSlug
      ? { slug: raw.seriesSlug, title: raw.seriesSlug, part: raw.seriesPart ?? 1, total: 1 }
      : null,
  };
}

export function toSummary(post: BlogPost): BlogPostSummary {
  return {
    slug:        post.slug as string,
    title:       post.title,
    description: post.description,
    publishedAt: post.publishedAt.toISOString(),
    readingTime: post.readingTime.minutes,
    category:    post.category.slug,
    tags:        post.tags.map(tag => tag as string),
    author:      post.author.slug,
  };
}

function getRelatedScore(candidate: VelitePost, post: BlogPost): number {
  const categoryScore = candidate.category === post.category.slug ? 2 : 0;
  const tagScore = candidate.tags.filter(tag =>
    post.tags.some(postTag => tag === postTag),
  ).length;

  return categoryScore + tagScore;
}

class VeliteBlogRepository implements IBlogRepository {
  async getAllPosts(): Promise<ReadonlyArray<BlogPost>> {
    return posts.map(toDomainPost);
  }

  async getPublishedPosts(): Promise<ReadonlyArray<BlogPost>> {
    return posts
      .filter(post => !post.draft)
      .sort(byPublishedAtDesc)
      .map(toDomainPost);
  }

  async getPostBySlug(slug: Slug): Promise<BlogPost | null> {
    const raw = posts.find(post => post.slug === slug);
    return raw ? toDomainPost(raw) : null;
  }

  async getFeaturedPosts(): Promise<ReadonlyArray<BlogPost>> {
    return posts
      .filter(post => post.featured && !post.draft)
      .sort(byPublishedAtDesc)
      .map(toDomainPost);
  }

  async getPostsByCategory(categorySlug: string): Promise<ReadonlyArray<BlogPost>> {
    return posts
      .filter(post => post.category === categorySlug && !post.draft)
      .sort(byPublishedAtDesc)
      .map(toDomainPost);
  }

  async getPostsByTag(tag: Tag): Promise<ReadonlyArray<BlogPost>> {
    return posts
      .filter(post => post.tags.includes(tag) && !post.draft)
      .sort(byPublishedAtDesc)
      .map(toDomainPost);
  }

  async getRelatedPosts(post: BlogPost, limit: number): Promise<ReadonlyArray<BlogPost>> {
    return posts
      .filter(candidate => candidate.slug !== post.slug && !candidate.draft)
      .map(candidate => ({ candidate, score: getRelatedScore(candidate, post) }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score || byPublishedAtDesc(a.candidate, b.candidate))
      .slice(0, limit)
      .map(result => toDomainPost(result.candidate));
  }

  async getAllSlugs(): Promise<ReadonlyArray<Slug>> {
    return posts
      .filter(post => !post.draft)
      .map(post => createSlug(post.slug));
  }

  async getAllCategories(): Promise<ReadonlyArray<BlogCategory>> {
    return CATEGORIES;
  }

  async getAllTags(): Promise<ReadonlyArray<Tag>> {
    const tagSet = new Set(posts.flatMap(post => post.tags));
    return [...tagSet].map(createTag);
  }

  async getAllAuthors(): Promise<ReadonlyArray<BlogAuthor>> {
    return Object.values(AUTHORS);
  }
}

export const blogRepository: IBlogRepository = new VeliteBlogRepository();
