import React from 'react';
import { NgoService } from '@/server/services/ngo.service';
import { HomeClient } from '@/components/home/HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const data = await NgoService.getLandingPageData();

  return (
    <HomeClient
      metrics={data.metrics}
      featuredAnimals={data.featuredAnimals}
      topNgos={data.topNgos}
    />
  );
}
