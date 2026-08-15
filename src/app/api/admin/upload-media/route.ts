import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('media') as File[];
    const feedbackId = formData.get('feedbackId') as string;

    if (!files || files.length === 0 || !feedbackId) {
      return NextResponse.json({ error: 'Files and feedbackId are required' }, { status: 400 });
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId }
    });

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // directory exists
    }

    const timestamp = Date.now();
    const uploadedMedia = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const extension = file.name.substring(file.name.lastIndexOf('.'));
      // Format: studentId_timestamp_1.jpg
      const uniqueName = `${feedback.studentId}_${timestamp}_${i + 1}${extension}`;
      const path = join(uploadDir, uniqueName);
      
      await writeFile(path, buffer);
      const url = `/uploads/${uniqueName}`;

      const isVideo = file.type.startsWith('video/');

      const mediaRecord = await prisma.media.create({
        data: {
          feedbackId: feedback.id,
          type: isVideo ? 'video' : 'photo',
          path: url,
        }
      });
      
      uploadedMedia.push(mediaRecord);
    }

    return NextResponse.json({ success: true, media: uploadedMedia });
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
