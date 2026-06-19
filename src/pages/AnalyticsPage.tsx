import { PageHeader } from '../components/layout/AppLayout'
import { MetricCard } from '../components/shared/MetricCard'
import { MaintenanceCharts } from '../components/charts/MaintenanceCharts'
import { useGarageStore } from '../store/useGarageStore'
import { formatCurrency, formatDistance } from '../engine/format'
import { totalLifetimeSpend, costPerDistance } from '../engine/budget'
import { spendByCategory, serviceCountByCategory } from '../engine/analytics'

export function AnalyticsPage() {
  const { getActiveVehicle, preferences } = useGarageStore()
  const vehicle = getActiveVehicle()

  const totalSpent = totalLifetimeSpend(vehicle)
  const costPerUnit = costPerDistance(vehicle)
  const completedRecords = vehicle.serviceRecords.filter((r) => r.status === 'completed')

  const thisYear = new Date().getFullYear()
  const thisYearRecords = completedRecords.filter((r) => new Date(r.date).getFullYear() === thisYear)
  const thisYearSpend = thisYearRecords.reduce((sum, r) => sum + r.cost, 0)

  const topCategory = spendByCategory(vehicle)[0]

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Insights and spending trends" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard
          label="Total Lifetime Spend"
          value={formatCurrency(totalSpent, preferences.currency)}
          subtitle={`${completedRecords.length} services`}
          icon="◈"
        />
        <MetricCard
          label={`Cost per ${preferences.distanceUnit === 'mi' ? 'Mile' : 'Kilometer'}`}
          value={formatCurrency(costPerUnit, preferences.currency)}
          subtitle={formatDistance(vehicle.profile.currentMileage, preferences.distanceUnit)}
          icon="◧"
        />
        <MetricCard
          label="This Year"
          value={formatCurrency(thisYearSpend, preferences.currency)}
          subtitle={`${thisYearRecords.length} services`}
          icon="◎"
        />
        <MetricCard
          label="Most Expensive"
          value={topCategory ? topCategory.label : '—'}
          subtitle={topCategory ? formatCurrency(topCategory.total, preferences.currency) : 'No data'}
          icon="▤"
        />
      </div>

      <MaintenanceCharts vehicle={vehicle} preferences={preferences} />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Top Categories by Spend</h2>
          {spendByCategory(vehicle).length === 0 ? (
            <p className="text-garage-muted">No data available</p>
          ) : (
            <div className="space-y-3">
              {spendByCategory(vehicle).slice(0, 5).map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="tabular-nums font-semibold">
                      {formatCurrency(item.total, preferences.currency)}
                    </p>
                    <p className="text-sm text-garage-muted">{item.count} services</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Most Frequent Services</h2>
          {serviceCountByCategory(vehicle).length === 0 ? (
            <p className="text-garage-muted">No data available</p>
          ) : (
            <div className="space-y-3">
              {serviceCountByCategory(vehicle).slice(0, 5).map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="tabular-nums font-semibold">{item.count} times</p>
                    <p className="text-sm text-garage-muted">
                      {formatCurrency(item.total / item.count, preferences.currency)} avg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
