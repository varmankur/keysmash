import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDaimonSession } from '@/lib/auth';

export async function GET() {
  const session = await getDaimonSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const bugs = await prisma.bugReport.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ bugs });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
