// lib/blog/sanitize.ts
// Funções puras de sanitização. Sem dependências externas.
// SRE-P2: usadas por lib/blog/db.ts e Route Handlers antes de qualquer persistência.

const EMAIL_MAX_LENGTH = 254;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function sanitizeEmail(raw: string): string {
  return raw.toLowerCase().trim().slice(0, EMAIL_MAX_LENGTH);
}

export function isValidEmail(email: string): boolean {
  const sanitized = sanitizeEmail(email);
  return EMAIL_REGEX.test(sanitized) && sanitized.length <= EMAIL_MAX_LENGTH;
}

const SLUG_MAX_LENGTH = 200;

export function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, SLUG_MAX_LENGTH);
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length > 0 && slug.length <= SLUG_MAX_LENGTH;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
