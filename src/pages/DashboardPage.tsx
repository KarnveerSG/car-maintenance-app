import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/layout/AppLayout'
import { MetricCard } from '../components/shared/MetricCard'
import { useGarageStore } from '../store/useGarageStore'
import { formatCurrency, formatDistance, formatDate } from '../engine/format'
import { evaluateReminders } from '../engine/reminders'
import { computeUpcomingServices, overdueCount, dueSoonCount } from '../engine/maintenance'
import { calculateBudgetStatus } from '../engine/budget'
import type { BudgetPeriod } from '../types'

export function DashboardPage() {
  const { getActiveVehicle, preferences } = useGarageStore()
  const vehicle = getActiveVehicle()
  const [period, setPeriod] = useState<BudgetPeriod>('monthly')

  const completedRecords = vehicle.serviceRecords.filter((r) => r.status === 'completed')
  const recentRecords = completedRecords.slice(-5).reverse()

  const totalSpent = completedRecords.reduce((sum, r) => sum + r.cost, 0)
  const thisYear = new Date().getFullYear()
  const yearSpent = completedRecords
    .filter((r) => new Date(r.date).getFullYear() === thisYear)
    .reduce((sum, r) => sum + r.cost, 0)

  const upcomingReminders = evaluateReminders(vehicle).filter(
    (e) => !e.reminder.completed && (e.urgency === 'overdue' || e.urgency === 'soon' || e.urgency === 'upcoming')
  )
  const overdueEvents = upcomingReminders.filter((e) => e.urgency === 'overdue')
  const soonEvents = upcomingReminders.filter((e) => e.urgency === 'soon')
  const otherUpcomingEvents = upcomingReminders.filter((e) => e.urgency === 'upcoming')

  const schedule = computeUpcomingServices(vehicle)
  const scheduleOverdue = overdueCount(schedule)
  const scheduleSoon = dueSoonCount(schedule)

  const budgetStatus = calculateBudgetStatus(vehicle, period)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`${vehicle.profile.year} ${vehicle.profile.make} ${vehicle.profile.model}`}
      />

      <div className="mb-6 flex items-center gap-2">
        <label className="label mb-0">Period</label>
        <button
          type="button"
          onClick={() => setPeriod('monthly')}
          className={`rounded-lg px-3 py-1 text-sm transition-colors ${
            period === 'monthly'
              ? 'bg-garage-amber text-garage-bg font-medium'
              : 'bg-garage-surface text-garage-muted hover:text-garage-text'
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setPeriod('yearly')}
          className={`rounded-lg px-3 py-1 text-sm transition-colors ${
            period === 'yearly'
              ? 'bg-garage-amber text-garage-bg font-medium'
              : 'bg-garage-surface text-garage-muted hover:text-garage-text'
          }`}
        >
          Yearly
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Current Mileage"
          value={formatDistance(vehicle.profile.currentMileage, preferences.distanceUnit)}
          icon="◧"
        />
        <MetricCard
          label={`${period === 'monthly' ? 'Monthly' : 'Yearly'} Budget`}
          value={formatCurrency(budgetStatus.budget, preferences.currency)}
          subtitle={`${formatCurrency(budgetStatus.spent, preferences.currency)} spent (${budgetStatus.percentUsed.toFixed(0)}%)`}
          trend={budgetStatus.percentUsed > 90 ? 'down' : budgetStatus.percentUsed > 70 ? 'neutral' : 'up'}
          icon="◫"
        />
        <MetricCard
          label="This Year"
          value={formatCurrency(yearSpent, preferences.currency)}
          subtitle={`${completedRecords.filter((r) => new Date(r.date).getFullYear() === thisYear).length} services`}
          icon="◎"
        />
        <MetricCard
          label="All-Time Total"
          value={formatCurrency(totalSpent, preferences.currency)}
          subtitle={`${completedRecords.length} services`}
          icon="▤"
        />
        <MetricCard
          label="Schedule Overdue"
          value={scheduleOverdue}
          subtitle={scheduleOverdue > 0 ? 'services past due' : 'all on track'}
          trend={scheduleOverdue > 0 ? 'down' : 'up'}
          icon="⚠"
        />
        <MetricCard
          label="Due Soon"
          value={scheduleSoon}
          subtitle="within 30 days or 1,000 mi"
          trend={scheduleSoon > 0 ? 'neutral' : 'up'}
          icon="◷"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Service</h2>
            <Link to="/service-history" className="text-sm text-garage-amber hover:underline">
              View all
            </Link>
          </div>
          {recentRecords.length === 0 ? (
            <p className="text-garage-muted">No service records yet</p>
          ) : (
            <div className="space-y-3">
              {recentRecords.map((record) => (
                <div key={record.id} className="flex items-start justify-between border-b border-garage-border pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{record.description}</p>
                    <p className="text-sm text-garage-muted">
                      {formatDate(record.date)} · {formatDistance(record.mileage, preferences.distanceUnit)}
                    </p>
                  </div>
                  <p className="tabular-nums font-medium text-garage-amber">
                    {formatCurrency(record.cost, preferences.currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Reminders</h2>
            <Link to="/reminders" className="text-sm text-garage-amber hover:underline">
              Manage
            </Link>
          </div>
          {overdueEvents.length > 0 && (
            <div className="mb-4">
              <p className="label text-garage-danger">Overdue ({overdueEvents.length})</p>
              <div className="mt-2 space-y-2">
                {overdueEvents.slice(0, 3).map(({ reminder }) => (
                  <div key={reminder.id} className="rounded-lg border border-garage-danger/40 bg-garage-danger/10 px-3 py-2">
                    <p className="font-medium text-garage-danger">{reminder.title}</p>
                    <p className="text-sm text-garage-muted">
                      {reminder.dueDate && `Due: ${formatDate(reminder.dueDate)}`}
                      {reminder.dueDate && reminder.dueMileage && ' · '}
                      {reminder.dueMileage && `At: ${formatDistance(reminder.dueMileage, preferences.distanceUnit)}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {soonEvents.length > 0 && (
            <div className="mb-4">
              <p className="label text-garage-warning">Due Soon ({soonEvents.length})</p>
              <div className="mt-2 space-y-2">
                {soonEvents.slice(0, 3).map(({ reminder }) => (
                  <div key={reminder.id} className="rounded-lg border border-garage-warning/40 bg-garage-warning/10 px-3 py-2">
                    <p className="font-medium text-garage-warning">{reminder.title}</p>
                    <p className="text-sm text-garage-muted">
                      {reminder.dueDate && `Due: ${formatDate(reminder.dueDate)}`}
                      {reminder.dueDate && reminder.dueMileage && ' · '}
                      {reminder.dueMileage && `At: ${formatDistance(reminder.dueMileage, preferences.distanceUnit)}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {otherUpcomingEvents.length > 0 ? (
            <div>
              <p className="label">Upcoming</p>
              <div className="mt-2 space-y-2">
                {otherUpcomingEvents.slice(0, 3).map(({ reminder }) => (
                  <div key={reminder.id} className="rounded-lg bg-garage-elevated px-3 py-2">
                    <p className="font-medium">{reminder.title}</p>
                    <p className="text-sm text-garage-muted">
                      {reminder.dueDate && `Due: ${formatDate(reminder.dueDate)}`}
                      {reminder.dueDate && reminder.dueMileage && ' · '}
                      {reminder.dueMileage && `At: ${formatDistance(reminder.dueMileage, preferences.distanceUnit)}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : overdueEvents.length === 0 && soonEvents.length === 0 ? (
            <p className="text-garage-muted">No upcoming reminders</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
