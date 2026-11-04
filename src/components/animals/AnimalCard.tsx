'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  CheckCircle2,
  MapPin,
  X,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatPhoneBR } from '@/lib/validators/cnpj';

export interface AnimalItem {
  id: string;
  ngoId: string;
  name: string;
  species: string;
  breed: string;
  ageMonths: number;
  ageGroup: string;
  size: string;
  gender: string;
  temperament: string;
  vaccinated: boolean;
  neutered: boolean;
  microchipped: boolean;
  specialNeeds: boolean;
  descriptionPt: string;
  descriptionEn: string;
  photoUrl: string;
  status: string;
  ngo?: {
    id: string;
    slug: string;
    tradeName: string;
    city: string;
    state: string;
  };
}

export function AnimalCard({
  animal,
  showNgoBadge = false,
}: {
  animal: AnimalItem;
  showNgoBadge?: boolean;
}) {
  const { locale, t, favoriteIds, toggleFavorite, user } = useApp();
  const isFav = favoriteIds.includes(animal.id);

  const [inquireOpen, setInquireOpen] = useState(false);
  const [applicantName, setApplicantName] = useState(user?.name || '');
  const [applicantEmail, setApplicantEmail] = useState(user?.email || '');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [cityState, setCityState] = useState(
    animal.ngo ? `${animal.ngo.city} - ${animal.ngo.state}` : 'São Paulo - SP'
  );
  const [housingType, setHousingType] = useState('APARTMENT');
  const [hasOtherPets, setHasOtherPets] = useState(false);
  const [safeScreens, setSafeScreens] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedOk, setSubmittedOk] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const labels = t.animalLabels as Record<string, string>;

  const formatAge = (months: number) => {
    if (months < 12) {
      return `${months} ${locale === 'pt-BR' ? 'meses' : 'mo'}`;
    }
    const years = Math.floor(months / 12);
    return `${years} ${
      locale === 'pt-BR'
        ? years === 1
          ? 'ano'
          : 'anos'
        : years === 1
        ? 'yr'
        : 'yrs'
    }`;
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animalId: animal.id,
          ngoId: animal.ngoId,
          applicantName,
          applicantEmail,
          applicantPhone,
          cityState,
          housingType,
          hasOtherPets,
          safeScreens,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Erro ao enviar formulário.');
      } else {
        setSubmittedOk(true);
      }
    } catch {
      setErrorMsg('Falha de conexão ao enviar pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <article className="group rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col justify-between transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
        <div>
          {/* Image Container */}
          <div className="relative h-56 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={animal.photoUrl}
              alt={animal.name}
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
            />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-white/95 dark:bg-zinc-950/90 text-zinc-900 dark:text-zinc-100 font-mono text-[11px] font-semibold border border-zinc-200 dark:border-zinc-800">
                {labels[animal.species] || animal.species} • {formatAge(animal.ageMonths)}
              </span>
              {animal.specialNeeds && (
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-semibold">
                  {labels.specialNeeds}
                </span>
              )}
            </div>

            {/* Favorite Button */}
            <button
              type="button"
              onClick={() => toggleFavorite(animal.id)}
              aria-label={`Favoritar ${animal.name}`}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/95 dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:scale-105 transition-transform"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFav ? 'fill-rose-600 text-rose-600' : 'text-zinc-600 dark:text-zinc-300'
                }`}
              />
            </button>
          </div>

          {/* Card Content */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                {animal.name}
              </h3>
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                {labels[animal.size] || animal.size}
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              {animal.breed} • {labels[animal.gender] || animal.gender}
            </p>

            {showNgoBadge && animal.ngo && (
              <Link
                href={`/ongs/${animal.ngo.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline mb-3"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {animal.ngo.tradeName} ({animal.ngo.city}/{animal.ngo.state})
                </span>
              </Link>
            )}

            <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed mb-4">
              {locale === 'pt-BR' ? animal.descriptionPt : animal.descriptionEn}
            </p>

            {/* Clinical Protocol Badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {animal.vaccinated && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 text-[11px] font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  {labels.vaccinated}
                </span>
              )}
              {animal.neutered && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 text-[11px] font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  {labels.neutered}
                </span>
              )}
              {animal.microchipped && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-mono">
                  {labels.microchipped}
                </span>
              )}
            </div>

            {/* Temperament Tags */}
            <div className="flex flex-wrap gap-1">
              {animal.temperament
                .split(',')
                .filter(Boolean)
                .map((tag) => {
                  const clean = tag.trim();
                  return (
                    <span
                      key={clean}
                      className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 font-mono text-[10px]"
                    >
                      {labels[clean] || clean}
                    </span>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="px-5 pb-5 pt-2">
          <button
            type="button"
            onClick={() => {
              setApplicantName(user?.name || '');
              setApplicantEmail(user?.email || '');
              setSubmittedOk(false);
              setInquireOpen(true);
            }}
            className="w-full py-2.5 px-4 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            {t.ngoDetail.adoptButton} • {animal.name}
          </button>
        </div>
      </article>

      {/* Adoption Inquiry Modal */}
      {inquireOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md max-w-lg w-full p-6 shadow-xl my-8">
            <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-emerald-700 dark:text-emerald-400 font-semibold">
                  {animal.name} ({animal.breed})
                </span>
                <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  {t.ngoDetail.inquireModalTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInquireOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedOk ? (
              <div className="py-6 text-center space-y-3">
                <ShieldCheck className="w-10 h-10 text-emerald-700 dark:text-emerald-400 mx-auto" />
                <h4 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
                  {locale === 'pt-BR'
                    ? 'Solicitação de Adoção Protocolada!'
                    : 'Adoption Inquiry Submitted!'}
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  {locale === 'pt-BR'
                    ? `A equipe de triagem da ONG responsável recebeu seu perfil residencial para adoção de ${animal.name} e entrará em contato em até 48h.`
                    : `The shelter screening team has received your household profile for ${animal.name} and will reach out within 48 hours.`}
                </p>
                <button
                  type="button"
                  onClick={() => setInquireOpen(false)}
                  className="mt-2 px-5 py-2 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold"
                >
                  {locale === 'pt-BR' ? 'Fechar' : 'Close'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-3 text-xs">
                {errorMsg && (
                  <div className="p-3 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      {locale === 'pt-BR' ? 'Seu Nome Completo *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                      placeholder="Nome e Sobrenome"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                      placeholder="contato@email.com.br"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      {locale === 'pt-BR' ? 'Telefone / WhatsApp *' : 'Phone / WhatsApp *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(formatPhoneBR(e.target.value))}
                      className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                      placeholder="(11) 98765-4321"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      {locale === 'pt-BR' ? 'Cidade / UF *' : 'City / State *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={cityState}
                      onChange={(e) => setCityState(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      {locale === 'pt-BR' ? 'Tipo de Imóvel' : 'Housing Type'}
                    </label>
                    <select
                      value={housingType}
                      onChange={(e) => setHousingType(e.target.value)}
                      className="w-full px-2.5 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="APARTMENT">
                        {locale === 'pt-BR' ? 'Apartamento' : 'Apartment'}
                      </option>
                      <option value="HOUSE">
                        {locale === 'pt-BR' ? 'Casa Murada' : 'Fenced House'}
                      </option>
                      <option value="RURAL">
                        {locale === 'pt-BR' ? 'Chácara / Sítio' : 'Rural Property'}
                      </option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 pt-5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={safeScreens}
                      onChange={(e) => setSafeScreens(e.target.checked)}
                      className="rounded border-zinc-300"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {locale === 'pt-BR' ? 'Janelas Teladas / Seguras' : 'Safety Screens Installed'}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 pt-5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasOtherPets}
                      onChange={(e) => setHasOtherPets(e.target.checked)}
                      className="rounded border-zinc-300"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {locale === 'pt-BR' ? 'Possui outros animais' : 'Has other pets'}
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    {locale === 'pt-BR'
                      ? 'Conte sobre sua rotina familiar e ambiente *'
                      : 'Tell us about your household routine and environment *'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                    placeholder={
                      locale === 'pt-BR'
                        ? 'Descreva horários de passeio, espaço disponível e experiência prévia com animais...'
                        : 'Describe walk schedules, space available, and prior experience with pets...'
                    }
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setInquireOpen(false)}
                    className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                  >
                    {locale === 'pt-BR' ? 'Cancelar' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded bg-brand-700 hover:bg-brand-800 text-white font-semibold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {submitting
                        ? '...'
                        : locale === 'pt-BR'
                        ? 'Enviar Solicitação'
                        : 'Submit Inquiry'}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
