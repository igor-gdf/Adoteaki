/**
 * Brazilian CNPJ utilities: formatting mask and official Modulo-11 check-digit validation.
 */

export function stripCnpj(value: string): string {
  return (value || '').replace(/\D/g, '');
}

export function formatCnpj(value: string): string {
  const digits = stripCnpj(value).slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

export function isValidCnpj(rawCnpj: string): boolean {
  const cnpj = stripCnpj(rawCnpj);
  if (cnpj.length !== 14) return false;

  // Reject sequences of identical digits (e.g., 00000000000000)
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calcDigit = (slice: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += parseInt(slice[i], 10) * weights[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const digit1 = calcDigit(cnpj.slice(0, 12), weights1);
  const digit2 = calcDigit(cnpj.slice(0, 12) + digit1.toString(), weights2);

  return cnpj.endsWith(`${digit1}${digit2}`);
}

export function formatCurrencyBRL(value: number, locale: 'pt-BR' | 'en' = 'pt-BR'): string {
  return new Intl.NumberFormat(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPhoneBR(value: string): string {
  const digits = (value || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}
