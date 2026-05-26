// components/organisms/PostContent/PostContent.tsx - Server Component
// Renderiza MDX compilado pelo Velite 0.3.1 a partir de body string.
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { MDXErrorBoundary } from '@/components/atoms/MDXErrorBoundary/MDXErrorBoundary';
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

const runtime: MdxRuntime = { Fragment, jsx, jsxs };

const runtimeRequire = (mod: string): MdxRuntime => {
  if (mod === 'react/jsx-runtime') return runtime;
  throw new Error(`[PostContent] módulo não autorizado: ${mod}`);
};

function MDXRenderer({
  code,
  components,
}: {
  readonly code: string;
  readonly components: MdxComponents;
}) {
  try {
    // TRUST BOUNDARY (ADR-011): post.body é EXCLUSIVAMENTE build artifact do Velite.
    // Gerado em build time por velite.config.ts - nunca input de usuário ou conteúdo remoto.
    // Não alterar este bloco para aceitar qualquer outra fonte sem revisão de segurança.
    const createModule = new Function(code) as unknown as MdxModuleFactory;
    const { default: Content } = createModule(runtimeRequire('react/jsx-runtime'));
    return <Content components={components} />;
  } catch (error) {
    console.error('[PostContent] MDX render error', (error as Error).message);
    return (
      <p role='alert' aria-live='polite'>
        Erro ao renderizar o conteúdo. Tente recarregar a página.
      </p>
    );
  }
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
  return (
    <article className={styles.article} aria-label={post.title}>
      <header className={styles.header}>
        <span className={styles.category}>{post.category.label}</span>
        <h1 className={styles.title}>{post.title}</h1>
        <p className={styles.description}>{post.description}</p>
      </header>

      <div className={styles.content} data-mdx-content>
        <MDXErrorBoundary>
          <MDXRenderer code={post.body} components={mdxComponents} />
        </MDXErrorBoundary>
      </div>
    </article>
  );
}
