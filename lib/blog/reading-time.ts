// lib/blog/reading-time.ts
// Funcao pura: entrada deterministica, saida deterministica.
// Testavel sem mocks. Sem dependencias externas.

import type { ReadingTime } from '@/domain/blog/value-objects';

// Media de leitura para conteudo tecnico (Nielsen Norman Group).
const WORDS_PER_MINUTE = 200;

export function computeReadingTime(rawContent: string): ReadingTime {
  const words   = rawContent.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  return { minutes, words };
}
