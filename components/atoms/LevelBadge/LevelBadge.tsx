import React from "react";
import type { EventLevel } from "@/types";
import styles from "./LevelBadge.module.css";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface LevelBadgeProps {
  level: EventLevel;
  size?: "sm" | "md";
  dot?: boolean;
}

export function LevelBadge({ level, size = "md", dot = false }: LevelBadgeProps) {
  const ref = useIntersectionObserver('visible');
  const levelClass = level.toLowerCase();
  return (
    <span
      ref={ref}
      className={[styles.badge, styles[levelClass], styles[size], dot ? styles.dotOnly : ""].filter(Boolean).join(" ")}
      aria-label={`Nível: ${level}`}
    >
      {dot ? <span className={styles.dot} aria-hidden="true" /> : level}
    </span>
  );
}
