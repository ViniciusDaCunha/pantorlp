import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { PostCard } from './PostCard';
import type { BlogPostSummary } from '@/types/blog';

vi.mock('@/components/molecules/ReadingTime/ReadingTime', () => ({
  ReadingTime: ({ minutes }: { readonly minutes: number }) => (
    <span aria-label={`Tempo de leitura: ${minutes} minutos`}>
      {minutes} min de leitura
    </span>
  ),
}));

vi.mock('@/components/molecules/TagBadge/TagBadge', () => ({
  TagBadge: ({ tag }: { readonly tag: string }) => (
    <a href={`/blog/tag/${tag}`} aria-label={`Ver posts com tag ${tag}`}>
      {tag}
    </a>
  ),
}));

const mockPost: BlogPostSummary = {
  slug: 'wide-events-intro',
  title: 'O que sao Wide Events',
  description: 'Wide events capturam contexto completo...',
  publishedAt: '2025-04-01',
  readingTime: 5,
  category: 'wide-events',
  tags: ['wide-events', 'opentelemetry'],
  author: 'pantor-team',
};

describe('PostCard', () => {
  it('renderiza titulo como link para o post', () => {
    const html = renderToStaticMarkup(<PostCard post={mockPost} />);

    expect(html).toContain('href="/blog/wide-events-intro"');
    expect(html).toContain('O que sao Wide Events');
  });

  it('exibe tempo de leitura', () => {
    const html = renderToStaticMarkup(<PostCard post={mockPost} />);

    expect(html).toContain('5 min de leitura');
  });

  it('renderiza tags como links para /blog/tag/', () => {
    const html = renderToStaticMarkup(<PostCard post={mockPost} />);

    expect(html).toContain('aria-label="Ver posts com tag wide-events"');
    expect(html).toContain('href="/blog/tag/wide-events"');
  });

  it('renderiza article com aria-label', () => {
    const html = renderToStaticMarkup(<PostCard post={mockPost} />);

    expect(html).toContain('<article');
    expect(html).toContain('aria-label="O que sao Wide Events"');
  });

  it('variante featured adiciona classe CSS correta', () => {
    const html = renderToStaticMarkup(<PostCard post={mockPost} variant='featured' />);

    expect(html).toContain('featured');
  });
});
