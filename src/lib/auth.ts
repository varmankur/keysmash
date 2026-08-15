import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'tcs-ai-super-secret-key-2026';

export async function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  const daimonToken = cookieStore.get('daimon_token')?.value;
  
  // Daimon can also access admin sessions
  if (daimonToken) {
    const session = await verifyToken(daimonToken);
    if (session && (session as any).role === 'daimon') return session;
  }
  
  if (!token) return null;
  return verifyToken(token);
}

export async function getDaimonSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('daimon_token')?.value;
  if (!token) return null;
  const session = await verifyToken(token);
  if (session && (session as any).role === 'daimon') return session;
  return null;
}
