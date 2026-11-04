'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  formatCnpj,
  formatPhoneBR,
  isValidCnpj,
  formatCurrencyBRL,
} from '@/lib/validators/cnpj';

const BRAZIL_UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

function generateValidCnpj(): string {
  const randomDigits = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 9)
  );
  const base = [...randomDigits, 0, 0, 0, 1];
  const calc = (arr: number[], weights: number[]) => {
    const sum = arr.reduce((acc, val, idx) => acc + val * weights[idx], 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };
  const d1 = calc(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calc([...base, d1], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return formatCnpj([...base, d1, d2].join(''));
}

export default function RegisterNgoPage() {
  const { locale, refreshUser } = useApp();
  const router = useRouter();

  const [legalName, setLegalName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [foundationYear, setFoundationYear] = useState('2020');
  const [state, setState] = useState('SP');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [size, setSize] = useState('MEDIUM');
  const [causeTags, setCauseTags] = useState('CAES,GATOS,CASTRACAO,VACINACAO');
  const [descriptionPt, setDescriptionPt] = useState('');
  const [missionPt, setMissionPt] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [password, setPassword] = useState('');

  // Initial Financial Setup
  const [initialBalance, setInitialBalance] = useState('18500');
  const [monthlyDonations, setMonthlyDonations] = useState('14200');
  const [monthlyGrants, setMonthlyGrants] = useState('4800');
  const [monthlyVeterinary, setMonthlyVeterinary] = useState('9400');
  const [monthlyFood, setMonthlyFood] = useState('5200');
  const [monthlyFacility, setMonthlyFacility] = useState('2100');
  const [monthlyAdmin, setMonthlyAdmin] = useState('1100');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cnpjValid = cnpj.length >= 18 && isValidCnpj(cnpj);
  const cnpjTouched = cnpj.length > 3;

  const projectedRevenue =
    (Number(monthlyDonations) || 0) + (Number(monthlyGrants) || 0);
  const projectedExpense =
    (Number(monthlyVeterinary) || 0) +
    (Number(monthlyFood) || 0) +
    (Number(monthlyFacility) || 0) +
    (Number(monthlyAdmin) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidCnpj(cnpj)) {
      setError(
        locale === 'pt-BR'
          ? 'O CNPJ informado não possui dígitos verificadores válidos (Módulo-11).'
          : 'The provided CNPJ failed Modulo-11 check-digit validation.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/ngos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legalName,
          tradeName,
          cnpj,
          foundationYear: Number(foundationYear),
          state,
          city,
          address,
          size,
          causeTags,
          descriptionPt,
          missionPt,
          email,
          phone,
          website,
          pixKey: pixKey || cnpj,
          password,
          initialBalance: Number(initialBalance) || 0,
          monthlyDonations: Number(monthlyDonations) || 0,
          monthlyGrants: Number(monthlyGrants) || 0,
          monthlyVeterinary: Number(monthlyVeterinary) || 0,
          monthlyFood: Number(monthlyFood) || 0,
          monthlyFacility: Number(monthlyFacility) || 0,
          monthlyAdmin: Number(monthlyAdmin) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao credenciar ONG.');
      } else {
        await refreshUser();
        router.push(`/ongs/${data.ngo.slug}`);
      }
    } catch {
      setError('Erro de comunicação com o servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/ongs"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {locale === 'pt-BR' ? 'Voltar ao Diretório' : 'Back to Directory'}
            </span>
          </Link>
        </div>

        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono text-xs mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {locale === 'pt-BR'
                ? 'CREDENCIAMENTO NACIONAL DE ONG & ABERTURA DE LIVRO-RAZÃO'
                : 'OFFICIAL NGO ONBOARDING & INITIAL FINANCIAL LEDGER'}
            </span>
          </div>
          <h1 className="font-serif font-bold text-3xl text-zinc-950 dark:text-zinc-50">
            {locale === 'pt-BR'
              ? 'Cadastrar Organização de Proteção Animal'
              : 'Register Animal Protection Organization'}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            {locale === 'pt-BR'
              ? 'Preencha os dados cadastrais obrigatórios junto ao CNPJ válido e configure o balancete inicial que alimentará automaticamente seu painel público de transparência.'
              : 'Complete mandatory institutional details with a valid Brazilian CNPJ and configure the initial balance sheet that automatically powers your public transparency dashboard.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 flex items-center gap-3 text-xs text-rose-800 dark:text-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Institutional & Legal Identity */}
          <div className="p-6 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h2 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  {locale === 'pt-BR'
                    ? '1. Identificação Jurídica e Institucional'
                    : '1. Legal & Institutional Identity'}
                </h2>
              </div>
              <span className="font-mono text-[11px] text-zinc-500">
                * {locale === 'pt-BR' ? 'Campos Obrigatórios' : 'Mandatory Fields'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  {locale === 'pt-BR' ? 'Razão Social *' : 'Legal Name (Razão Social) *'}
                </label>
                <input
                  type="text"
                  required
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="Ex: Associação Protetora Vida Animal"
                  className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  {locale === 'pt-BR' ? 'Nome Fantasia *' : 'Trade Name (Nome Fantasia) *'}
                </label>
                <input
                  type="text"
                  required
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  placeholder="Ex: Instituto Vida Animal"
                  className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">
                    CNPJ (com validação Módulo-11) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const generated = generateValidCnpj();
                      setCnpj(generated);
                      if (!pixKey) setPixKey(generated);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>
                      {locale === 'pt-BR' ? 'Gerar CNPJ Válido' : 'Generate Valid CNPJ'}
                    </span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                  placeholder="00.000.000/0001-00"
                  maxLength={18}
                  className={`w-full px-3 py-2 font-mono rounded border bg-white dark:bg-zinc-950 ${
                    cnpjTouched
                      ? cnpjValid
                        ? 'border-emerald-500'
                        : 'border-rose-400'
                      : 'border-zinc-300 dark:border-zinc-700'
                  }`}
                />
                {cnpjTouched && (
                  <span
                    className={`mt-1 inline-flex items-center gap-1 font-mono text-[11px] ${
                      cnpjValid
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {cnpjValid ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        {locale === 'pt-BR'
                          ? 'Dígitos verificadores válidos (Módulo-11).'
                          : 'Valid Modulo-11 check digits.'}
                      </>
                    ) : (
                      locale === 'pt-BR'
                        ? 'Digite os 14 números de um CNPJ válido ou clique em "Gerar CNPJ Válido".'
                        : 'Enter 14 digits of a valid CNPJ or click "Generate Valid CNPJ".'
                    )}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    {locale === 'pt-BR' ? 'Ano de Fundação' : 'Foundation Year'}
                  </label>
                  <input
                    type="number"
                    min={1950}
                    max={2026}
                    value={foundationYear}
                    onChange={(e) => setFoundationYear(e.target.value)}
                    className="w-full px-3 py-2 font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    {locale === 'pt-BR' ? 'Porte do Abrigo *' : 'Shelter Size *'}
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-2.5 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                    <option value="SMALL">Pequeno (&lt;40 animais)</option>
                    <option value="MEDIUM">Médio (40-150 animais)</option>
                    <option value="LARGE">Grande (+150 animais)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs pt-2">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Estado (UF) *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                >
                  {BRAZIL_UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  {locale === 'pt-BR' ? 'Município / Cidade *' : 'City *'}
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Campinas"
                  className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  {locale === 'pt-BR' ? 'Endereço Completo *' : 'Full Street Address *'}
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, Número, Bairro e CEP"
                  className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  E-mail Oficial (Login da ONG) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="diretoria@suaong.org.br"
                  className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneBR(e.target.value))}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  {locale === 'pt-BR' ? 'Senha de Acesso Gestor' : 'Manager Portal Password'}
                </label>
                <input
                  type="password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  {locale === 'pt-BR'
                    ? 'Tags de Causa / Especialidade (separadas por vírgula)'
                    : 'Cause Tags (comma-separated)'}
                </label>
                <input
                  type="text"
                  value={causeTags}
                  onChange={(e) => setCauseTags(e.target.value)}
                  className="w-full px-3 py-2 font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Website / Instagram (Opcional)
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://suaong.org.br"
                  className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  {locale === 'pt-BR' ? 'Descrição Institucional *' : 'Institutional Description *'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={descriptionPt}
                  onChange={(e) => setDescriptionPt(e.target.value)}
                  placeholder="Descreva a estrutura física, histórico de atuação e equipe clínica da ONG..."
                  className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  {locale === 'pt-BR' ? 'Missão & Compromisso *' : 'Mission Statement *'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={missionPt}
                  onChange={(e) => setMissionPt(e.target.value)}
                  placeholder="Qual é o objetivo central da organização e compromisso com transparência?"
                  className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Initial Financial Setup */}
          <div className="p-6 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h2 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  {locale === 'pt-BR'
                    ? '2. Configuração Financeira Inicial (Popula o Dashboard Público)'
                    : '2. Initial Financial Setup (Populates Public Dashboard)'}
                </h2>
              </div>
              <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400">
                {locale === 'pt-BR' ? 'Editável em tempo real depois' : 'Editable in real-time later'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  {locale === 'pt-BR' ? 'Saldo Inicial em Caixa (R$)' : 'Initial Reserve Balance (BRL)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full px-3 py-2 font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block font-medium text-emerald-800 dark:text-emerald-400 mb-1">
                  {locale === 'pt-BR' ? 'Receita: Doações & PIX (R$)' : 'Revenue: PIX & Donations (BRL)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={monthlyDonations}
                  onChange={(e) => setMonthlyDonations(e.target.value)}
                  className="w-full px-3 py-2 font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block font-medium text-emerald-800 dark:text-emerald-400 mb-1">
                  {locale === 'pt-BR' ? 'Receita: Editais & Eventos (R$)' : 'Revenue: Grants & Events (BRL)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={monthlyGrants}
                  onChange={(e) => setMonthlyGrants(e.target.value)}
                  className="w-full px-3 py-2 font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-medium text-rose-800 dark:text-rose-400 mb-1">
                  {locale === 'pt-BR' ? 'Despesa: Clínica Veterinária (R$)' : 'Expense: Veterinary Care'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={monthlyVeterinary}
                  onChange={(e) => setMonthlyVeterinary(e.target.value)}
                  className="w-full px-3 py-2 font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block font-medium text-rose-800 dark:text-rose-400 mb-1">
                  {locale === 'pt-BR' ? 'Despesa: Ração & Nutrição (R$)' : 'Expense: Food & Nutrition'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={monthlyFood}
                  onChange={(e) => setMonthlyFood(e.target.value)}
                  className="w-full px-3 py-2 font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block font-medium text-rose-800 dark:text-rose-400 mb-1">
                  {locale === 'pt-BR' ? 'Despesa: Instalações (R$)' : 'Expense: Facility Upkeep'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={monthlyFacility}
                  onChange={(e) => setMonthlyFacility(e.target.value)}
                  className="w-full px-3 py-2 font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block font-medium text-rose-800 dark:text-rose-400 mb-1">
                  {locale === 'pt-BR' ? 'Despesa: Administração (R$)' : 'Expense: Administration'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={monthlyAdmin}
                  onChange={(e) => setMonthlyAdmin(e.target.value)}
                  className="w-full px-3 py-2 font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
            </div>

            {/* Live Preview Summary Bar */}
            <div className="p-4 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">
                  Receita Inicial
                </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {formatCurrencyBRL(projectedRevenue, locale)}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">
                  Despesa Inicial
                </span>
                <span className="font-bold text-rose-700 dark:text-rose-400">
                  {formatCurrencyBRL(projectedExpense, locale)}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">
                  Saldo em Caixa Projetado
                </span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {formatCurrencyBRL(
                    (Number(initialBalance) || 0) + projectedRevenue - projectedExpense,
                    locale
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link
              href="/ongs"
              className="px-5 py-2.5 rounded border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              {locale === 'pt-BR' ? 'Cancelar' : 'Cancel'}
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded bg-brand-700 hover:bg-brand-800 text-white text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {submitting
                ? '...'
                : locale === 'pt-BR'
                ? 'Homologar Cadastro & Publicar Painel'
                : 'Submit Registration & Publish Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
