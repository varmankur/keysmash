import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request, { params }: { params: Promise<{ formId: string }> }) {
  const resolvedParams = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const feedbackId = formData.get('feedbackId') as string;
    const mediaFiles = formData.getAll('media') as File[];

    if (!feedbackId || mediaFiles.length === 0) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const form = await prisma.form.findFirst({
      where: { id: resolvedParams.formId, adminId: session.id }
    });

    if (!form) return NextResponse.json({ error: 'Unauthorized or not found' }, { status: 403 });

    const feedback = await prisma.feedback.findUnique({ where: { id: feedbackId } });
    if (!feedback || feedback.formId !== resolvedParams.formId) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {}

    let index = 1;
    for (const file of mediaFiles) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const ext = file.name.split('.').pop();
      const type = file.type.startsWith('video/') ? 'video' : 'photo';
      const timestamp = Date.now();
      
      const filename = `${feedback.studentId}_${timestamp}_${index}.${ext}`;
      const filepath = join(uploadsDir, filename);

      await writeFile(filepath, buffer);

      await prisma.media.create({
        data: {
          feedbackId,
          type,
          path: `/uploads/${filename}`
        }
      });
      index++;
    }

    return NextResponse.json({ success: true });
  } catch {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
