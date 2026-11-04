import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/server/db/client';

const COOKIE_NAME = 'adoteaki_session';
const SECRET = process.env.JWT_SECRET || 'adoteaki-production-secret-key-2026';

export type UserRole = 'ADMIN' | 'NGO' | 'SUPPORTER';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: string;
  ngoId?: string | null;
  ngoSlug?: string | null;
  ngoName?: string | null;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'adoteaki_salt').digest('hex');
}

export function signToken(payload: { userId: string; role: string; exp: number }): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

export function verifyToken(token: string): { userId: string; role: string; exp: number } | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;
    const expectedSig = crypto
      .createHmac('sha256', SECRET)
      .update(data)
      .digest('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string, role: string) {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  const token = signToken({ userId, role, exp });
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        ngo: {
          select: { id: true, slug: true, tradeName: true },
        },
      },
    });

    if (!user || user.status === 'SUSPENDED') return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      status: user.status,
      ngoId: user.ngo?.id || null,
      ngoSlug: user.ngo?.slug || null,
      ngoName: user.ngo?.tradeName || null,
    };
  } catch {
    return null;
  }
}
