import React from 'react';
import { notFound } from 'next/navigation';
import { NgoService } from '@/server/services/ngo.service';
import { FinanceService } from '@/server/services/finance.service';
import { NgoDetailClient } from '@/components/ngos/NgoDetailClient';

export const dynamic = 'force-dynamic';

export default async function NgoDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const [{ id }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({ tab: undefined }),
  ]);
  const ngo = await NgoService.getNgoDetail(id);
  if (!ngo) {
    notFound();
  }

  const financialSummary = await FinanceService.getNgoFinancialSummary(ngo.id);
  if (!financialSummary) {
    notFound();
  }

  return (
    <NgoDetailClient
      ngo={ngo}
      financialSummary={financialSummary}
      initialTab={resolvedSearchParams.tab || 'overview'}
    />
  );
}
