import { NextRequest, NextResponse } from 'next/server';
import { db, nextId } from '@/lib/serverStore';
import { CalendarEvent } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // YYYY-MM
  let results = [...db.events];
  if (month) {
    results = results.filter((e) => e.date.startsWith(month));
  }
  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Omit<CalendarEvent, 'id'>;
  if (!body.title || !body.date) {
    return NextResponse.json({ message: 'title and date are required' }, { status: 400 });
  }
  const event: CalendarEvent = { ...body, id: nextId('evt') };
  db.events.push(event);
  return NextResponse.json(event, { status: 201 });
}
