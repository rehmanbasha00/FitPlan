import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchRazorpayPayment, verifyRazorpayWebhookSignature } from '@/lib/payments/razorpay';

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get('x-razorpay-signature');
  const eventId = req.headers.get('x-razorpay-event-id');
  if (!signature) return NextResponse.json({ message: 'Missing signature' }, { status: 400 });
  try {
    if (!verifyRazorpayWebhookSignature(raw, signature)) return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
    const event = JSON.parse(raw);
    const eventName = event.event as string;

    if (eventName === 'qr_code.credited') {
      const payment = event.payload?.payment?.entity;
      const qr = event.payload?.qr_code?.entity;
      if (!payment?.id || !qr?.id || payment.status !== 'captured') return NextResponse.json({ received: true });
      const order = await prisma.walletPaymentOrder.findUnique({ where: { providerQrId: qr.id } });
      if (!order || order.status === 'credited') return NextResponse.json({ received: true });
      if (payment.amount !== Number(order.amountPaise) || payment.currency !== order.currency) return NextResponse.json({ message: 'Amount mismatch' }, { status: 400 });
      await prisma.$transaction(async tx => {
        const claimed = await tx.walletPaymentOrder.updateMany({ where: { id: order.id, status: { not: 'credited' } }, data: { status: 'credited', providerPaymentId: payment.id } });
        if (!claimed.count) return;
        await tx.walletAccount.update({ where: { id: order.walletAccountId }, data: { balancePaise: { increment: order.amountPaise } } });
        await tx.walletTransaction.create({ data: { id: `wtx-${payment.id}`, walletAccountId: order.walletAccountId, type: 'deposit', status: 'completed', amountPaise: order.amountPaise, currency: order.currency, provider: 'razorpay', providerTransactionId: payment.id, idempotencyKey: `razorpay:${payment.id}`, description: 'Wallet deposit via UPI QR', metadata: { qrId: qr.id, orderId: order.id, webhookEventId: eventId } } });
      });
      return NextResponse.json({ received: true });
    }

    if (eventName === 'payment.captured') {
      const paymentId = event.payload?.payment?.entity?.id as string | undefined;
      const orderId = event.payload?.payment?.entity?.order_id as string | undefined;
      if (!paymentId || !orderId) return NextResponse.json({ received: true });
      const payment = await fetchRazorpayPayment(paymentId);
      if (payment.order_id !== orderId || payment.status !== 'captured') return NextResponse.json({ received: true });
      const order = await prisma.walletPaymentOrder.findUnique({ where: { providerOrderId: orderId } });
      if (!order || order.status === 'credited') return NextResponse.json({ received: true });
      if (payment.amount !== Number(order.amountPaise) || payment.currency !== order.currency) return NextResponse.json({ message: 'Amount mismatch' }, { status: 400 });
      await prisma.$transaction(async tx => {
        const claimed = await tx.walletPaymentOrder.updateMany({ where: { id: order.id, status: { not: 'credited' } }, data: { status: 'credited', providerPaymentId: payment.id } });
        if (!claimed.count) return;
        await tx.walletAccount.update({ where: { id: order.walletAccountId }, data: { balancePaise: { increment: order.amountPaise } } });
        await tx.walletTransaction.create({ data: { id: `wtx-${payment.id}`, walletAccountId: order.walletAccountId, type: 'deposit', status: 'completed', amountPaise: order.amountPaise, currency: order.currency, provider: 'razorpay', providerTransactionId: payment.id, idempotencyKey: `razorpay:${payment.id}`, description: 'Wallet deposit via Razorpay', metadata: { orderId, webhookEventId: eventId } } });
      });
      return NextResponse.json({ received: true });
    }

    if (eventName.startsWith('payout.')) {
      const payout = event.payload?.payout?.entity;
      if (!payout?.id) return NextResponse.json({ received: true });
      const withdrawal = await prisma.walletWithdrawal.findUnique({ where: { providerPayoutId: payout.id } });
      if (!withdrawal) return NextResponse.json({ received: true });
      if (eventName === 'payout.processed') {
        await prisma.$transaction(async tx => {
          await tx.walletWithdrawal.updateMany({ where: { id: withdrawal.id, status: { not: 'processed' } }, data: { status: 'processed' } });
          await tx.walletTransaction.update({ where: { id: `wtx-${withdrawal.id}` }, data: { status: 'completed', metadata: { payoutId: payout.id, webhookEventId: eventId, utr: payout.utr ?? null } } });
        });
      } else if (eventName === 'payout.reversed' || eventName === 'payout.failed') {
        await prisma.$transaction(async tx => {
          const current = await tx.walletWithdrawal.findUnique({ where: { id: withdrawal.id } });
          if (!current || current.status === 'reversed' || current.status === 'failed') return;
          await tx.walletWithdrawal.update({ where: { id: withdrawal.id }, data: { status: 'reversed', failureReason: payout.failure_reason || payout.status_details?.description || 'Payout failed' } });
          await tx.walletAccount.update({ where: { id: withdrawal.walletAccountId }, data: { balancePaise: { increment: withdrawal.amountPaise } } });
          await tx.walletTransaction.update({ where: { id: `wtx-${withdrawal.id}` }, data: { status: 'failed', description: 'Withdrawal failed; balance returned', metadata: { payoutId: payout.id, webhookEventId: eventId } } });
          await tx.walletTransaction.create({ data: { id: `wtx-${withdrawal.id}-reversal`, walletAccountId: withdrawal.walletAccountId, type: 'credit', status: 'completed', amountPaise: withdrawal.amountPaise, currency: 'INR', provider: 'razorpayx', idempotencyKey: `withdrawal-reversal:${withdrawal.id}`, description: 'Withdrawal reversal', metadata: { withdrawalId: withdrawal.id, payoutId: payout.id } } });
        });
      } else {
        await prisma.walletWithdrawal.update({ where: { id: withdrawal.id }, data: { status: 'processing' } });
        await prisma.walletTransaction.update({ where: { id: `wtx-${withdrawal.id}` }, data: { status: 'processing' } });
      }
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Webhook processing failed' }, { status: 500 });
  }
}
