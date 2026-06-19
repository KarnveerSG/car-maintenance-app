import type { Vehicle, VehicleProfile, BudgetSettings } from '../types'
import { createId, todayISO } from './format'

export const createDefaultProfile = (partial: Partial<VehicleProfile> = {}): VehicleProfile => ({
  name: partial.name ?? 'My Car',
  make: partial.make ?? '',
  model: partial.model ?? '',
  year: partial.year ?? new Date().getFullYear(),
  vin: partial.vin ?? '',
  licensePlate: partial.licensePlate ?? '',
  color: partial.color ?? '',
  currentMileage: partial.currentMileage ?? 0,
  averageMonthlyDistance: partial.averageMonthlyDistance ?? 1000,
  drivingCondition: partial.drivingCondition ?? 'normal',
  purchaseDate: partial.purchaseDate ?? todayISO(),
})

export const createDefaultBudget = (partial: Partial<BudgetSettings> = {}): BudgetSettings => ({
  monthlyBudget: partial.monthlyBudget ?? 150,
  annualBudget: partial.annualBudget ?? 1800,
})

export const createVehicle = (profile: Partial<VehicleProfile> = {}): Vehicle => {
  const resolved = createDefaultProfile(profile)
  return {
    id: createId(),
    profile: resolved,
    serviceRecords: [],
    reminders: [],
    mileageHistory:
      resolved.currentMileage > 0
        ? [{ id: createId(), date: todayISO(), mileage: resolved.currentMileage }]
        : [],
    budget: createDefaultBudget(),
  }
}

export const vehicleLabel = (vehicle: Vehicle): string => {
  const { profile } = vehicle
  const detail = [profile.year, profile.make, profile.model].filter(Boolean).join(' ')
  return detail || profile.name
}

/* Estimate current mileage from latest reading plus average monthly accrual. */
export const estimateCurrentMileage = (vehicle: Vehicle, asOfISO: string): number => {
  const readings = [...vehicle.mileageHistory].sort((a, b) => a.date.localeCompare(b.date))
  const latest = readings[readings.length - 1]
  if (!latest) return vehicle.profile.currentMileage
  const monthsElapsed = Math.max(
    0,
    (new Date(asOfISO).getTime() - new Date(latest.date).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  )
  return Math.round(latest.mileage + monthsElapsed * vehicle.profile.averageMonthlyDistance)
}
