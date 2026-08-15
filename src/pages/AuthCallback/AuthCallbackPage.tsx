import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AuthCallbackPage() {
  const { signInWithSocial } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    signInWithSocial().catch(() => {
      setError(
        'Unable to sign in with that provider. Please try again or sign in with email.',
      )
    })
  }, [signInWithSocial])

  return (
    <div className="w-full max-w-sm rounded-lg border bg-card p-8 text-center shadow-sm">
      <h1 className="mb-2 text-xl font-semibold">
        {error ? 'Sign in failed' : 'Signing you in…'}
      </h1>
      {error ? (
        <>
          <p className="mb-6 text-sm text-destructive">{error}</p>
          <Link
            to="/"
            className={cn(buttonVariants({ variant: 'link' }), 'h-auto px-0 py-0')}
          >
            Back to sign in
          </Link>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Please wait a moment.</p>
      )}
    </div>
  )
}
