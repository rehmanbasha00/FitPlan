import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getUserFromSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { ensureWalletAccount, paiseFromRupees } from '@/lib/wallet';
import { createRazorpayXPayoutToVpa } from '@/lib/payments/razorpay';

export async function POST(request: NextRequest) {
  const user = await getUserFromSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  if (process.env.PAYOUTS_MODE !== 'live') return NextResponse.json({ message: 'Withdrawals are not enabled until the approved payout/wallet provider is configured.' }, { status: 503 });

  const body = await request.json().catch(() => ({})) as { amount?: number; destination?: string };
  const amountPaise = paiseFromRupees(Number(body.amount));
  const destination = body.destination?.trim().toLowerCase();
  if (amountPaise < 100n) return NextResponse.json({ message: 'Minimum withdrawal is ₹1.' }, { status: 400 });
  if (!destination || !/^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9.-]{2,}$/.test(destination)) return NextResponse.json({ message: 'Enter a valid UPI ID.' }, { status: 400 });

  const wallet = await ensureWalletAccount(user.id);
  const id = `ww-${randomUUID()}`;
  const idempotencyKey = `fitplan-withdraw:${id}`;

  try {
    await prisma.$transaction(async (tx) => {
      const reserved = await tx.walletAccount.updateMany({ where: { id: wallet.id, status: 'active', balancePaise: { gte: amountPaise } }, data: { balancePaise: { decrement: amountPaise } } });
      if (reserved.count !== 1) throw new Error('Insufficient wallet balance.');
      await tx.walletWithdrawal.create({ data: { id, walletAccountId: wallet.id, userId: user.id, amountPaise, destination, status: 'pending', provider: 'razorpayx', idempotencyKey } });
      await tx.walletTransaction.create({ data: { id: `wtx-${id}`, walletAccountId: wallet.id, type: 'withdrawal', status: 'pending', amountPaise, currency: 'INR', provider: 'razorpayx', idempotencyKey: `withdrawal:${id}`, description: 'Wallet withdrawal to UPI', metadata: { withdrawalId: id, destination } } });
    });

    try {
      const payout = await createRazorpayXPayoutToVpa({ amountPaise, vpa: destination, name: user.name, email: user.email, phone: user.phone, referenceId: id.slice(0, 40), idempotencyKey });
      await prisma.walletWithdrawal.update({ where: { id }, data: { status: payout.status === 'processed' ? 'processed' : 'processing', providerPayoutId: payout.id } });
      await prisma.walletTransaction.update({ where: { id: `wtx-${id}` }, data: { status: payout.status === 'processed' ? 'completed' : 'processing', providerTransactionId: payout.id, metadata: { withdrawalId: id, destination, payoutStatus: payout.status } } });
      return NextResponse.json({ ok: true, status: payout.status, message: payout.status === 'processed' ? 'Withdrawal completed.' : 'Withdrawal is processing.' });
    } catch (providerError) {
      await prisma.$transaction(async (tx) => {
        await tx.walletAccount.update({ where: { id: wallet.id }, data: { balancePaise: { increment: amountPaise } } });
        await tx.walletWithdrawal.update({ where: { id }, data: { status: 'failed', failureReason: providerError instanceof Error ? providerError.message : 'Payout failed' } });
        await tx.walletTransaction.update({ where: { id: `wtx-${id}` }, data: { status: 'failed', description: 'Wallet withdrawal failed and balance was returned' } });
        await tx.walletTransaction.create({ data: { id: `wtx-${id}-reversal`, walletAccountId: wallet.id, type: 'credit', status: 'completed', amountPaise, currency: 'INR', provider: 'razorpayx', idempotencyKey: `withdrawal-reversal:${id}`, description: 'Withdrawal reversal', metadata: { withdrawalId: id } } });
      });
      throw providerError;
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Withdrawal failed' }, { status: 400 });
  }
}
