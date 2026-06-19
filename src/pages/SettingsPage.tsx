import { useState } from 'react'
import { PageHeader } from '../components/layout/AppLayout'
import { useGarageStore } from '../store/useGarageStore'
import { exportAppState, parseAppState } from '../store/useGarageStore'
import { CURRENCIES, DISTANCE_UNITS } from '../types'

export function SettingsPage() {
  const { preferences, updatePreferences, resetAll, importState } = useGarageStore()
  const [showExport, setShowExport] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importData, setImportData] = useState('')
  const [importError, setImportError] = useState('')

  const handleExport = () => {
    const state = useGarageStore.getState()
    const json = exportAppState(state)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `garage-keeper-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setShowExport(false)
  }

  const handleImport = () => {
    try {
      const parsed = parseAppState(importData)
      if (confirm('This will replace all current data. Continue?')) {
        importState(parsed)
        setShowImport(false)
        setImportData('')
        setImportError('')
      }
    } catch (err) {
      setImportError('Invalid backup file')
    }
  }

  const handleReset = () => {
    if (confirm('Reset all data? This cannot be undone.')) {
      if (confirm('Are you absolutely sure? All vehicles and records will be deleted.')) {
        resetAll()
      }
    }
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Preferences and data management" />

      <div className="space-y-6">
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Currency</label>
              <select
                value={preferences.currency}
                onChange={(e) => updatePreferences({ currency: e.target.value as any })}
                className="input-field"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Distance Unit</label>
              <select
                value={preferences.distanceUnit}
                onChange={(e) => updatePreferences({ distanceUnit: e.target.value as any })}
                className="input-field"
              >
                {DISTANCE_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="light-mode"
                checked={preferences.lightMode}
                onChange={(e) => updatePreferences({ lightMode: e.target.checked })}
                className="h-4 w-4 cursor-pointer rounded border-garage-border bg-garage-bg accent-garage-amber"
              />
              <label htmlFor="light-mode" className="cursor-pointer text-sm font-medium">
                Light mode
              </label>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Data Management</h2>
          <div className="space-y-3">
            {!showExport ? (
              <button type="button" onClick={() => setShowExport(true)} className="btn-secondary w-full">
                Export Backup
              </button>
            ) : (
              <div className="rounded-lg border border-garage-border bg-garage-elevated p-4">
                <p className="mb-3 text-sm text-garage-muted">
                  Download a JSON backup of all your data
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={handleExport} className="btn-primary">
                    Download Backup
                  </button>
                  <button type="button" onClick={() => setShowExport(false)} className="btn-ghost">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!showImport ? (
              <button type="button" onClick={() => setShowImport(true)} className="btn-secondary w-full">
                Import Backup
              </button>
            ) : (
              <div className="rounded-lg border border-garage-border bg-garage-elevated p-4">
                <p className="mb-3 text-sm text-garage-muted">
                  Paste your backup JSON below
                </p>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="input-field mb-2"
                  rows={6}
                  placeholder="Paste backup JSON here..."
                />
                {importError && <p className="mb-2 text-sm text-garage-danger">{importError}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={handleImport} className="btn-primary">
                    Import
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowImport(false)
                      setImportData('')
                      setImportError('')
                    }}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <button type="button" onClick={handleReset} className="btn-ghost w-full text-garage-danger">
              Reset All Data
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">About</h2>
          <div className="space-y-2 text-sm text-garage-muted">
            <p>
              <strong className="text-garage-text">Garage Keeper</strong> v2.0.0
            </p>
            <p>
              Track vehicle maintenance, service history, reminders, and budgets. All data is stored locally in
              your browser using localStorage.
            </p>
            <p className="mt-4 text-xs">
              Built with React, TypeScript, Tailwind CSS, and Zustand
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
