import { NextRequest, NextResponse } from 'next/server';
import { deleteTabletAssignment, getAllTabletAssignments, upsertTabletAssignment } from '@/app/lib/queries';
import { verifyToken } from '@/app/lib/auth';

function isAdmin(request: NextRequest): boolean {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return !!token && !!verifyToken(token);
}

export async function GET(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tablets = await getAllTabletAssignments();
    return NextResponse.json({ tablets });
  } catch (error) {
    console.error('Error fetching tablet assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, eventId } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Tablet code is required' }, { status: 400 });
    }

    const tablet = await upsertTabletAssignment(code, eventId ? Number(eventId) : null);

    if (!tablet) {
      return NextResponse.json({ error: 'Failed to save tablet' }, { status: 500 });
    }

    return NextResponse.json({ tablet }, { status: 200 });
  } catch (error) {
    console.error('Error saving tablet assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const code = url.searchParams.get('code') || '';

    if (!code) {
      return NextResponse.json({ error: 'Tablet code is required' }, { status: 400 });
    }

    const deleted = await deleteTabletAssignment(code);

    if (!deleted) {
      return NextResponse.json({ error: 'Tablet not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Tablet deleted successfully' });
  } catch (error) {
    console.error('Error deleting tablet assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}