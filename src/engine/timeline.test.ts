import { describe, expect, it } from 'vitest'
import { buildCalendarMonth, buildTimelineEvents, eventsForDate, groupEventsByMonth } from './timeline'
import { createReminder } from './reminders'
import { createVehicle } from './vehicles'

describe('timeline', () => {
  it('builds events from services, reminders, and mileage', () => {
    const vehicle = createVehicle({ make: 'Honda', model: 'Civic', year: 2021 })
    vehicle.serviceRecords.push({
      id: 'svc-1',
      category: 'oil',
      description: 'Oil change',
      date: '2026-06-01',
      mileage: 15000,
      cost: 70,
      shop: 'Shop',
      status: 'completed',
      notes: '',
      attachments: [],
    })
    vehicle.reminders.push(
      createReminder({ title: 'Registration', category: 'registration', dueDate: '2026-07-01', basis: 'date' })
    )
    vehicle.mileageHistory.push({ id: 'm-1', date: '2026-06-15', mileage: 15500 })

    const events = buildTimelineEvents(vehicle, '2026-06-18')
    expect(events.some((e) => e.kind === 'service_completed')).toBe(true)
    expect(events.some((e) => e.kind === 'reminder')).toBe(true)
    expect(events.some((e) => e.kind === 'mileage')).toBe(true)
    expect(events.some((e) => e.kind === 'maintenance_due')).toBe(true)
  })

  it('filters events for a specific date', () => {
    const vehicle = createVehicle()
    vehicle.serviceRecords.push({
      id: 'svc-1',
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
    const events = buildTimelineEvents(vehicle, '2026-06-18')
    const onDay = eventsForDate(events, '2026-06-10')
    expect(onDay).toHaveLength(1)
    expect(onDay[0].title).toBe('Oil')
  })

  it('builds a calendar month grid with padding days', () => {
    const days = buildCalendarMonth([], 2026, 5)
    expect(days.length % 7).toBe(0)
    expect(days.filter((d) => d.inMonth)).toHaveLength(30)
  })

  it('groups events by month key', () => {
    const vehicle = createVehicle()
    vehicle.serviceRecords.push({
      id: '1',
      category: 'oil',
      description: 'A',
      date: '2026-06-01',
      mileage: 0,
      cost: 0,
      shop: '',
      status: 'completed',
      notes: '',
      attachments: [],
    })
    vehicle.serviceRecords.push({
      id: '2',
      category: 'oil',
      description: 'B',
      date: '2026-05-01',
      mileage: 0,
      cost: 0,
      shop: '',
      status: 'completed',
      notes: '',
      attachments: [],
    })
    const groups = groupEventsByMonth(buildTimelineEvents(vehicle, '2026-06-18'))
    expect(groups.get('2026-06')?.length).toBeGreaterThan(0)
    expect(groups.get('2026-05')?.length).toBeGreaterThan(0)
  })
})
