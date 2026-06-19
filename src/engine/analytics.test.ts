import { describe, expect, it } from 'vitest'
import { spendByCategory, spendByMonth, serviceCountByCategory } from './analytics'
import { createVehicle } from './vehicles'
import type { ServiceRecord } from '../types'

const record = (partial: Partial<ServiceRecord> & Pick<ServiceRecord, 'category' | 'cost' | 'date'>): ServiceRecord => ({
  id: partial.id ?? '1',
  description: partial.description ?? 'Service',
  mileage: partial.mileage ?? 1000,
  shop: partial.shop ?? '',
  status: partial.status ?? 'completed',
  notes: partial.notes ?? '',
  attachments: partial.attachments ?? [],
  ...partial,
})

describe('analytics', () => {
  it('aggregates lifetime spend by category', () => {
    const vehicle = createVehicle()
    vehicle.serviceRecords.push(
      record({ id: '1', category: 'oil', cost: 70, date: '2026-06-01' }),
      record({ id: '2', category: 'oil', cost: 30, date: '2026-05-01' }),
      record({ id: '3', category: 'tires', cost: 40, date: '2026-04-01' }),
      record({ id: '4', category: 'brakes', cost: 200, date: '2026-06-10', status: 'scheduled' })
    )

    const breakdown = spendByCategory(vehicle)
    const oil = breakdown.find((b) => b.category === 'oil')
    expect(oil?.total).toBe(100)
    expect(oil?.count).toBe(2)
    expect(breakdown.find((b) => b.category === 'brakes')).toBeUndefined()
  })

  it('returns monthly buckets for the last N months', () => {
    const vehicle = createVehicle()
    const now = new Date()
    const key = now.toISOString().slice(0, 7)
    vehicle.serviceRecords.push(record({ id: '1', category: 'oil', cost: 50, date: `${key}-10` }))

    const months = spendByMonth(vehicle, 6)
    expect(months).toHaveLength(6)
    expect(months[months.length - 1].total).toBe(50)
  })

  it('sorts service counts by frequency', () => {
    const vehicle = createVehicle()
    vehicle.serviceRecords.push(
      record({ id: '1', category: 'oil', cost: 10, date: '2026-01-01' }),
      record({ id: '2', category: 'oil', cost: 10, date: '2026-02-01' }),
      record({ id: '3', category: 'tires', cost: 10, date: '2026-03-01' })
    )

    const counts = serviceCountByCategory(vehicle)
    expect(counts[0].category).toBe('oil')
    expect(counts[0].count).toBe(2)
  })
})
