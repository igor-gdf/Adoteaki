import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';
import {
  clearSessionCookie,
  getCurrentUser,
  hashPassword,
  setSessionCookie,
} from '@/server/auth/session';

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, name, role, phone, city, state } = body;

    if (action === 'register') {
      if (!email || !password || !name) {
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

    if (!user || user.passwordHash !== hashPassword(password)) {
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
