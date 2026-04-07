"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { TerminalEvent } from "@/types";

// ─── Wide Event Fixtures ──────────────────────────────────────────────────────

const TERMINAL_EVENTS: TerminalEvent[] = [
  {
    timestamp: "10:30:01.234",
    level: "INFO",
    eventType: "payment.succeeded",
    attrs: 'user_id=usr_abc123 amount=150.00 currency=BRL duration_ms=342',
  },
  {
    timestamp: "10:30:01.891",
    level: "ERROR",
    eventType: "payment.failed",
    attrs: 'user_id=usr_xyz789 error=INSUFFICIENT_FUNDS duration_ms=1847 retry=2',
  },
  {
    timestamp: "10:30:02.103",
    level: "INFO",
    eventType: "user.login",
    attrs: 'user_id=usr_def456 ip=187.45.x.x region=BR duration_ms=89',
  },
  {
    timestamp: "10:30:02.456",
    level: "WARN",
    eventType: "http.request.slow",
    attrs: 'path=/api/checkout duration_ms=2341 threshold=2000 status=200',
  },
  {
    timestamp: "10:30:02.789",
    level: "DEBUG",
    eventType: "db.query",
    attrs: 'table=orders duration_ms=45 rows=12 cached=false',
  },
  {
    timestamp: "10:30:03.012",
    level: "FATAL",
    eventType: "db.connection.error",
    attrs: 'host=rds-prod.internal retry=3 duration_ms=5000 pool=exhausted',
  },
  {
    timestamp: "10:30:03.441",
    level: "INFO",
    eventType: "order.created",
    attrs: 'order_id=ord_9f2a4b plan=growth amount=290.00 duration_ms=156',
  },
  {
    timestamp: "10:30:03.899",
    level: "WARN",
    eventType: "api.rate_limit",
    attrs: 'key=pk_live_xx endpoint=/v1/events limit=1000 remaining=12',
  },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseTerminalAnimationOptions {
  intervalMs?: number;
  maxLines?: number;
}

export function useTerminalAnimation({
  intervalMs = 1400,
  maxLines = 6,
}: UseTerminalAnimationOptions = {}) {
  const [visibleLines, setVisibleLines] = useState<TerminalEvent[]>([]);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addNextLine = useCallback(() => {
    const event = TERMINAL_EVENTS[indexRef.current % TERMINAL_EVENTS.length];
    indexRef.current += 1;

    setVisibleLines((prev) => {
      const next = [...prev, event];
      return next.length > maxLines ? next.slice(next.length - maxLines) : next;
    });
  }, [maxLines]);

  useEffect(() => {
    // Seed with first 2 lines immediately
    setVisibleLines(TERMINAL_EVENTS.slice(0, 2));
    indexRef.current = 2;

    intervalRef.current = setInterval(addNextLine, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [addNextLine, intervalMs]);

  return { visibleLines };
}
