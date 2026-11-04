import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/server/services/admin.service';
import { getCurrentUser } from '@/server/auth/session';

export async function GET() {
  try {
    const overview = await AdminService.getGovernanceOverview();
    return NextResponse.json(overview);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao carregar painel administrativo.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas Administradores do Sistema podem executar ações de governança.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { target, id, status, verifiedScore, role } = body;

    if (target === 'NGO') {
      const updatedNgo = await AdminService.updateNgoStatus(id, status, verifiedScore, {
        id: user.id,
        name: user.name,
        role: user.role,
      });
      return NextResponse.json({ ngo: updatedNgo });
    }

    if (target === 'USER') {
      const updatedUser = await AdminService.updateUserStatusOrRole(
        id,
        { status, role },
        { id: user.id, name: user.name, role: user.role }
      );
      return NextResponse.json({ user: updatedUser });
    }

    return NextResponse.json({ error: 'Alvo de governança inválido.' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro na operação administrativa.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
