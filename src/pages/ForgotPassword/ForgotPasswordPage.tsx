import { type FormEvent, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { AuthFlowError, authFlowErrorMessage } from '@/lib/auth-errors'
import { cognitoForgotPasswordService } from '@/lib/forgot-password'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormError } from '@/components/FormError'

export function ForgotPasswordPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [stage, setStage] = useState<'request' | 'reset'>('request')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Please enter your email address.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await cognitoForgotPasswordService.requestCode(trimmedEmail)
      setStage('reset')
    } catch (err) {
      setError(
        err instanceof AuthFlowError
          ? authFlowErrorMessage(err.kind)
          : 'Unable to request a reset.',
      )
      setIsSubmitting(false)
    }
  }

  const handleReset = async (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim() || !newPassword) {
      setError('Please enter the reset code and a new password.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await cognitoForgotPasswordService.resetPassword(email, code.trim(), newPassword)
      await signIn(email, newPassword)
    } catch (err) {
      setError(
        err instanceof AuthFlowError
          ? authFlowErrorMessage(err.kind)
          : 'Please sign in with your new password.',
      )
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={stage === 'request' ? handleRequest : handleReset}
      className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm sm:p-8"
    >
      <h1 className="mb-1 text-xl font-semibold">
        {stage === 'request' ? 'Reset your password' : 'Enter the reset code'}
      </h1>
      {stage === 'request' ? (
        <>
          <p className="mb-6 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a one-time reset code.
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
          <FormError message={error} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send reset code'}
          </Button>
        </>
      ) : (
        <>
          <p className="mb-6 text-sm text-muted-foreground">
            If that email belongs to an account, a reset code was sent to it.
          </p>
          <div className="mb-4 grid gap-1.5">
            <Label htmlFor="code">Reset code</Label>
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
          <div className="mb-4 grid gap-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                setError(null)
              }}
            />
          </div>
          <FormError message={error} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting…' : 'Reset password'}
          </Button>
        </>
      )}
    </form>
  )
}
