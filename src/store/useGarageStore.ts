import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppState,
  BudgetSettings,
  Preferences,
  Reminder,
  ServiceRecord,
  Vehicle,
  VehicleProfile,
} from '../types'
import { createVehicle } from '../engine/vehicles'
import { createReminder } from '../engine/reminders'
import { createId, todayISO } from '../engine/format'

const defaultPreferences = (): Preferences => ({
  currency: 'USD',
  distanceUnit: 'mi',
  lightMode: false,
})

const createDemoVehicle = (): Vehicle => {
  const vehicle = createVehicle({
    name: 'Daily Driver',
    make: 'Toyota',
    model: 'Corolla',
    year: 2019,
    color: 'Silver',
    licensePlate: 'ABC-1234',
    currentMileage: 62000,
    averageMonthlyDistance: 1100,
    drivingCondition: 'normal',
    purchaseDate: '2019-04-15',
  })

  vehicle.serviceRecords = [
    { id: createId(), category: 'oil', description: 'Synthetic oil & filter change', date: '2026-04-02', mileage: 60500, cost: 72, shop: 'QuickLube', status: 'completed', notes: '', attachments: [] },
    { id: createId(), category: 'tires', description: 'Tire rotation', date: '2026-04-02', mileage: 60500, cost: 30, shop: 'QuickLube', status: 'completed', notes: '', attachments: [] },
    { id: createId(), category: 'brakes', description: 'Front brake pads', date: '2026-01-18', mileage: 57800, cost: 240, shop: 'Midas', status: 'completed', notes: 'Rotors resurfaced', attachments: [] },
    { id: createId(), category: 'battery', description: 'Battery replacement', date: '2025-11-05', mileage: 54200, cost: 165, shop: 'AutoZone', status: 'completed', notes: '', attachments: [] },
  ]

  vehicle.mileageHistory = [
    { id: createId(), date: '2025-11-05', mileage: 54200 },
    { id: createId(), date: '2026-01-18', mileage: 57800 },
    { id: createId(), date: '2026-04-02', mileage: 60500 },
    { id: createId(), date: todayISO(), mileage: 62000 },
  ]

  vehicle.reminders = [
    createReminder({ title: 'Oil & Filter Change', category: 'oil', basis: 'both', dueDate: '2026-07-01', dueMileage: 65500, estimatedCost: 70 }),
    createReminder({ title: 'Registration Renewal', category: 'registration', basis: 'date', dueDate: '2026-08-15', estimatedCost: 90 }),
  ]

  vehicle.budget = { monthlyBudget: 150, annualBudget: 1800 }
  return vehicle
}

interface GarageStore extends AppState {
  getActiveVehicle: () => Vehicle
  setActiveVehicle: (id: string) => void
  addVehicle: (profile?: Partial<VehicleProfile>) => void
  updateVehicleProfile: (partial: Partial<VehicleProfile>) => void
  removeVehicle: (id: string) => void
  updateActiveVehicle: (updater: (v: Vehicle) => Vehicle) => void

  addServiceRecord: (record: Omit<ServiceRecord, 'id'>) => void
  updateServiceRecord: (id: string, partial: Partial<ServiceRecord>) => void
  removeServiceRecord: (id: string) => void

  addReminder: (reminder?: Partial<Reminder>) => void
  updateReminder: (id: string, partial: Partial<Reminder>) => void
  removeReminder: (id: string) => void
  toggleReminderComplete: (id: string) => void
  addReminders: (reminders: Reminder[]) => void

  logMileage: (mileage: number, date?: string) => void
  updateBudget: (partial: Partial<BudgetSettings>) => void

  updatePreferences: (partial: Partial<Preferences>) => void
  toggleLightMode: () => void

  completeOnboarding: () => void
  loadDemo: () => void
  resetAll: () => void
  importState: (state: AppState) => void
}

const initialVehicle = createVehicle()

const initialState: AppState = {
  vehicles: [initialVehicle],
  activeVehicleId: initialVehicle.id,
  preferences: defaultPreferences(),
  hasOnboarded: false,
}

export const useGarageStore = create<GarageStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      getActiveVehicle: () => {
        const { vehicles, activeVehicleId } = get()
        return vehicles.find((v) => v.id === activeVehicleId) ?? vehicles[0]
      },

      setActiveVehicle: (id) => set({ activeVehicleId: id }),

      updateActiveVehicle: (updater) =>
        set((state) => ({
          vehicles: state.vehicles.map((v) => (v.id === state.activeVehicleId ? updater(v) : v)),
        })),

      addVehicle: (profile) => {
        const vehicle = createVehicle(profile)
        set((s) => ({ vehicles: [...s.vehicles, vehicle], activeVehicleId: vehicle.id }))
      },

      updateVehicleProfile: (partial) =>
        get().updateActiveVehicle((v) => ({ ...v, profile: { ...v.profile, ...partial } })),

      removeVehicle: (id) =>
        set((s) => {
          if (s.vehicles.length <= 1) return s
          const next = s.vehicles.filter((v) => v.id !== id)
          return {
            vehicles: next,
            activeVehicleId: s.activeVehicleId === id ? next[0].id : s.activeVehicleId,
          }
        }),

      addServiceRecord: (record) =>
        get().updateActiveVehicle((v) => {
          const withId: ServiceRecord = { ...record, id: createId(), attachments: record.attachments ?? [] }
          const mileageHistory =
            record.status === 'completed' && record.mileage > 0
              ? [...v.mileageHistory, { id: createId(), date: record.date, mileage: record.mileage }]
              : v.mileageHistory
          const currentMileage = Math.max(v.profile.currentMileage, record.mileage)
          return {
            ...v,
            serviceRecords: [...v.serviceRecords, withId],
            mileageHistory,
            profile: { ...v.profile, currentMileage },
          }
        }),

      updateServiceRecord: (id, partial) =>
        get().updateActiveVehicle((v) => ({
          ...v,
          serviceRecords: v.serviceRecords.map((r) => (r.id === id ? { ...r, ...partial } : r)),
        })),

      removeServiceRecord: (id) =>
        get().updateActiveVehicle((v) => ({
          ...v,
          serviceRecords: v.serviceRecords.filter((r) => r.id !== id),
        })),

      addReminder: (reminder) =>
        get().updateActiveVehicle((v) => ({
          ...v,
          reminders: [...v.reminders, createReminder(reminder)],
        })),

      updateReminder: (id, partial) =>
        get().updateActiveVehicle((v) => ({
          ...v,
          reminders: v.reminders.map((r) => (r.id === id ? { ...r, ...partial } : r)),
        })),

      removeReminder: (id) =>
        get().updateActiveVehicle((v) => ({
          ...v,
          reminders: v.reminders.filter((r) => r.id !== id),
        })),

      toggleReminderComplete: (id) =>
        get().updateActiveVehicle((v) => ({
          ...v,
          reminders: v.reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)),
        })),

      addReminders: (reminders) =>
        get().updateActiveVehicle((v) => ({ ...v, reminders: [...v.reminders, ...reminders] })),

      logMileage: (mileage, date = todayISO()) =>
        get().updateActiveVehicle((v) => ({
          ...v,
          mileageHistory: [...v.mileageHistory, { id: createId(), date, mileage }],
          profile: { ...v.profile, currentMileage: Math.max(v.profile.currentMileage, mileage) },
        })),

      updateBudget: (partial) =>
        get().updateActiveVehicle((v) => ({ ...v, budget: { ...v.budget, ...partial } })),

      updatePreferences: (partial) =>
        set((s) => ({ preferences: { ...s.preferences, ...partial } })),

      toggleLightMode: () =>
        set((s) => ({ preferences: { ...s.preferences, lightMode: !s.preferences.lightMode } })),

      completeOnboarding: () => set({ hasOnboarded: true }),

      loadDemo: () => {
        const demo = createDemoVehicle()
        set({
          vehicles: [demo],
          activeVehicleId: demo.id,
          preferences: defaultPreferences(),
          hasOnboarded: true,
        })
      },

      resetAll: () => {
        const fresh = createVehicle()
        set({
          vehicles: [fresh],
          activeVehicleId: fresh.id,
          preferences: defaultPreferences(),
          hasOnboarded: false,
        })
      },

      importState: (state) => set({ ...state }),
    }),
    {
      name: 'garage-keeper-v2',
      version: 1,
      migrate: (persisted: unknown) => {
        const state = persisted as AppState
        return {
          ...state,
          vehicles: state.vehicles.map((v) => ({
            ...v,
            serviceRecords: v.serviceRecords.map((r) => ({
              ...r,
              attachments: r.attachments ?? [],
            })),
          })),
        }
      },
      partialize: (state) => ({
        vehicles: state.vehicles,
        activeVehicleId: state.activeVehicleId,
        preferences: state.preferences,
        hasOnboarded: state.hasOnboarded,
      }),
    }
  )
)

export const exportAppState = (state: AppState): string => JSON.stringify(state, null, 2)

export const parseAppState = (raw: string): AppState => {
  const parsed = JSON.parse(raw) as AppState
  if (!Array.isArray(parsed.vehicles)) throw new Error('Invalid export file')
  return parsed
}
