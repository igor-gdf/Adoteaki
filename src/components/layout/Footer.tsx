'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export function Footer() {
  const { locale, t } = useApp();

  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-zinc-200 dark:border-zinc-800">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-brand-700 text-white flex items-center justify-center font-serif font-bold text-sm">
                A
              </div>
              <span className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                AdoteAki
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed">
              {locale === 'pt-BR'
                ? 'Infraestrutura brasileira de adoção responsável e prestação de contas contábil para organizações do terceiro setor de proteção animal.'
                : 'Brazilian public infrastructure for responsible pet adoption and financial transparency for animal welfare NGOs.'}
            </p>
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-500">
              Conformidade MROSC (Lei Federal nº 13.019/2014) • Validação CNPJ Módulo-11
            </p>
          </div>

          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-semibold mb-3">
              {locale === 'pt-BR' ? 'Navegação Pública' : 'Public Navigation'}
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/" className="hover:text-zinc-950 dark:hover:text-white">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href="/ongs" className="hover:text-zinc-950 dark:hover:text-white">
                  {t.nav.ngos}
                </Link>
              </li>
              <li>
                <Link
                  href="/ongs/cadastrar"
                  className="hover:text-zinc-950 dark:hover:text-white"
                >
                  {t.nav.registerNgo}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-semibold mb-3">
              {locale === 'pt-BR' ? 'Portais de Governança' : 'Governance Portals'}
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link
                  href="/dashboard/finances"
                  className="hover:text-zinc-950 dark:hover:text-white"
                >
                  {t.nav.finances}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-zinc-950 dark:hover:text-white">
                  {t.nav.admin}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-4">
          <p>
            © {new Date().getFullYear()} AdoteAki Brasil.{' '}
            {locale === 'pt-BR'
              ? 'Código aberto para auditoria cidadã.'
              : 'Open ledger for citizen auditing.'}
          </p>
          <p className="font-mono">
            SQLite + Prisma ORM • Next.js App Router • Clean Architecture
          </p>
        </div>
      </div>
    </footer>
  );
}
