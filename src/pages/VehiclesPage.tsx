import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageHeader } from '../components/layout/AppLayout'
import { useGarageStore } from '../store/useGarageStore'
import { vehicleProfileSchema, mileageSchema } from '../schemas/forms'
import { formatDistance, formatDate, todayISO } from '../engine/format'
import { DRIVING_CONDITIONS, type VehicleProfile } from '../types'
import type { z } from 'zod'

type MileageFormData = z.infer<typeof mileageSchema>

export function VehiclesPage() {
  const { vehicles, getActiveVehicle, setActiveVehicle, updateVehicleProfile, addVehicle, removeVehicle, logMileage, preferences } = useGarageStore()
  const activeVehicle = getActiveVehicle()
  const [isEditing, setIsEditing] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VehicleProfile>({
    resolver: zodResolver(vehicleProfileSchema),
    defaultValues: activeVehicle.profile,
  })

  const onSave = (data: VehicleProfile) => {
    updateVehicleProfile(data)
    setIsEditing(false)
  }

  const onAddVehicle = (data: VehicleProfile) => {
    addVehicle(data)
    setShowAddForm(false)
  }

  const handleDelete = () => {
    if (vehicles.length <= 1) {
      alert('Cannot delete the only vehicle')
      return
    }
    if (confirm(`Delete ${activeVehicle.profile.name}?`)) {
      removeVehicle(activeVehicle.id)
    }
  }

  return (
    <div>
      <PageHeader title="Vehicles" subtitle="Manage your vehicle profiles" />

      {vehicles.length > 1 && (
        <div className="mb-6">
          <label className="label">Active Vehicle</label>
          <div className="flex gap-2">
            {vehicles.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveVehicle(v.id)}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  v.id === activeVehicle.id
                    ? 'bg-garage-amber text-garage-bg font-medium'
                    : 'bg-garage-surface text-garage-muted hover:text-garage-text'
                }`}
              >
                {v.profile.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{activeVehicle.profile.name}</h2>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <button type="button" onClick={() => setIsEditing(true)} className="btn-secondary">
                  Edit
                </button>
                {vehicles.length > 1 && (
                  <button type="button" onClick={handleDelete} className="btn-ghost text-garage-danger">
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Name</label>
                <input type="text" {...register('name')} className="input-field" />
                {errors.name && <p className="mt-1 text-sm text-garage-danger">{errors.name.message}</p>}
              </div>

              <div>
                <label className="label">Make</label>
                <input type="text" {...register('make')} className="input-field" />
                {errors.make && <p className="mt-1 text-sm text-garage-danger">{errors.make.message}</p>}
              </div>

              <div>
                <label className="label">Model</label>
                <input type="text" {...register('model')} className="input-field" />
                {errors.model && <p className="mt-1 text-sm text-garage-danger">{errors.model.message}</p>}
              </div>

              <div>
                <label className="label">Year</label>
                <input type="number" {...register('year', { valueAsNumber: true })} className="input-field" />
                {errors.year && <p className="mt-1 text-sm text-garage-danger">{errors.year.message}</p>}
              </div>

              <div>
                <label className="label">VIN</label>
                <input type="text" {...register('vin')} className="input-field" />
              </div>

              <div>
                <label className="label">License Plate</label>
                <input type="text" {...register('licensePlate')} className="input-field" />
              </div>

              <div>
                <label className="label">Color</label>
                <input type="text" {...register('color')} className="input-field" />
              </div>

              <div>
                <label className="label">Current Mileage</label>
                <input type="number" {...register('currentMileage', { valueAsNumber: true })} className="input-field" />
                {errors.currentMileage && <p className="mt-1 text-sm text-garage-danger">{errors.currentMileage.message}</p>}
              </div>

              <div>
                <label className="label">Average Monthly Distance ({preferences.distanceUnit})</label>
                <input type="number" {...register('averageMonthlyDistance', { valueAsNumber: true })} className="input-field" />
              </div>

              <div>
                <label className="label">Driving Condition</label>
                <select {...register('drivingCondition')} className="input-field">
                  {DRIVING_CONDITIONS.map((dc) => (
                    <option key={dc.value} value={dc.value}>
                      {dc.label} — {dc.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Purchase Date</label>
                <input type="date" {...register('purchaseDate')} className="input-field" />
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  reset(activeVehicle.profile)
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="label">Make & Model</p>
              <p>{activeVehicle.profile.make} {activeVehicle.profile.model}</p>
            </div>
            <div>
              <p className="label">Year</p>
              <p>{activeVehicle.profile.year}</p>
            </div>
            {activeVehicle.profile.vin && (
              <div>
                <p className="label">VIN</p>
                <p className="font-mono text-sm">{activeVehicle.profile.vin}</p>
              </div>
            )}
            {activeVehicle.profile.licensePlate && (
              <div>
                <p className="label">License Plate</p>
                <p>{activeVehicle.profile.licensePlate}</p>
              </div>
            )}
            {activeVehicle.profile.color && (
              <div>
                <p className="label">Color</p>
                <p>{activeVehicle.profile.color}</p>
              </div>
            )}
            <div>
              <p className="label">Current Mileage</p>
              <p>{formatDistance(activeVehicle.profile.currentMileage, preferences.distanceUnit)}</p>
            </div>
            <div>
              <p className="label">Avg Monthly Distance</p>
              <p>{formatDistance(activeVehicle.profile.averageMonthlyDistance, preferences.distanceUnit)}/mo</p>
            </div>
            <div>
              <p className="label">Driving Condition</p>
              <p className="capitalize">{activeVehicle.profile.drivingCondition}</p>
            </div>
            {activeVehicle.profile.purchaseDate && (
              <div>
                <p className="label">Purchase Date</p>
                <p>{formatDate(activeVehicle.profile.purchaseDate)}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card mt-6">
        <h2 className="mb-4 text-lg font-semibold">Mileage Log</h2>
        <MileageLogForm
          currentMileage={activeVehicle.profile.currentMileage}
          onSubmit={(data) => logMileage(data.mileage, data.date)}
        />
        {activeVehicle.mileageHistory.length > 0 ? (
          <div className="mt-6">
            <p className="label">History</p>
            <div className="mt-2 space-y-2">
              {[...activeVehicle.mileageHistory]
                .sort((a, b) => b.date.localeCompare(a.date) || b.mileage - a.mileage)
                .map((reading) => (
                  <div
                    key={reading.id}
                    className="flex items-center justify-between rounded-lg bg-garage-elevated px-3 py-2 text-sm"
                  >
                    <span className="text-garage-muted">{formatDate(reading.date)}</span>
                    <span className="tabular-nums font-medium">
                      {formatDistance(reading.mileage, preferences.distanceUnit)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-garage-muted">No mileage readings logged yet</p>
        )}
      </div>

      <div className="mt-6">
        {!showAddForm ? (
          <button type="button" onClick={() => setShowAddForm(true)} className="btn-secondary">
            + Add Another Vehicle
          </button>
        ) : (
          <div className="card">
            <h3 className="mb-4 text-lg font-semibold">Add Vehicle</h3>
            <VehicleForm onSubmit={onAddVehicle} onCancel={() => setShowAddForm(false)} />
          </div>
        )}
      </div>
    </div>
  )
}

function MileageLogForm({
  currentMileage,
  onSubmit,
}: {
  currentMileage: number
  onSubmit: (data: MileageFormData) => void
}) {
  const preferences = useGarageStore((s) => s.preferences)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MileageFormData>({
    resolver: zodResolver(mileageSchema),
    defaultValues: { mileage: currentMileage, date: todayISO() },
  })

  const onFormSubmit = (data: MileageFormData) => {
    onSubmit(data)
    reset({ mileage: data.mileage, date: todayISO() })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-wrap items-end gap-4">
      <div className="min-w-[140px] flex-1">
        <label className="label">Odometer ({preferences.distanceUnit})</label>
        <input type="number" {...register('mileage', { valueAsNumber: true })} className="input-field" />
        {errors.mileage && <p className="mt-1 text-sm text-garage-danger">{errors.mileage.message}</p>}
      </div>
      <div className="min-w-[140px] flex-1">
        <label className="label">Date</label>
        <input type="date" {...register('date')} className="input-field" />
        {errors.date && <p className="mt-1 text-sm text-garage-danger">{errors.date.message}</p>}
      </div>
      <button type="submit" className="btn-primary">
        Log Reading
      </button>
    </form>
  )
}

function VehicleForm({ onSubmit, onCancel }: { onSubmit: (data: VehicleProfile) => void; onCancel: () => void }) {
  const preferences = useGarageStore((s) => s.preferences)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleProfile>({
    resolver: zodResolver(vehicleProfileSchema),
    defaultValues: {
      drivingCondition: 'normal',
      currentMileage: 0,
      averageMonthlyDistance: 1000,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Name</label>
          <input type="text" {...register('name')} className="input-field" placeholder="Daily Driver" />
          {errors.name && <p className="mt-1 text-sm text-garage-danger">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label">Make</label>
          <input type="text" {...register('make')} className="input-field" placeholder="Toyota" />
          {errors.make && <p className="mt-1 text-sm text-garage-danger">{errors.make.message}</p>}
        </div>

        <div>
          <label className="label">Model</label>
          <input type="text" {...register('model')} className="input-field" placeholder="Corolla" />
          {errors.model && <p className="mt-1 text-sm text-garage-danger">{errors.model.message}</p>}
        </div>

        <div>
          <label className="label">Year</label>
          <input type="number" {...register('year', { valueAsNumber: true })} className="input-field" />
          {errors.year && <p className="mt-1 text-sm text-garage-danger">{errors.year.message}</p>}
        </div>

        <div>
          <label className="label">Current Mileage</label>
          <input type="number" {...register('currentMileage', { valueAsNumber: true })} className="input-field" />
        </div>

        <div>
          <label className="label">Average Monthly Distance ({preferences.distanceUnit})</label>
          <input type="number" {...register('averageMonthlyDistance', { valueAsNumber: true })} className="input-field" />
        </div>

        <div>
          <label className="label">Driving Condition</label>
          <select {...register('drivingCondition')} className="input-field">
            {DRIVING_CONDITIONS.map((dc) => (
              <option key={dc.value} value={dc.value}>
                {dc.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary">
          Add Vehicle
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}
