import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageHeader } from '../components/layout/AppLayout'
import { AttachmentInput, AttachmentList } from '../components/shared/ServiceAttachments'
import { useGarageStore } from '../store/useGarageStore'
import { serviceRecordSchema } from '../schemas/forms'
import { formatCurrency, formatDistance, formatDate, todayISO } from '../engine/format'
import type { ServiceRecord, ServiceCategory, ServiceAttachment } from '../types'
import { SERVICE_CATEGORIES } from '../types'
import type { z } from 'zod'

type ServiceFormData = z.infer<typeof serviceRecordSchema>

export function ServiceHistoryPage() {
  const { getActiveVehicle, addServiceRecord, updateServiceRecord, removeServiceRecord, preferences } = useGarageStore()
  const vehicle = getActiveVehicle()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<ServiceCategory | 'all'>('all')

  const sortedRecords = [...vehicle.serviceRecords].sort((a, b) => b.date.localeCompare(a.date))
  const filteredRecords = filter === 'all' ? sortedRecords : sortedRecords.filter((r) => r.category === filter)

  const onAdd = (data: Omit<ServiceRecord, 'id'>) => {
    addServiceRecord(data)
    setShowAddForm(false)
  }

  const onUpdate = (id: string, data: Partial<ServiceRecord>) => {
    updateServiceRecord(id, data)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this service record?')) {
      removeServiceRecord(id)
    }
  }

  return (
    <div>
      <PageHeader title="Service History" subtitle="Track all maintenance and repairs" />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <label className="label mb-0">Filter</label>
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-lg px-3 py-1 text-sm transition-colors ${
            filter === 'all'
              ? 'bg-garage-amber text-garage-bg font-medium'
              : 'bg-garage-surface text-garage-muted hover:text-garage-text'
          }`}
        >
          All
        </button>
        {SERVICE_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setFilter(cat.value)}
            className={`rounded-lg px-3 py-1 text-sm transition-colors ${
              filter === cat.value
                ? 'bg-garage-amber text-garage-bg font-medium'
                : 'bg-garage-surface text-garage-muted hover:text-garage-text'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {!showAddForm && (
        <button type="button" onClick={() => setShowAddForm(true)} className="btn-primary mb-6">
          + Add Service Record
        </button>
      )}

      {showAddForm && (
        <div className="card mb-6">
          <h3 className="mb-4 text-lg font-semibold">Add Service Record</h3>
          <ServiceForm onSubmit={onAdd} onCancel={() => setShowAddForm(false)} />
        </div>
      )}

      {filteredRecords.length === 0 ? (
        <div className="card text-center text-garage-muted">
          <p>No service records found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((record) => (
            <div key={record.id} className="card">
              {editingId === record.id ? (
                <ServiceForm
                  initialData={record}
                  onSubmit={(data) => onUpdate(record.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="badge"
                        style={{
                          backgroundColor: SERVICE_CATEGORIES.find((c) => c.value === record.category)?.color + '20',
                          color: SERVICE_CATEGORIES.find((c) => c.value === record.category)?.color,
                        }}
                      >
                        {SERVICE_CATEGORIES.find((c) => c.value === record.category)?.label}
                      </span>
                      {record.status === 'scheduled' && (
                        <span className="badge bg-garage-warning/20 text-garage-warning">Scheduled</span>
                      )}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold">{record.description}</h3>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-garage-muted">
                      <span>{formatDate(record.date)}</span>
                      <span>·</span>
                      <span>{formatDistance(record.mileage, preferences.distanceUnit)}</span>
                      {record.shop && (
                        <>
                          <span>·</span>
                          <span>{record.shop}</span>
                        </>
                      )}
                    </div>
                    {record.notes && <p className="mt-2 text-sm text-garage-muted">{record.notes}</p>}
                    <AttachmentList attachments={record.attachments ?? []} />
                  </div>
                  <div className="ml-4 flex flex-col items-end gap-2">
                    <p className="tabular-nums text-xl font-semibold text-garage-amber">
                      {formatCurrency(record.cost, preferences.currency)}
                    </p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setEditingId(record.id)} className="btn-ghost text-sm">
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(record.id)} className="btn-ghost text-sm text-garage-danger">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface ServiceFormProps {
  initialData?: ServiceRecord
  onSubmit: (data: Omit<ServiceRecord, 'id'>) => void
  onCancel: () => void
}

function ServiceForm({ initialData, onSubmit, onCancel }: ServiceFormProps) {
  const { getActiveVehicle, preferences } = useGarageStore()
  const vehicle = getActiveVehicle()
  const [attachments, setAttachments] = useState<ServiceAttachment[]>(initialData?.attachments ?? [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceRecordSchema),
    defaultValues: initialData || {
      date: todayISO(),
      mileage: vehicle.profile.currentMileage,
      status: 'completed',
      cost: 0,
      notes: '',
      shop: '',
      attachments: [],
    },
  })

  const onFormSubmit = (data: ServiceFormData) => {
    onSubmit({
      ...data,
      category: data.category as ServiceCategory,
      notes: data.notes ?? '',
      shop: data.shop ?? '',
      attachments,
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
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
          <label className="label">Status</label>
          <select {...register('status')} className="input-field">
            <option value="completed">Completed</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <input type="text" {...register('description')} className="input-field" placeholder="Oil & filter change" />
          {errors.description && <p className="mt-1 text-sm text-garage-danger">{errors.description.message}</p>}
        </div>

        <div>
          <label className="label">Date</label>
          <input type="date" {...register('date')} className="input-field" />
          {errors.date && <p className="mt-1 text-sm text-garage-danger">{errors.date.message}</p>}
        </div>

        <div>
          <label className="label">Mileage ({preferences.distanceUnit})</label>
          <input type="number" {...register('mileage', { valueAsNumber: true })} className="input-field" />
          {errors.mileage && <p className="mt-1 text-sm text-garage-danger">{errors.mileage.message}</p>}
        </div>

        <div>
          <label className="label">Cost ({preferences.currency})</label>
          <input type="number" step="0.01" {...register('cost', { valueAsNumber: true })} className="input-field" />
          {errors.cost && <p className="mt-1 text-sm text-garage-danger">{errors.cost.message}</p>}
        </div>

        <div>
          <label className="label">Shop (optional)</label>
          <input type="text" {...register('shop')} className="input-field" placeholder="QuickLube" />
        </div>

        <div className="sm:col-span-2">
          <label className="label">Notes (optional)</label>
          <textarea {...register('notes')} className="input-field" rows={3} placeholder="Additional notes..." />
        </div>

        <div className="sm:col-span-2">
          <AttachmentInput attachments={attachments} onChange={setAttachments} />
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary">
          {initialData ? 'Save' : 'Add Record'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}
