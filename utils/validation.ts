// ─── Email Validation ────────────────────────────────────────────────────────

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","10minutemail.com","tempmail.com",
  "throwam.com","yopmail.com","sharklasers.com","spam4.me","trashmail.at",
  "trashmail.io","trashmail.me","mailnesia.com","dispostable.com",
  "fakeinbox.com","maildrop.cc","discard.email","spambog.com","mailnull.com",
]);

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return { valid: false, error: "E-mail é obrigatório." };
  if (!EMAIL_REGEX.test(trimmed)) return { valid: false, error: "Formato de e-mail inválido." };
  const domain = trimmed.split("@")[1];
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, error: "Use seu e-mail profissional ou pessoal." };
  }
  return { valid: true };
}

export function validateRole(role: string): ValidationResult {
  const valid = ["developer","tech-lead","cto","founder","other"].includes(role);
  return valid ? { valid: true } : { valid: false, error: "Selecione um papel." };
}

export function sanitizeString(value: string, maxLength = 100): string {
  return value.trim().slice(0, maxLength);
}
