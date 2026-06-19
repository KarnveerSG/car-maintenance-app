import { useEffect, useState, type ReactNode } from 'react'
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { OnboardingPage } from './pages/OnboardingPage'
import { DashboardPage } from './pages/DashboardPage'
import { VehiclesPage } from './pages/VehiclesPage'
import { ServiceHistoryPage } from './pages/ServiceHistoryPage'
import { RemindersPage } from './pages/RemindersPage'
import { CalendarPage } from './pages/CalendarPage'
import { BudgetPage } from './pages/BudgetPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { SettingsPage } from './pages/SettingsPage'
import { useGarageStore } from './store/useGarageStore'
import { isElectronFile } from './lib/isElectron'

const AppRouter = isElectronFile ? HashRouter : BrowserRouter

function PersistGate({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(() => useGarageStore.persist.hasHydrated())

  useEffect(() => {
    if (useGarageStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    const unsub = useGarageStore.persist.onFinishHydration(() => setHydrated(true))
    const timer = window.setTimeout(() => setHydrated(true), 1500)
    return () => {
      unsub()
      window.clearTimeout(timer)
    }
  }, [])

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-garage-bg text-garage-muted">
        Loading…
      </div>
    )
  }

  return children
}

function ThemeSync() {
  const lightMode = useGarageStore((s) => s.preferences.lightMode)

  useEffect(() => {
    const root = document.documentElement
    if (lightMode) {
      root.classList.remove('dark')
      root.classList.add('light')
    } else {
      root.classList.remove('light')
      root.classList.add('dark')
    }
  }, [lightMode])

  return null
}

function ProtectedLayout() {
  const hasOnboarded = useGarageStore((s) => s.hasOnboarded)
  if (!hasOnboarded) return <Navigate to="/" replace />
  return <AppLayout />
}

function App() {
  return (
    <PersistGate>
      <AppRouter>
        <ThemeSync />
        <Routes>
          <Route path="/" element={<OnboardingPage />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/service-history" element={<ServiceHistoryPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppRouter>
    </PersistGate>
  )
}

export default App
