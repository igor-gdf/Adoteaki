'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Globe,
  Copy,
  Check,
  FileSpreadsheet,
  PawPrint,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AnimalCard, AnimalItem } from '@/components/animals/AnimalCard';
import { FinancialDashboard } from '@/components/finances/FinancialDashboard';
import type { FinancialSummaryDTO } from '@/server/services/finance.service';

interface NgoDetailData {
  id: string;
  slug: string;
  legalName: string;
  tradeName: string;
  cnpj: string;
  foundationYear: number;
  state: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  size: string;
  causeTags: string;
  descriptionPt: string;
  descriptionEn: string;
  missionPt: string;
  missionEn: string;
  email: string;
  phone: string;
  website: string | null;
  instagram: string | null;
  pixKey: string | null;
  bankInfo: string | null;
  status: string;
  verifiedScore: number;
  totalAdoptions: number;
  animals: AnimalItem[];
}

export function NgoDetailClient({
  ngo,
  financialSummary,
  initialTab = 'overview',
}: {
  ngo: NgoDetailData;
  financialSummary: FinancialSummaryDTO;
  initialTab?: string;
}) {
  const { locale, t } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'finances'>(
    initialTab === 'finances' ? 'finances' : 'overview'
  );
  const [copiedPix, setCopiedPix] = useState(false);

  // Animal Catalog Filters
  const [speciesFilter, setSpeciesFilter] = useState('ALL');
  const [ageFilter, setAgeFilter] = useState('ALL');
  const [sizeFilter, setSizeFilter] = useState('ALL');
  const [temperamentFilter, setTemperamentFilter] = useState('ALL');
  const [healthFilter, setHealthFilter] = useState('ALL');

  const availableAnimals = useMemo(() => {
    return ngo.animals.filter((animal) => {
      if (animal.status !== 'AVAILABLE') return false;
      if (speciesFilter !== 'ALL' && animal.species !== speciesFilter) return false;
      if (ageFilter !== 'ALL' && animal.ageGroup !== ageFilter) return false;
      if (sizeFilter !== 'ALL' && animal.size !== sizeFilter) return false;
      if (temperamentFilter !== 'ALL') {
        const tags = animal.temperament.split(',').map((t) => t.trim().toUpperCase());
        if (!tags.includes(temperamentFilter)) return false;
      }
      if (healthFilter === 'VACCINATED' && !animal.vaccinated) return false;
      if (healthFilter === 'NEUTERED' && !animal.neutered) return false;
      return true;
    });
  }, [
    ngo.animals,
    speciesFilter,
    ageFilter,
    sizeFilter,
    temperamentFilter,
    healthFilter,
  ]);

  const handleCopyPix = () => {
    if (!ngo.pixKey) return;
    navigator.clipboard.writeText(ngo.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  // Bounding box for OpenStreetMap embed around NGO lat/lng
  const delta = 0.012;
  const bbox = `${ngo.longitude - delta},${ngo.latitude - delta},${ngo.longitude + delta},${
    ngo.latitude + delta
  }`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox
  )}&layer=mapnik&marker=${ngo.latitude},${ngo.longitude}`;

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen py-8 sm:py-10 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/ongs"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.ngoDetail.backToDirectory}</span>
          </Link>
        </div>

        {/* Institutional Header Banner */}
        <div className="p-5 sm:p-8 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 max-w-3xl min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    CNPJ {ngo.cnpj} ({t.directory.verifiedCnpj})
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-xs">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  {ngo.city} / {ngo.state}
                </span>
                <span className="font-mono text-xs text-zinc-500">
                  Fundação: {ngo.foundationYear}
                </span>
              </div>

              <h1 className="font-serif font-bold text-2xl sm:text-4xl text-zinc-950 dark:text-zinc-50">
                {ngo.tradeName}
              </h1>
              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                Razão Social: {ngo.legalName}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {ngo.causeTags
                  .split(',')
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
              </div>
            </div>

            {/* Right Key Score & Edit Portal Link */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-3 shrink-0">
              <div className="p-4 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 sm:text-right">
                <span className="block font-mono text-[10px] uppercase text-zinc-500">
                  {t.directory.transparencyIndex}
                </span>
                <span className="font-mono font-bold text-2xl text-emerald-700 dark:text-emerald-400">
                  {ngo.verifiedScore}/100
                </span>
                <span className="block text-[11px] text-zinc-500 mt-0.5">
                  {ngo.totalAdoptions}{' '}
                  {locale === 'pt-BR' ? 'adoções homologadas' : 'verified adoptions'}
                </span>
              </div>

              <Link
                href={`/dashboard/finances?ngoId=${ngo.id}`}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>
                  {locale === 'pt-BR'
                    ? 'Portal Gestor (Editar ONG / Finanças)'
                    : 'Manager Portal (Edit NGO / Finances)'}
                </span>
              </Link>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`inline-flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 rounded text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <PawPrint className="w-4 h-4 shrink-0" />
              <span>
                {t.ngoDetail.institutionalTab} ({availableAnimals.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('finances')}
              className={`inline-flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 rounded text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === 'finances'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>{t.ngoDetail.financialTab}</span>
            </button>
          </div>
        </div>

        {/* Institutional Overview + Location Pin + Animal Catalog */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Institutional Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Columns: About, Mission & Direct Donation */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-5 sm:p-6 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
                  <div>
                    <h2 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-2">
                      {t.ngoDetail.aboutHeading}
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {locale === 'pt-BR' ? ngo.descriptionPt : ngo.descriptionEn}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100 mb-1.5">
                      {t.ngoDetail.missionHeading}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {locale === 'pt-BR' ? ngo.missionPt : ngo.missionEn}
                    </p>
                  </div>
                </div>

                {/* PIX & Bank Account Auditable Box */}
                <div className="p-5 sm:p-6 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold block">
                        {t.ngoDetail.pixHeading}
                      </span>
                      <div className="font-mono font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 mt-1 break-words">
                        PIX (CNPJ): {ngo.pixKey || ngo.cnpj}
                      </div>
                      {ngo.bankInfo && (
                        <p className="font-mono text-xs text-zinc-500 mt-0.5 break-words">
                          {ngo.bankInfo}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold shrink-0"
                    >
                      {copiedPix ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{locale === 'pt-BR' ? 'Chave Copiada' : 'PIX Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{locale === 'pt-BR' ? 'Copiar Chave PIX' : 'Copy PIX Key'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Contact Channels & Interactive Map Pin */}
              <div className="p-5 sm:p-6 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
                <h2 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  {t.ngoDetail.contactHeading}
                </h2>

                <div className="space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{ngo.address}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span className="font-mono">{ngo.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span className="font-mono truncate">{ngo.email}</span>
                  </div>
                  {ngo.website && (
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Globe className="w-4 h-4 text-zinc-400 shrink-0" />
                      <a
                        href={ngo.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 dark:text-emerald-400 hover:underline font-mono truncate"
                      >
                        {ngo.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Interactive Map Pin View */}
                <div className="pt-2">
                  <div className="text-[11px] font-mono text-zinc-500 mb-1.5 flex items-center justify-between gap-2">
                    <span className="truncate">{t.ngoDetail.locationPinLabel}</span>
                    <span className="shrink-0">
                      {ngo.latitude.toFixed(4)}, {ngo.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div className="w-full h-44 rounded border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
                    <iframe
                      title={`Mapa ${ngo.tradeName}`}
                      src={osmEmbedUrl}
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filterable Adoption Catalog */}
            <section className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <div className="mb-6">
                <h2 className="font-serif font-bold text-2xl text-zinc-900 dark:text-zinc-100">
                  {t.ngoDetail.catalogHeading}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {t.ngoDetail.catalogSubtitle}
                </p>
              </div>

              {/* Animal Filters */}
              <div className="p-4 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
                    {t.ngoDetail.filterSpecies}
                  </label>
                  <select
                    value={speciesFilter}
                    onChange={(e) => setSpeciesFilter(e.target.value)}
                    className="w-full px-2.5 py-2 sm:py-1.5 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                    <option value="ALL">{t.ngoDetail.all}</option>
                    <option value="DOG">{t.animalLabels.DOG}</option>
                    <option value="CAT">{t.animalLabels.CAT}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
                    {t.ngoDetail.filterAge}
                  </label>
                  <select
                    value={ageFilter}
                    onChange={(e) => setAgeFilter(e.target.value)}
                    className="w-full px-2.5 py-2 sm:py-1.5 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                    <option value="ALL">{t.ngoDetail.all}</option>
                    <option value="PUPPY">{t.animalLabels.PUPPY}</option>
                    <option value="ADULT">{t.animalLabels.ADULT}</option>
                    <option value="SENIOR">{t.animalLabels.SENIOR}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
                    {t.ngoDetail.filterSize}
                  </label>
                  <select
                    value={sizeFilter}
                    onChange={(e) => setSizeFilter(e.target.value)}
                    className="w-full px-2.5 py-2 sm:py-1.5 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                    <option value="ALL">{t.ngoDetail.all}</option>
                    <option value="SMALL">{t.animalLabels.SMALL}</option>
                    <option value="MEDIUM">{t.animalLabels.MEDIUM}</option>
                    <option value="LARGE">{t.animalLabels.LARGE}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
                    {t.ngoDetail.filterTemperament}
                  </label>
                  <select
                    value={temperamentFilter}
                    onChange={(e) => setTemperamentFilter(e.target.value)}
                    className="w-full px-2.5 py-2 sm:py-1.5 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                    <option value="ALL">{t.ngoDetail.all}</option>
                    <option value="DOCILE">{t.animalLabels.DOCILE}</option>
                    <option value="SOCIABLE">{t.animalLabels.SOCIABLE}</option>
                    <option value="PLAYFUL">{t.animalLabels.PLAYFUL}</option>
                    <option value="CALM">{t.animalLabels.CALM}</option>
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
                    {t.ngoDetail.filterHealth}
                  </label>
                  <select
                    value={healthFilter}
                    onChange={(e) => setHealthFilter(e.target.value)}
                    className="w-full px-2.5 py-2 sm:py-1.5 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                    <option value="ALL">{t.ngoDetail.all}</option>
                    <option value="VACCINATED">{t.ngoDetail.vaccinatedOnly}</option>
                    <option value="NEUTERED">{t.ngoDetail.neuteredOnly}</option>
                  </select>
                </div>
              </div>

              {availableAnimals.length === 0 ? (
                <div className="p-10 rounded border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                  {locale === 'pt-BR'
                    ? 'Nenhum animal corresponde aos filtros selecionados nesta ONG.'
                    : 'No animals match the selected filters in this NGO.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableAnimals.map((animal) => (
                    <AnimalCard key={animal.id} animal={animal} />
                  ))}
                </div>
              )}
            </section>

            {/* Always visible Financial Transparency Preview / Embedded Dashboard below catalog */}
            <section className="pt-10 border-t border-zinc-200 dark:border-zinc-800">
              <FinancialDashboard summary={financialSummary} />
            </section>
          </div>
        )}

        {/* Dedicated Financial Tab */}
        {activeTab === 'finances' && <FinancialDashboard summary={financialSummary} />}
      </div>
    </div>
  );
}
