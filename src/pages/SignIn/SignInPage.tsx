import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { ApiRequestError } from '@/lib/api'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export function SignInPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Please enter your email address.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await signIn(trimmedEmail, password)
    } catch (err) {
      setIsSubmitting(false)
      setError(
        err instanceof ApiRequestError
          ? err.message
          : 'Unable to sign in with those credentials.',
      )
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm"
    >
      <h1 className="mb-1 text-xl font-semibold">Sign in</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Use your email and password to access the exam generator.
      </p>

      <div className="mb-4 grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError(null)
          }}
          placeholder="you@example.com"
          autoFocus
        />
      </div>

      <div className="mb-4 grid gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError(null)
          }}
        />
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className={cn(
              buttonVariants({ variant: 'link', size: 'sm' }),
              'h-auto px-0 py-0',
            )}
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>

      <div className="my-5 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or continue with</span>
        <Separator className="flex-1" />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <Button type="button" variant="outline">
          Continue with Google
        </Button>
        <Button type="button" variant="outline">
          Continue with Apple
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          to="/sign-up"
          className={cn(buttonVariants({ variant: 'link' }), 'h-auto px-0 py-0')}
        >
          Sign up
        </Link>
      </div>
    </form>
  )
}