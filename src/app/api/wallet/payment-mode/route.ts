import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({
    payments: process.env.PAYMENTS_MODE === 'live' ? 'live' : 'sandbox',
    payouts: process.env.PAYOUTS_MODE === 'live' ? 'live' : 'disabled',
  });
}
