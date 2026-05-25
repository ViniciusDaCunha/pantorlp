// components/organisms/BlogHeader/BlogHeader.tsx - Server Component
// Titulo, breadcrumb e contagem de posts da pagina de listagem.
import Link from 'next/link';
import styles from './BlogHeader.module.css';

interface BreadcrumbItem {
  readonly label: string;
  readonly href: string;
}

interface BlogHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly postCount?: number;
  readonly breadcrumb?: ReadonlyArray<BreadcrumbItem>;
}

export function BlogHeader({
  title,
  description,
  postCount,
  breadcrumb = [],
}: BlogHeaderProps) {
  return (
    <header className={styles.header}>
      {breadcrumb.length > 0 && (
        <nav aria-label='Breadcrumb' className={styles.breadcrumb}>
          <ol>
            {breadcrumb.map((item, index) => (
              <li key={item.href}>
                {index < breadcrumb.length - 1 ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  <span aria-current='page'>{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <h1 className={styles.title}>{title}</h1>

      {description && <p className={styles.description}>{description}</p>}

      {postCount !== undefined && (
        <p className={styles.count}>
          {postCount} {postCount === 1 ? 'artigo' : 'artigos'}
        </p>
      )}
    </header>
  );
}
