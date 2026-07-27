export function mailToAddress() {
  return process.env.MAIL_TO || 'ksprotect@ksprotect.is';
}

export function mailFromAddress() {
  return (
    process.env.MAIL_FROM ||
    'KS Protect <onboarding@resend.dev>'
  );
}

export function isMailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendMail(options: {
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  to?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('MAIL_NOT_CONFIGURED');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: mailFromAddress(),
      to: [options.to || mailToAddress()],
      subject: options.subject,
      text: options.text,
      html: options.html || undefined,
      reply_to: options.replyTo || undefined,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error('MAIL_SEND_FAILED:' + detail.slice(0, 200));
  }

  return response.json();
}
