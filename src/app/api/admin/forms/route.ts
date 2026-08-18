import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const forms = await prisma.form.findMany({
      where: { adminId: session.id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { feedbacks: true } } }
    });

    return NextResponse.json({ forms });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug, title, description, primaryColor, questions } = await request.json();

    const existing = await prisma.form.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Form URL already taken' }, { status: 400 });
    }

    const form = await prisma.form.create({
      data: {
        adminId: session.id,
        slug,
        title,
        description,
        primaryColor: primaryColor || '#3b82f6',
        questions: JSON.stringify(questions)
      }
    });

    return NextResponse.json({ success: true, formId: form.id });
  } catch (error) {
    console.error('Create form error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
