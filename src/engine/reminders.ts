import type { Reminder, Vehicle } from '../types'
import { createId, todayISO } from './format'
import { estimateCurrentMileage } from './vehicles'
import { computeUpcomingServices } from './maintenance'

export const createReminder = (partial: Partial<Reminder> = {}): Reminder => ({
  id: createId(),
  title: partial.title ?? '',
  category: partial.category ?? 'other',
  basis: partial.basis ?? 'date',
  dueDate: partial.dueDate ?? null,
  dueMileage: partial.dueMileage ?? null,
  intervalDays: partial.intervalDays ?? null,
  intervalDistance: partial.intervalDistance ?? null,
  estimatedCost: partial.estimatedCost ?? 0,
  notes: partial.notes ?? '',
  completed: partial.completed ?? false,
})

export type ReminderUrgency = 'overdue' | 'soon' | 'upcoming' | 'done'

export interface ReminderEvent {
  reminder: Reminder
  urgency: ReminderUrgency
  daysRemaining: number | null
  distanceRemaining: number | null
}

export const evaluateReminder = (
  reminder: Reminder,
  currentMileage: number,
  asOfISO = todayISO()
): ReminderEvent => {
  if (reminder.completed) {
    return { reminder, urgency: 'done', daysRemaining: null, distanceRemaining: null }
  }

  let daysRemaining: number | null = null
  let distanceRemaining: number | null = null

  if (reminder.basis === 'date' || reminder.basis === 'both') {
    if (reminder.dueDate) {
      daysRemaining = Math.round(
        (new Date(reminder.dueDate).getTime() - new Date(asOfISO).getTime()) / (1000 * 60 * 60 * 24)
      )
    }
  }

  if (reminder.basis === 'mileage' || reminder.basis === 'both') {
    if (reminder.dueMileage !== null) {
      distanceRemaining = reminder.dueMileage - currentMileage
    }
  }

  const overdue =
    (daysRemaining !== null && daysRemaining < 0) ||
    (distanceRemaining !== null && distanceRemaining < 0)
  const soon =
    (daysRemaining !== null && daysRemaining <= 14) ||
    (distanceRemaining !== null && distanceRemaining <= 500)

  const urgency: ReminderUrgency = overdue ? 'overdue' : soon ? 'soon' : 'upcoming'
  return { reminder, urgency, daysRemaining, distanceRemaining }
}

export const evaluateReminders = (vehicle: Vehicle, asOfISO = todayISO()): ReminderEvent[] => {
  const currentMileage = estimateCurrentMileage(vehicle, asOfISO)
  const order = { overdue: 0, soon: 1, upcoming: 2, done: 3 }
  return vehicle.reminders
    .map((r) => evaluateReminder(r, currentMileage, asOfISO))
    .sort((a, b) => order[a.urgency] - order[b.urgency])
}

/* Generate reminder drafts from the projected maintenance schedule (event generation). */
export const generateRemindersFromSchedule = (vehicle: Vehicle, asOfISO = todayISO()): Reminder[] => {
  const existingTitles = new Set(vehicle.reminders.map((r) => r.title.toLowerCase()))
  return computeUpcomingServices(vehicle, asOfISO)
    .filter((s) => s.urgency !== 'upcoming')
    .filter((s) => !existingTitles.has(s.label.toLowerCase()))
    .map((s) =>
      createReminder({
        title: s.label,
        category: s.category,
        basis: 'both',
        dueDate: s.dueDate,
        dueMileage: s.dueMileage,
        estimatedCost: s.estimatedCost,
        notes: 'Auto-generated from maintenance schedule',
      })
    )
}

export const getOverdueReminders = (reminders: Reminder[], currentMileage: number, asOfISO = todayISO()): Reminder[] => {
  return reminders
    .map((r) => ({ reminder: r, event: evaluateReminder(r, currentMileage, asOfISO) }))
    .filter(({ event }) => event.urgency === 'overdue')
    .map(({ reminder }) => reminder)
}

export const getUpcomingReminders = (reminders: Reminder[], currentMileage: number, daysAhead = 30, asOfISO = todayISO()): Reminder[] => {
  return reminders
    .map((r) => ({ reminder: r, event: evaluateReminder(r, currentMileage, asOfISO) }))
    .filter(({ event }) => {
      if (event.urgency === 'overdue' || event.urgency === 'done') return false
      if (event.daysRemaining !== null && event.daysRemaining <= daysAhead) return true
      if (event.distanceRemaining !== null && event.distanceRemaining <= 1000) return true
      return false
    })
    .map(({ reminder }) => reminder)
}
