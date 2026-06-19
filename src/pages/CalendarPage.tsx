import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/layout/AppLayout'
import { useGarageStore } from '../store/useGarageStore'
import { formatCurrency, formatDate, todayISO } from '../engine/format'
import {
  buildCalendarMonth,
  buildTimelineEvents,
  groupEventsByMonth,
  monthLabel,
  type TimelineEvent,
} from '../engine/timeline'
import type { Currency } from '../types'
import { SERVICE_CATEGORIES } from '../types'

type ViewMode = 'calendar' | 'timeline'

const KIND_LABELS: Record<TimelineEvent['kind'], string> = {
  service_completed: 'Service',
  service_scheduled: 'Scheduled',
  reminder: 'Reminder',
  mileage: 'Mileage',
  maintenance_due: 'Due',
}

const KIND_COLORS: Record<TimelineEvent['kind'], string> = {
  service_completed: '#c9a962',
  service_scheduled: '#d4a35a',
  reminder: '#6b8fbf',
  mileage: '#7d9b8a',
  maintenance_due: '#c96b6b',
}

const URGENCY_BORDER: Record<string, string> = {
  overdue: 'border-garage-danger/40',
  soon: 'border-garage-warning/40',
  upcoming: 'border-garage-border',
}

export function CalendarPage() {
  const { getActiveVehicle, preferences } = useGarageStore()
  const vehicle = getActiveVehicle()
  const [view, setView] = useState<ViewMode>('calendar')
  const today = todayISO()
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState(today)

  const events = useMemo(() => buildTimelineEvents(vehicle, today), [vehicle, today])
  const calendarDays = useMemo(() => buildCalendarMonth(events, year, month), [events, year, month])
  const monthGroups = useMemo(() => groupEventsByMonth(events), [events])
  const selectedEvents = events.filter((e) => e.date === selectedDate)

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  return (
    <div>
      <PageHeader title="Calendar & Timeline" subtitle="Services, reminders, and maintenance at a glance" />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setView('calendar')}
          className={`rounded-lg px-4 py-2 text-sm transition-colors ${
            view === 'calendar'
              ? 'bg-garage-amber text-garage-bg font-medium'
              : 'bg-garage-surface text-garage-muted hover:text-garage-text'
          }`}
        >
          Calendar
        </button>
        <button
          type="button"
          onClick={() => setView('timeline')}
          className={`rounded-lg px-4 py-2 text-sm transition-colors ${
            view === 'timeline'
              ? 'bg-garage-amber text-garage-bg font-medium'
              : 'bg-garage-surface text-garage-muted hover:text-garage-text'
          }`}
        >
          Timeline
        </button>
      </div>

      {view === 'calendar' ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <button type="button" onClick={() => shiftMonth(-1)} className="btn-ghost px-2">
                ‹
              </button>
              <h2 className="text-lg font-semibold">{monthLabel(year, month)}</h2>
              <button type="button" onClick={() => shiftMonth(1)} className="btn-ghost px-2">
                ›
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium uppercase text-garage-muted">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const isSelected = day.date === selectedDate
                const isToday = day.date === today
                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDate(day.date)}
                    className={`min-h-[72px] rounded-lg border p-1 text-left transition-colors sm:min-h-[88px] ${
                      day.inMonth ? 'bg-garage-bg' : 'bg-garage-elevated/50 opacity-50'
                    } ${isSelected ? 'border-garage-amber ring-1 ring-garage-amber/30' : 'border-garage-border hover:border-garage-amber/30'}`}
                  >
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        isToday ? 'bg-garage-amber font-semibold text-garage-bg' : ''
                      }`}
                    >
                      {new Date(day.date).getDate()}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {day.events.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          className="truncate rounded px-1 text-[10px] leading-tight"
                          style={{ backgroundColor: KIND_COLORS[e.kind] + '30', color: KIND_COLORS[e.kind] }}
                        >
                          {e.title}
                        </div>
                      ))}
                      {day.events.length > 2 && (
                        <p className="text-[10px] text-garage-muted">+{day.events.length - 2} more</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="card h-fit">
            <h3 className="mb-3 text-lg font-semibold">{formatDate(selectedDate)}</h3>
            {selectedEvents.length === 0 ? (
              <p className="text-sm text-garage-muted">No events on this day</p>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map((event) => (
                  <EventCard key={event.id} event={event} currency={preferences.currency} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {[...monthGroups.entries()].map(([monthKey, monthEvents]) => {
            const [y, m] = monthKey.split('-').map(Number)
            return (
              <section key={monthKey}>
                <h2 className="mb-4 font-serif text-xl font-semibold">{monthLabel(y, m - 1)}</h2>
                <div className="relative space-y-4 border-l-2 border-garage-border pl-6">
                  {monthEvents.map((event) => (
                    <div key={event.id} className="relative">
                      <span
                        className="absolute -left-[31px] top-3 h-3 w-3 rounded-full border-2 border-garage-bg"
                        style={{ backgroundColor: KIND_COLORS[event.kind] }}
                      />
                      <EventCard event={event} currency={preferences.currency} />
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
          {events.length === 0 && (
            <div className="card text-center text-garage-muted">
              <p>No events yet</p>
              <Link to="/service-history" className="mt-2 inline-block text-garage-amber hover:underline">
                Add a service record
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EventCard({ event, currency }: { event: TimelineEvent; currency: Currency }) {
  const category = event.category
    ? SERVICE_CATEGORIES.find((c) => c.value === event.category)
    : undefined
  const urgencyClass = event.urgency ? URGENCY_BORDER[event.urgency] : 'border-garage-border'

  return (
    <div className={`rounded-xl border bg-garage-elevated p-3 ${urgencyClass}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="badge"
          style={{ backgroundColor: KIND_COLORS[event.kind] + '25', color: KIND_COLORS[event.kind] }}
        >
          {KIND_LABELS[event.kind]}
        </span>
        {category && (
          <span className="badge" style={{ backgroundColor: category.color + '20', color: category.color }}>
            {category.label}
          </span>
        )}
        {event.urgency && (
          <span className="badge bg-garage-elevated text-garage-muted capitalize">{event.urgency}</span>
        )}
      </div>
      <p className="mt-2 font-medium">{event.title}</p>
      {event.subtitle && <p className="text-sm text-garage-muted">{event.subtitle}</p>}
      <div className="mt-1 flex flex-wrap gap-2 text-xs text-garage-muted">
        <span>{formatDate(event.date)}</span>
        {event.cost !== undefined && event.cost > 0 && (
          <span>· {formatCurrency(event.cost, currency)}</span>
        )}
      </div>
    </div>
  )
}
