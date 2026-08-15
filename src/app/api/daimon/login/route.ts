import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const validUsername = process.env.DAIMON_USERNAME || 'daimon';
    const validPassword = process.env.DAIMON_PASSWORD || 'daimonpassword';

    if (username === validUsername && password === validPassword) {
      const token = await signToken({ role: 'daimon' });
      const cookieStore = await cookies();
      
      cookieStore.set('daimon_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 1 day
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
