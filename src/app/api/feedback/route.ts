import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function generateStudentId() {
  const prefix = "STU";
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
  return `${prefix}-${randomStr}`;
}

export async function POST(request: Request) {
  try {
    const { formId, answers } = await request.json();

    if (!formId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const form = await prisma.form.findUnique({ where: { id: formId } });
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

    const studentId = generateStudentId();

    const feedback = await prisma.feedback.create({
      data: {
        formId,
        studentId,
        answers: JSON.stringify(answers)
      }
    });

    console.log(`FEEDBACK_SUBMITTED: ${JSON.stringify({ id: feedback.id })}`);

    return NextResponse.json({ success: true, studentId, feedbackId: feedback.id });
  } catch {
    console.error('Feedback submission error:');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
