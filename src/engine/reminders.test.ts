import { describe, expect, it } from 'vitest'
import { createReminder, evaluateReminder, generateRemindersFromSchedule } from './reminders'
import { createVehicle } from './vehicles'

describe('evaluateReminder', () => {
  it('marks past due date as overdue', () => {
    const reminder = createReminder({
      title: 'Oil',
      category: 'oil',
      basis: 'date',
      dueDate: '2020-01-01',
    })
    const event = evaluateReminder(reminder, 50000, '2026-06-18')
    expect(event.urgency).toBe('overdue')
    expect(event.daysRemaining).toBeLessThan(0)
  })

  it('marks completed reminders as done', () => {
    const reminder = createReminder({ completed: true, dueDate: '2020-01-01' })
    const event = evaluateReminder(reminder, 50000, '2026-06-18')
    expect(event.urgency).toBe('done')
  })

  it('marks mileage-based reminder overdue when past due mileage', () => {
    const reminder = createReminder({
      basis: 'mileage',
      dueMileage: 40000,
      dueDate: null,
    })
    const event = evaluateReminder(reminder, 45000, '2026-06-18')
    expect(event.urgency).toBe('overdue')
  })
})

describe('generateRemindersFromSchedule', () => {
  it('skips reminders that already exist by title', () => {
    const vehicle = createVehicle({
      currentMileage: 100000,
      purchaseDate: '2020-01-01',
      drivingCondition: 'severe',
    })
    vehicle.reminders.push(
      createReminder({ title: 'Oil & Filter Change', category: 'oil', dueDate: '2026-01-01', dueMileage: 103000 })
    )
    const generated = generateRemindersFromSchedule(vehicle, '2026-06-18')
    expect(generated.some((r) => r.title.toLowerCase() === 'oil & filter change')).toBe(false)
  })
})
