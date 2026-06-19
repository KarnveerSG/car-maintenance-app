import { describe, expect, it } from 'vitest'
import { addMonthsISO, clamp, daysBetween, formatDate, formatDistance, todayISO } from './format'

describe('format', () => {
  it('formats distance with unit', () => {
    expect(formatDistance(62000, 'mi')).toBe('62,000 mi')
    expect(formatDistance(100000, 'km')).toBe('100,000 km')
  })

  it('formats dates and handles empty input', () => {
    expect(formatDate('')).toBe('—')
    expect(formatDate('2026-06-18')).toMatch(/Jun/)
  })

  it('computes days between ISO dates', () => {
    expect(daysBetween('2026-06-01', '2026-06-18')).toBe(17)
    expect(daysBetween('2026-06-18', '2026-06-01')).toBe(-17)
  })

  it('adds months to an ISO date', () => {
    expect(addMonthsISO('2026-01-01', 1)).toMatch(/^2026-02/)
    expect(addMonthsISO('2026-01-01', 6)).toMatch(/^2026-07/)
    expect(addMonthsISO('2026-01-01', 12)).toMatch(/^2027-01/)
  })

  it('clamps values within bounds', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(99, 0, 10)).toBe(10)
  })

  it('returns today as ISO date string', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
