import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logEvent } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Generate unique student ID (e.g. STU-A1B2C3)
    const studentId = `STU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Save dynamic answers
    const feedback = await prisma.feedback.create({
      data: {
        studentId,
        answers: JSON.stringify(body),
      },
    });

    logEvent('FEEDBACK_SUBMITTED', { id: feedback.id });

    return NextResponse.json({ success: true, data: feedback }, { status: 201 });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
