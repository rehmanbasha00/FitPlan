import { NextRequest, NextResponse } from 'next/server';
import { db, nextId } from '@/lib/serverStore';
import { Trip } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() ?? '';
  const status = searchParams.get('status');
  const sortBy = searchParams.get('sortBy');

  let results = [...db.trips];

  if (search) {
    results = results.filter(
      (trip) =>
        trip.name.toLowerCase().includes(search) || trip.destination.toLowerCase().includes(search)
    );
  }

  if (status && status !== 'all') {
    results = results.filter((trip) => trip.status === status);
  }

  if (sortBy === 'name') {
    results.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'status') {
    results.sort((a, b) => a.status.localeCompare(b.status));
  } else {
    results.sort((a, b) => a.startDate.localeCompare(b.startDate));
  }

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Omit<Trip, 'id'>;

  if (!body.name || !body.destination || !body.startDate || !body.endDate) {
    return NextResponse.json(
      { message: 'name, destination, startDate and endDate are required' },
      { status: 400 }
    );
  }

  const trip: Trip = { ...body, id: nextId('trip') };
  db.trips.unshift(trip);
  return NextResponse.json(trip, { status: 201 });
}
