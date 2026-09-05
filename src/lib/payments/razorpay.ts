import crypto from 'crypto';

function config() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error('Razorpay keys are not configured');
  return { keyId, keySecret };
}

async function razorpayFetch(path: string, init: RequestInit = {}) {
  const { keyId, keySecret } = config();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch(`https://api.razorpay.com${path}`, {
    ...init,
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.description || 'Razorpay API request failed');
  return data;
}

export async function createRazorpayOrder(amountPaise: bigint, receipt: string) {
  return razorpayFetch('/v1/orders', {
    method: 'POST',
    body: JSON.stringify({ amount: Number(amountPaise), currency: 'INR', receipt, payment_capture: 1 }),
  }) as Promise<{ id: string; amount: number; currency: string; status: string }>;
}

export async function createRazorpayUpiQr(amountPaise: bigint, description: string, notes: Record<string, string>) {
  const closeBy = Math.floor(Date.now() / 1000) + 60 * 30;
  return razorpayFetch('/v1/payments/qr_codes', {
    method: 'POST',
    body: JSON.stringify({
      type: 'upi_qr',
      name: 'Fitplan Wallet',
      usage: 'single_use',
      fixed_amount: true,
      payment_amount: Number(amountPaise),
      description,
      close_by: closeBy,
      notes,
    }),
  }) as Promise<{ id: string; image_url: string; payment_amount: number; status: string; close_by: number }>;
}

export async function fetchRazorpayPayment(paymentId: string) {
  return razorpayFetch(`/v1/payments/${encodeURIComponent(paymentId)}`) as Promise<{ id: string; order_id: string | null; amount: number; currency: string; status: string }>;
}

export function verifyRazorpayPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const { keySecret } = config();
  const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
  const a = Buffer.from(expected); const b = Buffer.from(signature); return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured');
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected); const b = Buffer.from(signature); return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function payoutConfig() {
  const keyId = process.env.RAZORPAYX_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAYX_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
  const accountNumber = process.env.RAZORPAYX_ACCOUNT_NUMBER;
  if (!keyId || !keySecret || !accountNumber) throw new Error('RazorpayX payout credentials are not configured');
  return { keyId, keySecret, accountNumber };
}

export async function createRazorpayXPayoutToVpa(input: {
  amountPaise: bigint;
  vpa: string;
  name: string;
  email: string;
  phone: string;
  referenceId: string;
  idempotencyKey: string;
}) {
  const { keyId, keySecret, accountNumber } = payoutConfig();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/payouts', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      'X-Payout-Idempotency': input.idempotencyKey,
    },
    body: JSON.stringify({
      account_number: accountNumber,
      amount: Number(input.amountPaise),
      currency: 'INR',
      mode: 'UPI',
      purpose: 'payout',
      fund_account: {
        account_type: 'vpa',
        vpa: { address: input.vpa },
        contact: { name: input.name, email: input.email, contact: input.phone, type: 'customer', reference_id: input.referenceId },
      },
      queue_if_low_balance: false,
      reference_id: input.referenceId,
      narration: 'Fitplan Wallet Withdrawal',
    }),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.description || 'Unable to create payout');
  return data as { id: string; status: string; amount: number; currency: string; fund_account_id?: string; utr?: string };
}
