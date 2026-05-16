import React from "react";
import type { EventLevel } from "@/types";
import styles from "./LevelBadge.module.css";

interface LevelBadgeProps {
  level: EventLevel;
  size?: "sm" | "md";
  dot?: boolean;
}

export function LevelBadge({ level, size = "md", dot = false }: LevelBadgeProps) {
  const levelClass = level.toLowerCase();
  return (
    <span
      className={[styles.badge, styles[levelClass], styles[size], dot ? styles.dotOnly : ""].filter(Boolean).join(" ")}
      aria-label={`Nível: ${level}`}
    >
      {dot ? <span className={styles.dot} aria-hidden="true" /> : level}
    </span>
  );
}
