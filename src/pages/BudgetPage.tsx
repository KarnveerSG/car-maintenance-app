import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageHeader } from '../components/layout/AppLayout'
import { MetricCard } from '../components/shared/MetricCard'
import { useGarageStore } from '../store/useGarageStore'
import { budgetSchema } from '../schemas/forms'
import { formatCurrency } from '../engine/format'
import { calculateBudgetStatus, getCategoryBreakdown } from '../engine/budget'
import type { BudgetPeriod, BudgetSettings } from '../types'

export function BudgetPage() {
  const { getActiveVehicle, updateBudget, preferences } = useGarageStore()
  const vehicle = getActiveVehicle()
  const [period, setPeriod] = useState<BudgetPeriod>('monthly')
  const [isEditing, setIsEditing] = useState(false)

  const budgetStatus = calculateBudgetStatus(vehicle, period)
  const breakdown = getCategoryBreakdown(vehicle, period)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetSettings>({
    resolver: zodResolver(budgetSchema),
    defaultValues: vehicle.budget,
  })

  const onSave = (data: BudgetSettings) => {
    updateBudget(data)
    setIsEditing(false)
  }

  const remaining = budgetStatus.budget - budgetStatus.spent
  const percentRemaining = 100 - budgetStatus.percentUsed

  return (
    <div>
      <PageHeader title="Budget" subtitle="Track and manage maintenance spending" />

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard
          label="Budget"
          value={formatCurrency(budgetStatus.budget, preferences.currency)}
          subtitle={period === 'monthly' ? 'per month' : 'per year'}
          icon="◫"
        />
        <MetricCard
          label="Spent"
          value={formatCurrency(budgetStatus.spent, preferences.currency)}
          subtitle={`${budgetStatus.percentUsed.toFixed(1)}% of budget`}
          trend={budgetStatus.percentUsed > 90 ? 'down' : budgetStatus.percentUsed > 70 ? 'neutral' : 'up'}
          icon="◈"
        />
        <MetricCard
          label="Remaining"
          value={formatCurrency(remaining, preferences.currency)}
          subtitle={`${percentRemaining.toFixed(1)}% available`}
          trend={percentRemaining > 30 ? 'up' : percentRemaining > 10 ? 'neutral' : 'down'}
          icon="◎"
        />
        <MetricCard
          label="Avg per Service"
          value={formatCurrency(budgetStatus.averagePerService, preferences.currency)}
          subtitle={`${budgetStatus.serviceCount} services`}
          icon="▤"
        />
      </div>

      <div className="card mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Budget Settings</h2>
          {!isEditing && (
            <button type="button" onClick={() => setIsEditing(true)} className="btn-secondary">
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Monthly Budget ({preferences.currency})</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('monthlyBudget', { valueAsNumber: true })}
                  className="input-field"
                />
                {errors.monthlyBudget && (
                  <p className="mt-1 text-sm text-garage-danger">{errors.monthlyBudget.message}</p>
                )}
              </div>

              <div>
                <label className="label">Annual Budget ({preferences.currency})</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('annualBudget', { valueAsNumber: true })}
                  className="input-field"
                />
                {errors.annualBudget && (
                  <p className="mt-1 text-sm text-garage-danger">{errors.annualBudget.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                Save
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="label">Monthly Budget</p>
              <p className="text-xl font-semibold">
                {formatCurrency(vehicle.budget.monthlyBudget, preferences.currency)}
              </p>
            </div>
            <div>
              <p className="label">Annual Budget</p>
              <p className="text-xl font-semibold">
                {formatCurrency(vehicle.budget.annualBudget, preferences.currency)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">Category Breakdown</h2>
        {breakdown.length === 0 ? (
          <p className="text-garage-muted">No spending data for this period</p>
        ) : (
          <div className="space-y-4">
            {breakdown.map((item) => {
              const percent = budgetStatus.spent > 0 ? (item.total / budgetStatus.spent) * 100 : 0
              return (
                <div key={item.category}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.label}</span>
                      <span className="text-sm text-garage-muted">({item.count} services)</span>
                    </div>
                    <div className="text-right">
                      <p className="tabular-nums font-semibold">
                        {formatCurrency(item.total, preferences.currency)}
                      </p>
                      <p className="text-sm text-garage-muted">{percent.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-garage-border">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
