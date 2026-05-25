// components/organisms/PostContent/PostContent.tsx - Server Component
// Renderiza MDX compilado pelo Velite 0.3.1 a partir de body string.
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { CodeBlock } from '@/components/molecules/CodeBlock/CodeBlock';
import type { BlogPost } from '@/domain/blog/entities';
import styles from './PostContent.module.css';

interface PostContentProps {
  readonly post: BlogPost;
}

type MdxComponent = (props: {
  readonly components?: MdxComponents;
}) => ReactNode;

interface MdxModule {
  readonly default: MdxComponent;
}

interface MdxRuntime {
  readonly Fragment: typeof Fragment;
  readonly jsx: typeof jsx;
  readonly jsxs: typeof jsxs;
}

type MdxModuleFactory = (runtime: MdxRuntime) => MdxModule;

interface MdxPreProps extends ComponentPropsWithoutRef<'pre'> {
  readonly 'data-language'?: string;
}

type MdxComponents = Readonly<{
  pre: (props: MdxPreProps) => ReactNode;
}>;

function createMdxModule(code: string): MdxModule {
  const createModule = Function(code) as unknown as MdxModuleFactory;
  return createModule({ Fragment, jsx, jsxs });
}

function Pre({ children, className, 'data-language': dataLanguage }: MdxPreProps) {
  const language = dataLanguage
    ? `language-${dataLanguage}`
    : className;

  return (
    <CodeBlock className={language}>
      {children}
    </CodeBlock>
  );
}

const mdxComponents: MdxComponents = {
  pre: Pre,
};

export function PostContent({ post }: PostContentProps) {
  const Content = createMdxModule(post.body).default;

  return (
    <article className={styles.article} aria-label={post.title}>
      <header className={styles.header}>
        <span className={styles.category}>{post.category.label}</span>
        <h1 className={styles.title}>{post.title}</h1>
        <p className={styles.description}>{post.description}</p>
      </header>

      <div className={styles.content} data-mdx-content>
        <Content components={mdxComponents} />
      </div>
    </article>
  );
}
