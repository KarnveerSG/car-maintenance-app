import { z } from 'zod'

export const vehicleProfileSchema = z.object({
  name: z.string().min(1, 'Name required'),
  make: z.string().min(1, 'Make required'),
  model: z.string().min(1, 'Model required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 2),
  vin: z.string().optional(),
  licensePlate: z.string().optional(),
  color: z.string().optional(),
  currentMileage: z.number().min(0),
  averageMonthlyDistance: z.number().min(0),
  drivingCondition: z.enum(['normal', 'severe']),
  purchaseDate: z.string().optional(),
})

export const attachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']),
  size: z.number().min(0),
  dataUrl: z.string().min(1),
})

export const serviceRecordSchema = z.object({
  category: z.string().min(1, 'Category required'),
  description: z.string().min(1, 'Description required'),
  date: z.string().min(1, 'Date required'),
  mileage: z.number().min(0),
  cost: z.number().min(0),
  shop: z.string().optional(),
  status: z.enum(['completed', 'scheduled']),
  notes: z.string().optional(),
  attachments: z.array(attachmentSchema).default([]),
})

export const reminderSchema = z.object({
  title: z.string().min(1, 'Title required'),
  category: z.string().min(1, 'Category required'),
  basis: z.enum(['date', 'mileage', 'both']),
  dueDate: z.string().nullable(),
  dueMileage: z.number().nullable(),
  intervalDays: z.number().nullable(),
  intervalDistance: z.number().nullable(),
  estimatedCost: z.number().min(0),
  notes: z.string().optional(),
})

export const budgetSchema = z.object({
  monthlyBudget: z.number().min(0),
  annualBudget: z.number().min(0),
})

export const mileageSchema = z.object({
  mileage: z.number().min(0),
  date: z.string().min(1, 'Date required'),
})
