import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getAnalyticsPassword } from '@/app/lib/queries';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    const storedHash = await getAnalyticsPassword();

    // If no password has been set, allow access
    if (!storedHash) {
      return NextResponse.json({ authenticated: true });
    }

    // If a password exists but none was provided (probe or empty), signal unauthorized
    if (!password) {
      return NextResponse.json(
        { authenticated: false, error: 'Password required' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, storedHash);

    if (isValid) {
      return NextResponse.json({ authenticated: true });
    } else {
      return NextResponse.json(
        { authenticated: false, error: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error verifying analytics password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
