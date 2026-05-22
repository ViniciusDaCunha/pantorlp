import { defineCollection, defineConfig, s } from 'velite';
import rehypePrettyCode                       from 'rehype-pretty-code';
import remarkGfm                              from 'remark-gfm';
import rehypeSlug                             from 'rehype-slug';
import rehypeAutolinkHeadings                 from 'rehype-autolink-headings';

function createBlogPath(metaPath: string): string {
  return metaPath
    .replace(/\\/g, '/')
    .replace(/^.*\/content\/blog\//, '')
    .replace(/^blog\//, '')
    .replace(/\.mdx$/, '');
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
