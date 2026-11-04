import React from 'react';
import { NgoService } from '@/server/services/ngo.service';
import { prisma } from '@/server/db/client';
import { NgoDirectoryClient } from '@/components/ngos/NgoDirectoryClient';

export const dynamic = 'force-dynamic';

export default async function NgosDirectoryPage({
  searchParams,
}: {
  searchParams?: { search?: string; state?: string };
}) {
  const [ngos, allAnimals] = await Promise.all([
    NgoService.listNgos({}),
    prisma.animal.findMany({
      where: { status: 'AVAILABLE', ngo: { status: 'APPROVED' } },
      include: {
        ngo: {
          select: { id: true, slug: true, tradeName: true, city: true, state: true },
        },
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    }),
  ]);

  return (
    <NgoDirectoryClient
      initialNgos={ngos}
      allAnimals={allAnimals}
      initialSearch={searchParams?.search || ''}
      initialState={searchParams?.state || 'ALL'}
    />
  );
}
