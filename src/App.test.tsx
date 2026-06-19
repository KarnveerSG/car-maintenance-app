import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { useGarageStore } from './store/useGarageStore'

afterEach(() => cleanup())

beforeEach(() => {
  localStorage.clear()
  useGarageStore.getState().resetAll()
})

describe('App routing', () => {
  it('redirects onboarded users away from onboarding to dashboard', async () => {
    useGarageStore.setState({ hasOnboarded: true })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    })
  })

  it('Get started navigates to dashboard', async () => {
    const user = userEvent.setup()

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Get started' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Get started' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    })
    expect(useGarageStore.getState().hasOnboarded).toBe(true)
  })
})
