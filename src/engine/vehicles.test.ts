import { describe, expect, it } from 'vitest'
import { createVehicle, estimateCurrentMileage, vehicleLabel } from './vehicles'

describe('vehicles', () => {
  it('creates a vehicle with defaults and initial mileage history', () => {
    const vehicle = createVehicle({ make: 'Toyota', model: 'Corolla', year: 2020, currentMileage: 5000 })
    expect(vehicle.profile.make).toBe('Toyota')
    expect(vehicle.serviceRecords).toHaveLength(0)
    expect(vehicle.mileageHistory).toHaveLength(1)
    expect(vehicle.mileageHistory[0].mileage).toBe(5000)
  })

  it('builds a display label from year make model', () => {
    const vehicle = createVehicle({ make: 'Honda', model: 'Civic', year: 2019 })
    expect(vehicleLabel(vehicle)).toBe('2019 Honda Civic')
  })

  it('estimates mileage from latest reading and monthly average', () => {
    const vehicle = createVehicle({
      currentMileage: 10000,
      averageMonthlyDistance: 1000,
    })
    vehicle.mileageHistory = [{ id: '1', date: '2026-01-01', mileage: 10000 }]
    const estimated = estimateCurrentMileage(vehicle, '2026-06-01')
    expect(estimated).toBeGreaterThan(10000)
    expect(estimated).toBeLessThanOrEqual(16000)
  })

  it('falls back to profile mileage when no history exists', () => {
    const vehicle = createVehicle({ currentMileage: 42000 })
    vehicle.mileageHistory = []
    expect(estimateCurrentMileage(vehicle, '2026-06-18')).toBe(42000)
  })
})
