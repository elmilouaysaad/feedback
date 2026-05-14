import { NextRequest, NextResponse } from 'next/server';
import { getEventStats, getAllEventStats } from '@/app/lib/queries';

export const dynamic = 'force-dynamic';

// GET: Fetch analytics for specific event or all events
export async function GET(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get('eventId');
    const includeHidden = request.nextUrl.searchParams.get('includeHidden') === 'true';

    if (eventId) {
      // Get stats for specific event
      const stats = await getEventStats(parseInt(eventId));
      if (!stats) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ stats });
    } else {
      // Get stats for all events
      const stats = await getAllEventStats(includeHidden);
      return NextResponse.json({ stats });
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
