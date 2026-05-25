// components/molecules/AuthorAvatar/AuthorAvatar.tsx - Server Component
// Exibe avatar e nome do autor. Recebe BlogAuthor completo.
import Image from 'next/image';
import type { BlogAuthor } from '@/domain/blog/entities';
import styles from './AuthorAvatar.module.css';

interface AuthorAvatarProps {
  readonly author: BlogAuthor;
  readonly size?: 'sm' | 'md';
}

export function AuthorAvatar({ author, size = 'sm' }: AuthorAvatarProps) {
  const px = size === 'md' ? 48 : 32;

  return (
    <div className={`${styles.wrapper} ${styles[size]}`}>
      <Image
        src={author.avatar}
        alt={`Foto de ${author.name}`}
        width={px}
        height={px}
        className={styles.image}
      />
      <span className={styles.name}>{author.name}</span>
    </div>
  );
}
