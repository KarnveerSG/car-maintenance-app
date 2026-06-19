interface MetricCardProps {
  label: string
  value: string | number
  subtitle?: string
  icon?: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function MetricCard({ label, value, subtitle, icon, trend, className = '' }: MetricCardProps) {
  const trendColor =
    trend === 'up' ? 'text-garage-success' : trend === 'down' ? 'text-garage-danger' : 'text-garage-muted'

  return (
    <div className={`card ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="label">{label}</p>
          <p className="tabular-nums mt-2 text-2xl font-semibold">{value}</p>
          {subtitle && <p className={`mt-1 text-sm ${trendColor}`}>{subtitle}</p>}
        </div>
        {icon && <span className="text-2xl text-garage-muted" aria-hidden>{icon}</span>}
      </div>
    </div>
  )
}
