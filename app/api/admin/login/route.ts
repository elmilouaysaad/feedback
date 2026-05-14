import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminLogin, generateToken } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const isValid = await verifyAdminLogin(password);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = generateToken({ role: 'admin' });

    return NextResponse.json(
      { token, message: 'Login successful' },
      {
        status: 200,
        headers: {
          'Set-Cookie': `adminToken=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
        },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
