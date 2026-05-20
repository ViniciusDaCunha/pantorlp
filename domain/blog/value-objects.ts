// domain/blog/value-objects.ts
// Branded types garantem invariantes em compile-time.
// Smart constructors sao as unicas formas de criar Slug e Tag.
// Nenhuma dependencia externa.

export type Slug = string & { readonly __brand: 'Slug' };
export type Tag  = string & { readonly __brand: 'Tag'  };

export interface ReadingTime {
  readonly minutes: number;
  readonly words:   number;
}

export interface SocialLink {
  readonly platform: 'twitter' | 'github' | 'linkedin' | 'website';
  readonly url:      string;
}

export function createSlug(raw: string): Slug {
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-/, '');
  return slug as Slug;
}

export function createTag(raw: string): Tag {
  return raw.toLowerCase().trim() as Tag;
}
