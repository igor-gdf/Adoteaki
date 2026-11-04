import { NextRequest, NextResponse } from 'next/server';
import { NgoService } from '@/server/services/ngo.service';
import { setSessionCookie } from '@/server/auth/session';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      search: searchParams.get('search') || undefined,
      state: searchParams.get('state') || undefined,
      city: searchParams.get('city') || undefined,
      size: searchParams.get('size') || undefined,
      causeTag: searchParams.get('causeTag') || undefined,
      includeAllStatuses: searchParams.get('all') === 'true',
    };

    const ngos = await NgoService.listNgos(filters);
    return NextResponse.json({ ngos });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao listar ONGs.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await NgoService.registerNgo(body);

    if (body.autoLogin !== false && result.user) {
      await setSessionCookie(result.user.id, result.user.role);
    }

    return NextResponse.json({ ngo: result.ngo }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao cadastrar ONG.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
