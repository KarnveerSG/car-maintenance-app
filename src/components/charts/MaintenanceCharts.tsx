import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { spendByCategory, spendByMonth } from '../../engine/analytics'
import { formatCurrency } from '../../engine/format'
import type { Vehicle, Preferences } from '../../types'

interface Props {
  vehicle: Vehicle
  preferences: Preferences
}

export function MaintenanceCharts({ vehicle, preferences }: Props) {
  const categoryData = spendByCategory(vehicle)
  const monthlyData = spendByMonth(vehicle, 12)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">Monthly Spending (Last 12 Months)</h2>
        {monthlyData.length === 0 ? (
          <p className="text-center text-garage-muted">No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4f" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#9aa5b8', fontSize: 12 }}
                stroke="#2d3a4f"
              />
              <YAxis
                tick={{ fill: '#9aa5b8', fontSize: 12 }}
                stroke="#2d3a4f"
                tickFormatter={(value) => `${preferences.currency} ${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2332',
                  border: '1px solid #2d3a4f',
                  borderRadius: '8px',
                  color: '#f4f0e8',
                }}
                formatter={(value: number) => [formatCurrency(value, preferences.currency), 'Spent']}
              />
              <Bar dataKey="total" fill="#c9a962" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">Spending by Category</h2>
        {categoryData.length === 0 ? (
          <p className="text-center text-garage-muted">No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="total"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.label} (${((entry.total / categoryData.reduce((sum, c) => sum + c.total, 0)) * 100).toFixed(0)}%)`}
                labelLine={{ stroke: '#9aa5b8' }}
              >
                {categoryData.map((entry) => (
                  <Cell key={entry.category} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2332',
                  border: '1px solid #2d3a4f',
                  borderRadius: '8px',
                  color: '#f4f0e8',
                }}
                formatter={(value: number) => [formatCurrency(value, preferences.currency), 'Total']}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
