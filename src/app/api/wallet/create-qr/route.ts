import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getUserFromSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { ensureWalletAccount, paiseFromRupees } from '@/lib/wallet';
import { createRazorpayUpiQr } from '@/lib/payments/razorpay';

export async function POST(req: NextRequest) {
  const user = await getUserFromSession(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  if (process.env.PAYMENTS_MODE !== 'live') return NextResponse.json({ message: 'Live payments are not enabled. Configure Razorpay live credentials first.' }, { status: 503 });
  try {
    const body = await req.json().catch(() => ({})) as { amount?: number };
    const amountPaise = paiseFromRupees(Number(body.amount));
    if (amountPaise < 100n || amountPaise > 10000000n) return NextResponse.json({ message: 'Amount must be between ₹1 and ₹100,000.' }, { status: 400 });
    const wallet = await ensureWalletAccount(user.id);
    const localId = `wpo-${randomUUID()}`;
    const qr = await createRazorpayUpiQr(amountPaise, 'Fitplan Wallet Deposit', { fitplan_wallet_id: wallet.id, fitplan_order_id: localId });
    await prisma.walletPaymentOrder.create({ data: { id: localId, userId: user.id, walletAccountId: wallet.id, provider: 'razorpay', providerOrderId: `qr:${qr.id}`, providerQrId: qr.id, providerQrImageUrl: qr.image_url, amountPaise, currency: 'INR', status: 'qr_created' } });
    return NextResponse.json({ qrId: qr.id, imageUrl: qr.image_url, amount: Number(amountPaise), expiresAt: new Date(qr.close_by * 1000).toISOString() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Unable to create payment QR' }, { status: 500 });
  }
}
