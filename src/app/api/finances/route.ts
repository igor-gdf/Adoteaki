import { NextRequest, NextResponse } from 'next/server';
import { FinanceService } from '@/server/services/finance.service';
import { getCurrentUser } from '@/server/auth/session';
import { prisma } from '@/server/db/client';

async function resolveTargetNgoId(reqNgoId: string | null | undefined, user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (reqNgoId) return reqNgoId;
  if (user?.ngoId) return user.ngoId;
  const firstNgo = await prisma.nGO.findFirst({ orderBy: { createdAt: 'asc' } });
  return firstNgo?.id || null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = await getCurrentUser();
    const targetNgoId = await resolveTargetNgoId(searchParams.get('ngoId'), user);

    if (!targetNgoId) {
      return NextResponse.json({ error: 'Nenhuma ONG encontrada.' }, { status: 404 });
    }

    const summary = await FinanceService.getNgoFinancialSummary(targetNgoId);
    const allNgos = await prisma.nGO.findMany({
      select: { id: true, tradeName: true, cnpj: true, city: true, state: true },
      orderBy: { tradeName: 'asc' },
    });

    return NextResponse.json({ summary, allNgos });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao carregar dados financeiros.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'NGO' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Permissão restrita a gestores de ONG e administradores.' }, { status: 403 });
    }

    const body = await req.json();
    const targetNgoId = user.role === 'ADMIN' ? body.ngoId || user.ngoId : user.ngoId;
    if (!targetNgoId) {
      return NextResponse.json({ error: 'ONG vinculada não identificada.' }, { status: 400 });
    }

    const entry = await FinanceService.createEntry(
      targetNgoId,
      { id: user.id, name: user.name, role: user.role },
      body
    );

    const summary = await FinanceService.getNgoFinancialSummary(targetNgoId);
    return NextResponse.json({ entry, summary }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao criar lançamento financeiro.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'NGO' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Permissão negada.' }, { status: 403 });
    }

    const body = await req.json();
    const targetNgoId = user.role === 'ADMIN' && body.ngoId ? body.ngoId : user.ngoId;
    if (!targetNgoId) {
      return NextResponse.json({ error: 'ONG não identificada.' }, { status: 400 });
    }

    if (body.action === 'updateInitialBalance') {
      await FinanceService.updateInitialBalance(
        targetNgoId,
        Number(body.initialBalance),
        { id: user.id, name: user.name, role: user.role }
      );
      const summary = await FinanceService.getNgoFinancialSummary(targetNgoId);
      return NextResponse.json({ summary });
    }

    const updated = await FinanceService.updateEntry(
      body.id,
      targetNgoId,
      { id: user.id, name: user.name, role: user.role },
      body
    );

    const summary = await FinanceService.getNgoFinancialSummary(targetNgoId);
    return NextResponse.json({ entry: updated, summary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar lançamento.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'NGO' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Permissão negada.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const ngoIdParam = searchParams.get('ngoId');
    const targetNgoId = user.role === 'ADMIN' && ngoIdParam ? ngoIdParam : user.ngoId;

    if (!id || !targetNgoId) {
      return NextResponse.json({ error: 'ID do lançamento é obrigatório.' }, { status: 400 });
    }

    await FinanceService.deleteEntry(id, targetNgoId, {
      id: user.id,
      name: user.name,
      role: user.role,
    });

    const summary = await FinanceService.getNgoFinancialSummary(targetNgoId);
    return NextResponse.json({ summary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao excluir lançamento.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
