import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { formId: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, isWinner } = await request.json();
    
    // Verify ownership of the feedback via the form
    const form = await prisma.form.findFirst({
      where: { id: params.formId, adminId: session.id }
    });

    if (!form) return NextResponse.json({ error: 'Unauthorized or not found' }, { status: 403 });

    await prisma.feedback.update({
      where: { id },
      data: { isWinner }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
