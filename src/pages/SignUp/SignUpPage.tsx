import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function SignUpPage() {
  return (
    <div className="w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm">
      <h1 className="mb-1 text-xl font-semibold">Create an account</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Sign up with your email to start generating mock exams.
      </p>
      <p className="mb-6 text-sm text-muted-foreground">
        Account creation is coming next.
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