import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureWalletAccount, rupeesFromPaise } from '@/lib/wallet';

export async function GET(request: NextRequest) {
  const user = await getUserFromSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const wallet = await ensureWalletAccount(user.id);
  const transactions = await prisma.walletTransaction.findMany({
    where: { walletAccountId: wallet.id }, orderBy: { createdAt: 'desc' }, take: 50,
  });

  return NextResponse.json({
    id: wallet.id,
    walletHandle: wallet.walletHandle,
    qrPayload: wallet.qrPayload,
    currency: wallet.currency,
    balance: rupeesFromPaise(wallet.balancePaise),
    transactions: transactions.map((tx) => ({
      id: tx.id, type: tx.type, status: tx.status,
      amount: rupeesFromPaise(tx.amountPaise), currency: tx.currency,
      provider: tx.provider, description: tx.description,
      createdAt: tx.createdAt.toISOString(),
    })),
  });
}
