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
  params: { id: string };
  searchParams?: { tab?: string };
}) {
  const ngo = await NgoService.getNgoDetail(params.id);
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
      initialTab={searchParams?.tab || 'overview'}
    />
  );
}
