import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';
import { NgoService } from '@/server/services/ngo.service';
import { getCurrentUser } from '@/server/auth/session';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = await getCurrentUser();
    const ngoIdParam = searchParams.get('ngoId');

    const where: Record<string, unknown> = {};
    if (ngoIdParam) {
      where.ngoId = ngoIdParam;
    } else if (user?.role === 'NGO' && user.ngoId) {
      where.ngoId = user.ngoId;
    } else if (user?.role === 'SUPPORTER') {
      where.userId = user.id;
    }

    const inquiries = await prisma.adoptionInquiry.findMany({
      where,
      include: {
        animal: {
          select: { id: true, name: true, species: true, breed: true, photoUrl: true },
        },
        ngo: {
          select: { id: true, tradeName: true, city: true, state: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ inquiries });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao listar solicitações.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const inquiry = await NgoService.submitAdoptionInquiry({
      ...body,
      userId: user?.id || null,
    });

    return NextResponse.json({ inquiry }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao enviar pedido de adoção.';
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
    const updated = await NgoService.updateInquiryStatus(
      body.id,
      user.ngoId || body.ngoId || '',
      { id: user.id, name: user.name, role: user.role },
      body.status,
      body.reviewNotes
    );

    return NextResponse.json({ inquiry: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar pedido de adoção.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
