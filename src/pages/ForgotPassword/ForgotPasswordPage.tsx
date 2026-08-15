import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm">
      <h1 className="mb-1 text-xl font-semibold">Reset your password</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Enter your email and we&apos;ll send you a reset code.
      </p>
      <p className="mb-6 text-sm text-muted-foreground">
        Password recovery is coming next.
      </p>
      <Link
        to="/"
        className={cn(buttonVariants({ variant: 'link' }), 'h-auto px-0 py-0')}
      >
        Back to sign in
      </Link>
    </div>
  )
}