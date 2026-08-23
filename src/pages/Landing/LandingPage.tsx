import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

function LandingMotif({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 320 320"
      fill="none"
      className={className}
    >
      <rect x="0" y="0" width="320" height="320" className="fill-secondary" />
      <g className="stroke-border" strokeWidth="1">
        <path d="M0 64 H320" />
        <path d="M0 128 H320" />
        <path d="M0 192 H320" />
        <path d="M0 256 H320" />
        <path d="M64 0 V320" />
        <path d="M128 0 V320" />
        <path d="M192 0 V320" />
        <path d="M256 0 V320" />
      </g>
      <g className="fill-primary" fillRule="evenodd">
        <rect x="16" y="16" width="32" height="32" rx="2" />
        <rect x="80" y="80" width="32" height="32" rx="2" />
        <rect x="144" y="144" width="32" height="32" rx="2" />
        <rect x="208" y="208" width="32" height="32" rx="2" />
        <rect x="272" y="272" width="32" height="32" rx="2" />
        <circle cx="48" cy="160" r="8" />
        <circle cx="112" cy="32" r="8" />
        <circle cx="176" cy="96" r="8" />
        <circle cx="240" cy="160" r="8" />
        <circle cx="304" cy="48" r="8" />
      </g>
    </svg>
  )
}

interface LandingCardProps {
  title: string
  children: React.ReactNode
}

function LandingCard({ title, children }: LandingCardProps) {
  return (
    <div className="rounded-lg border p-5">
      <h3 className="font-heading text-lg font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="font-heading text-lg font-medium">
            Mock Exams
          </Link>
          <Link
            to="/sign-in"
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            Sign in
          </Link>
        </div>
      </header>
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <section className="grid items-center gap-8 rounded-lg border sm:grid-cols-[1.4fr_1fr]">
          <div className="p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Cloud certifications
            </p>
            <h1 className="mt-4 font-heading text-5xl sm:text-6xl font-semibold tracking-tight">
              Practice exams generated on demand
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Stop reading cloud docs and hoping. Generate a guided mock exam for
              a certification, take it, and see exactly which domains to study
              next.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/sign-up"
                className={buttonVariants({ variant: 'default', size: 'lg' })}
              >
                Get started
              </Link>
              <Link
                to="/sign-in"
                className={buttonVariants({ variant: 'link', size: 'lg' })}
              >
                Sign in
              </Link>
            </div>
          </div>
          <div className="hidden sm:block h-full rounded-lg border">
            <LandingMotif className="h-full w-full rounded-md" />
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6">
            <h2 className="font-heading text-2xl font-semibold">
              Why mock exams work
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Reading is easy to mistake for studying. Guided practice turns
              what you do not know into a plan.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <LandingCard title="Generated for you">
              Pick a certification and get a fresh practice exam scoped to its
              domains and topics — on demand, not a reused question bank.
            </LandingCard>
            <LandingCard title="Domain-level breakdown">
              After you submit, see your score split by domain so you know
              precisely which area to study next.
            </LandingCard>
            <LandingCard title="Ready-to-download PDFs">
              Your completed exam is available as a PDF, so you can study away
              from the screen.
            </LandingCard>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-semibold mb-6">
            How it works
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <LandingCard title="1. Pick a certification">
              Choose from the catalog and review its exam plan before you begin.
            </LandingCard>
            <LandingCard title="2. Generate the exam">
              Confirm the plan and the platform builds a fresh practice exam
              from your certification&apos;s domains and topics.
            </LandingCard>
            <LandingCard title="3. Take the attempt">
              Work through the questions at your own pace, one at a time.
            </LandingCard>
            <LandingCard title="4. Review the breakdown">
              See your score and which domains to study next.
            </LandingCard>
          </div>
        </section>

        <section className="mt-12 rounded-lg border p-6 text-center sm:p-8">
          <h2 className="font-heading text-2xl font-semibold">
            Ready to see where you stand?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Generate your first practice exam in minutes.
          </p>
          <div className="mt-4">
            <Link
              to="/sign-up"
              className={buttonVariants({ variant: 'default', size: 'lg' })}
            >
              Get started
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <p className="text-sm text-muted-foreground">Mock Exams</p>
        </div>
      </footer>
    </div>
  )
}