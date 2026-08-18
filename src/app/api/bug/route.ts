import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logEvent } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { description, reporter } = await request.json();

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const bug = await prisma.bugReport.create({
      data: {
        description,
        reporter: reporter || 'Anonymous',
      },
    });

    logEvent('BUG_REPORTED', { id: bug.id });

    return NextResponse.json({ success: true, data: bug }, { status: 201 });
  } catch {
    console.error('Error reporting bug:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
