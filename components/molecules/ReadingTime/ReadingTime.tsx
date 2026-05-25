// components/molecules/ReadingTime/ReadingTime.tsx - Server Component
// Exibe estimativa de leitura. Recebe minutes: number; nao calcula.
import styles from './ReadingTime.module.css';

interface ReadingTimeProps {
  readonly minutes: number;
}

export function ReadingTime({ minutes }: ReadingTimeProps) {
  return (
    <span className={styles.wrapper} aria-label={`Tempo de leitura: ${minutes} minutos`}>
      <span className={styles.icon} aria-hidden>
        min
      </span>
      <span>{minutes} min de leitura</span>
    </span>
  );
}
