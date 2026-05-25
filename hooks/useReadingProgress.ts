// hooks/useReadingProgress.ts
// 'use client' implicito - usar apenas em Client Components.
// SRP: gerencia percentual de leitura via scroll do window.
import { useEffect, useState } from 'react';

export function useReadingProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress(): void {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const scrollable = scrollHeight - clientHeight;

      if (scrollable <= 0) {
        setProgress(100);
        return;
      }

      setProgress(Math.round((scrollTop / scrollable) * 100));
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return progress;
}
