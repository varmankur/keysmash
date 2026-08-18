import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'keysmash-super-secret-key-2026';

export async function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  const payload = await verifyToken(token) as { adminId?: string };
  if (!payload || !payload.adminId) return null;

  const admin = await prisma.admin.findUnique({
    where: { id: payload.adminId },
  });

  return admin;
}

export async function getDaimonSession() {
  const admin = await getSession();
  if (admin && admin.isDaimon) return admin;
  return null;
}
