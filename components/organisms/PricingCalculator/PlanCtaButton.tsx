"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/atoms/Button/Button";

interface PlanCtaButtonProps {
  planName: string;
  highlighted?: boolean;
  children: ReactNode;
  ariaLabel: string;
}

function getSessionId(): string | null {
  let id = sessionStorage.getItem("pantor_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("pantor_session_id", id);
  }
  return id;
}

export function PlanCtaButton({
  planName,
  highlighted = false,
  children,
  ariaLabel,
}: PlanCtaButtonProps) {
  async function handleCtaClick(): Promise<void> {
    const waitlist = document.getElementById("waitlist");
    waitlist?.scrollIntoView({ behavior: "smooth" });

    const { trackPlanCtaClick } = await import("@/lib/supabase");
    void trackPlanCtaClick(planName, getSessionId());
  }

  return (
    <Button
      variant={highlighted ? "primary" : "secondary"}
      size="md"
      onClick={handleCtaClick}
      aria-label={ariaLabel}
    >
      {children}
    </Button>
  );
}
