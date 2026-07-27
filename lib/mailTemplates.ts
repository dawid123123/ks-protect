function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function rowsHtml(rows: Array<[string, string]>) {
  return rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #1f241f;color:#9aa396;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;width:140px;vertical-align:top;">
          ${escapeHtml(label)}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #1f241f;color:#ecf0e9;font-size:15px;line-height:1.45;">
          ${escapeHtml(value).replace(/\n/g, '<br/>')}
        </td>
      </tr>`
    )
    .join('');
}

export function ksProtectEmailHtml(options: {
  eyebrow: string;
  title: string;
  intro?: string;
  rows?: Array<[string, string]>;
  body?: string;
  footerNote?: string;
}) {
  const intro = options.intro
    ? `<p style="margin:0 0 22px;color:#c5ccc0;font-size:15px;line-height:1.6;">${escapeHtml(options.intro)}</p>`
    : '';
  const table = options.rows?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 18px;">${rowsHtml(options.rows)}</table>`
    : '';
  const body = options.body
    ? `<div style="margin:18px 0 0;padding:16px;border:1px solid #2a322a;border-radius:14px;background:#0c0f0c;color:#d7ddd2;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(options.body)}</div>`
    : '';
  const footer = options.footerNote
    ? `<p style="margin:24px 0 0;color:#7d8678;font-size:12px;line-height:1.5;">${escapeHtml(options.footerNote)}</p>`
    : '';

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#070807;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:28px 18px;">
      <div style="border:1px solid #243024;border-radius:22px;overflow:hidden;background:linear-gradient(180deg,#121612 0%,#0a0c0a 100%);">
        <div style="padding:18px 22px;border-bottom:1px solid #243024;background:#0e120e;">
          <div style="color:#b9f542;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">
            KS PROTECT
          </div>
          <div style="margin-top:6px;color:#8f988a;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">
            ${escapeHtml(options.eyebrow)}
          </div>
        </div>
        <div style="padding:24px 22px 28px;">
          <h1 style="margin:0 0 14px;color:#f3f7ef;font-size:26px;line-height:1.15;letter-spacing:-0.03em;">
            ${escapeHtml(options.title)}
          </h1>
          ${intro}
          ${table}
          ${body}
          ${footer}
        </div>
      </div>
      <p style="margin:16px 8px 0;color:#5f675c;font-size:11px;line-height:1.5;">
        Skemmuvegi 28 · bleik gata, 200 Kópavogur · ksprotect@ksprotect.is · 844 4456
      </p>
    </div>
  </body>
</html>`;
}

export function contactInquiryEmail(input: {
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  service: string;
  message: string;
}) {
  const text = [
    'Ný fyrirspurn af vefsíðu KS Protect',
    '',
    `Nafn: ${input.name}`,
    `Sími: ${input.phone}`,
    `Netfang: ${input.email}`,
    `Bíll: ${input.vehicle}`,
    `Þjónusta: ${input.service}`,
    '',
    'Skilaboð:',
    input.message || '(engin)',
  ].join('\n');

  const html = ksProtectEmailHtml({
    eyebrow: 'Tilboðsbeiðni',
    title: `Fyrirspurn frá ${input.name}`,
    intro: 'Ný beiðni kom inn af vefsíðunni. Þú getur svarað beint þessum pósti.',
    rows: [
      ['Nafn', input.name],
      ['Sími', input.phone],
      ['Netfang', input.email],
      ['Bíll', input.vehicle],
      ['Þjónusta', input.service],
    ],
    body: input.message || '(engin skilaboð)',
    footerNote: 'Send af ksprotect.is / contact form',
  });

  return {
    subject: `Tilboðsbeiðni frá ${input.name}`,
    text,
    html,
  };
}

export function shopOrderEmail(input: {
  name: string;
  textBody: string;
}) {
  const html = ksProtectEmailHtml({
    eyebrow: 'Netverslun',
    title: `Pöntun frá ${input.name}`,
    intro: 'Ný pöntun úr netverslun KS Protect.',
    body: input.textBody,
    footerNote: 'Send af ksprotect.is / netverslun',
  });

  return {
    subject: `Pöntun frá ${input.name}`,
    text: input.textBody,
    html,
  };
}

export function passwordCodeEmail(code: string) {
  const text = [
    'Einhver bað um að breyta lykilorði verslunarstjóra á ksprotect.is.',
    '',
    `Staðfestingarkóði: ${code}`,
    '',
    'Kóðinn gildir í 15 mínútur.',
    'Ef þú baðst ekki um þetta geturðu hunsað þennan póst.',
  ].join('\n');

  const html = ksProtectEmailHtml({
    eyebrow: 'Öryggi',
    title: 'Staðfestingarkóði',
    intro: 'Notaðu þennan kóða til að staðfesta nýtt lykilorð verslunarstjóra.',
    rows: [['Kóði', code]],
    footerNote: 'Kóðinn gildir í 15 mínútur. Ef þú baðst ekki um þetta, hunsaðu póstinn.',
  });

  return {
    subject: 'KS Protect — staðfestingarkóði fyrir nýtt lykilorð',
    text,
    html,
  };
}
