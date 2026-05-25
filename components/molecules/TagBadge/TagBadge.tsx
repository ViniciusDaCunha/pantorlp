// components/molecules/TagBadge/TagBadge.tsx - Server Component
// Pill de tag com link para /blog/tag/[tag]
import Link from 'next/link';
import styles from './TagBadge.module.css';

interface TagBadgeProps {
  readonly tag: string;
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <Link
      href={`/blog/tag/${tag}`}
      className={styles.badge}
      aria-label={`Ver posts com tag ${tag}`}
    >
      {tag}
    </Link>
  );
}
