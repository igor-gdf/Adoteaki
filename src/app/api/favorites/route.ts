import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';
import { getCurrentUser } from '@/server/auth/session';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ favoriteIds: [], favorites: [] });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        animal: {
          include: {
            ngo: {
              select: { id: true, slug: true, tradeName: true, city: true, state: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      favoriteIds: favorites.map((f) => f.animalId),
      favorites: favorites.map((f) => f.animal),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao listar favoritos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Faça login para salvar animais nos seus favoritos.' },
        { status: 401 }
      );
    }

    const { animalId } = await req.json();
    if (!animalId) {
      return NextResponse.json({ error: 'ID do animal é obrigatório.' }, { status: 400 });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_animalId: {
          userId: user.id,
          animalId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    } else {
      await prisma.favorite.create({
        data: {
          userId: user.id,
          animalId,
        },
      });
      return NextResponse.json({ favorited: true });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao favoritar animal.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
