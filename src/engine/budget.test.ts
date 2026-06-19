import { describe, expect, it } from 'vitest'
import { createVehicle } from './vehicles'
import { calculateBudgetStatus, computePeriodSpend } from './budget'

describe('budget', () => {
  it('sums completed spend for the current month', () => {
    const vehicle = createVehicle()
    vehicle.budget = { monthlyBudget: 200, annualBudget: 2400 }
    vehicle.serviceRecords.push(
      {
        id: '1',
        category: 'oil',
        description: 'Oil',
        date: '2026-06-10',
        mileage: 1000,
        cost: 75,
        shop: '',
        status: 'completed',
        notes: '',
        attachments: [],
      },
      {
        id: '2',
        category: 'tires',
        description: 'Rotation',
        date: '2026-06-15',
        mileage: 1000,
        cost: 25,
        shop: '',
        status: 'completed',
        notes: '',
        attachments: [],
      },
      {
        id: '3',
        category: 'oil',
        description: 'Scheduled',
        date: '2026-06-20',
        mileage: 1000,
        cost: 999,
        shop: '',
        status: 'scheduled',
        notes: '',
        attachments: [],
      }
    )

    const spend = computePeriodSpend(vehicle, 'monthly', '2026-06-18')
    expect(spend.spent).toBe(100)
    expect(spend.remaining).toBe(100)
    expect(spend.overBudget).toBe(false)
  })

  it('calculates budget status with service count', () => {
    const vehicle = createVehicle()
    vehicle.budget = { monthlyBudget: 100, annualBudget: 1200 }
    vehicle.serviceRecords.push({
      id: '1',
      category: 'oil',
      description: 'Oil',
      date: '2026-06-10',
      mileage: 1000,
      cost: 50,
      shop: '',
      status: 'completed',
      notes: '',
      attachments: [],
    })

    const status = calculateBudgetStatus(vehicle, 'monthly', '2026-06-18')
    expect(status.serviceCount).toBe(1)
    expect(status.averagePerService).toBe(50)
    expect(status.percentUsed).toBe(50)
  })
})
