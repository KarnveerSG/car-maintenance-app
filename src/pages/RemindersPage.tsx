import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageHeader } from '../components/layout/AppLayout'
import { useGarageStore } from '../store/useGarageStore'
import { reminderSchema } from '../schemas/forms'
import { formatCurrency, formatDistance, formatDate, todayISO } from '../engine/format'
import { getUpcomingReminders, getOverdueReminders, generateRemindersFromSchedule, evaluateReminder } from '../engine/reminders'
import { computeUpcomingServices } from '../engine/maintenance'
import { estimateCurrentMileage } from '../engine/vehicles'
import type { Reminder, ReminderBasis } from '../types'
import { SERVICE_CATEGORIES } from '../types'

export function RemindersPage() {
  const { getActiveVehicle, addReminder, updateReminder, removeReminder, toggleReminderComplete, addReminders } = useGarageStore()
  const vehicle = getActiveVehicle()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tab, setTab] = useState<'active' | 'completed'>('active')

  const activeReminders = vehicle.reminders.filter((r) => !r.completed)
  const completedReminders = vehicle.reminders.filter((r) => r.completed)
  const currentMileage = estimateCurrentMileage(vehicle, todayISO())
  const overdueReminders = getOverdueReminders(activeReminders, currentMileage)
  const upcomingReminders = getUpcomingReminders(activeReminders, currentMileage, 60)
  const schedulePreview = computeUpcomingServices(vehicle)

  const onAdd = (data: Omit<Reminder, 'id' | 'completed'>) => {
    addReminder({ ...data, completed: false })
    setShowAddForm(false)
  }

  const onUpdate = (id: string, data: Partial<Reminder>) => {
    updateReminder(id, data)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this reminder?')) {
      removeReminder(id)
    }
  }

  const handleGenerateReminders = () => {
    const generated = generateRemindersFromSchedule(vehicle)
    if (generated.length === 0) {
      alert('No new reminders to generate based on maintenance schedule')
      return
    }
    if (confirm(`Generate ${generated.length} reminders from maintenance schedule?`)) {
      addReminders(generated)
    }
  }

  return (
    <div>
      <PageHeader title="Reminders" subtitle="Manage maintenance reminders and schedules" />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab('active')}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${
              tab === 'active'
                ? 'bg-garage-amber text-garage-bg font-medium'
                : 'bg-garage-surface text-garage-muted hover:text-garage-text'
            }`}
          >
            Active ({activeReminders.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('completed')}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${
              tab === 'completed'
                ? 'bg-garage-amber text-garage-bg font-medium'
                : 'bg-garage-surface text-garage-muted hover:text-garage-text'
            }`}
          >
            Completed ({completedReminders.length})
          </button>
        </div>

        <button type="button" onClick={handleGenerateReminders} className="btn-secondary">
          Generate from Schedule
        </button>
      </div>

      <div className="card mb-6">
        <h2 className="mb-4 text-lg font-semibold">Maintenance Schedule Preview</h2>
        <p className="mb-4 text-sm text-garage-muted">
          Projected services based on {vehicle.profile.drivingCondition} driving condition and service history
        </p>
        {schedulePreview.length === 0 ? (
          <p className="text-garage-muted">No scheduled services to preview</p>
        ) : (
          <div className="space-y-2">
            {schedulePreview.map((service) => (
              <SchedulePreviewRow key={`${service.category}-${service.label}`} service={service} />
            ))}
          </div>
        )}
      </div>

      {!showAddForm && tab === 'active' && (
        <button type="button" onClick={() => setShowAddForm(true)} className="btn-primary mb-6">
          + Add Reminder
        </button>
      )}

      {showAddForm && (
        <div className="card mb-6">
          <h3 className="mb-4 text-lg font-semibold">Add Reminder</h3>
          <ReminderForm onSubmit={onAdd} onCancel={() => setShowAddForm(false)} />
        </div>
      )}

      {tab === 'active' ? (
        <>
          {overdueReminders.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold text-garage-danger">Overdue ({overdueReminders.length})</h2>
              <div className="space-y-3">
                {overdueReminders.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    currentMileage={currentMileage}
                    isEditing={editingId === reminder.id}
                    onEdit={() => setEditingId(reminder.id)}
                    onUpdate={(data) => onUpdate(reminder.id, data)}
                    onDelete={() => handleDelete(reminder.id)}
                    onToggleComplete={() => toggleReminderComplete(reminder.id)}
                    onCancelEdit={() => setEditingId(null)}
                  />
                ))}
              </div>
            </div>
          )}

          {upcomingReminders.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">Upcoming</h2>
              <div className="space-y-3">
                {upcomingReminders.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    currentMileage={currentMileage}
                    isEditing={editingId === reminder.id}
                    onEdit={() => setEditingId(reminder.id)}
                    onUpdate={(data) => onUpdate(reminder.id, data)}
                    onDelete={() => handleDelete(reminder.id)}
                    onToggleComplete={() => toggleReminderComplete(reminder.id)}
                    onCancelEdit={() => setEditingId(null)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeReminders.length === 0 && (
            <div className="card text-center text-garage-muted">
              <p>No active reminders</p>
            </div>
          )}
        </>
      ) : (
        <>
          {completedReminders.length === 0 ? (
            <div className="card text-center text-garage-muted">
              <p>No completed reminders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedReminders.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  currentMileage={currentMileage}
                  isEditing={false}
                  onEdit={() => {}}
                  onUpdate={() => {}}
                  onDelete={() => handleDelete(reminder.id)}
                  onToggleComplete={() => toggleReminderComplete(reminder.id)}
                  onCancelEdit={() => {}}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

interface ReminderCardProps {
  reminder: Reminder
  currentMileage: number
  isEditing: boolean
  onEdit: () => void
  onUpdate: (data: Partial<Reminder>) => void
  onDelete: () => void
  onToggleComplete: () => void
  onCancelEdit: () => void
}

const urgencyBorderStyles = {
  overdue: 'border-garage-danger/40 bg-garage-danger/10',
  soon: 'border-garage-warning/40 bg-garage-warning/10',
  upcoming: '',
  done: 'opacity-60',
}

const urgencyBadgeStyles = {
  overdue: 'bg-garage-danger/20 text-garage-danger',
  soon: 'bg-garage-warning/20 text-garage-warning',
  upcoming: 'bg-garage-elevated text-garage-muted',
  done: 'bg-garage-elevated text-garage-muted',
}

const urgencyLabels = {
  overdue: 'Overdue',
  soon: 'Due Soon',
  upcoming: 'Upcoming',
  done: 'Done',
}

function ReminderCard({ reminder, currentMileage, isEditing, onEdit, onUpdate, onDelete, onToggleComplete, onCancelEdit }: ReminderCardProps) {
  const preferences = useGarageStore((s) => s.preferences)
  const event = evaluateReminder(reminder, currentMileage)
  const urgency = event.urgency

  if (isEditing) {
    return (
      <div className="card">
        <ReminderForm initialData={reminder} onSubmit={onUpdate} onCancel={onCancelEdit} />
      </div>
    )
  }

  return (
    <div className={`card border ${urgencyBorderStyles[urgency]} ${reminder.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="checkbox"
              checked={reminder.completed}
              onChange={onToggleComplete}
              className="h-4 w-4 cursor-pointer rounded border-garage-border bg-garage-bg accent-garage-amber"
            />
            <span
              className="badge"
              style={{
                backgroundColor: SERVICE_CATEGORIES.find((c) => c.value === reminder.category)?.color + '20',
                color: SERVICE_CATEGORIES.find((c) => c.value === reminder.category)?.color,
              }}
            >
              {SERVICE_CATEGORIES.find((c) => c.value === reminder.category)?.label}
            </span>
            {!reminder.completed && (
              <span className={`badge ${urgencyBadgeStyles[urgency]}`}>{urgencyLabels[urgency]}</span>
            )}
          </div>
          <h3 className={`mt-2 text-lg font-semibold ${reminder.completed ? 'line-through' : ''}`}>
            {reminder.title}
          </h3>
          <div className="mt-1 flex flex-wrap gap-2 text-sm text-garage-muted">
            {reminder.dueDate && <span>Due: {formatDate(reminder.dueDate)}</span>}
            {reminder.dueMileage && (
              <span>At: {formatDistance(reminder.dueMileage, preferences.distanceUnit)}</span>
            )}
            {reminder.estimatedCost > 0 && (
              <span>Est: {formatCurrency(reminder.estimatedCost, preferences.currency)}</span>
            )}
            {!reminder.completed && event.daysRemaining !== null && (
              <span>
                {event.daysRemaining < 0
                  ? `${Math.abs(event.daysRemaining)} days overdue`
                  : `${event.daysRemaining} days left`}
              </span>
            )}
            {!reminder.completed && event.distanceRemaining !== null && (
              <span>
                {event.distanceRemaining < 0
                  ? `${formatDistance(Math.abs(event.distanceRemaining), preferences.distanceUnit)} overdue`
                  : `${formatDistance(event.distanceRemaining, preferences.distanceUnit)} left`}
              </span>
            )}
          </div>
          {reminder.notes && <p className="mt-2 text-sm text-garage-muted">{reminder.notes}</p>}
        </div>
        {!reminder.completed && (
          <div className="ml-4 flex gap-2">
            <button type="button" onClick={onEdit} className="btn-ghost text-sm">
              Edit
            </button>
            <button type="button" onClick={onDelete} className="btn-ghost text-sm text-garage-danger">
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function SchedulePreviewRow({ service }: { service: ReturnType<typeof computeUpcomingServices>[number] }) {
  const preferences = useGarageStore((s) => s.preferences)
  const category = SERVICE_CATEGORIES.find((c) => c.value === service.category)

  return (
    <div
      className={`flex flex-wrap items-start justify-between gap-2 rounded-lg border px-3 py-2 ${urgencyBorderStyles[service.urgency]}`}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{service.label}</span>
          {category && (
            <span
              className="badge"
              style={{ backgroundColor: category.color + '20', color: category.color }}
            >
              {category.label}
            </span>
          )}
          <span className={`badge ${urgencyBadgeStyles[service.urgency]}`}>{urgencyLabels[service.urgency]}</span>
        </div>
        <p className="mt-1 text-sm text-garage-muted">
          Due: {formatDate(service.dueDate)} · At {formatDistance(service.dueMileage, preferences.distanceUnit)}
          {service.estimatedCost > 0 && ` · Est ${formatCurrency(service.estimatedCost, preferences.currency)}`}
        </p>
      </div>
      <p className="text-sm text-garage-muted">
        {service.daysRemaining < 0
          ? `${Math.abs(service.daysRemaining)}d overdue`
          : `${service.daysRemaining}d left`}
        {' · '}
        {service.distanceRemaining < 0
          ? `${formatDistance(Math.abs(service.distanceRemaining), preferences.distanceUnit)} overdue`
          : `${formatDistance(service.distanceRemaining, preferences.distanceUnit)} left`}
      </p>
    </div>
  )
}

interface ReminderFormProps {
  initialData?: Partial<Reminder>
  onSubmit: (data: any) => void
  onCancel: () => void
}

function ReminderForm({ initialData, onSubmit, onCancel }: ReminderFormProps) {
  const { preferences } = useGarageStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Omit<Reminder, 'id' | 'completed'>>({
    resolver: zodResolver(reminderSchema),
    defaultValues: initialData || {
      basis: 'both',
      estimatedCost: 0,
      notes: '',
    },
  })

  const basis = watch('basis') as ReminderBasis

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Title</label>
          <input type="text" {...register('title')} className="input-field" placeholder="Oil change" />
          {errors.title && <p className="mt-1 text-sm text-garage-danger">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label">Category</label>
          <select {...register('category')} className="input-field">
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Basis</label>
          <select {...register('basis')} className="input-field">
            <option value="date">Date only</option>
            <option value="mileage">Mileage only</option>
            <option value="both">Both date & mileage</option>
          </select>
        </div>

        {(basis === 'date' || basis === 'both') && (
          <div>
            <label className="label">Due Date</label>
            <input type="date" {...register('dueDate')} className="input-field" />
          </div>
        )}

        {(basis === 'mileage' || basis === 'both') && (
          <div>
            <label className="label">Due Mileage ({preferences.distanceUnit})</label>
            <input type="number" {...register('dueMileage', { valueAsNumber: true })} className="input-field" />
          </div>
        )}

        <div>
          <label className="label">Estimated Cost ({preferences.currency})</label>
          <input type="number" step="0.01" {...register('estimatedCost', { valueAsNumber: true })} className="input-field" />
        </div>

        <div className="sm:col-span-2">
          <label className="label">Notes (optional)</label>
          <textarea {...register('notes')} className="input-field" rows={2} />
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary">
          {initialData ? 'Save' : 'Add Reminder'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}
