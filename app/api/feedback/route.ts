import { NextRequest, NextResponse } from 'next/server';
import { submitFeedback, getActiveEvent, getTabletEvent } from '@/app/lib/queries';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const tabletCode = request.nextUrl.searchParams.get('tablet') || '';
    const { rating } = await request.json();

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get current event for this tablet, or fall back to the global active event
    const event = tabletCode ? await getTabletEvent(tabletCode) : await getActiveEvent();

    if (!event) {
      return NextResponse.json(
        { error: 'No active event' },
        { status: 400 }
      );
    }

    // Submit feedback
    const feedback = await submitFeedback(event.id, rating);

    if (!feedback) {
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
