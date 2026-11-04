import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';
import { NgoService } from '@/server/services/ngo.service';
import { getCurrentUser } from '@/server/auth/session';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ngoId = searchParams.get('ngoId');
    const species = searchParams.get('species');
    const status = searchParams.get('status');

    const user = await getCurrentUser();
    const where: Record<string, unknown> = {};
    if (user?.role === 'ADMIN') {
      if (ngoId) where.ngoId = ngoId;
    } else if (user?.role === 'NGO') {
      where.ngoId = user.ngoId || '__no_ngo__';
      if (ngoId && ngoId !== user.ngoId) {
        return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
      }
    } else {
      where.status = 'AVAILABLE';
      where.ngo = { status: 'APPROVED' };
      if (ngoId) where.ngoId = ngoId;
    }
    if (species && species !== 'ALL') where.species = species;
    if (status && status !== 'ALL' && user && (user.role === 'ADMIN' || user.role === 'NGO')) {
      where.status = status;
    }

    const animals = await prisma.animal.findMany({
      where,
      include: {
        ngo: {
          select: { id: true, slug: true, tradeName: true, city: true, state: true },
        },
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ animals });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao listar animais.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'NGO' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Apenas ONGs ou administradores podem cadastrar animais.' }, { status: 403 });
    }

    const body = await req.json();
    const targetNgoId = user.role === 'ADMIN' && body.ngoId ? body.ngoId : user.ngoId;
    if (!targetNgoId) {
      return NextResponse.json({ error: 'ONG vinculada não identificada.' }, { status: 400 });
    }

    const animal = await NgoService.createAnimal(
      targetNgoId,
      { id: user.id, name: user.name, role: user.role },
      body
    );

    return NextResponse.json({ animal }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao cadastrar animal.';
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
    const targetNgoId = user.role === 'ADMIN' && body.ngoId ? body.ngoId : user.ngoId || '';
    const updated = await NgoService.updateAnimal(
      body.id,
      targetNgoId,
      { id: user.id, name: user.name, role: user.role },
      body
    );

    return NextResponse.json({ animal: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar animal.';
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
    const targetNgoId = user.role === 'ADMIN' ? ngoIdParam || '' : user.ngoId || '';
    if (!id) {
      return NextResponse.json({ error: 'ID do animal é obrigatório.' }, { status: 400 });
    }

    await NgoService.deleteAnimal(id, targetNgoId, {
      id: user.id,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({ deleted: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao excluir animal.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
