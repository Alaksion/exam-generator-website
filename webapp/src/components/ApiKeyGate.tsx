import { type FormEvent, useState } from 'react'
import { useAuth } from '@/lib/auth'

export function ApiKeyGate() {
  const { setKey } = useAuth()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) {
      setError('Please enter an API key')
      return
    }
    setError(null)
    setKey(trimmed)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-xl font-semibold mb-2">API Key Required</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter the shared API key to access the exam generator.
        </p>

        <label htmlFor="api-key" className="sr-only">
          API Key
        </label>
        <input
          id="api-key"
          type="password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(null)
          }}
          placeholder="Paste your API key"
          className="w-full px-3 py-2 border rounded mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  )
}