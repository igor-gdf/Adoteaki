'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Scale,
  AlertCircle,
  SlidersHorizontal,
  Receipt,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrencyBRL } from '@/lib/validators/cnpj';
import type { FinancialSummaryDTO } from '@/server/services/finance.service';

interface Props {
  summary: FinancialSummaryDTO;
  showManageCta?: boolean;
}

export function FinancialDashboard({ summary, showManageCta = true }: Props) {
  const { locale, t } = useApp();
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(
    Math.max(0, summary.monthlySeries.length - 1)
  );
  const [ledgerFilterType, setLedgerFilterType] = useState<'ALL' | 'REVENUE' | 'EXPENSE'>('ALL');
  const [ledgerFilterMonth, setLedgerFilterMonth] = useState<string>('ALL');

  const formattedUpdatedDate = new Intl.DateTimeFormat(
    locale === 'pt-BR' ? 'pt-BR' : 'en-US',
    {
      dateStyle: 'long',
      timeStyle: 'short',
    }
  ).format(new Date(summary.financialUpdatedAt));

  const maxMonthlyVal = Math.max(
    1,
    ...summary.monthlySeries.map((m) => Math.max(m.revenue, m.expenses))
  );

  const activeMonth = summary.monthlySeries[selectedMonthIndex] || null;

  const filteredEntries = summary.entries.filter((entry) => {
    if (ledgerFilterType !== 'ALL' && entry.type !== ledgerFilterType) return false;
    if (ledgerFilterMonth !== 'ALL' && entry.month !== ledgerFilterMonth) return false;
    return true;
  });

  const translateCategory = (cat: string) => {
    const map = t.categories as Record<string, string>;
    return map[cat] || cat;
  };

  return (
    <div className="space-y-8 w-full max-w-full overflow-hidden">
      {/* Header + Manage CTA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold block">
            {t.finance.sectionTag} • CNPJ {summary.cnpj}
          </span>
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-zinc-900 dark:text-zinc-100 mt-1">
            {t.finance.title}
          </h2>
        </div>

        {showManageCta && (
          <Link
            href={`/dashboard/finances?ngoId=${summary.ngoId}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors w-full sm:w-auto shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{t.finance.manageButton}</span>
          </Link>
        )}
      </div>

      {/* Mandatory Audit & Last Updated Disclaimer */}
      <div className="p-4 rounded border border-amber-300/80 dark:border-amber-800/80 bg-amber-50/60 dark:bg-amber-950/25 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-800 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 min-w-0">
          <span className="font-mono font-bold uppercase tracking-wide text-amber-900 dark:text-amber-300 mr-1.5">
            {t.finance.disclaimerPrefix}
          </span>
          <span>{t.finance.disclaimerBody} </span>
          <strong className="font-mono underline decoration-amber-500/60 underline-offset-2">
            {formattedUpdatedDate}
          </strong>
          <span className="mt-1 sm:mt-0 sm:ml-2 inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-mono text-[11px] font-semibold">
            {locale === 'pt-BR' ? 'Score de transparência' : 'Transparency score'}{' '}
            {summary.verifiedScore}/100
          </span>
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
          {locale === 'pt-BR'
            ? 'O score vai de 0 a 100 e é atribuído pela auditoria após a conferência de documentos, CNPJ, registros e prestação de contas. O fluxo de caixa do PDF não altera esse score.'
            : 'The score ranges from 0 to 100 and is assigned by auditors after checking documents, registration, and accountability records. The PDF cash flow does not change this score.'}
        </p>
      </div>

      {/* 4 Balance Sheet Summary Cards */}
      <div className="w-full overflow-x-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 min-w-[300px]">
          <div className="p-4 sm:p-5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mb-2 gap-1">
              <span className="font-mono uppercase truncate">{t.finance.initialReserve}</span>
              <Wallet className="w-4 h-4 text-zinc-400 shrink-0" />
            </div>
            <div className="font-mono font-bold text-base sm:text-xl text-zinc-900 dark:text-zinc-100 break-words">
              {formatCurrencyBRL(summary.initialBalance, locale)}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {locale === 'pt-BR' ? 'Fundo patrimonial de abertura' : 'Opening reserve fund'}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mb-2 gap-1">
              <span className="font-mono uppercase truncate">{t.finance.totalRevenues}</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <div className="font-mono font-bold text-base sm:text-xl text-emerald-700 dark:text-emerald-400 break-words">
              {formatCurrencyBRL(summary.totalRevenue, locale)}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {locale === 'pt-BR'
                ? 'Doações PIX, editais e eventos'
                : 'PIX donations, grants & events'}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mb-2 gap-1">
              <span className="font-mono uppercase truncate">{t.finance.totalExpenses}</span>
              <ArrowDownRight className="w-4 h-4 text-rose-600 shrink-0" />
            </div>
            <div className="font-mono font-bold text-base sm:text-xl text-rose-700 dark:text-rose-400 break-words">
              {formatCurrencyBRL(summary.totalExpenses, locale)}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {locale === 'pt-BR'
                ? 'Clínica veterinária, ração e abrigo'
                : 'Veterinary care, food & upkeep'}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-300 mb-2 gap-1">
              <span className="font-mono uppercase font-semibold truncate">
                {t.finance.currentBalance}
              </span>
              <Scale className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            </div>
            <div
              className={`font-mono font-bold text-base sm:text-xl break-words ${
                summary.currentBalance >= 0
                  ? 'text-zinc-900 dark:text-zinc-100'
                  : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              {formatCurrencyBRL(summary.currentBalance, locale)}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {locale === 'pt-BR'
                ? 'Disponibilidade líquida auditada'
                : 'Audited net liquid balance'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        {[
          [locale === 'pt-BR' ? 'Cobertura de caixa' : 'Cash coverage', `${summary.indicators.cashCoverageMonths} ${locale === 'pt-BR' ? 'meses' : 'months'}`],
          [locale === 'pt-BR' ? 'Taxa de cobertura' : 'Coverage rate', `${summary.indicators.coverageRate.toFixed(1)}%`],
          [locale === 'pt-BR' ? 'Receitas recorrentes' : 'Recurring revenue', `${summary.indicators.recurringRevenuePercentage.toFixed(1)}%`],
          [locale === 'pt-BR' ? 'Despesa média mensal' : 'Average monthly expense', formatCurrencyBRL(summary.indicators.averageMonthlyExpense, locale)],
          [locale === 'pt-BR' ? 'Maior entrada' : 'Highest revenue', summary.indicators.highestRevenueMonth?.month ?? '-'],
          [locale === 'pt-BR' ? 'Maior saída' : 'Highest expense', summary.indicators.highestExpenseMonth?.month ?? '-'],
        ].map(([label, value]) => (
          <div key={label} className="border-l-2 border-amber-400 pl-3 py-2">
            <div className="font-mono uppercase text-[10px] text-zinc-500 dark:text-zinc-400">{label}</div>
            <div className="font-semibold text-zinc-900 dark:text-zinc-100 mt-1">{value}</div>
          </div>
        ))}
      </div>

      {/* Breakdown Charts: Revenue Sources & Operating Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <div className="p-5 sm:p-6 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 w-full overflow-x-auto">
          <div className="min-w-[260px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-5">
              <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
                {t.finance.revenueBreakdown}
              </h3>
              <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                100% = {formatCurrencyBRL(summary.totalRevenue, locale)}
              </span>
            </div>

            <div className="space-y-4">
              {summary.revenueByCategory.map((item) => (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {translateCategory(item.category)}
                    </span>
                    <div className="font-mono text-zinc-700 dark:text-zinc-300 shrink-0">
                      <span>{formatCurrencyBRL(item.amount, locale)}</span>
                      <span className="ml-1.5 text-zinc-500">({item.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-emerald-700 dark:bg-emerald-500 rounded-sm transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(4, item.percentage))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Operating Expenses Breakdown */}
        <div className="p-5 sm:p-6 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 w-full overflow-x-auto">
          <div className="min-w-[260px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-5">
              <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
                {t.finance.expenseBreakdown}
              </h3>
              <span className="text-xs font-mono text-rose-700 dark:text-rose-400 font-semibold">
                100% = {formatCurrencyBRL(summary.totalExpenses, locale)}
              </span>
            </div>

            <div className="space-y-4">
              {summary.expenseByCategory.map((item) => {
                const barColor =
                  item.category === 'VETERINARY'
                    ? 'bg-terracotta-500 dark:bg-amber-500'
                    : item.category === 'FOOD'
                    ? 'bg-amber-700 dark:bg-amber-600'
                    : 'bg-zinc-700 dark:bg-zinc-400';

                return (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                        {translateCategory(item.category)}
                      </span>
                      <div className="font-mono text-zinc-700 dark:text-zinc-300 shrink-0">
                        <span>{formatCurrencyBRL(item.amount, locale)}</span>
                        <span className="ml-1.5 text-zinc-500">({item.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-sm overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-sm transition-all duration-300`}
                        style={{ width: `${Math.min(100, Math.max(4, item.percentage))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 12-Month Interactive Cash Flow Chart */}
      {summary.monthlySeries.length > 0 && (
        <div className="p-5 sm:p-6 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
                {t.finance.monthlyEvolution}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {locale === 'pt-BR'
                  ? 'Clique em qualquer competência mensal para inspecionar o detalhamento contábil.'
                  : 'Click on any monthly bar to inspect the detailed accounting breakdown.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-700 dark:bg-emerald-500 inline-block shrink-0" />
                {locale === 'pt-BR' ? 'Receitas' : 'Revenues'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-zinc-800 dark:bg-zinc-400 inline-block shrink-0" />
                {locale === 'pt-BR' ? 'Despesas Totais' : 'Total Expenses'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-terracotta-500 inline-block shrink-0" />
                {locale === 'pt-BR' ? 'Custo Veterinário' : 'Veterinary Care'}
              </span>
            </div>
          </div>

          {/* Scrollable Interactive Bar Chart Wrapper */}
          <div className="w-full overflow-x-auto pb-2">
            <div className="grid grid-cols-12 gap-2 items-end h-52 pt-4 pb-2 border-b border-zinc-200 dark:border-zinc-800 min-w-[560px]">
              {summary.monthlySeries.map((item, idx) => {
                const revHeight = Math.max(8, Math.round((item.revenue / maxMonthlyVal) * 160));
                const expHeight = Math.max(8, Math.round((item.expenses / maxMonthlyVal) * 160));
                const vetHeight = Math.max(4, Math.round((item.veterinary / maxMonthlyVal) * 160));
                const isSelected = idx === selectedMonthIndex;

                return (
                  <button
                    key={item.month}
                    type="button"
                    onClick={() => setSelectedMonthIndex(idx)}
                    className={`flex flex-col items-center group focus:outline-none p-1 rounded transition-colors ${
                      isSelected
                        ? 'bg-zinc-100 dark:bg-zinc-800/90 ring-1 ring-zinc-300 dark:ring-zinc-700'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-end justify-center gap-1 w-full h-40">
                      <div
                        style={{ height: `${revHeight}px` }}
                        className="w-2.5 bg-emerald-700 dark:bg-emerald-500 rounded-t-sm transition-all"
                        title={`Receita ${item.month}: ${formatCurrencyBRL(item.revenue, locale)}`}
                      />
                      <div
                        style={{ height: `${expHeight}px` }}
                        className="w-2.5 bg-zinc-800 dark:bg-zinc-400 rounded-t-sm relative flex items-end overflow-hidden transition-all"
                        title={`Despesa ${item.month}: ${formatCurrencyBRL(item.expenses, locale)}`}
                      >
                        <div
                          style={{ height: `${vetHeight}px` }}
                          className="w-full bg-terracotta-500"
                        />
                      </div>
                    </div>
                    <span
                      className={`mt-2 font-mono text-[10px] ${
                        isSelected
                          ? 'font-bold text-zinc-950 dark:text-white'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {item.month.slice(5)}/{item.month.slice(2, 4)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Month Inspector Bar */}
          {activeMonth && (
            <div className="mt-4 pt-2 grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
              <div>
                <span className="text-zinc-500 block font-mono uppercase text-[10px]">
                  {locale === 'pt-BR' ? 'Competência Selecionada' : 'Selected Month'}
                </span>
                <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {activeMonth.month}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block font-mono uppercase text-[10px]">
                  {locale === 'pt-BR' ? 'Receita Mensal' : 'Monthly Revenue'}
                </span>
                <span className="font-mono font-semibold text-sm text-emerald-700 dark:text-emerald-400">
                  {formatCurrencyBRL(activeMonth.revenue, locale)}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block font-mono uppercase text-[10px]">
                  {locale === 'pt-BR' ? 'Despesa Total' : 'Total Expense'}
                </span>
                <span className="font-mono font-semibold text-sm text-rose-700 dark:text-rose-400">
                  {formatCurrencyBRL(activeMonth.expenses, locale)}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block font-mono uppercase text-[10px]">
                  {locale === 'pt-BR' ? 'Clínica Veterinária' : 'Veterinary Care'}
                </span>
                <span className="font-mono font-semibold text-sm text-zinc-800 dark:text-zinc-200">
                  {formatCurrencyBRL(activeMonth.veterinary, locale)}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-zinc-500 block font-mono uppercase text-[10px]">
                  {locale === 'pt-BR' ? 'Resultado Líquido' : 'Net Result'}
                </span>
                <span
                  className={`font-mono font-bold text-sm ${
                    activeMonth.net >= 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {activeMonth.net >= 0 ? '+' : ''}
                  {formatCurrencyBRL(activeMonth.net, locale)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* General Ledger Table */}
      <div className="rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-zinc-500 shrink-0" />
            <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
              {t.finance.ledgerTableTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={ledgerFilterType}
              onChange={(e) =>
                setLedgerFilterType(e.target.value as 'ALL' | 'REVENUE' | 'EXPENSE')
              }
              aria-label="Filtrar por natureza contábil"
              className="w-full sm:w-auto px-2.5 py-2 sm:py-1.5 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
            >
              <option value="ALL">
                {locale === 'pt-BR' ? 'Todas as Naturezas' : 'All Entry Types'}
              </option>
              <option value="REVENUE">
                {locale === 'pt-BR' ? 'Apenas Receitas (+)' : 'Revenues Only (+)'}
              </option>
              <option value="EXPENSE">
                {locale === 'pt-BR' ? 'Apenas Despesas (-)' : 'Expenses Only (-)'}
              </option>
            </select>

            <select
              value={ledgerFilterMonth}
              onChange={(e) => setLedgerFilterMonth(e.target.value)}
              aria-label="Filtrar por competência mensal"
              className="w-full sm:w-auto px-2.5 py-2 sm:py-1.5 text-xs font-mono rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
            >
              <option value="ALL">
                {locale === 'pt-BR' ? 'Todos os Meses (12m)' : 'All Months (12m)'}
              </option>
              {summary.monthlySeries
                .slice()
                .reverse()
                .map((m) => (
                  <option key={m.month} value={m.month}>
                    {m.month}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="w-full overflow-x-auto max-h-96">
          <table className="w-full min-w-[680px] text-left border-collapse text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 sticky top-0">
              <tr className="font-mono uppercase text-[11px] text-zinc-500 dark:text-zinc-400">
                <th className="py-3 px-4">{t.finance.colMonth}</th>
                <th className="py-3 px-4">{t.finance.colType}</th>
                <th className="py-3 px-4">{t.finance.colCategory}</th>
                <th className="py-3 px-4">{t.finance.colDescription}</th>
                <th className="py-3 px-4">{t.finance.colDocRef}</th>
                <th className="py-3 px-4 text-right">{t.finance.colAmount}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredEntries.slice(0, 35).map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                    {entry.month}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                        entry.type === 'REVENUE'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {entry.type === 'REVENUE'
                        ? locale === 'pt-BR'
                          ? 'RECEITA'
                          : 'REVENUE'
                        : locale === 'pt-BR'
                        ? 'DESPESA'
                        : 'EXPENSE'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                    {translateCategory(entry.category)}
                  </td>
                  <td className="py-3 px-4 text-zinc-900 dark:text-zinc-100 font-medium">
                    {locale === 'pt-BR' ? entry.titlePt : entry.titleEn}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                    {entry.documentRef ? (
                      <span className="inline-flex items-center gap-1">
                        <FileCheck2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        {entry.documentRef}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td
                    className={`py-3 px-4 font-mono font-semibold text-right whitespace-nowrap ${
                      entry.type === 'REVENUE'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {entry.type === 'REVENUE' ? '+' : '-'}
                    {formatCurrencyBRL(entry.amount, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
