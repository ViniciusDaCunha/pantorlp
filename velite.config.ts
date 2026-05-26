import { defineCollection, defineConfig, s } from 'velite';
import { unified }                            from 'unified';
import remarkParse                            from 'remark-parse';
import { visit }                              from 'unist-util-visit';
import type { Heading, Text }                 from 'mdast';
import rehypePrettyCode                       from 'rehype-pretty-code';
import remarkGfm                              from 'remark-gfm';
import rehypeSlug                             from 'rehype-slug';
import rehypeAutolinkHeadings                 from 'rehype-autolink-headings';

type BlogHeading = Readonly<{
  id:    string;
  text:  string;
  level: 2 | 3;
}>;

function createBlogPath(metaPath: string): string {
  return metaPath
    .replace(/\\/g, '/')
    .replace(/^.*\/content\/blog\//, '')
    .replace(/^blog\//, '')
    .replace(/\.mdx$/, '');
}

function createHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u0000-\u001F!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-|-$/g, '');
}

function extractHeadingsFromMdx(content: string): BlogHeading[] {
  const tree = unified().use(remarkParse).parse(content);
  const headings: BlogHeading[] = [];

  visit(tree, 'heading', (node: Heading) => {
    if (node.depth !== 2 && node.depth !== 3) return;

    const text = node.children
      .filter((child): child is Text => child.type === 'text')
      .map(child => child.value)
      .join('');

    if (!text) return;

    headings.push({
      id:    createHeadingId(text),
      text,
      level: node.depth,
    });
  });

  return headings;
}

const posts = defineCollection({
  name:    'Post',
  pattern: 'blog/**/*.mdx',
  schema:  s.object({
    title:       s.string(),
    description: s.string(),
    author:      s.string(),
    category:    s.string(),
    tags:        s.array(s.string()),
    publishedAt: s.isodate(),
    updatedAt:   s.isodate().optional(),
    featured:    s.boolean().default(false),
    draft:       s.boolean().default(false),
    ogImage:     s.string().optional(),
    seriesSlug:  s.string().optional(),
    seriesPart:  s.number().optional(),
    body:        s.mdx(),
    raw:         s.raw(),
  }).transform((data, { meta }) => {
    const slug = createBlogPath(meta.path);

    return {
      ...data,
      headings: extractHeadingsFromMdx(data.raw),
      slug,
      url: `/blog/${slug}`,
    };
  }),
});

export default defineConfig({
  root:        'content',
  output:      { data: '.velite', clean: true },
  collections: { posts },
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      [rehypePrettyCode, {
        theme:          'one-dark-pro',
        keepBackground: false,
        onVisitLine(node: { children: unknown[] }) {
          if (node.children.length === 0) {
            node.children = [{ type: 'text', value: ' ' }];
          }
        },
      }],
    ],
  },
});
