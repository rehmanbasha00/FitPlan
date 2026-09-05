import { NextRequest, NextResponse } from 'next/server';
export async function POST(_req: NextRequest) { return NextResponse.json({ message: 'Sandbox deposits were removed. Use a configured payment provider.' }, { status: 410 }); }
