// app/blog/not-found.tsx - Server Component
// Exibido quando notFound() e chamado em qualquer rota de /blog/*
import Link from 'next/link';
import styles from './not-found.module.css';

export default function BlogNotFound() {
  return (
    <div className={styles.container} role='main'>
      <h1 className={styles.title}>Post não encontrado</h1>
      <p className={styles.description}>
        O artigo que você procura não existe ou foi removido.
      </p>
      <Link href='/blog' className={styles.link}>
        Voltar para o blog.
      </Link>
    </div>
  );
}
