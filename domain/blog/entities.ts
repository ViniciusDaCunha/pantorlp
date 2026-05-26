// domain/blog/entities.ts
// Camada de Dominio - zero dependencias externas.
// Representa O QUE sao as entidades, nao como sao persistidas ou renderizadas.

import type { ReadingTime, Slug, SocialLink, Tag } from './value-objects';

export interface BlogPost {
  readonly slug:        Slug;
  readonly title:       string;
  readonly description: string;
  readonly body:        string;
  readonly author:      BlogAuthor;
  readonly category:    BlogCategory;
  readonly tags:        ReadonlyArray<Tag>;
  readonly publishedAt: Date;
  readonly updatedAt:   Date;
  readonly readingTime: ReadingTime;
  readonly headings:    ReadonlyArray<BlogHeading>;
  readonly featured:    boolean;
  readonly draft:       boolean;
  readonly ogImage:     string | null;
  readonly series:      BlogSeries | null;
}

export interface BlogHeading {
  readonly id:    string;
  readonly text:  string;
  readonly level: 2 | 3;
}

export interface BlogAuthor {
  readonly slug:   string;
  readonly name:   string;
  readonly bio:    string;
  readonly avatar: string;
  readonly links:  ReadonlyArray<SocialLink>;
}

export interface BlogCategory {
  readonly slug:        string;
  readonly label:       string;
  readonly description: string;
}

export interface BlogSeries {
  readonly slug:  string;
  readonly title: string;
  readonly part:  number;
  readonly total: number;
}
