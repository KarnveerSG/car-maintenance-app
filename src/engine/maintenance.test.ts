import { describe, expect, it } from 'vitest'
import { createVehicle } from './vehicles'
import { computeUpcomingServices, overdueCount, dueSoonCount } from './maintenance'

describe('computeUpcomingServices', () => {
  it('projects oil change from last completed service', () => {
    const vehicle = createVehicle({
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      currentMileage: 30000,
      purchaseDate: '2020-01-01',
      drivingCondition: 'normal',
    })
    vehicle.serviceRecords.push({
      id: '1',
      category: 'oil',
      description: 'Oil change',
      date: '2025-01-01',
      mileage: 25000,
      cost: 60,
      shop: 'Shop',
      status: 'completed',
      notes: '',
      attachments: [],
    })

    const services = computeUpcomingServices(vehicle, '2025-06-01')
    const oil = services.find((s) => s.category === 'oil')
    expect(oil).toBeDefined()
    expect(oil!.dueMileage).toBe(30000)
  })

  it('counts overdue and due soon services', () => {
    const vehicle = createVehicle({
      currentMileage: 100000,
      purchaseDate: '2020-01-01',
      drivingCondition: 'severe',
    })
    const services = computeUpcomingServices(vehicle, '2026-06-18')
    expect(overdueCount(services)).toBeGreaterThan(0)
    expect(dueSoonCount(services)).toBeGreaterThanOrEqual(0)
  })
})
