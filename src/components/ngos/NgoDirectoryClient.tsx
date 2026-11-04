'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Building2,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrencyBRL } from '@/lib/validators/cnpj';
import { AnimalCard, AnimalItem } from '@/components/animals/AnimalCard';

interface NgoDirectoryItem {
  id: string;
  slug: string;
  legalName: string;
  tradeName: string;
  cnpj: string;
  foundationYear: number;
  state: string;
  city: string;
  address: string;
  size: string;
  causeTags: string;
  descriptionPt: string;
  descriptionEn: string;
  missionPt: string;
  missionEn: string;
  status: string;
  verifiedScore: number;
  totalAdoptions: number;
  availableAnimalsCount: number;
  totalRevenue: number;
  totalExpenses: number;
  currentBalance: number;
  financialUpdatedAt: string;
}

const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export function NgoDirectoryClient({
  initialNgos,
  allAnimals,
  initialSearch = '',
  initialState = 'ALL',
}: {
  initialNgos: NgoDirectoryItem[];
  allAnimals: AnimalItem[];
  initialSearch?: string;
  initialState?: string;
}) {
  const { locale, t, favoriteIds } = useApp();

  const [search, setSearch] = useState(initialSearch);
  const [selectedState, setSelectedState] = useState(initialState);
  const [cityQuery, setCityQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState('ALL');
  const [selectedCause, setSelectedCause] = useState('ALL');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const filteredNgos = useMemo(() => {
    return initialNgos.filter((ngo) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          ngo.tradeName.toLowerCase().includes(q) ||
          ngo.legalName.toLowerCase().includes(q) ||
          ngo.city.toLowerCase().includes(q) ||
          ngo.cnpj.includes(q);
        if (!match) return false;
      }
      if (selectedState !== 'ALL' && ngo.state !== selectedState) return false;
      if (cityQuery.trim()) {
        if (!ngo.city.toLowerCase().includes(cityQuery.toLowerCase())) return false;
      }
      if (selectedSize !== 'ALL' && ngo.size !== selectedSize) return false;
      if (selectedCause !== 'ALL') {
        const tags = ngo.causeTags.split(',').map((tag) => tag.trim().toUpperCase());
        if (!tags.some((t) => t.includes(selectedCause))) return false;
      }
      return true;
    });
  }, [initialNgos, search, selectedState, cityQuery, selectedSize, selectedCause]);

  const filteredAnimals = useMemo(() => {
    if (!onlyFavorites) return allAnimals;
    return allAnimals.filter((a) => favoriteIds.includes(a.id));
  }, [allAnimals, onlyFavorites, favoriteIds]);

  const resetFilters = () => {
    setSearch('');
    setSelectedState('ALL');
    setCityQuery('');
    setSelectedSize('ALL');
    setSelectedCause('ALL');
  };

  const sizeLabels: Record<string, string> = {
    SMALL: locale === 'pt-BR' ? 'Pequeno Porte (Até 40 animais)' : 'Small Shelter (<40 animals)',
    MEDIUM: locale === 'pt-BR' ? 'Médio Porte (40-150 animais)' : 'Medium Shelter (40-150 animals)',
    LARGE: locale === 'pt-BR' ? 'Grande Porte (+150 animais)' : 'Large Hospital Shelter (150+)',
  };

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen py-8 sm:py-10 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header + Direct CTA "Cadastrar ONG" */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8 mb-8">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
              {t.directory.tag}
            </span>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100 mt-1">
              {t.directory.title}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-2xl">
              {t.directory.subtitle}
            </p>
          </div>

          <Link
            href="/ongs/cadastrar"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded bg-brand-700 hover:bg-brand-800 text-white text-xs sm:text-sm font-semibold tracking-wide transition-colors shrink-0"
          >
            <Building2 className="w-4 h-4" />
            <span>{t.directory.registerCta}</span>
          </Link>
        </div>

        {/* Multi-Dimensional Filter Bar */}
        <div className="p-4 sm:p-5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/80 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search by Name / CNPJ */}
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block font-mono text-[11px] uppercase text-zinc-600 dark:text-zinc-400 mb-1.5">
                {t.directory.searchLabel}
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.directory.searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* State / UF */}
            <div>
              <label className="block font-mono text-[11px] uppercase text-zinc-600 dark:text-zinc-400 mb-1.5">
                {t.directory.stateLabel}
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              >
                <option value="ALL">{t.directory.allStates}</option>
                {BRAZIL_STATES.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div>
              <label className="block font-mono text-[11px] uppercase text-zinc-600 dark:text-zinc-400 mb-1.5">
                {t.directory.sizeLabel}
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              >
                <option value="ALL">{t.directory.allSizes}</option>
                <option value="SMALL">{locale === 'pt-BR' ? 'Pequeno Porte' : 'Small'}</option>
                <option value="MEDIUM">{locale === 'pt-BR' ? 'Médio Porte' : 'Medium'}</option>
                <option value="LARGE">{locale === 'pt-BR' ? 'Grande Porte' : 'Large'}</option>
              </select>
            </div>

            {/* Cause Tag */}
            <div>
              <label className="block font-mono text-[11px] uppercase text-zinc-600 dark:text-zinc-400 mb-1.5">
                {t.directory.causeLabel}
              </label>
              <select
                value={selectedCause}
                onChange={(e) => setSelectedCause(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              >
                <option value="ALL">{t.directory.allCauses}</option>
                <option value="CAES">{locale === 'pt-BR' ? 'Cães' : 'Dogs'}</option>
                <option value="GATOS">{locale === 'pt-BR' ? 'Gatos' : 'Cats'}</option>
                <option value="CASTRACAO">{locale === 'pt-BR' ? 'Castração' : 'Spay/Neuter'}</option>
                <option value="IDOSOS">{locale === 'pt-BR' ? 'Animais Idosos' : 'Senior Pets'}</option>
                <option value="REABILITACAO">{locale === 'pt-BR' ? 'Reabilitação Clínica' : 'Rehabilitation'}</option>
              </select>
            </div>
          </div>

          {/* City Secondary Filter + Reset */}
          <div className="mt-4 pt-3 border-t border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder={
                  locale === 'pt-BR' ? 'Filtrar por município...' : 'Filter by city...'
                }
                className="w-full sm:w-56 px-3 py-2 sm:py-1.5 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              />
              <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                <strong>{filteredNgos.length}</strong> {t.directory.resultsCount}
              </span>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.directory.clearFilters}</span>
            </button>
          </div>
        </div>

        {/* NGO Results List */}
        {filteredNgos.length === 0 ? (
          <div className="p-8 sm:p-12 rounded border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
            <p className="font-serif text-lg text-zinc-800 dark:text-zinc-200">
              {locale === 'pt-BR'
                ? 'Nenhuma organização encontrada para os filtros selecionados.'
                : 'No organizations matched your current filter criteria.'}
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold"
            >
              {t.directory.clearFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 mb-16">
            {filteredNgos.map((ngo) => (
              <div
                key={ngo.id}
                className="p-5 sm:p-6 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-xs font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                        {ngo.city} - {ngo.state}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono text-xs">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {t.directory.verifiedCnpj}: {ngo.cnpj}
                        </span>
                      </span>
                      <span className="font-mono text-xs text-zinc-500">
                        {sizeLabels[ngo.size] || ngo.size}
                      </span>
                    </div>

                    <div>
                      <Link
                        href={`/ongs/${ngo.slug}`}
                        className="font-serif font-bold text-xl sm:text-2xl text-zinc-900 dark:text-zinc-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors block"
                      >
                        {ngo.tradeName}
                      </Link>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {ngo.legalName} • Fundada em {ngo.foundationYear}
                      </p>
                    </div>

                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl">
                      {locale === 'pt-BR' ? ngo.descriptionPt : ngo.descriptionEn}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ngo.causeTags
                        .split(',')
                        .filter(Boolean)
                        .map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono text-[10px]"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Financial & Adoption Snapshot Box */}
                  <div className="w-full lg:w-80 shrink-0 p-4 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      <span className="font-mono text-[11px] uppercase text-zinc-500">
                        {t.directory.transparencyIndex}
                      </span>
                      <span className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400">
                        {ngo.verifiedScore}/100
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="min-w-0">
                        <span className="text-zinc-500 block text-[11px]">
                          {locale === 'pt-BR' ? 'Receitas (12m)' : 'Revenues (12m)'}
                        </span>
                        <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 break-words">
                          {formatCurrencyBRL(ngo.totalRevenue, locale)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-zinc-500 block text-[11px]">
                          {locale === 'pt-BR' ? 'Despesas (12m)' : 'Expenses (12m)'}
                        </span>
                        <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 break-words">
                          {formatCurrencyBRL(ngo.totalExpenses, locale)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        <strong>{ngo.availableAnimalsCount}</strong> {t.directory.availableAnimals}
                      </span>
                      <span className="font-mono text-zinc-500">
                        {ngo.totalAdoptions} {locale === 'pt-BR' ? 'adotados' : 'adopted'}
                      </span>
                    </div>

                    <div className="pt-1 flex flex-col gap-2">
                      <Link
                        href={`/ongs/${ngo.slug}`}
                        className="w-full py-2.5 px-3 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                      >
                        <span>{t.directory.viewProfile}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/ongs/${ngo.slug}?tab=finances`}
                        className="w-full py-2 px-3 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span>
                          {locale === 'pt-BR'
                            ? 'Ver Balanço & Notas Fiscais'
                            : 'Inspect Financial Ledger'}
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Unified Animal Roster Section (With Favorites Filter) */}
        <section id="catalogo" className="pt-10 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
                {t.homeFeatured.animalsTag}
              </span>
              <h2 className="font-serif font-bold text-2xl text-zinc-900 dark:text-zinc-100 mt-1">
                {locale === 'pt-BR'
                  ? 'Todos os Animais Disponíveis nas ONGs Credenciadas'
                  : 'All Animals Available Across Verified NGOs'}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`w-full sm:w-auto px-3.5 py-2.5 sm:py-2 rounded border text-xs font-semibold transition-colors ${
                onlyFavorites
                  ? 'bg-rose-50 dark:bg-rose-950 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                  : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {onlyFavorites
                ? locale === 'pt-BR'
                  ? `Mostrando Favoritos (${favoriteIds.length}) • Ver Todos`
                  : `Showing Saved Pets (${favoriteIds.length}) • Show All`
                : locale === 'pt-BR'
                ? `Filtrar Meus Favoritos (${favoriteIds.length})`
                : `Filter My Saved Pets (${favoriteIds.length})`}
            </button>
          </div>

          {filteredAnimals.length === 0 ? (
            <div className="p-8 rounded border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
              {locale === 'pt-BR'
                ? 'Você ainda não adicionou animais aos seus favoritos.'
                : 'You have not saved any favorite animals yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAnimals.map((animal) => (
                <AnimalCard key={animal.id} animal={animal} showNgoBadge />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
