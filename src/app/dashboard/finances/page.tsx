'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  PawPrint,
  Inbox,
  Building2,
  ExternalLink,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrencyBRL } from '@/lib/validators/cnpj';
import { FinancialDashboard } from '@/components/finances/FinancialDashboard';
import type { FinancialSummaryDTO } from '@/server/services/finance.service';
import type { AnimalItem } from '@/components/animals/AnimalCard';

const PHOTO_PRESETS = [
  {
    label: 'Cão Caramelo / SRD',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Gato Siamês / Pelagem Clara',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Cão Grande Porte / Pastor',
    url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Gato Laranja Tigrado',
    url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=900&q=80',
  },
];

interface InquiryRecord {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  cityState: string;
  housingType: string;
  hasOtherPets: boolean;
  safeScreens: boolean;
  message: string;
  status: string;
  reviewNotes: string | null;
  createdAt: string;
  animal: {
    id: string;
    name: string;
    species: string;
    breed: string;
    photoUrl: string;
  };
}

function DashboardFinancesContent() {
  const { locale, t, user, quickLoginAs } = useApp();
  const searchParams = useSearchParams();
  const queryNgoId = searchParams.get('ngoId');

  const [selectedNgoId, setSelectedNgoId] = useState<string>(queryNgoId || '');
  const [allNgos, setAllNgos] = useState<
    { id: string; tradeName: string; cnpj: string; city: string; state: string }[]
  >([]);
  const [summary, setSummary] = useState<FinancialSummaryDTO | null>(null);
  const [animals, setAnimals] = useState<AnimalItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [ngoProfile, setNgoProfile] = useState<{
    id: string;
    slug: string;
    legalName: string;
    tradeName: string;
    cnpj: string;
    city: string;
    state: string;
    address: string;
    phone: string;
    email: string;
    pixKey: string;
    descriptionPt: string;
    missionPt: string;
  } | null>(null);

  const [portalTab, setPortalTab] = useState<
    'finances' | 'animals' | 'inquiries' | 'profile'
  >('finances');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  // Financial Form State
  const [initialBalanceInput, setInitialBalanceInput] = useState('');
  const [newEntryType, setNewEntryType] = useState<'REVENUE' | 'EXPENSE'>('REVENUE');
  const [newEntryCategory, setNewEntryCategory] = useState('DONATIONS');
  const [newEntryMonth, setNewEntryMonth] = useState('2026-10');
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryAmount, setNewEntryAmount] = useState('');
  const [newEntryDocRef, setNewEntryDocRef] = useState('');

  // Inline Edit Entry State
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editMonth, setEditMonth] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDocRef, setEditDocRef] = useState('');

  // Animal Create State
  const [animalName, setAnimalName] = useState('');
  const [animalSpecies, setAnimalSpecies] = useState('DOG');
  const [animalBreed, setAnimalBreed] = useState('SRD');
  const [animalAgeMonths, setAnimalAgeMonths] = useState('18');
  const [animalSize, setAnimalSize] = useState('MEDIUM');
  const [animalGender, setAnimalGender] = useState('MALE');
  const [animalTemperament, setAnimalTemperament] = useState('DOCILE,SOCIABLE');
  const [animalPhotoUrl, setAnimalPhotoUrl] = useState(PHOTO_PRESETS[0].url);
  const [animalDesc, setAnimalDesc] = useState('');
  const [animalVaccinated, setAnimalVaccinated] = useState(true);
  const [animalNeutered, setAnimalNeutered] = useState(true);

  const canManage = user?.role === 'NGO' || user?.role === 'ADMIN';

  const loadPortalData = useCallback(
    async (targetId?: string) => {
      setLoading(true);
      try {
        const param = targetId ? `?ngoId=${targetId}` : '';
        const finRes = await fetch(`/api/finances${param}`, { cache: 'no-store' });
        if (finRes.ok) {
          const finData = await finRes.json();
          setSummary(finData.summary);
          setAllNgos(finData.allNgos || []);
          const resolvedId = finData.summary?.ngoId;
          if (resolvedId) {
            setSelectedNgoId(resolvedId);
            setInitialBalanceInput(String(finData.summary.initialBalance));

            const [ngoRes, animRes, inqRes] = await Promise.all([
              fetch(`/api/ngos/${resolvedId}`, { cache: 'no-store' }),
              fetch(`/api/animals?ngoId=${resolvedId}`, { cache: 'no-store' }),
              fetch(`/api/inquiries?ngoId=${resolvedId}`, { cache: 'no-store' }),
            ]);

            if (ngoRes.ok) {
              const ngoJson = await ngoRes.json();
              setNgoProfile(ngoJson.ngo);
            }
            if (animRes.ok) {
              const animJson = await animRes.json();
              setAnimals(animJson.animals || []);
            }
            if (inqRes.ok) {
              const inqJson = await inqRes.json();
              setInquiries(inqJson.inquiries || []);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadPortalData(queryNgoId || user?.ngoId || undefined);
  }, [queryNgoId, user?.ngoId, loadPortalData]);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3500);
  };

  const handleUpdateInitialBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/finances', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateInitialBalance',
        ngoId: selectedNgoId,
        initialBalance: Number(initialBalanceInput),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setSummary(data.summary);
      showToast(
        locale === 'pt-BR'
          ? 'Saldo inicial atualizado em tempo real!'
          : 'Initial reserve balance updated in real time!'
      );
    }
  };

  const handleAddFinancialEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryTitle || !newEntryAmount) return;

    const res = await fetch('/api/finances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ngoId: selectedNgoId,
        type: newEntryType,
        category: newEntryCategory,
        month: newEntryMonth,
        titlePt: newEntryTitle,
        titleEn: newEntryTitle,
        amount: Number(newEntryAmount),
        documentRef: newEntryDocRef || `DOC-${newEntryMonth}-${Math.floor(100 + Math.random() * 900)}`,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setSummary(data.summary);
      setNewEntryTitle('');
      setNewEntryAmount('');
      setNewEntryDocRef('');
      showToast(
        locale === 'pt-BR'
          ? 'Lançamento contábil adicionado e gráficos recalculados!'
          : 'Ledger entry added and charts recalculated!'
      );
    }
  };

  const handleSaveEntryEdit = async (entryId: string) => {
    const res = await fetch('/api/finances', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: entryId,
        ngoId: selectedNgoId,
        titlePt: editTitle,
        amount: Number(editAmount),
        month: editMonth,
        category: editCategory,
        documentRef: editDocRef,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setSummary(data.summary);
      setEditingEntryId(null);
      showToast(
        locale === 'pt-BR'
          ? 'Lançamento atualizado com sucesso!'
          : 'Financial entry updated!'
      );
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    const res = await fetch(
      `/api/finances?id=${entryId}&ngoId=${selectedNgoId}`,
      { method: 'DELETE' }
    );
    if (res.ok) {
      const data = await res.json();
      setSummary(data.summary);
      showToast(
        locale === 'pt-BR'
          ? 'Lançamento removido do livro-razão.'
          : 'Entry removed from ledger.'
      );
    }
  };

  const handleCreateAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = Number(animalAgeMonths) || 12;
    const ageGroup = ageNum < 12 ? 'PUPPY' : ageNum >= 84 ? 'SENIOR' : 'ADULT';

    const res = await fetch('/api/animals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ngoId: selectedNgoId,
        name: animalName,
        species: animalSpecies,
        breed: animalBreed,
        ageMonths: ageNum,
        ageGroup,
        size: animalSize,
        gender: animalGender,
        temperament: animalTemperament,
        vaccinated: animalVaccinated,
        neutered: animalNeutered,
        microchipped: true,
        specialNeeds: false,
        descriptionPt: animalDesc,
        photoUrl: animalPhotoUrl,
      }),
    });

    if (res.ok) {
      setAnimalName('');
      setAnimalDesc('');
      await loadPortalData(selectedNgoId);
      showToast(
        locale === 'pt-BR'
          ? 'Animal adicionado ao catálogo público de adoção!'
          : 'Animal added to the public adoption catalog!'
      );
    }
  };

  const handleToggleAnimalStatus = async (animal: AnimalItem) => {
    const nextStatus = animal.status === 'AVAILABLE' ? 'ADOPTED' : 'AVAILABLE';
    const res = await fetch('/api/animals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: animal.id,
        ngoId: selectedNgoId,
        status: nextStatus,
      }),
    });
    if (res.ok) {
      await loadPortalData(selectedNgoId);
      showToast(`Status de ${animal.name} alterado para ${nextStatus}.`);
    }
  };

  const handleDeleteAnimal = async (animalId: string) => {
    const res = await fetch(`/api/animals?id=${animalId}`, { method: 'DELETE' });
    if (res.ok) {
      await loadPortalData(selectedNgoId);
      showToast('Animal removido do catálogo.');
    }
  };

  const handleInquiryStatus = async (inquiryId: string, status: string) => {
    const res = await fetch('/api/inquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: inquiryId,
        ngoId: selectedNgoId,
        status,
      }),
    });
    if (res.ok) {
      await loadPortalData(selectedNgoId);
      showToast(`Solicitação atualizada para ${status}.`);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ngoProfile) return;
    const res = await fetch(`/api/ngos/${ngoProfile.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ngoProfile),
    });
    if (res.ok) {
      showToast(
        locale === 'pt-BR'
          ? 'Perfil público da ONG atualizado!'
          : 'Public NGO profile updated!'
      );
    }
  };

  const revenueCategories = ['DONATIONS', 'GRANTS', 'EVENTS', 'PARTNERSHIPS'];
  const expenseCategories = [
    'VETERINARY',
    'FOOD',
    'FACILITY',
    'ADMINISTRATION',
    'RESCUE_OPS',
  ];

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* RBAC Quick Demo Banner if not logged in as NGO or Admin */}
        {!canManage && (
          <div className="p-4 rounded border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-zinc-800 dark:text-zinc-200">
              <strong className="font-mono uppercase text-amber-900 dark:text-amber-300 block mb-0.5">
                {locale === 'pt-BR'
                  ? 'MODO DE VISUALIZAÇÃO • AUTENTICAÇÃO DE GESTOR NECESSÁRIA PARA EDIÇÃO'
                  : 'VIEW MODE • NGO MANAGER AUTHENTICATION REQUIRED FOR LIVE CRUD'}
              </strong>
              <span>
                {locale === 'pt-BR'
                  ? 'Clique no botão ao lado para entrar instantaneamente como Gestor da ONG de Proteção Animal e testar a edição em tempo real.'
                  : 'Click the button to sign in immediately as NGO Manager and test real-time financial & catalog CRUD.'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => quickLoginAs('ong@adoteaki.org.br', 'ong12345')}
              className="px-4 py-2 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold shrink-0"
            >
              {locale === 'pt-BR'
                ? 'Entrar como Gestor de ONG (1-Clique)'
                : 'Sign In as NGO Manager (1-Click)'}
            </button>
          </div>
        )}

        {feedback && (
          <div className="p-3.5 rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 text-xs font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              {feedback}
            </span>
          </div>
        )}

        {/* Portal Header & NGO Selector */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
              PORTAL GESTOR DA ORGANIZAÇÃO • CRUD EM TEMPO REAL
            </span>
            <h1 className="font-serif font-bold text-3xl text-zinc-900 dark:text-zinc-100 mt-1">
              {summary?.tradeName || 'Gestão Financeira & Operacional'}
            </h1>
            {summary && (
              <p className="font-mono text-xs text-zinc-500 mt-1">
                CNPJ {summary.cnpj} • Score de Transparência {summary.verifiedScore}/100
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedNgoId}
              onChange={(e) => {
                setSelectedNgoId(e.target.value);
                loadPortalData(e.target.value);
              }}
              aria-label="Selecionar ONG"
              className="px-3 py-2 text-xs font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            >
              {allNgos.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.tradeName} ({n.city}/{n.state})
                </option>
              ))}
            </select>

            {ngoProfile && (
              <Link
                href={`/ongs/${ngoProfile.slug}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <span>
                  {locale === 'pt-BR' ? 'Ver Página Pública' : 'View Public Profile'}
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Portal Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <button
            type="button"
            onClick={() => setPortalTab('finances')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-colors ${
              portalTab === 'finances'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>
              {locale === 'pt-BR'
                ? '1. Livro-Razão & Finanças (Tempo Real)'
                : '1. Financial Manager (Live CRUD)'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPortalTab('animals')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-colors ${
              portalTab === 'animals'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <PawPrint className="w-4 h-4" />
            <span>
              {locale === 'pt-BR'
                ? `2. Catálogo de Animais (${animals.length})`
                : `2. Animal Roster CRUD (${animals.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPortalTab('inquiries')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-colors ${
              portalTab === 'inquiries'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>
              {locale === 'pt-BR'
                ? `3. Pedidos de Adoção (${inquiries.length})`
                : `3. Adoption Inquiries (${inquiries.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPortalTab('profile')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-colors ${
              portalTab === 'profile'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>
              {locale === 'pt-BR'
                ? '4. Perfil Público da ONG'
                : '4. Public Institutional Profile'}
            </span>
          </button>
        </div>

        {loading || !summary ? (
          <div className="py-12 text-center font-mono text-xs text-zinc-500">
            Carregando demonstrativos contábeis...
          </div>
        ) : (
          <>
            {/* TAB 1: FINANCIAL MANAGER */}
            {portalTab === 'finances' && (
              <div className="space-y-10">
                {/* CRUD Controls Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Reserve / Initial Balance Adjustment */}
                  <form
                    onSubmit={handleUpdateInitialBalance}
                    className="p-5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4"
                  >
                    <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
                      {locale === 'pt-BR'
                        ? 'Ajustar Reserva / Saldo Inicial'
                        : 'Update Opening Reserve Balance'}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {locale === 'pt-BR'
                        ? 'Altera imediatamente o saldo líquido em caixa no painel público.'
                        : 'Immediately recalculates net liquid cash on the public dashboard.'}
                    </p>
                    <div>
                      <label className="block font-mono text-[11px] uppercase text-zinc-500 mb-1">
                        Valor em R$ (BRL)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        disabled={!canManage}
                        value={initialBalanceInput}
                        onChange={(e) => setInitialBalanceInput(e.target.value)}
                        className="w-full px-3 py-2 font-mono text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!canManage}
                      className="w-full py-2 px-4 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold disabled:opacity-50"
                    >
                      {locale === 'pt-BR'
                        ? 'Salvar Saldo Inicial'
                        : 'Save Opening Balance'}
                    </button>
                  </form>

                  {/* Right 2 Cols: Add New Revenue or Expense Entry */}
                  <form
                    onSubmit={handleAddFinancialEntry}
                    className="lg:col-span-2 p-5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
                        {locale === 'pt-BR'
                          ? 'Novo Lançamento no Livro-Razão (Receita ou Despesa)'
                          : 'Add New Ledger Entry (Revenue or Expense)'}
                      </h3>
                      <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                        Atualização Instantânea de Gráficos
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Natureza
                        </label>
                        <select
                          value={newEntryType}
                          disabled={!canManage}
                          onChange={(e) => {
                            const val = e.target.value as 'REVENUE' | 'EXPENSE';
                            setNewEntryType(val);
                            setNewEntryCategory(
                              val === 'REVENUE' ? 'DONATIONS' : 'VETERINARY'
                            );
                          }}
                          className="w-full px-2.5 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-semibold"
                        >
                          <option value="REVENUE">RECEITA (+)</option>
                          <option value="EXPENSE">DESPESA (-)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Categoria Orçamentária
                        </label>
                        <select
                          value={newEntryCategory}
                          disabled={!canManage}
                          onChange={(e) => setNewEntryCategory(e.target.value)}
                          className="w-full px-2.5 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                        >
                          {(newEntryType === 'REVENUE'
                            ? revenueCategories
                            : expenseCategories
                          ).map((cat) => (
                            <option key={cat} value={cat}>
                              {(t.categories as Record<string, string>)[cat] || cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Competência (YYYY-MM)
                        </label>
                        <input
                          type="month"
                          disabled={!canManage}
                          value={newEntryMonth}
                          onChange={(e) => setNewEntryMonth(e.target.value)}
                          className="w-full px-2.5 py-2 font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Valor (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          disabled={!canManage}
                          value={newEntryAmount}
                          onChange={(e) => setNewEntryAmount(e.target.value)}
                          placeholder="4500.00"
                          className="w-full px-3 py-2 font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="sm:col-span-2">
                        <label className="block font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Descrição Auditável do Lançamento
                        </label>
                        <input
                          type="text"
                          required
                          disabled={!canManage}
                          value={newEntryTitle}
                          onChange={(e) => setNewEntryTitle(e.target.value)}
                          placeholder="Ex: Lote de Vacinas V10 e Cirurgias Ortopédicas"
                          className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Nº Nota Fiscal / Recibo
                        </label>
                        <input
                          type="text"
                          disabled={!canManage}
                          value={newEntryDocRef}
                          onChange={(e) => setNewEntryDocRef(e.target.value)}
                          placeholder="NF-SP-2026-881"
                          className="w-full px-3 py-2 font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!canManage}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        <span>
                          {locale === 'pt-BR'
                            ? 'Registrar Lançamento & Atualizar Gráficos'
                            : 'Record Entry & Update Charts'}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>

                {/*Editable Ledger CRUD Table */}
                <div className="rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                  <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
                        {locale === 'pt-BR'
                          ? 'Editor de Lançamentos Históricos (CRUD Completo)'
                          : 'Historical Ledger Entries Editor (Full CRUD)'}
                      </h3>
                      <p className="text-xs text-zinc-500">
                        {locale === 'pt-BR'
                          ? 'Edite valores, categorias, meses ou remova qualquer linha para recalcular o balanço imediatamente.'
                          : 'Edit amounts, categories, months, or delete any row to recalculate the balance sheet immediately.'}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-zinc-500">
                      {summary.entries.length} registros
                    </span>
                  </div>

                  <div className="w-full overflow-x-auto max-h-96">
                    <table className="w-full min-w-[680px] text-left border-collapse text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 font-mono uppercase text-[11px] text-zinc-500">
                        <tr>
                          <th className="py-3 px-4">Mês</th>
                          <th className="py-3 px-4">Tipo</th>
                          <th className="py-3 px-4">Categoria</th>
                          <th className="py-3 px-4">Descrição</th>
                          <th className="py-3 px-4">Documento</th>
                          <th className="py-3 px-4 text-right">Valor (R$)</th>
                          <th className="py-3 px-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {summary.entries.map((entry) => {
                          const isEditing = editingEntryId === entry.id;
                          return (
                            <tr key={entry.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40">
                              <td className="py-2.5 px-4 font-mono">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editMonth}
                                    onChange={(e) => setEditMonth(e.target.value)}
                                    className="w-24 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                                  />
                                ) : (
                                  entry.month
                                )}
                              </td>
                              <td className="py-2.5 px-4 font-mono">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    entry.type === 'REVENUE'
                                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                      : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                  }`}
                                >
                                  {entry.type}
                                </span>
                              </td>
                              <td className="py-2.5 px-4">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    className="w-32 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                                  />
                                ) : (
                                  (t.categories as Record<string, string>)[entry.category] ||
                                  entry.category
                                )}
                              </td>
                              <td className="py-2.5 px-4 font-medium">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full min-w-[200px] px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                                  />
                                ) : (
                                  entry.titlePt
                                )}
                              </td>
                              <td className="py-2.5 px-4 font-mono text-zinc-500">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editDocRef}
                                    onChange={(e) => setEditDocRef(e.target.value)}
                                    className="w-28 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                                  />
                                ) : (
                                  entry.documentRef || '—'
                                )}
                              </td>
                              <td className="py-2.5 px-4 font-mono font-semibold text-right">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    className="w-28 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-right"
                                  />
                                ) : (
                                  formatCurrencyBRL(entry.amount, locale)
                                )}
                              </td>
                              <td className="py-2.5 px-4 text-right whitespace-nowrap">
                                {isEditing ? (
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEntryEdit(entry.id)}
                                      className="p-1.5 rounded bg-emerald-700 text-white"
                                      title="Salvar"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingEntryId(null)}
                                      className="p-1.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                      title="Cancelar"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={!canManage}
                                      onClick={() => {
                                        setEditingEntryId(entry.id);
                                        setEditTitle(entry.titlePt);
                                        setEditAmount(String(entry.amount));
                                        setEditMonth(entry.month);
                                        setEditCategory(entry.category);
                                        setEditDocRef(entry.documentRef || '');
                                      }}
                                      className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-40"
                                      title="Editar Lançamento"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={!canManage}
                                      onClick={() => handleDeleteEntry(entry.id)}
                                      className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 disabled:opacity-40"
                                      title="Excluir Lançamento"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Live Interactive Charts Preview */}
                <div className="pt-4">
                  <FinancialDashboard summary={summary} showManageCta={false} />
                </div>
              </div>
            )}

            {/* TAB 2: ANIMAL ADOPTION CATALOG CRUD */}
            {portalTab === 'animals' && (
              <div className="space-y-8">
                <form
                  onSubmit={handleCreateAnimal}
                  className="p-6 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4"
                >
                  <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                    {locale === 'pt-BR'
                      ? 'Cadastrar Novo Animal para Adoção'
                      : 'Add New Animal to Adoption Roster'}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block font-medium mb-1">Nome do Animal *</label>
                      <input
                        type="text"
                        required
                        disabled={!canManage}
                        value={animalName}
                        onChange={(e) => setAnimalName(e.target.value)}
                        placeholder="Ex: Pipoca"
                        className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Espécie</label>
                      <select
                        value={animalSpecies}
                        disabled={!canManage}
                        onChange={(e) => setAnimalSpecies(e.target.value)}
                        className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      >
                        <option value="DOG">Cão</option>
                        <option value="CAT">Gato</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Raça / Pelagem</label>
                      <input
                        type="text"
                        disabled={!canManage}
                        value={animalBreed}
                        onChange={(e) => setAnimalBreed(e.target.value)}
                        className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Idade ( em meses)</label>
                      <input
                        type="number"
                        disabled={!canManage}
                        value={animalAgeMonths}
                        onChange={(e) => setAnimalAgeMonths(e.target.value)}
                        className="w-full px-3 py-2 font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block font-medium mb-1">Porte</label>
                      <select
                        value={animalSize}
                        disabled={!canManage}
                        onChange={(e) => setAnimalSize(e.target.value)}
                        className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      >
                        <option value="SMALL">Pequeno</option>
                        <option value="MEDIUM">Médio</option>
                        <option value="LARGE">Grande</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Sexo</label>
                      <select
                        value={animalGender}
                        disabled={!canManage}
                        onChange={(e) => setAnimalGender(e.target.value)}
                        className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      >
                        <option value="MALE">Macho</option>
                        <option value="FEMALE">Fêmea</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Temperamento (CSV)</label>
                      <input
                        type="text"
                        disabled={!canManage}
                        value={animalTemperament}
                        onChange={(e) => setAnimalTemperament(e.target.value)}
                        className="w-full px-3 py-2 font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Foto (Preset ou URL)</label>
                      <select
                        value={animalPhotoUrl}
                        disabled={!canManage}
                        onChange={(e) => setAnimalPhotoUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      >
                        {PHOTO_PRESETS.map((p) => (
                          <option key={p.url} value={p.url}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs items-center">
                    <div className="sm:col-span-2">
                      <label className="block font-medium mb-1">Histórico Clínico & Comportamental *</label>
                      <input
                        type="text"
                        required
                        disabled={!canManage}
                        value={animalDesc}
                        onChange={(e) => setAnimalDesc(e.target.value)}
                        placeholder="Descreva o temperamento, resgate e adaptação do animal..."
                        className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={animalVaccinated}
                          onChange={(e) => setAnimalVaccinated(e.target.checked)}
                        />
                        <span>Vacinado</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={animalNeutered}
                          onChange={(e) => setAnimalNeutered(e.target.checked)}
                        />
                        <span>Castrado</span>
                      </label>
                      <button
                        type="submit"
                        disabled={!canManage}
                        className="ml-auto px-4 py-2 rounded bg-brand-700 text-white font-semibold disabled:opacity-50"
                      >
                        + Cadastrar
                      </button>
                    </div>
                  </div>
                </form>

                {/* Existing Animals Table */}
                <div className="w-full overflow-x-auto rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <table className="w-full min-w-[640px] text-left border-collapse text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 font-mono uppercase text-[11px] text-zinc-500">
                      <tr>
                        <th className="py-3 px-4">Animal</th>
                        <th className="py-3 px-4">Espécie / Porte</th>
                        <th className="py-3 px-4">Protocolo</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {animals.map((a) => (
                        <tr key={a.id}>
                          <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                            {a.name} <span className="font-normal text-zinc-500">({a.breed})</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                            {a.species} • {a.size} • {a.ageMonths}m
                          </td>
                          <td className="py-3 px-4">
                            {a.vaccinated ? 'Vacinado ' : ''}
                            {a.neutered ? '• Castrado' : ''}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                a.status === 'AVAILABLE'
                                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              type="button"
                              disabled={!canManage}
                              onClick={() => handleToggleAnimalStatus(a)}
                              className="px-2.5 py-1 rounded border border-zinc-300 dark:border-zinc-700 text-[11px] font-medium"
                            >
                              {a.status === 'AVAILABLE'
                                ? 'Marcar como Adotado'
                                : 'Reativar para Adoção'}
                            </button>
                            <button
                              type="button"
                              disabled={!canManage}
                              onClick={() => handleDeleteAnimal(a.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: ADOPTION INQUIRIES */}
            {portalTab === 'inquiries' && (
              <div className="space-y-4">
                {inquiries.length === 0 ? (
                  <div className="p-10 rounded border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                    Nenhuma solicitação de adoção registrada para esta ONG até o momento.
                  </div>
                ) : (
                  inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            Animal: {inq.animal?.name}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] font-semibold">
                            Status: {inq.status}
                          </span>
                        </div>
                        <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                          Candidato(a): {inq.applicantName} • {inq.cityState}
                        </div>
                        <div className="font-mono text-zinc-500">
                          {inq.applicantEmail} • {inq.applicantPhone} • Imóvel: {inq.housingType}{' '}
                          {inq.safeScreens ? '• Telado' : ''}
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 p-3 rounded border border-zinc-200/70 dark:border-zinc-800 mt-2">
                          &ldquo;{inq.message}&rdquo;
                        </p>
                      </div>

                      <div className="flex flex-wrap md:flex-col gap-2 shrink-0 text-xs">
                        <button
                          type="button"
                          disabled={!canManage}
                          onClick={() => handleInquiryStatus(inq.id, 'INTERVIEW')}
                          className="px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          Agendar Entrevista
                        </button>
                        <button
                          type="button"
                          disabled={!canManage}
                          onClick={() => handleInquiryStatus(inq.id, 'APPROVED')}
                          className="px-3 py-1.5 rounded bg-emerald-700 text-white font-semibold hover:bg-emerald-800"
                        >
                          Aprovar Adoção
                        </button>
                        <button
                          type="button"
                          disabled={!canManage}
                          onClick={() => handleInquiryStatus(inq.id, 'REJECTED')}
                          className="px-3 py-1.5 rounded border border-rose-300 text-rose-700 font-medium hover:bg-rose-50"
                        >
                          Recusar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: NGO PUBLIC PROFILE EDITOR */}
            {portalTab === 'profile' && ngoProfile && (
              <form
                onSubmit={handleUpdateProfile}
                className="p-6 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 text-xs"
              >
                <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  Editar Dados Institucionais da ONG
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Nome Fantasia</label>
                    <input
                      type="text"
                      value={ngoProfile.tradeName}
                      onChange={(e) =>
                        setNgoProfile({ ...ngoProfile, tradeName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Razão Social</label>
                    <input
                      type="text"
                      value={ngoProfile.legalName}
                      onChange={(e) =>
                        setNgoProfile({ ...ngoProfile, legalName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Telefone Oficial</label>
                    <input
                      type="text"
                      value={ngoProfile.phone}
                      onChange={(e) =>
                        setNgoProfile({ ...ngoProfile, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Chave PIX Oficial</label>
                    <input
                      type="text"
                      value={ngoProfile.pixKey || ''}
                      onChange={(e) =>
                        setNgoProfile({ ...ngoProfile, pixKey: e.target.value })
                      }
                      className="w-full px-3 py-2 font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    value={ngoProfile.address}
                    onChange={(e) =>
                      setNgoProfile({ ...ngoProfile, address: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Apresentação Institucional</label>
                  <textarea
                    rows={3}
                    value={ngoProfile.descriptionPt}
                    onChange={(e) =>
                      setNgoProfile({ ...ngoProfile, descriptionPt: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!canManage}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded bg-brand-700 text-white font-semibold disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Alterações Institucionais</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function DashboardFinancesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center font-mono text-xs text-zinc-500">
          Carregando portal financeiro...
        </div>
      }
    >
      <DashboardFinancesContent />
    </Suspense>
  );
}
