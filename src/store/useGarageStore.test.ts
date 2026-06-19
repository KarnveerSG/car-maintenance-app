import { describe, expect, it } from 'vitest'
import { exportAppState, parseAppState } from './useGarageStore'
import type { AppState } from '../types'

const sampleState: AppState = {
  hasOnboarded: true,
  activeVehicleId: 'v1',
  preferences: { currency: 'USD', distanceUnit: 'mi', lightMode: false },
  vehicles: [
    {
      id: 'v1',
      profile: {
        name: 'Daily Driver',
        make: 'Toyota',
        model: 'Corolla',
        year: 2019,
        vin: '',
        licensePlate: '',
        color: '',
        currentMileage: 62000,
        averageMonthlyDistance: 1100,
        drivingCondition: 'normal',
        purchaseDate: '2019-04-15',
      },
      serviceRecords: [
        {
          id: 's1',
          category: 'oil',
          description: 'Oil change',
          date: '2026-04-02',
          mileage: 60500,
          cost: 72,
          shop: 'QuickLube',
          status: 'completed',
          notes: '',
          attachments: [],
        },
      ],
      reminders: [],
      mileageHistory: [],
      budget: { monthlyBudget: 150, annualBudget: 1800 },
    },
  ],
}

describe('useGarageStore export/import helpers', () => {
  it('round-trips app state through JSON export', () => {
    const json = exportAppState(sampleState)
    const parsed = parseAppState(json)
    expect(parsed.vehicles).toHaveLength(1)
    expect(parsed.vehicles[0].serviceRecords[0].description).toBe('Oil change')
    expect(parsed.preferences.currency).toBe('USD')
  })

  it('rejects invalid export JSON', () => {
    expect(() => parseAppState('{"vehicles":"not-an-array"}')).toThrow('Invalid export file')
    expect(() => parseAppState('not json')).toThrow()
  })
})
