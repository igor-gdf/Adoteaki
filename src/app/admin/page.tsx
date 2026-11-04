'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  Users,
  ScrollText,
  CheckCircle2,
  Ban,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrencyBRL } from '@/lib/validators/cnpj';

interface NgoAdminReport {
  id: string;
  slug: string;
  legalName: string;
  tradeName: string;
  cnpj: string;
  city: string;
  state: string;
  status: string;
  verifiedScore: number;
  initialBalance: number;
  totalRevenue: number;
  totalExpenses: number;
  currentBalance: number;
  entriesCount: number;
  documentationRate: number;
  animalsCount: number;
  totalAdoptions: number;
  financialUpdatedAt: string;
}

interface UserAdminItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  city: string | null;
  state: string | null;
  ngoName: string | null;
  createdAt: string;
}

interface AuditLogItem {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

export default function AdminGovernancePage() {
  const { locale, user, quickLoginAs } = useApp();

  const [tab, setTab] = useState<'ngos' | 'users' | 'audit'>('ngos');
  const [stats, setStats] = useState<{
    totalNgos: number;
    approvedNgos: number;
    pendingNgos: number;
    suspendedNgos: number;
    totalUsers: number;
    totalAnimals: number;
    totalInquiries: number;
  } | null>(null);
  const [ngoReports, setNgoReports] = useState<NgoAdminReport[]>([]);
  const [usersList, setUsersList] = useState<UserAdminItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setNgoReports(data.ngoReports || []);
        setUsersList(data.users || []);
        setAuditLogs(data.auditLogs || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleNgoStatus = async (
    ngoId: string,
    status: 'APPROVED' | 'SUSPENDED' | 'PENDING',
    verifiedScore?: number
  ) => {
    const res = await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: 'NGO',
        id: ngoId,
        status,
        verifiedScore,
      }),
    });
    if (res.ok) {
      await fetchAdminData();
      notify(`Status da ONG atualizado para ${status} e registrado no Log de Auditoria.`);
    }
  };

  const handleUserUpdate = async (
    userId: string,
    payload: { status?: string; role?: string }
  ) => {
    const res = await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: 'USER',
        id: userId,
        ...payload,
      }),
    });
    if (res.ok) {
      await fetchAdminData();
      notify('Cadastro de usuário atualizado com sucesso.');
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Quick Admin Role Switcher if not currently logged in as ADMIN */}
        {!isAdmin && (
          <div className="p-4 rounded border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-zinc-800 dark:text-zinc-200">
              <strong className="font-mono uppercase text-amber-900 dark:text-amber-300 block mb-0.5">
                {locale === 'pt-BR'
                  ? 'ACESSO RESTRITO • ENTRE COMO ADMINISTRADOR DO SISTEMA PARA APROVAR/SUSPENDER'
                  : 'RESTRICTED ACTIONS • SIGN IN AS SYSTEM ADMIN TO APPROVE OR SUSPEND'}
              </strong>
              <span>
                {locale === 'pt-BR'
                  ? 'Clique ao lado para autenticar como Helena Vasconcelos (Auditora Chefe - ADMIN) e executar ações de governança.'
                  : 'Click the button to sign in as System Administrator and execute governance actions.'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => quickLoginAs('admin@adoteaki.org.br', 'admin123')}
              className="px-4 py-2 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold shrink-0"
            >
              {locale === 'pt-BR'
                ? 'Autenticar como Admin (1-Clique)'
                : 'Sign In as System Admin (1-Click)'}
            </button>
          </div>
        )}

        {toast && (
          <div className="p-3.5 rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 text-xs font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>{toast}</span>
          </div>
        )}

        {/* Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <span className="font-mono text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
            GOVERNANÇA DA PLATAFORMA • AUDITORIA & CONTROLE DE ACESSO (RBAC)
          </span>
          <h1 className="font-serif font-bold text-3xl text-zinc-900 dark:text-zinc-100 mt-1">
            {locale === 'pt-BR'
              ? 'Painel de Administração, Compliance Fiscal e Log de Auditoria'
              : 'System Administration, Financial Compliance & Audit Log'}
          </h1>
        </div>

        {/* Summary Metrics */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="font-mono text-[11px] uppercase text-zinc-500 block">
                ONGs Cadastradas
              </span>
              <span className="font-mono font-bold text-2xl text-zinc-900 dark:text-zinc-100">
                {stats.totalNgos}
              </span>
              <span className="block text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 font-mono">
                {stats.approvedNgos} Aprovadas • {stats.pendingNgos} Pendentes
              </span>
            </div>

            <div className="p-4 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="font-mono text-[11px] uppercase text-zinc-500 block">
                Usuários Globais
              </span>
              <span className="font-mono font-bold text-2xl text-zinc-900 dark:text-zinc-100">
                {stats.totalUsers}
              </span>
              <span className="block text-[11px] text-zinc-500 mt-0.5 font-mono">
                Perfis Admin, ONG & Apoiador
              </span>
            </div>

            <div className="p-4 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="font-mono text-[11px] uppercase text-zinc-500 block">
                Animais Catalogados
              </span>
              <span className="font-mono font-bold text-2xl text-zinc-900 dark:text-zinc-100">
                {stats.totalAnimals}
              </span>
              <span className="block text-[11px] text-zinc-500 mt-0.5 font-mono">
                {stats.totalInquiries} pedidos de adoção
              </span>
            </div>

            <div className="p-4 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="font-mono text-[11px] uppercase text-zinc-500 block">
                Eventos de Auditoria
              </span>
              <span className="font-mono font-bold text-2xl text-emerald-700 dark:text-emerald-400">
                {auditLogs.length}
              </span>
              <span className="block text-[11px] text-zinc-500 mt-0.5 font-mono">
                Rastreabilidade Imutável
              </span>
            </div>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <button
            type="button"
            onClick={() => setTab('ngos')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold ${
              tab === 'ngos'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>
              {locale === 'pt-BR'
                ? '1. Homologação de ONGs & Relatórios de Transparência'
                : '1. NGO Approvals & Financial Transparency Reports'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab('users')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold ${
              tab === 'users'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>
              {locale === 'pt-BR'
                ? '2. Gestão Global de Usuários'
                : '2. Global Users Management'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab('audit')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold ${
              tab === 'audit'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <ScrollText className="w-4 h-4" />
            <span>
              {locale === 'pt-BR'
                ? '3. Log de Auditoria da Plataforma'
                : '3. Platform Audit Log'}
            </span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center font-mono text-xs text-zinc-500">
            Carregando relatórios de governança...
          </div>
        ) : (
          <>
            {/* TAB 1: NGO APPROVALS & FINANCIAL REPORTS */}
            {tab === 'ngos' && (
              <div className="rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 font-mono uppercase text-[11px] text-zinc-500">
                    <tr>
                      <th className="py-3.5 px-4">Organização / CNPJ</th>
                      <th className="py-3.5 px-4">UF</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Score / NFs</th>
                      <th className="py-3.5 px-4 text-right">Receitas (12m)</th>
                      <th className="py-3.5 px-4 text-right">Despesas (12m)</th>
                      <th className="py-3.5 px-4 text-right">Saldo Caixa</th>
                      <th className="py-3.5 px-4 text-right">Governança</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {ngoReports.map((ngo) => (
                      <tr key={ngo.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {ngo.tradeName}
                          </div>
                          <div className="font-mono text-[11px] text-zinc-500">
                            CNPJ {ngo.cnpj}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {ngo.city}/{ngo.state}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              ngo.status === 'APPROVED'
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : ngo.status === 'PENDING'
                                ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                            }`}
                          >
                            {ngo.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">
                            {ngo.verifiedScore}/100
                          </span>
                          <span className="block text-[10px] text-zinc-500">
                            {ngo.documentationRate}% c/ Doc Fiscal
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-right text-emerald-700 dark:text-emerald-400">
                          {formatCurrencyBRL(ngo.totalRevenue, locale)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-right text-rose-700 dark:text-rose-400">
                          {formatCurrencyBRL(ngo.totalExpenses, locale)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-right">
                          {formatCurrencyBRL(ngo.currentBalance, locale)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                          {ngo.status !== 'APPROVED' && (
                            <button
                              type="button"
                              disabled={!isAdmin}
                              onClick={() => handleNgoStatus(ngo.id, 'APPROVED', 95)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-700 text-white text-[11px] font-semibold disabled:opacity-40"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Aprovar
                            </button>
                          )}
                          {ngo.status !== 'SUSPENDED' && (
                            <button
                              type="button"
                              disabled={!isAdmin}
                              onClick={() => handleNgoStatus(ngo.id, 'SUSPENDED', 60)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-rose-300 text-rose-700 text-[11px] font-semibold disabled:opacity-40"
                            >
                              <Ban className="w-3 h-3" />
                              Suspender
                            </button>
                          )}
                          <Link
                            href={`/ongs/${ngo.slug}?tab=finances`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-zinc-300 dark:border-zinc-700 text-[11px] font-medium"
                          >
                            <span>Auditar</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: GLOBAL USERS MANAGEMENT */}
            {tab === 'users' && (
              <div className="rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 font-mono uppercase text-[11px] text-zinc-500">
                    <tr>
                      <th className="py-3.5 px-4">Nome</th>
                      <th className="py-3.5 px-4">E-mail</th>
                      <th className="py-3.5 px-4">Perfil (RBAC)</th>
                      <th className="py-3.5 px-4">ONG Vinculada</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {usersList.map((u) => (
                      <tr key={u.id}>
                        <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                          {u.name}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                          {u.email}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <select
                            value={u.role}
                            disabled={!isAdmin}
                            onChange={(e) =>
                              handleUserUpdate(u.id, { role: e.target.value })
                            }
                            className="px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="NGO">NGO</option>
                            <option value="SUPPORTER">SUPPORTER</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                          {u.ngoName || '—'}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            disabled={!isAdmin}
                            onClick={() =>
                              handleUserUpdate(u.id, {
                                status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                              })
                            }
                            className="px-2.5 py-1 rounded border border-zinc-300 dark:border-zinc-700 text-[11px] font-medium disabled:opacity-40"
                          >
                            {u.status === 'ACTIVE' ? 'Suspender Conta' : 'Reativar Conta'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: PLATFORM AUDIT LOG */}
            {tab === 'audit' && (
              <div className="rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 font-mono uppercase text-[11px] text-zinc-500">
                    <tr>
                      <th className="py-3.5 px-4">Data / Hora</th>
                      <th className="py-3.5 px-4">Ator / Perfil</th>
                      <th className="py-3.5 px-4">Evento</th>
                      <th className="py-3.5 px-4">Detalhamento da Operação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-3 px-4 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString(locale)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {log.actorName}
                          </span>
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px]">
                            {log.actorRole}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
