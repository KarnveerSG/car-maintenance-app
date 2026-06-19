import type { ServiceCategory, Vehicle } from '../types'
import { SERVICE_CATEGORIES } from '../types'
import { computeUpcomingServices } from './maintenance'
import { evaluateReminders } from './reminders'

export type TimelineEventKind =
  | 'service_completed'
  | 'service_scheduled'
  | 'reminder'
  | 'mileage'
  | 'maintenance_due'

export interface TimelineEvent {
  id: string
  kind: TimelineEventKind
  date: string
  title: string
  subtitle?: string
  category?: ServiceCategory
  cost?: number
  urgency?: 'overdue' | 'soon' | 'upcoming'
}

const categoryLabel = (category: ServiceCategory): string =>
  SERVICE_CATEGORIES.find((c) => c.value === category)?.label ?? category

export const buildTimelineEvents = (vehicle: Vehicle, asOfISO: string): TimelineEvent[] => {
  const events: TimelineEvent[] = []

  for (const record of vehicle.serviceRecords) {
    events.push({
      id: `service-${record.id}`,
      kind: record.status === 'completed' ? 'service_completed' : 'service_scheduled',
      date: record.date,
      title: record.description,
      subtitle: [categoryLabel(record.category), record.shop].filter(Boolean).join(' · '),
      category: record.category,
      cost: record.cost,
    })
  }

  for (const { reminder, urgency } of evaluateReminders(vehicle, asOfISO)) {
    if (reminder.completed) continue
    const dueDate = reminder.dueDate ?? asOfISO
    events.push({
      id: `reminder-${reminder.id}`,
      kind: 'reminder',
      date: dueDate,
      title: reminder.title,
      subtitle: categoryLabel(reminder.category),
      category: reminder.category,
      cost: reminder.estimatedCost,
      urgency: urgency === 'done' ? undefined : urgency,
    })
  }

  for (const reading of vehicle.mileageHistory) {
    events.push({
      id: `mileage-${reading.id}`,
      kind: 'mileage',
      date: reading.date,
      title: 'Mileage logged',
      subtitle: `${reading.mileage.toLocaleString()} mi/km`,
    })
  }

  for (const service of computeUpcomingServices(vehicle, asOfISO)) {
    events.push({
      id: `schedule-${service.category}-${service.label}`,
      kind: 'maintenance_due',
      date: service.dueDate,
      title: service.label,
      subtitle: categoryLabel(service.category),
      category: service.category,
      cost: service.estimatedCost,
      urgency: service.urgency,
    })
  }

  return events.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))
}

export const groupEventsByMonth = (events: TimelineEvent[]): Map<string, TimelineEvent[]> => {
  const groups = new Map<string, TimelineEvent[]>()
  for (const event of events) {
    const key = event.date.slice(0, 7)
    const list = groups.get(key) ?? []
    list.push(event)
    groups.set(key, list)
  }
  return groups
}

export interface CalendarDay {
  date: string
  inMonth: boolean
  events: TimelineEvent[]
}

export const buildCalendarMonth = (
  events: TimelineEvent[],
  year: number,
  month: number
): CalendarDay[] => {
  const first = new Date(year, month, 1)
  const startOffset = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: CalendarDay[] = []

  for (let i = 0; i < startOffset; i++) {
    const d = new Date(year, month, -startOffset + i + 1)
    const iso = d.toISOString().slice(0, 10)
    days.push({ date: iso, inMonth: false, events: eventsForDate(events, iso) })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = new Date(year, month, day).toISOString().slice(0, 10)
    days.push({ date: iso, inMonth: true, events: eventsForDate(events, iso) })
  }

  while (days.length % 7 !== 0) {
    const last = new Date(days[days.length - 1].date)
    last.setDate(last.getDate() + 1)
    const iso = last.toISOString().slice(0, 10)
    days.push({ date: iso, inMonth: false, events: eventsForDate(events, iso) })
  }

  return days
}

export const eventsForDate = (events: TimelineEvent[], iso: string): TimelineEvent[] =>
  events.filter((e) => e.date === iso)

export const monthLabel = (year: number, month: number): string =>
  new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
