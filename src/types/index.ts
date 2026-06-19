export type Currency = 'USD' | 'CAD' | 'EUR' | 'GBP'

export type DistanceUnit = 'mi' | 'km'

export type DrivingCondition = 'normal' | 'severe'

export type ServiceCategory =
  | 'oil'
  | 'tires'
  | 'brakes'
  | 'filters'
  | 'fluids'
  | 'battery'
  | 'belts'
  | 'spark_plugs'
  | 'transmission'
  | 'inspection'
  | 'registration'
  | 'insurance'
  | 'repair'
  | 'fuel'
  | 'other'

export type ServiceStatus = 'completed' | 'scheduled'

export type ReminderBasis = 'date' | 'mileage' | 'both'

export type AttachmentMimeType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'application/pdf'

export interface ServiceAttachment {
  id: string
  name: string
  mimeType: AttachmentMimeType
  size: number
  dataUrl: string
}

export interface ServiceRecord {
  id: string
  category: ServiceCategory
  description: string
  date: string
  mileage: number
  cost: number
  shop: string
  status: ServiceStatus
  notes: string
  attachments: ServiceAttachment[]
}

export interface MileageReading {
  id: string
  date: string
  mileage: number
}

export interface Reminder {
  id: string
  title: string
  category: ServiceCategory
  basis: ReminderBasis
  dueDate: string | null
  dueMileage: number | null
  intervalDays: number | null
  intervalDistance: number | null
  estimatedCost: number
  notes: string
  completed: boolean
}

export interface VehicleProfile {
  name: string
  make: string
  model: string
  year: number
  vin: string
  licensePlate: string
  color: string
  currentMileage: number
  averageMonthlyDistance: number
  drivingCondition: DrivingCondition
  purchaseDate: string
}

export interface BudgetSettings {
  monthlyBudget: number
  annualBudget: number
}

export interface Vehicle {
  id: string
  profile: VehicleProfile
  serviceRecords: ServiceRecord[]
  reminders: Reminder[]
  mileageHistory: MileageReading[]
  budget: BudgetSettings
}

export interface Preferences {
  currency: Currency
  distanceUnit: DistanceUnit
  lightMode: boolean
}

export interface AppState {
  vehicles: Vehicle[]
  activeVehicleId: string
  preferences: Preferences
  hasOnboarded: boolean
}

export type BudgetPeriod = 'monthly' | 'yearly'

export interface MaintenanceIntervalDef {
  category: ServiceCategory
  label: string
  intervalDistance: number
  intervalMonths: number
  estimatedCost: number
}

/* Default manufacturer-agnostic schedules, keyed by driving condition. */
export const MAINTENANCE_SCHEDULE: Record<DrivingCondition, MaintenanceIntervalDef[]> = {
  normal: [
    { category: 'oil', label: 'Oil & Filter Change', intervalDistance: 5000, intervalMonths: 6, estimatedCost: 65 },
    { category: 'tires', label: 'Tire Rotation', intervalDistance: 5000, intervalMonths: 6, estimatedCost: 35 },
    { category: 'inspection', label: 'Multi-Point Inspection', intervalDistance: 10000, intervalMonths: 12, estimatedCost: 0 },
    { category: 'filters', label: 'Cabin Air Filter', intervalDistance: 15000, intervalMonths: 12, estimatedCost: 50 },
    { category: 'brakes', label: 'Brake Inspection', intervalDistance: 15000, intervalMonths: 12, estimatedCost: 60 },
    { category: 'filters', label: 'Engine Air Filter', intervalDistance: 30000, intervalMonths: 24, estimatedCost: 40 },
    { category: 'fluids', label: 'Coolant Flush', intervalDistance: 60000, intervalMonths: 48, estimatedCost: 100 },
    { category: 'spark_plugs', label: 'Spark Plug Replacement', intervalDistance: 60000, intervalMonths: 48, estimatedCost: 120 },
    { category: 'transmission', label: 'Transmission Service', intervalDistance: 60000, intervalMonths: 48, estimatedCost: 180 },
    { category: 'belts', label: 'Timing Belt Inspection', intervalDistance: 60000, intervalMonths: 48, estimatedCost: 600 },
  ],
  severe: [
    { category: 'oil', label: 'Oil & Filter Change', intervalDistance: 3000, intervalMonths: 3, estimatedCost: 65 },
    { category: 'tires', label: 'Tire Rotation', intervalDistance: 4000, intervalMonths: 4, estimatedCost: 35 },
    { category: 'brakes', label: 'Brake Inspection', intervalDistance: 7500, intervalMonths: 6, estimatedCost: 60 },
    { category: 'filters', label: 'Cabin Air Filter', intervalDistance: 10000, intervalMonths: 9, estimatedCost: 50 },
    { category: 'filters', label: 'Engine Air Filter', intervalDistance: 20000, intervalMonths: 18, estimatedCost: 40 },
    { category: 'fluids', label: 'Coolant Flush', intervalDistance: 45000, intervalMonths: 36, estimatedCost: 100 },
    { category: 'spark_plugs', label: 'Spark Plug Replacement', intervalDistance: 45000, intervalMonths: 36, estimatedCost: 120 },
    { category: 'transmission', label: 'Transmission Service', intervalDistance: 45000, intervalMonths: 36, estimatedCost: 180 },
  ],
}

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string; color: string }[] = [
  { value: 'oil', label: 'Oil & Filter', color: '#c9a962' },
  { value: 'tires', label: 'Tires', color: '#7d9b8a' },
  { value: 'brakes', label: 'Brakes', color: '#c96b6b' },
  { value: 'filters', label: 'Filters', color: '#6b8fbf' },
  { value: 'fluids', label: 'Fluids', color: '#5fa8a8' },
  { value: 'battery', label: 'Battery', color: '#d4a35a' },
  { value: 'belts', label: 'Belts & Hoses', color: '#8b7aa8' },
  { value: 'spark_plugs', label: 'Spark Plugs', color: '#bf8f6b' },
  { value: 'transmission', label: 'Transmission', color: '#6baf8a' },
  { value: 'inspection', label: 'Inspection', color: '#9aa5b8' },
  { value: 'registration', label: 'Registration', color: '#a88fbf' },
  { value: 'insurance', label: 'Insurance', color: '#6b9bbf' },
  { value: 'repair', label: 'Repair', color: '#c98b6b' },
  { value: 'fuel', label: 'Fuel', color: '#b0a55a' },
  { value: 'other', label: 'Other', color: '#9aa5b8' },
]

export const DRIVING_CONDITIONS: { value: DrivingCondition; label: string; description: string }[] = [
  { value: 'normal', label: 'Normal', description: 'Mostly highway, mild climate, regular trips' },
  { value: 'severe', label: 'Severe', description: 'Short trips, towing, dust, extreme heat/cold, stop-and-go' },
]

export const CURRENCIES: { value: Currency; label: string; locale: string }[] = [
  { value: 'USD', label: 'USD', locale: 'en-US' },
  { value: 'CAD', label: 'CAD', locale: 'en-CA' },
  { value: 'EUR', label: 'EUR', locale: 'de-DE' },
  { value: 'GBP', label: 'GBP', locale: 'en-GB' },
]

export const DISTANCE_UNITS: { value: DistanceUnit; label: string }[] = [
  { value: 'mi', label: 'Miles' },
  { value: 'km', label: 'Kilometers' },
]
