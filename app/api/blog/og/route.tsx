// app/api/blog/og/route.tsx
// Edge Runtime: ImageResponse para OG dinâmica por post.
// Cache de 1 hora — conteúdo estático por slug.
// SRE-P2: slug do query param sanitizado antes de qualquer operação.

import { ImageResponse } from 'next/og';
import { createSlug } from '@/domain/blog/value-objects';
import { blogRepository } from '@/lib/blog/contentlayer';
import { sanitizeSlug } from '@/lib/blog/sanitize';

export const runtime = 'edge';

const CACHE_CONTROL = 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400';
const SECURITY_HEADERS = {
  'Cache-Control': CACHE_CONTROL,
  'X-Content-Type-Options': 'nosniff',
} as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawSlug = searchParams.get('slug') ?? '';

  const slug = sanitizeSlug(rawSlug);
  if (!slug) {
    return new Response('slug inválido', {
      status:  400,
      headers: SECURITY_HEADERS,
    });
  }

  const post = await blogRepository.getPostBySlug(createSlug(slug));
  if (!post) {
    return new Response('Post não encontrado', {
      status:  404,
      headers: SECURITY_HEADERS,
    });
  }

  return new ImageResponse(
    (
      <div
        style={{
          display:         'flex',
          flexDirection:   'column',
          justifyContent:  'flex-end',
          width:           '100%',
          height:          '100%',
          padding:         '60px',
          backgroundColor: '#0f172a',
          color:           '#f1f5f9',
          fontFamily:      'sans-serif',
        }}
      >
        <div style={{ fontSize: 16, color: '#94a3b8', marginBottom: 16 }}>
          Pantor Blog · {post.category.label}
        </div>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.2, marginBottom: 24 }}>
          {post.title}
        </div>
        <div style={{ fontSize: 22, color: '#94a3b8', lineHeight: 1.5 }}>
          {post.description.slice(0, 120)}
          {post.description.length > 120 ? '...' : ''}
        </div>
        <div style={{ display: 'flex', marginTop: 40, alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 16, color: '#64748b' }}>
            {post.readingTime.minutes} min · {post.publishedAt.toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>
    ),
    {
      width:   1200,
      height:  630,
      headers: SECURITY_HEADERS,
    },
  );
}
