import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import * as xlsx from 'xlsx';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: { media: true }
    });

    // Convert data to worksheeet
    const flatFeedbacks = feedbacks.map(fb => {
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

    // Generate buffer
    const buf = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return as downloadable file
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="feedbacks.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
