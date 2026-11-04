'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Sun,
  Moon,
  Globe,
  Heart,
  LogIn,
  LogOut,
  UserCheck,
  Building2,
  FileSpreadsheet,
  SlidersHorizontal,
  X,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function Header() {
  const {
    locale,
    setLocale,
    t,
    theme,
    toggleTheme,
    user,
    logout,
    quickLoginAs,
    favoriteIds,
    authModalOpen,
    setAuthModalOpen,
    refreshUser,
  } = useApp();

  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: authTab,
          email,
          password,
          name: authTab === 'register' ? name : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Falha na autenticação.');
      } else {
        await refreshUser();
        setAuthModalOpen(false);
        setEmail('');
        setPassword('');
        setName('');
      }
    } catch {
      setAuthError('Erro de conexão com o servidor.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleQuickDemoRole = async (
    demoEmail: string,
    demoPass: string,
    redirectPath?: string
  ) => {
    setRoleDropdownOpen(false);
    const ok = await quickLoginAs(demoEmail, demoPass);
    if (ok && redirectPath) {
      router.push(redirectPath);
    }
  };

  const navItems = [
    { href: '/', label: t.nav.home },
    { href: '/ongs', label: t.nav.ngos },
    { href: '/ongs/cadastrar', label: t.nav.registerNgo },
    {
      href: '/dashboard/finances',
      label: t.nav.finances,
      icon: FileSpreadsheet,
    },
    {
      href: '/admin',
      label: t.nav.admin,
      icon: SlidersHorizontal,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
        {/* Top institutional bar */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800/80 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-600" />
              <span>
                {locale === 'pt-BR'
                  ? 'SISTEMA PÚBLICO DE ADOÇÃO & AUDITORIA CONTÁBIL • RECEITA FEDERAL / MÓDULO-11'
                  : 'PUBLIC ADOPTION & FINANCIAL AUDIT SYSTEM • VERIFIED CNPJ REGISTRY'}
              </span>
            </div>

            {/* RBAC Quick Demo Switcher for instant evaluation */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>
                  {user
                    ? `${user.name.split(' ')[0]} (${user.role})`
                    : t.nav.roleSwitch}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded shadow-lg py-1.5 z-50">
                  <div className="px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                    {locale === 'pt-BR'
                      ? 'Alternar Perfil RBAC (1-Clique)'
                      : 'Switch RBAC Profile (1-Click)'}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickDemoRole(
                        'contato@pataspaulistas.org.br',
                        'ong123',
                        '/dashboard/finances'
                      )
                    }
                    className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-start gap-2.5"
                  >
                    <Building2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {locale === 'pt-BR'
                          ? 'Perfil 2: ONG (Instituto Patas Paulistas)'
                          : 'Role 2: NGO Manager (Patas Paulistas)'}
                      </div>
                      <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                        CRUD de Finanças, Catálogo de Animais e Adoções
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickDemoRole('admin@adoteaki.org.br', 'admin123', '/admin')
                    }
                    className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-start gap-2.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {locale === 'pt-BR'
                          ? 'Perfil 1: Administrador do Sistema'
                          : 'Role 1: System Administrator'}
                      </div>
                      <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                        Aprovar/Suspender ONGs, Usuários e Log de Auditoria
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickDemoRole('apoiador@adoteaki.org.br', 'apoiador123')
                    }
                    className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-start gap-2.5"
                  >
                    <Heart className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {locale === 'pt-BR'
                          ? 'Perfil 3: Apoiador / Adotante Público'
                          : 'Role 3: Public Supporter / Adopter'}
                      </div>
                      <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                        Favoritar animais, solicitar adoção e auditar balanços
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded bg-brand-700 dark:bg-brand-600 text-white flex items-center justify-center font-serif font-bold text-lg tracking-tight">
                A
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg leading-none text-zinc-900 dark:text-zinc-100 tracking-tight">
                  AdoteAki
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mt-0.5">
                  BR • Transparência Animal
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls: Language, Theme, Favorites, Auth */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLocale(locale === 'pt-BR' ? 'en' : 'pt-BR')}
              aria-label="Alternar idioma / Switch language"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-500" />
              <span>{locale === 'pt-BR' ? 'PT-BR' : 'EN-US'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Alternar tema claro ou escuro"
              className="p-2 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              title={
                theme === 'light'
                  ? 'Ativar modo escuro (Dark Mode)'
                  : 'Ativar modo claro (Light Mode #FFFFFF)'
              }
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Favorites indicator */}
            <Link
              href="/ongs#catalogo"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              title={t.nav.favorites}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  favoriteIds.length > 0
                    ? 'fill-rose-600 text-rose-600'
                    : 'text-zinc-500'
                }`}
              />
              <span className="font-mono">{favoriteIds.length}</span>
            </Link>

            {/* User Session / Login Button */}
            {user ? (
              <div className="flex items-center gap-2 pl-1">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-400">
                    {t.roles[user.role]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{t.nav.logout}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setAuthModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.nav.login}</span>
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Auth Modal (Login / Sign Up + Quick Credentials) */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-4">
              <div>
                <h2 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  {authTab === 'login' ? t.nav.login : t.nav.signup}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  AdoteAki • Acesso Autenticado RBAC
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-4 bg-zinc-100 dark:bg-zinc-800 p-1 rounded">
              <button
                type="button"
                onClick={() => setAuthTab('login')}
                className={`py-1.5 text-xs font-semibold rounded ${
                  authTab === 'login'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {t.nav.login}
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('register')}
                className={`py-1.5 text-xs font-semibold rounded ${
                  authTab === 'register'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {t.nav.signup}
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authTab === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    {locale === 'pt-BR' ? 'Nome Completo' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                    placeholder="Ex: Mariana Costa"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                  placeholder="seu@email.com.br"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  {locale === 'pt-BR' ? 'Senha' : 'Password'}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 rounded bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {authLoading
                  ? '...'
                  : authTab === 'login'
                  ? t.nav.login
                  : t.nav.signup}
              </button>
            </form>

            {/* Demo Quick-Fill Credentials Box */}
            <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                {locale === 'pt-BR'
                  ? 'Credenciais de Demonstração (Clique para Entrar):'
                  : 'Demo Credentials (Click to Sign In):'}
              </p>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={async () => {
                    await quickLoginAs('contato@pataspaulistas.org.br', 'ong123');
                    setAuthModalOpen(false);
                  }}
                  className="text-left px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between"
                >
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    ONG (Patas Paulistas SP)
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500">
                    contato@pataspaulistas.org.br
                  </span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await quickLoginAs('admin@adoteaki.org.br', 'admin123');
                    setAuthModalOpen(false);
                  }}
                  className="text-left px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between"
                >
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    Admin (Auditora Chefe)
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500">
                    admin@adoteaki.org.br
                  </span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await quickLoginAs('apoiador@adoteaki.org.br', 'apoiador123');
                    setAuthModalOpen(false);
                  }}
                  className="text-left px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between"
                >
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    Apoiador / Público
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500">
                    apoiador@adoteaki.org.br
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
