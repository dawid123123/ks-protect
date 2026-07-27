/**
 * Valitor Web Payments Page — wired when merchant credentials exist.
 * Docs: https://specs.valitor.is/acquiring/PaymentsPage/en/API/
 *
 * Without credentials, checkout still works: order goes by email and
 * the shop can send a payment link manually.
 */

export type ValitorConfig = {
  merchantId: string;
  verificationCode: string;
  paymentUrl: string;
};

export function getValitorConfig(): ValitorConfig | null {
  const merchantId = process.env.VALITOR_MERCHANT_ID?.trim();
  const verificationCode = process.env.VALITOR_VERIFICATION_CODE?.trim();
  const paymentUrl =
    process.env.VALITOR_PAYMENT_URL?.trim() ||
    'https://payment.valitor.is/PayPage/';

  if (!merchantId || !verificationCode) {
    return null;
  }

  return { merchantId, verificationCode, paymentUrl };
}

export function isValitorConfigured() {
  return Boolean(getValitorConfig());
}
