import { describe, expect, it, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/trips/route';
import { GET as GET_ONE, PATCH, DELETE } from '@/app/api/trips/[id]/route';
import { db } from '@/lib/serverStore';
import { initialTrips } from '@/data/mockData';

describe('/api/trips route handlers', () => {
  beforeEach(() => {
    db.trips = structuredClone(initialTrips);
  });

  it('GET returns all seeded trips', async () => {
    const res = await GET(new NextRequest('http://localhost/api/trips'));
    const data = await res.json();
    expect(data).toHaveLength(initialTrips.length);
  });

  it('GET filters by search term', async () => {
    const res = await GET(new NextRequest('http://localhost/api/trips?search=switzerland'));
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].destination).toBe('Switzerland');
  });

  it('POST rejects a trip missing required fields', async () => {
    const res = await POST(
      new NextRequest('http://localhost/api/trips', { method: 'POST', body: JSON.stringify({ name: 'Trip' }) })
    );
    expect(res.status).toBe(400);
  });

  it('POST creates a new trip', async () => {
    const res = await POST(
      new NextRequest('http://localhost/api/trips', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Kyoto Trip',
          destination: 'Kyoto',
          startDate: '2024-04-01',
          endDate: '2024-04-05',
          time: '9:00 AM',
          description: '',
          budget: 1000,
          participants: [],
          status: 'upcoming',
          imageUrl: 'https://example.com/img.jpg',
          mapLat: 0,
          mapLng: 0
        })
      })
    );
    expect(res.status).toBe(201);
    const created = await res.json();
    expect(created.id).toBeDefined();
    expect(db.trips.some((t) => t.id === created.id)).toBe(true);
  });

  it('PATCH updates an existing trip', async () => {
    const target = initialTrips[0];
    const res = await PATCH(
      new NextRequest(`http://localhost/api/trips/${target.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' })
      }),
      { params: { id: target.id } }
    );
    expect(res.status).toBe(200);
    const updated = await res.json();
    expect(updated.name).toBe('Updated Name');
  });

  it('DELETE removes a trip', async () => {
    const target = initialTrips[0];
    const res = await DELETE(new NextRequest(`http://localhost/api/trips/${target.id}`, { method: 'DELETE' }), {
      params: { id: target.id }
    });
    expect(res.status).toBe(200);
    expect(db.trips.find((t) => t.id === target.id)).toBeUndefined();
  });

  it('GET one returns 404 for an unknown id', async () => {
    const res = await GET_ONE(new NextRequest('http://localhost/api/trips/unknown'), { params: { id: 'unknown' } });
    expect(res.status).toBe(404);
  });
});
