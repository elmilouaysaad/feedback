import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getAnalyticsPassword, setAnalyticsPassword } from '@/app/lib/queries';
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

    const hashedPassword = await getAnalyticsPassword();
    return NextResponse.json({ hasPassword: !!hashedPassword });
  } catch (error) {
    console.error('Error getting analytics password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password } = await request.json();

    if (!password || password.trim().length === 0) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await setAnalyticsPassword(hashedPassword);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting analytics password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
