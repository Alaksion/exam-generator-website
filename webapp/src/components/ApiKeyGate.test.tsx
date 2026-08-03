import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '@/components/AuthProvider'
import { ApiKeyGate } from '@/components/ApiKeyGate'

function renderGate() {
  return render(
    <AuthProvider>
      <ApiKeyGate />
    </AuthProvider>,
  )
}

describe('ApiKeyGate', () => {
  beforeEach(() => localStorage.clear())

  it('shows the prompt when no key is set', () => {
    renderGate()
    expect(screen.getByText('API Key Required')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Paste your API key')).toBeInTheDocument()
  })

  it('shows an error when submitting empty input', async () => {
    const user = userEvent.setup()
    renderGate()

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(screen.getByText('Please enter an API key')).toBeInTheDocument()
  })

  it('stores the key on valid submission', async () => {
    const user = userEvent.setup()
    renderGate()

    const input = screen.getByPlaceholderText('Paste your API key')
    await user.type(input, 'test-key-123')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(localStorage.getItem('x-api-key')).toBe('test-key-123')
  })
})