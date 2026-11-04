'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  Building2,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrencyBRL } from '@/lib/validators/cnpj';
import { AnimalCard, AnimalItem } from '@/components/animals/AnimalCard';

interface HomeClientProps {
  metrics: {
    totalAdoptions: number;
    activeNgos: number;
    avgTransparencyScore: number;
    availableAnimalsCount: number;
    totalAuditedVolume: number;
  };
  featuredAnimals: AnimalItem[];
  topNgos: {
    id: string;
    slug: string;
    tradeName: string;
    legalName: string;
    cnpj: string;
    city: string;
    state: string;
    size: string;
    causeTags: string;
    verifiedScore: number;
    availableAnimals: number;
    totalAdoptions: number;
    descriptionPt: string;
    descriptionEn: string;
  }[];
}

export function HomeClient({ metrics, featuredAnimals, topNgos }: HomeClientProps) {
  const { locale, t } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUf, setSelectedUf] = useState('ALL');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedUf !== 'ALL') params.set('state', selectedUf);
    router.push(`/ongs?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-zinc-950 overflow-x-hidden">
      {/* Editorial Hero Section */}
      <section className="border-b border-zinc-200 dark:border-zinc-800 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 mb-6 max-w-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider text-zinc-700 dark:text-zinc-300 leading-snug">
                {t.hero.badge}
              </span>
            </div>

            <h1 className="font-serif font-bold text-3xl sm:text-5xl text-zinc-950 dark:text-zinc-50 tracking-tight leading-[1.12] mb-6">
              {t.hero.title}
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
              {t.hero.subtitle}
            </p>

            {/* Quick-Search Bar: Responsive container with full-width controls on mobile */}
            <form
              onSubmit={handleQuickSearch}
              className="flex flex-col sm:flex-row gap-3 w-full p-3 sm:p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 mb-6"
            >
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 sm:py-2 w-full rounded sm:rounded-none border sm:border-0 border-zinc-200 dark:border-zinc-800">
                <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.hero.quickSearchPlaceholder}
                  className="w-full text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                />
              </div>

              <select
                value={selectedUf}
                onChange={(e) => setSelectedUf(e.target.value)}
                aria-label="Filtrar por UF"
                className="w-full sm:w-auto px-3 py-2.5 sm:py-2 text-xs font-mono rounded sm:rounded-none border sm:border-0 sm:border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 sm:bg-transparent dark:bg-zinc-950 sm:dark:bg-transparent text-zinc-700 dark:text-zinc-300 focus:outline-none"
              >
                <option value="ALL">Brasil (Todas UFs)</option>
                <option value="SP">São Paulo (SP)</option>
                <option value="PR">Paraná (PR)</option>
                <option value="BA">Bahia (BA)</option>
                <option value="MG">Minas Gerais (MG)</option>
                <option value="RJ">Rio de Janeiro (RJ)</option>
                <option value="RS">Rio Grande do Sul (RS)</option>
              </select>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold tracking-wide transition-colors shrink-0"
              >
                {t.hero.quickSearchButton}
              </button>
            </form>

            {/* Secondary Action Links */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <Link
                href="/ongs"
                className="inline-flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 hover:text-brand-700 dark:hover:text-emerald-400"
              >
                <span>{t.hero.ctaExploreNgos}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
              <Link
                href="/ongs/cadastrar"
                className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{t.hero.ctaRegisterNgo}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* High-Level Impact Metrics Strip */}
      <section className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 sm:px-0">
            <div className="p-4 sm:p-5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1.5">
                {t.metrics.totalAdoptions}
              </span>
              <div className="font-mono text-lg sm:text-2xl font-bold text-zinc-950 dark:text-white">
                {metrics.totalAdoptions.toLocaleString(locale)}
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                {t.metrics.totalAdoptionsSub}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1.5">
                {t.metrics.activeNgos}
              </span>
              <div className="font-mono text-lg sm:text-2xl font-bold text-zinc-950 dark:text-white flex flex-wrap items-baseline gap-1.5">
                <span>{metrics.activeNgos}</span>
                <span className="text-xs font-normal text-emerald-700 dark:text-emerald-400">
                  ({metrics.availableAnimalsCount} pets)
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                {t.metrics.activeNgosSub}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1.5">
                {t.metrics.transparencyScore}
              </span>
              <div className="font-mono text-lg sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {metrics.avgTransparencyScore}%
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                {t.metrics.transparencyScoreSub}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1.5">
                {t.metrics.auditedVolume}
              </span>
              <div className="font-mono text-lg sm:text-2xl font-bold text-zinc-950 dark:text-white break-words">
                {formatCurrencyBRL(metrics.totalAuditedVolume, locale)}
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                {t.metrics.auditedVolumeSub}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* "Quem Somos" & "Nosso Objetivo" Editorial Section */}
      <section className="py-14 sm:py-16 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
              {t.about.sectionTag}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 pb-12 border-b border-zinc-200 dark:border-zinc-800">
            <div className="space-y-3">
              <h2 className="font-serif font-bold text-2xl text-zinc-900 dark:text-zinc-100">
                {t.about.whoWeAreTitle}
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t.about.whoWeAreBody}
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-serif font-bold text-2xl text-zinc-900 dark:text-zinc-100">
                {t.about.ourMissionTitle}
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t.about.ourMissionBody}
              </p>
            </div>
          </div>

          {/* 3 Verification Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-10">
            <div className="p-5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>01. {t.about.pillar1Title}</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t.about.pillar1Desc}
              </p>
            </div>

            <div className="p-5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>02. {t.about.pillar2Title}</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t.about.pillar2Desc}
              </p>
            </div>

            <div className="p-5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>03. {t.about.pillar3Title}</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t.about.pillar3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Animals Section */}
      <section className="py-14 sm:py-16 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
                {t.homeFeatured.animalsTag}
              </span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100 mt-1">
                {t.homeFeatured.animalsTitle}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {t.homeFeatured.animalsSubtitle}
              </p>
            </div>

            <Link
              href="/ongs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-700 dark:hover:text-emerald-400 shrink-0"
            >
              <span>{t.homeFeatured.viewAllNgos}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAnimals.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} showNgoBadge />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Verified NGOs Section */}
      <section className="py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
                {t.homeFeatured.ngosTag}
              </span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100 mt-1">
                {t.homeFeatured.ngosTitle}
              </h2>
            </div>

            <Link
              href="/ongs/cadastrar"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold transition-colors w-full sm:w-auto"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t.directory.registerCta}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topNgos.map((ngo) => (
              <div
                key={ngo.id}
                className="p-6 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-500">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      {ngo.city} / {ngo.state}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono text-[11px] font-semibold">
                      Score {ngo.verifiedScore}/100
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-xl text-zinc-900 dark:text-zinc-100 mb-1">
                    {ngo.tradeName}
                  </h3>
                  <p className="font-mono text-[11px] text-zinc-500 mb-3">
                    CNPJ {ngo.cnpj}
                  </p>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-4">
                    {locale === 'pt-BR' ? ngo.descriptionPt : ngo.descriptionEn}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    <strong>{ngo.availableAnimals}</strong> {t.directory.availableAnimals}
                  </span>
                  <Link
                    href={`/ongs/${ngo.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-700 dark:hover:text-emerald-400 shrink-0"
                  >
                    <span>{t.directory.viewProfile}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
