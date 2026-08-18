import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const feedbackId = formData.get('feedbackId') as string | null;

    if (!file || typeof file === 'string' || !feedbackId) {
      return NextResponse.json({ error: 'Missing file or feedbackId' }, { status: 400 });
    }

    // Verify feedback exists
    const feedback = await prisma.feedback.findUnique({ where: { id: feedbackId } });
    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {}

    const filename = `${feedbackId}_${Date.now()}_${file.name}`;
    const filePath = join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    const isVideo = file.type.startsWith('video');

    await prisma.media.create({
      data: {
        feedbackId,
        type: isVideo ? 'video' : 'photo',
        path: `/uploads/${filename}`
      }
    });

    return NextResponse.json({ success: true, path: `/uploads/${filename}` });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
