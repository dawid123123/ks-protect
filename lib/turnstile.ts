export function turnstileSiteKey() {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
}

export function turnstileSecretKey() {
  return process.env.TURNSTILE_SECRET_KEY || '';
}

export function isTurnstileConfigured() {
  return Boolean(turnstileSiteKey() && turnstileSecretKey());
}

/** When Turnstile is configured, token is required. Otherwise allow (local/dev). */
export async function verifyTurnstileToken(token: string, ip?: string | null) {
  if (!isTurnstileConfigured()) {
    return { ok: true as const, skipped: true as const };
  }

  if (!token) {
    return { ok: false as const, skipped: false as const };
  }

  const body = new URLSearchParams();
  body.set('secret', turnstileSecretKey());
  body.set('response', token);
  if (ip) {
    body.set('remoteip', ip);
  }

  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }
  );

  if (!response.ok) {
    return { ok: false as const, skipped: false as const };
  }

  const data = (await response.json()) as { success?: boolean };
  return {
    ok: Boolean(data.success),
    skipped: false as const,
  };
}
