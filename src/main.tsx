import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { AuthProvider } from '@/components/AuthProvider'
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary'
import { Toaster } from '@/components/ui/sonner'
import App from './App.tsx'
import './index.css'

const mutationCache = new MutationCache({
  onError: (error) => {
    window.dispatchEvent(new CustomEvent('api:globalerror', { detail: error }))
  },
})

const queryClient = new QueryClient({
  mutationCache,
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof Error && 'status' in error) {
          const apiError = error as { status: number }
          if (apiError.status === 401 || apiError.status === 404) return false
        }
        return failureCount < 3
      },
      staleTime: 30_000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
)