// app/blog/layout.tsx - Server Component
// Layout compartilhado por todas as rotas do blog.
// Sem 'use client': nao tem interatividade propria.
import type { Metadata } from 'next';
import styles            from './blog.module.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Pantor Blog',
    default:  'Blog | Pantor',
  },
};

interface BlogLayoutProps {
  readonly children: React.ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className={styles.blogRoot}>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
