import { NextRequest, NextResponse } from 'next/server';
import { getActiveEvent, getTabletEvent } from '@/app/lib/queries';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const tabletCode = request.nextUrl.searchParams.get('tablet') || '';
    const event = tabletCode ? await getTabletEvent(tabletCode) : await getActiveEvent();

    if (!event) {
      return NextResponse.json(
        { error: 'No active event' },
        { status: 404 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error fetching current event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
