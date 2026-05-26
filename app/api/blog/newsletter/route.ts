// app/api/blog/newsletter/route.ts
// Route Handler de captura de newsletter. SRE-P1 + P5 + P6.
// Rate limiting via middleware.ts (implementado em T51).

import { subscribeToBlogNewsletter } from '@/lib/blog/db';
import { isRecord, isString, isValidEmail } from '@/lib/blog/sanitize';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store',
} as const;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: 'JSON inválido' },
      { status: 400, headers: SECURITY_HEADERS }
    );
  }

  if (!isRecord(body)) {
    return Response.json(
      { error: 'Formato inválido' },
      { status: 400, headers: SECURITY_HEADERS }
    );
  }

  const email = isString(body.email) ? body.email : '';
  const sourceSlug = isString(body.sourceSlug) ? body.sourceSlug : '';

  if (!isValidEmail(email)) {
    return Response.json(
      { error: 'Email inválido' },
      { status: 422, headers: SECURITY_HEADERS }
    );
  }

  const result = await subscribeToBlogNewsletter(email, sourceSlug);

  if (!result.ok && !result.isDuplicate) {
    return Response.json(
      { error: 'Erro interno' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }

  return Response.json(
    { ok: true },
    { status: 200, headers: SECURITY_HEADERS }
  );
}

export async function GET() {
  return Response.json(
    { error: 'Método não permitido' },
    { status: 405, headers: { ...SECURITY_HEADERS, Allow: 'POST' } }
  );
}
