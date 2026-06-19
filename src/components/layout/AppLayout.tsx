import { NavLink, Outlet } from 'react-router-dom'
import { useGarageStore } from '../../store/useGarageStore'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '◈' },
  { to: '/vehicles', label: 'Vehicles', icon: '◧' },
  { to: '/service-history', label: 'Service History', icon: '▤' },
  { to: '/reminders', label: 'Reminders', icon: '◉' },
  { to: '/calendar', label: 'Calendar', icon: '◷' },
  { to: '/budget', label: 'Budget', icon: '◫' },
  { to: '/analytics', label: 'Analytics', icon: '◎' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export function AppLayout() {
  const { getActiveVehicle, toggleLightMode, preferences } = useGarageStore()
  const vehicle = getActiveVehicle()

  return (
    <div className="min-h-dvh lg:flex">
      <aside className="no-print border-b border-garage-border bg-garage-surface lg:fixed lg:inset-y-0 lg:w-64 lg:border-b-0 lg:border-r">
        <div className="px-4 py-5 lg:px-6">
          <p className="font-serif text-xl font-semibold">Garage Keeper</p>
          <p className="text-xs text-garage-muted">{vehicle.profile.name}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-6">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors lg:px-4 ${
                  isActive
                    ? 'bg-garage-amber/15 font-medium text-garage-amber'
                    : 'text-garage-muted hover:bg-garage-elevated hover:text-garage-text'
                }`
              }
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <button
        type="button"
        onClick={toggleLightMode}
        className="fixed bottom-4 left-4 z-50 btn-ghost rounded-xl border border-garage-border bg-garage-surface/95 px-3 py-2 text-sm shadow-lg backdrop-blur-sm bottom-20 lg:bottom-4 lg:left-4"
        aria-label="Toggle theme"
      >
        {preferences.lightMode ? '◐ Dark mode' : '◑ Light mode'}
      </button>

      <div className="flex-1 lg:pl-64">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
        <footer className="px-6 pb-6 text-center text-xs text-garage-muted">
          Maintenance tracking · Data stored locally in your browser
        </footer>
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-garage-muted">{subtitle}</p>}
    </div>
  )
}
