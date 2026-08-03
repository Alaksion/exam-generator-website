import { ApiKeyGate } from '@/components/ApiKeyGate'
import { useAuth } from '@/lib/auth'

function AuthenticatedApp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Mock Exams</p>
    </div>
  )
}

function App() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <ApiKeyGate />
  }

  return <AuthenticatedApp />
}

export default App