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
        <td style="padding:12px 14px;background:#f4f7f1;border:1px solid #e2e8dc;color:#5a6456;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;width:150px;vertical-align:top;">
          ${escapeHtml(label)}
        </td>
        <td style="padding:12px 14px;border:1px solid #e2e8dc;border-left:0;color:#152018;font-size:15px;line-height:1.5;vertical-align:top;">
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
    ? `<p style="margin:0 0 20px;color:#4d5749;font-size:15px;line-height:1.6;">${escapeHtml(options.intro)}</p>`
    : '';
  const table = options.rows?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;margin:0 0 18px;border-radius:12px;overflow:hidden;">${rowsHtml(options.rows)}</table>`
    : '';
  const body = options.body
    ? `<div style="margin:8px 0 0;padding:16px 18px;border:1px solid #e2e8dc;border-radius:12px;background:#f7faf4;color:#243028;font-size:14px;line-height:1.65;">${escapeHtml(options.body).replace(/\n/g, '<br/>')}</div>`
    : '';
  const footer = options.footerNote
    ? `<p style="margin:20px 0 0;color:#7a8474;font-size:12px;line-height:1.5;">${escapeHtml(options.footerNote)}</p>`
    : '';

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#eef2ea;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2ea;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border:1px solid #d7dfd0;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:18px 24px;background:#0d120e;border-bottom:3px solid #b9f542;">
                <div style="color:#b9f542;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">
                  KS PROTECT
                </div>
                <div style="margin-top:6px;color:#a7b0a2;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">
                  ${escapeHtml(options.eyebrow)}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px 24px;">
                <h1 style="margin:0 0 12px;color:#101610;font-size:24px;line-height:1.25;">
                  ${escapeHtml(options.title)}
                </h1>
                ${intro}
                ${table}
                ${body}
                ${footer}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background:#f7faf4;border-top:1px solid #e2e8dc;color:#667064;font-size:12px;line-height:1.55;">
                Skemmuvegi 28 · bleik gata, 200 Kópavogur<br/>
                ksprotect@ksprotect.is · 844 4456
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
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
    footerNote: 'Sent af ksprotect.is',
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
    footerNote: 'Sent af ksprotect.is / netverslun',
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
