import { useEffect, useRef } from 'react';

export function useIntersectionObserver(classToAdd: string, options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.classList.add(classToAdd);
      }
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  }, [classToAdd, options]);

  return ref;
}