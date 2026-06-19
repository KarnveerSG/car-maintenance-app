import type { Currency, DistanceUnit } from '../types'

const LOCALES: Record<Currency, string> = {
  USD: 'en-US',
  CAD: 'en-CA',
  EUR: 'de-DE',
  GBP: 'en-GB',
}

export const createId = (): string => crypto.randomUUID()

export const formatCurrency = (value: number, currency: Currency = 'USD'): string =>
  new Intl.NumberFormat(LOCALES[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

export const formatCurrencyPrecise = (value: number, currency: Currency = 'USD'): string =>
  new Intl.NumberFormat(LOCALES[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

export const formatDistance = (value: number, unit: DistanceUnit = 'mi'): string =>
  `${new Intl.NumberFormat('en-US').format(Math.round(value))} ${unit}`

export const formatPercent = (value: number, decimals = 1): string => `${value.toFixed(decimals)}%`

export const formatDate = (iso: string): string => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const todayISO = (): string => new Date().toISOString().slice(0, 10)

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

export const daysBetween = (fromISO: string, toISO: string): number => {
  const from = new Date(fromISO).getTime()
  const to = new Date(toISO).getTime()
  return Math.round((to - from) / (1000 * 60 * 60 * 24))
}

export const addMonthsISO = (iso: string, months: number): string => {
  const d = new Date(iso)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}
