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
    const file = formData.get('video') as File;
    const feedbackId = formData.get('feedbackId') as string;

    if (!file || !feedbackId) {
      return NextResponse.json({ error: 'File and feedbackId are required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save locally
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // directory already exists
    }
    
    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const path = join(uploadDir, uniqueName);
    
    await writeFile(path, buffer);
    const videoUrl = `/uploads/${uniqueName}`;

    // Update DB
    const updatedFeedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: { videoPath: videoUrl },
    });

    return NextResponse.json({ success: true, videoPath: videoUrl, feedback: updatedFeedback });
  } catch (error) {
    console.error('Error uploading video:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
