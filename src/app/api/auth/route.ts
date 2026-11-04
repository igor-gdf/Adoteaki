import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';
import {
  clearSessionCookie,
  getCurrentUser,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from '@/server/auth/session';
import { authSchema } from '@/lib/validators/schemas';

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = authSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados de autenticação inválidos.' }, { status: 400 });
    }

    const { action, email, password, name, role, phone, city, state } = parsed.data;

    if (action === 'register') {
      if (!name) {
        return NextResponse.json(
          { error: 'Nome, e-mail e senha são obrigatórios.' },
          { status: 400 }
        );
      }

      const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Já existe uma conta cadastrada com este e-mail.' },
          { status: 409 }
        );
      }

      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          name: name.trim(),
          passwordHash: hashPassword(password),
          role: role === 'NGO' ? 'NGO' : 'SUPPORTER',
          status: 'ACTIVE',
          phone: phone || null,
          city: city || null,
          state: state || null,
        },
      });

      await setSessionCookie(newUser.id, newUser.role);
      const sessionUser = await getCurrentUser();
      return NextResponse.json({ user: sessionUser }, { status: 201 });
    }

    // Default: login
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Informe seu e-mail e senha.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: 'Credenciais inválidas. Verifique seu e-mail e senha.' },
        { status: 401 }
      );
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Esta conta está suspensa pela auditoria da plataforma.' },
        { status: 403 }
      );
    }

    if (!user.passwordHash.startsWith('scrypt$')) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashPassword(password) },
      });
    }

    await setSessionCookie(user.id, user.role);
    const sessionUser = await getCurrentUser();
    return NextResponse.json({ user: sessionUser });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno de autenticação.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
