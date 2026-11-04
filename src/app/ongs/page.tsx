import React from 'react';
import { NgoService } from '@/server/services/ngo.service';
import { prisma } from '@/server/db/client';
import { NgoDirectoryClient } from '@/components/ngos/NgoDirectoryClient';

export const dynamic = 'force-dynamic';

export default async function NgosDirectoryPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; state?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
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
      initialSearch={resolvedSearchParams?.search || ''}
      initialState={resolvedSearchParams?.state || 'ALL'}
    />
  );
}
