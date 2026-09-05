import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

export function paiseFromRupees(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid amount');
  return BigInt(Math.round(amount * 100));
}

export function rupeesFromPaise(value: bigint | number) {
  return Number(value) / 100;
}

export async function ensureWalletAccount(userId: string) {
  const existing = await prisma.walletAccount.findUnique({ where: { userId } });
  if (existing) return existing;

  const id = `wallet-${randomUUID()}`;
  const handle = `fp_${randomUUID().replace(/-/g, '').slice(0, 20)}`;
  const qrPayload = `fitplan://wallet/${handle}`;
  return prisma.walletAccount.create({
    data: { id, userId, walletHandle: handle, qrPayload, currency: 'INR' },
  });
}
