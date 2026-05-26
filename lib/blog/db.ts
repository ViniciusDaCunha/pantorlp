// lib/blog/db.ts
// Operações Supabase do blog. Segue SRE-P8.
// Importa sanitize — nunca usa string de input diretamente em query.

import { supabase } from '@/lib/supabase';
import { isValidEmail, sanitizeEmail, sanitizeSlug } from '@/lib/blog/sanitize';

export interface NewsletterResult {
  readonly ok: boolean;
  readonly isDuplicate: boolean;
}

export async function subscribeToBlogNewsletter(
  rawEmail: string,
  rawSourceSlug: string
): Promise<NewsletterResult> {
  if (!supabase) {
    console.warn('[db] supabase not configured');
    return { ok: false, isDuplicate: false };
  }

  const email = sanitizeEmail(rawEmail);
  const sourceSlug = sanitizeSlug(rawSourceSlug);

  if (!isValidEmail(email)) {
    return { ok: false, isDuplicate: false };
  }

  const { error } = await supabase
    .from('blog_newsletter_subscribers')
    .insert({
      email,
      source_slug: sourceSlug,
      subscribed_at: new Date().toISOString(),
    });

  if (error?.code === '23505') {
    return { ok: true, isDuplicate: true };
  }

  if (error) {
    console.error('[db] newsletter insert error', {
      code: error.code,
      message: error.message,
    });
    return { ok: false, isDuplicate: false };
  }

  return { ok: true, isDuplicate: false };
}

export async function incrementPostView(rawSlug: string): Promise<void> {
  if (!supabase) return;

  const slug = sanitizeSlug(rawSlug);
  if (!slug) return;

  const { error } = await supabase.rpc('increment_post_view', { p_slug: slug });

  if (error) {
    console.error('[db] increment_post_view error', { code: error.code });
  }
}
