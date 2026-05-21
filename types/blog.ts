// types/blog.ts
// Tipos de apresentacao e API do blog.
// OCP: types/index.ts existente nao e modificado.

// Frontmatter validado pelo Contentlayer.
export interface PostFrontmatter {
  readonly title:       string;
  readonly description: string;
  readonly author:      string;
  readonly category:    string;
  readonly tags:        string[];
  readonly publishedAt: string;
  readonly updatedAt?:  string;
  readonly featured?:   boolean;
  readonly draft?:      boolean;
  readonly ogImage?:    string;
  readonly seriesSlug?: string;
  readonly seriesPart?: number;
}

// Versao resumida para listagens, sem body.
export interface BlogPostSummary {
  readonly slug:        string;
  readonly title:       string;
  readonly description: string;
  readonly publishedAt: string;
  readonly readingTime: number;
  readonly category:    string;
  readonly tags:        string[];
  readonly author:      string;
}

// Props de componentes.
export interface PostCardProps {
  readonly post:     BlogPostSummary;
  readonly variant?: 'default' | 'featured' | 'compact';
}

// Paginacao.
export interface PaginationParams {
  readonly page:     number;
  readonly pageSize: number;
}

export interface PaginatedPosts {
  readonly posts:      ReadonlyArray<BlogPostSummary>;
  readonly total:      number;
  readonly page:       number;
  readonly totalPages: number;
}

// Parametros de rota (generateStaticParams).
export type BlogSlugParams     = { readonly slug:      string };
export type BlogCategoryParams = { readonly categoria: string };
export type BlogTagParams      = { readonly tag:       string };
