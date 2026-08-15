import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, isWinner } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: { isWinner },
    });

    return NextResponse.json({ success: true, feedback: updatedFeedback });
  } catch (error) {
    console.error('Error marking winner:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
