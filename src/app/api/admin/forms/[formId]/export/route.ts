import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import * as xlsx from 'xlsx';

export async function GET(request: Request, { params }: { params: { formId: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const form = await prisma.form.findFirst({
      where: { id: params.formId, adminId: session.id },
      include: {
        feedbacks: {
          orderBy: { createdAt: 'desc' },
          include: { media: true }
        }
      }
    });

    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

    const flatFeedbacks = form.feedbacks.map(fb => {
      let answers = {};
      try {
        answers = JSON.parse(fb.answers);
      } catch(e) {}
      
      const mediaFiles = fb.media.map(m => m.path.split('/').pop()).join(', ');

      return {
        id: fb.id,
        studentId: fb.studentId,
        createdAt: fb.createdAt,
        isWinner: fb.isWinner,
        mediaFiles,
        ...answers
      };
    });

    const worksheet = xlsx.utils.json_to_sheet(flatFeedbacks);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Feedbacks');

    const buf = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${form.slug}-export.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
