import { describe, expect, it } from 'vitest'
import {
  attachmentSchema,
  mileageSchema,
  reminderSchema,
  serviceRecordSchema,
  vehicleProfileSchema,
} from './forms'

describe('forms schemas', () => {
  it('validates a complete vehicle profile', () => {
    const result = vehicleProfileSchema.safeParse({
      name: 'Daily Driver',
      make: 'Toyota',
      model: 'Corolla',
      year: 2019,
      currentMileage: 62000,
      averageMonthlyDistance: 1100,
      drivingCondition: 'normal',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid vehicle year', () => {
    const result = vehicleProfileSchema.safeParse({
      name: 'Car',
      make: 'X',
      model: 'Y',
      year: 1800,
      currentMileage: 0,
      averageMonthlyDistance: 0,
      drivingCondition: 'normal',
    })
    expect(result.success).toBe(false)
  })

  it('validates service records with default attachments', () => {
    const result = serviceRecordSchema.safeParse({
      category: 'oil',
      description: 'Oil change',
      date: '2026-06-18',
      mileage: 62000,
      cost: 72,
      status: 'completed',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.attachments).toEqual([])
  })

  it('validates attachment metadata', () => {
    const result = attachmentSchema.safeParse({
      id: 'a1',
      name: 'receipt.pdf',
      mimeType: 'application/pdf',
      size: 1024,
      dataUrl: 'data:application/pdf;base64,abc',
    })
    expect(result.success).toBe(true)
  })

  it('validates mileage log entries', () => {
    const result = mileageSchema.safeParse({ mileage: 62000, date: '2026-06-18' })
    expect(result.success).toBe(true)
  })

  it('requires reminder title', () => {
    const result = reminderSchema.safeParse({
      title: '',
      category: 'oil',
      basis: 'date',
      dueDate: '2026-07-01',
      dueMileage: null,
      intervalDays: null,
      intervalDistance: null,
      estimatedCost: 0,
    })
    expect(result.success).toBe(false)
  })
})
