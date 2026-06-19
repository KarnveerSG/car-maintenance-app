import type { ServiceCategory, ServiceRecord, Vehicle } from '../types'
import { MAINTENANCE_SCHEDULE } from '../types'
import { todayISO } from './format'
import { estimateCurrentMileage } from './vehicles'

export interface UpcomingService {
  category: ServiceCategory
  label: string
  dueMileage: number
  dueDate: string
  distanceRemaining: number
  daysRemaining: number
  estimatedCost: number
  urgency: 'overdue' | 'soon' | 'upcoming'
}

const lastCompletedMileage = (records: ServiceRecord[], category: ServiceCategory): number => {
  const matches = records
    .filter((r) => r.category === category && r.status === 'completed')
    .sort((a, b) => b.mileage - a.mileage)
  return matches[0]?.mileage ?? 0
}

const lastCompletedDate = (records: ServiceRecord[], category: ServiceCategory): string | null => {
  const matches = records
    .filter((r) => r.category === category && r.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date))
  return matches[0]?.date ?? null
}

const classifyUrgency = (distanceRemaining: number, daysRemaining: number): UpcomingService['urgency'] => {
  if (distanceRemaining <= 0 || daysRemaining <= 0) return 'overdue'
  if (distanceRemaining <= 1000 || daysRemaining <= 30) return 'soon'
  return 'upcoming'
}

/* Build the projected service schedule for a vehicle based on its driving condition. */
export const computeUpcomingServices = (vehicle: Vehicle, asOfISO = todayISO()): UpcomingService[] => {
  const schedule = MAINTENANCE_SCHEDULE[vehicle.profile.drivingCondition]
  const currentMileage = estimateCurrentMileage(vehicle, asOfISO)

  return schedule
    .map((def) => {
      const baseMileage = lastCompletedMileage(vehicle.serviceRecords, def.category)
      const baseDate = lastCompletedDate(vehicle.serviceRecords, def.category) ?? vehicle.profile.purchaseDate
      const dueMileage = baseMileage + def.intervalDistance
      const dueDateObj = new Date(baseDate)
      dueDateObj.setMonth(dueDateObj.getMonth() + def.intervalMonths)
      const dueDate = dueDateObj.toISOString().slice(0, 10)

      const distanceRemaining = dueMileage - currentMileage
      const daysRemaining = Math.round(
        (dueDateObj.getTime() - new Date(asOfISO).getTime()) / (1000 * 60 * 60 * 24)
      )

      return {
        category: def.category,
        label: def.label,
        dueMileage,
        dueDate,
        distanceRemaining,
        daysRemaining,
        estimatedCost: def.estimatedCost,
        urgency: classifyUrgency(distanceRemaining, daysRemaining),
      }
    })
    .sort((a, b) => {
      const order = { overdue: 0, soon: 1, upcoming: 2 }
      if (order[a.urgency] !== order[b.urgency]) return order[a.urgency] - order[b.urgency]
      return a.distanceRemaining - b.distanceRemaining
    })
}

export const overdueCount = (services: UpcomingService[]): number =>
  services.filter((s) => s.urgency === 'overdue').length

export const dueSoonCount = (services: UpcomingService[]): number =>
  services.filter((s) => s.urgency === 'soon').length
