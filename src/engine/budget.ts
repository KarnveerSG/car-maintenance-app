import type { BudgetPeriod, ServiceRecord, Vehicle } from '../types'

export interface PeriodSpend {
  period: BudgetPeriod
  budget: number
  spent: number
  remaining: number
  percentUsed: number
  overBudget: boolean
}

const inMonth = (iso: string, year: number, month: number): boolean => {
  const d = new Date(iso)
  return d.getFullYear() === year && d.getMonth() === month
}

const inYear = (iso: string, year: number): boolean => new Date(iso).getFullYear() === year

const completedSpend = (records: ServiceRecord[], predicate: (iso: string) => boolean): number =>
  records
    .filter((r) => r.status === 'completed' && predicate(r.date))
    .reduce((sum, r) => sum + r.cost, 0)

export const computePeriodSpend = (
  vehicle: Vehicle,
  period: BudgetPeriod,
  asOfISO = new Date().toISOString().slice(0, 10)
): PeriodSpend => {
  const now = new Date(asOfISO)
  const year = now.getFullYear()
  const month = now.getMonth()

  const spent =
    period === 'monthly'
      ? completedSpend(vehicle.serviceRecords, (iso) => inMonth(iso, year, month))
      : completedSpend(vehicle.serviceRecords, (iso) => inYear(iso, year))

  const budget = period === 'monthly' ? vehicle.budget.monthlyBudget : vehicle.budget.annualBudget
  const remaining = budget - spent
  const percentUsed = budget > 0 ? (spent / budget) * 100 : 0

  return {
    period,
    budget,
    spent,
    remaining,
    percentUsed,
    overBudget: spent > budget,
  }
}

export const totalLifetimeSpend = (vehicle: Vehicle): number =>
  vehicle.serviceRecords
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + r.cost, 0)

export const costPerDistance = (vehicle: Vehicle): number => {
  const total = totalLifetimeSpend(vehicle)
  const mileage = vehicle.profile.currentMileage
  if (mileage <= 0) return 0
  return total / mileage
}

import { SERVICE_CATEGORIES } from '../types'
import type { ServiceCategory } from '../types'

export interface BudgetStatus {
  budget: number
  spent: number
  remaining: number
  percentUsed: number
  serviceCount: number
  averagePerService: number
}

export interface CategoryBreakdown {
  category: ServiceCategory
  label: string
  color: string
  total: number
  count: number
}

export const calculateBudgetStatus = (vehicle: Vehicle, period: BudgetPeriod, asOfISO = new Date().toISOString().slice(0, 10)): BudgetStatus => {
  const periodSpend = computePeriodSpend(vehicle, period, asOfISO)
  const count = vehicle.serviceRecords.filter((r) => {
    if (r.status !== 'completed') return false
    const now = new Date(asOfISO)
    const recordDate = new Date(r.date)
    if (period === 'monthly') {
      return recordDate.getFullYear() === now.getFullYear() && recordDate.getMonth() === now.getMonth()
    } else {
      return recordDate.getFullYear() === now.getFullYear()
    }
  }).length
  
  return {
    budget: periodSpend.budget,
    spent: periodSpend.spent,
    remaining: periodSpend.remaining,
    percentUsed: periodSpend.percentUsed,
    serviceCount: count,
    averagePerService: count > 0 ? periodSpend.spent / count : 0,
  }
}

export const getCategoryBreakdown = (vehicle: Vehicle, period: BudgetPeriod, asOfISO = new Date().toISOString().slice(0, 10)): CategoryBreakdown[] => {
  const now = new Date(asOfISO)
  const totals = new Map<ServiceCategory, { total: number; count: number }>()
  
  for (const record of vehicle.serviceRecords) {
    if (record.status !== 'completed') continue
    const recordDate = new Date(record.date)
    
    let include = false
    if (period === 'monthly') {
      include = recordDate.getFullYear() === now.getFullYear() && recordDate.getMonth() === now.getMonth()
    } else {
      include = recordDate.getFullYear() === now.getFullYear()
    }
    
    if (!include) continue
    
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
