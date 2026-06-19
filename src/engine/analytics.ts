import type { ServiceCategory, Vehicle } from '../types'
import { SERVICE_CATEGORIES } from '../types'
import type { CategoryBreakdown } from './budget'

export interface MonthlySpend {
  month: string
  total: number
}

export const spendByCategory = (vehicle: Vehicle): CategoryBreakdown[] => {
  const totals = new Map<ServiceCategory, { total: number; count: number }>()
  for (const record of vehicle.serviceRecords) {
    if (record.status !== 'completed') continue
    const entry = totals.get(record.category) ?? { total: 0, count: 0 }
    entry.total += record.cost
    entry.count += 1
    totals.set(record.category, entry)
  }

  return SERVICE_CATEGORIES.filter((c) => totals.has(c.value))
    .map((c) => ({
      category: c.value,
      label: c.label,
      color: c.color,
      total: totals.get(c.value)!.total,
      count: totals.get(c.value)!.count,
    }))
    .sort((a, b) => b.total - a.total)
}

export const spendByMonth = (vehicle: Vehicle, months = 12): MonthlySpend[] => {
  const now = new Date()
  const buckets: MonthlySpend[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toISOString().slice(0, 7)
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    const total = vehicle.serviceRecords
      .filter((r) => r.status === 'completed' && r.date.slice(0, 7) === key)
      .reduce((sum, r) => sum + r.cost, 0)
    buckets.push({ month: label, total })
  }
  return buckets
}

export const serviceCountByCategory = (vehicle: Vehicle): CategoryBreakdown[] =>
  spendByCategory(vehicle).sort((a, b) => b.count - a.count)
