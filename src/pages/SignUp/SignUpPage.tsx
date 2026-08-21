import { type FormEvent, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { AuthFlowError, authFlowErrorMessage } from '@/lib/auth-errors'
import { cognitoSignUpService } from '@/lib/signup'
import { logError } from '@/lib/log'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SignUpPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [stage, setStage] = useState<'details' | 'confirm'>('details')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('Please enter your email and a password.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await cognitoSignUpService.createAccount(trimmedEmail, password)
      setStage('confirm')
    } catch (err) {
      logError('signup.createAccount', err)
      setError(
        err instanceof AuthFlowError ? authFlowErrorMessage(err.kind) : 'Unable to create your account.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setError('Please enter your verification code.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await cognitoSignUpService.confirmRegistration(email, code.trim())
      await signIn(email, password)
    } catch (err) {
      setError(
        err instanceof AuthFlowError
          ? authFlowErrorMessage(err.kind)
          : 'Please sign in with your new account.',
      )
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setError(null)
    try {
      await cognitoSignUpService.resendCode(email)
    } catch (err) {
      setError(
        err instanceof AuthFlowError
          ? authFlowErrorMessage(err.kind)
          : 'Unable to resend the code. Please try again.',
      )
    } finally {
      setIsResending(false)
    }
  }

  return (
    <form
      onSubmit={stage === 'details' ? handleCreate : handleConfirm}
      className="w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm"
    >
      <h1 className="mb-1 text-xl font-semibold">
        {stage === 'details' ? 'Create an account' : 'Verify your email'}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {stage === 'details'
          ? 'Sign up with your email to start generating mock exams.'
          : `We sent a verification code to ${email}.`}
      </p>

      {stage === 'details' ? (
        <>
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
            />
          </div>
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </>
      ) : (
        <>
          <div className="mb-4 grid gap-1.5">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError(null)
              }}
              autoFocus
            />
          </div>
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying…' : 'Verify and sign in'}
          </Button>
          <Button
            type="button"
            variant="link"
            className="h-auto w-full px-0 py-0"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? 'Resending…' : 'Resend code'}
          </Button>
        </>
      )}
    </form>
  )
}
