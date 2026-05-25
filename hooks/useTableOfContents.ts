// hooks/useTableOfContents.ts
// 'use client' implicito - usar apenas em Client Components.
// SRP: gerencia qual heading esta visivel (IntersectionObserver).
import { useEffect, useState } from 'react';

export interface TocEntry {
  readonly id: string;
  readonly text: string;
  readonly level: 2 | 3;
}

export function useTableOfContents(headings: ReadonlyArray<TocEntry>): { readonly activeId: string } {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.find(entry => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-20% 0% -70% 0%', threshold: 0 },
    );

    headings.forEach(heading => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  return { activeId };
}
