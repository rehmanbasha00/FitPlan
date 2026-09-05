import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/serverStore';
import { CalendarEvent } from '@/types';

interface Params {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: Params) {
  const event = db.events.find((e) => e.id === params.id);
  if (!event) return NextResponse.json({ message: 'Event not found' }, { status: 404 });
  return NextResponse.json(event);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const idx = db.events.findIndex((e) => e.id === params.id);
  if (idx === -1) return NextResponse.json({ message: 'Event not found' }, { status: 404 });
  const updates = (await request.json()) as Partial<CalendarEvent>;
  db.events[idx] = { ...db.events[idx], ...updates, id: params.id };
  return NextResponse.json(db.events[idx]);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const idx = db.events.findIndex((e) => e.id === params.id);
  if (idx === -1) return NextResponse.json({ message: 'Event not found' }, { status: 404 });
  db.events.splice(idx, 1);
  return NextResponse.json({ id: params.id });
}
