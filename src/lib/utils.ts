import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Taux BCEAO fixe : 1 EUR = 655,957 FCFA
const FCFA_PER_EUR = 655.957;

export function formatFCFA(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  return (
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) +
    ' FCFA'
  );
}

export function fcfaToEur(fcfa: number): number {
  return fcfa / FCFA_PER_EUR;
}

export function formatEUR(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDateFR(
  date: string | Date | null | undefined,
  opts?: Intl.DateTimeFormatOptions,
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...opts,
  });
}

export function formatDateTimeFR(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}