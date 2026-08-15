import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import * as xlsx from 'xlsx';
import { mkdir, writeFile, copyFile, rm, readFile as fsReadFile } from 'fs/promises';
import { join } from 'path';
import { feedbackConfig } from '@/config/feedback.config';
import { execSync } from 'child_process';

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

    const exportsDir = join(process.cwd(), 'public', 'exports');
    try {
      await mkdir(exportsDir, { recursive: true });
    } catch (e) {}

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const eventName = feedbackConfig.branding.eventName.replace(/\s+/g, '_');
    const zipName = `${eventName}_${timestamp}.zip`;
    const zipPath = join(exportsDir, zipName);
    
    // Create a temporary folder for staging the zip contents
    const tempDirName = `temp_${timestamp}`;
    const tempDirPath = join(exportsDir, tempDirName);
    const tempMediaDirPath = join(tempDirPath, 'media');
    
    await mkdir(tempDirPath, { recursive: true });
    await mkdir(tempMediaDirPath, { recursive: true });

    // 1. Generate Excel File
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
    
    const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Write excel to staging folder
    await writeFile(join(tempDirPath, 'feedbacks.xlsx'), excelBuffer);

    // 2. Copy Media Files to staging folder
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    for (const fb of feedbacks) {
      for (const media of fb.media) {
        const filename = media.path.split('/').pop();
        if (filename) {
          try {
            await copyFile(join(uploadsDir, filename), join(tempMediaDirPath, filename));
          } catch(e) {
            console.error('Failed to copy file:', filename);
          }
        }
      }
    }

    // 3. Create zip using system zip command
    execSync(`cd "${tempDirPath}" && zip -r "../${zipName}" .`);

    // 4. Cleanup staging folder
    await rm(tempDirPath, { recursive: true, force: true });

    // 5. Read the zip file to buffer
    const fileBuffer = await fsReadFile(zipPath);

    // 6. Cleanup zip file from public/exports if we don't want to keep it
    await rm(zipPath, { force: true });

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipName}"`,
      },
    });
  } catch (error) {
    console.error('Error generating ZIP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
