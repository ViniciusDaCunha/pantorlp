// domain/blog/repository.ts
// IBlogRepository: contrato de acesso ao conteudo do blog.
// ISP: define apenas o que os consumidores precisam.
// Implementacao concreta em lib/blog/contentlayer.ts.

import type { BlogAuthor, BlogCategory, BlogPost } from './entities';
import type { Slug, Tag }                          from './value-objects';

export interface IBlogRepository {
  // Leitura de posts
  // getAllPosts: todos, incluindo drafts para uso interno/admin.
  getAllPosts(): Promise<ReadonlyArray<BlogPost>>;
  // getPublishedPosts: draft:false, ordenados por publishedAt desc.
  getPublishedPosts(): Promise<ReadonlyArray<BlogPost>>;
  // getPostBySlug: retorna null se nao encontrar; nunca lanca excecao.
  getPostBySlug(slug: Slug): Promise<BlogPost | null>;
  // getFeaturedPosts: featured:true e draft:false.
  getFeaturedPosts(): Promise<ReadonlyArray<BlogPost>>;

  // Filtragem
  getPostsByCategory(categorySlug: string): Promise<ReadonlyArray<BlogPost>>;
  getPostsByTag(tag: Tag): Promise<ReadonlyArray<BlogPost>>;
  // getRelatedPosts: exclui o post atual, prioriza mesma categoria + tags.
  getRelatedPosts(post: BlogPost, limit: number): Promise<ReadonlyArray<BlogPost>>;

  // Metadados para generateStaticParams
  getAllSlugs(): Promise<ReadonlyArray<Slug>>;
  getAllCategories(): Promise<ReadonlyArray<BlogCategory>>;
  getAllTags(): Promise<ReadonlyArray<Tag>>;
  getAllAuthors(): Promise<ReadonlyArray<BlogAuthor>>;
}
