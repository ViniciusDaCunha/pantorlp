"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { WaitlistFormData, DeveloperRole } from "@/types";
import { validateEmail, validateRole, sanitizeString } from "@/utils/validation";
import { submitWaitlist, trackEvent } from "@/lib/supabase";

// ─── Session ID ───────────────────────────────────────────────────────────────

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  const key = "pantor_sid";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

type FormStatus = "idle" | "loading" | "success" | "error";

interface FormState {
  email: string;
  role: DeveloperRole | "";
  company: string;
}

interface FormErrors {
  email?: string;
  role?: string;
}

export function useWaitlistForm() {
  const [formData, setFormData] = useState<FormState>({
    email: "",
    role: "",
    company: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [isDuplicate, setIsDuplicate] = useState(false);
  const hasTrackedStart = useRef(false);
  const sessionId = useRef<string>("");

  useEffect(() => {
    sessionId.current = getOrCreateSessionId();
  }, []);

  const updateField = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));

      // Track form interaction once
      if (!hasTrackedStart.current) {
        hasTrackedStart.current = true;
        trackEvent("form_start", sessionId.current);
      }
    },
    []
  );

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    const emailResult = validateEmail(formData.email);
    if (!emailResult.valid) newErrors.email = emailResult.error;

    const roleResult = validateRole(formData.role);
    if (!roleResult.valid) newErrors.role = roleResult.error;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      setStatus("loading");

      const result = await submitWaitlist({
        email: formData.email,
        role: formData.role as DeveloperRole,
        company: sanitizeString(formData.company),
      });

      if (result.success) {
        setStatus("success");
        setIsDuplicate(result.isDuplicate ?? false);
        await trackEvent("form_submit", sessionId.current, {
          role: formData.role,
          isDuplicate: result.isDuplicate,
        });
      } else {
        setStatus("error");
      }
    },
    [formData, validate]
  );

  const reset = useCallback(() => {
    setFormData({ email: "", role: "", company: "" });
    setErrors({});
    setStatus("idle");
    setIsDuplicate(false);
    hasTrackedStart.current = false;
  }, []);

  return {
    formData,
    errors,
    status,
    isDuplicate,
    updateField,
    handleSubmit,
    reset,
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",
  };
}
