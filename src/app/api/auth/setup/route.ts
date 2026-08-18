import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Check if any daimon already exists
    const existingDaimon = await prisma.admin.findFirst({
      where: { isDaimon: true }
    });

    if (existingDaimon) {
      return NextResponse.json({ error: 'Setup already complete.' }, { status: 400 });
    }

    // Hash default password
    const defaultPassword = process.env.DAIMON_PASSWORD || 'daimon_admin_setup';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Create the master Daimon
    const daimon = await prisma.admin.create({
      data: {
        username: 'daimon',
        passwordHash,
        isDaimon: true,
        requirePasswordChange: true
      }
    });

    // Auto-login the new Daimon
    const token = await signToken({ adminId: daimon.id });
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return NextResponse.redirect(new URL('/auth/change-password', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  } catch {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
