import { NextRequest, NextResponse } from 'next/server';
import { NgoService } from '@/server/services/ngo.service';
import { FinanceService } from '@/server/services/finance.service';
import { getCurrentUser } from '@/server/auth/session';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ngo = await NgoService.getNgoDetail(params.id);
    if (!ngo) {
      return NextResponse.json({ error: 'ONG não encontrada.' }, { status: 404 });
    }
    const financialSummary = await FinanceService.getNgoFinancialSummary(ngo.id);
    return NextResponse.json({ ngo, financialSummary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao carregar ONG.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.ngoId !== params.id)) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const body = await req.json();
    const updated = await NgoService.updateNgoProfile(
      params.id,
      { id: user.id, name: user.name, role: user.role },
      body
    );

    return NextResponse.json({ ngo: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar perfil da ONG.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
