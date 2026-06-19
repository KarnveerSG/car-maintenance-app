import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useGarageStore } from '../store/useGarageStore'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { loadDemo, completeOnboarding, hasOnboarded } = useGarageStore()

  useEffect(() => {
    if (hasOnboarded) navigate('/dashboard', { replace: true })
  }, [hasOnboarded, navigate])

  const start = () => {
    flushSync(() => completeOnboarding())
    navigate('/dashboard', { replace: true })
  }

  const tryDemo = () => {
    flushSync(() => loadDemo())
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-garage-amber/20 bg-garage-surface shadow-glow">
        <span className="font-serif text-3xl text-garage-amber">◧</span>
      </div>

      <h1 className="font-serif text-4xl font-semibold sm:text-5xl">Garage Keeper</h1>

      <p className="mt-4 max-w-lg text-lg text-garage-muted">
        Track vehicle maintenance, service history, reminders, and budget — all in one place.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={start} className="btn-primary">
          Get started
        </button>
        <button type="button" onClick={tryDemo} className="btn-secondary">
          Explore demo
        </button>
      </div>

      <p className="mt-12 max-w-md text-sm text-garage-muted">
        Manage service records, set maintenance reminders, track costs, and analyze spending patterns — all stored
        locally in your browser.
      </p>
    </div>
  )
}
