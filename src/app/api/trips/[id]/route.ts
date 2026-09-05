import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/serverStore';
import { Trip } from '@/types';

interface Params {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: Params) {
  const trip = db.trips.find((t) => t.id === params.id);
  if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
  return NextResponse.json(trip);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const idx = db.trips.findIndex((t) => t.id === params.id);
  if (idx === -1) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

  const updates = (await request.json()) as Partial<Trip>;
  const updated: Trip = { ...db.trips[idx], ...updates, id: params.id };
  db.trips[idx] = updated;
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const idx = db.trips.findIndex((t) => t.id === params.id);
  if (idx === -1) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
  db.trips.splice(idx, 1);
  return NextResponse.json({ id: params.id });
}
