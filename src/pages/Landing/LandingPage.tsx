import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

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
        <section className="rounded-lg border">
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            Practice exams generated on demand
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Stop reading cloud docs and hoping. Generate a guided mock exam for a
            certification, take it, and see exactly which domains to study next.
          </p>
          <div className="mt-6 flex items-center gap-3">
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
        </section>

        <section className="mt-8">
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
            <div className="rounded-lg border p-5">
              <h3 className="font-heading text-lg font-medium">Generated for you</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a certification and get a fresh practice exam scoped to its
                domains and topics — on demand, not a reused question bank.
              </p>
            </div>
            <div className="rounded-lg border p-5">
              <h3 className="font-heading text-lg font-medium">
                Domain-level breakdown
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                After you submit, see your score split by domain so you know
                precisely which area to study next.
              </p>
            </div>
            <div className="rounded-lg border p-5">
              <h3 className="font-heading text-lg font-medium">
                Ready-to-download PDFs
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your completed exam is available as a PDF, so you can study away
                from the screen.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-semibold mb-6">
            How it works
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-5">
              <h3 className="font-heading text-lg font-medium">1. Pick a certification</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose from the catalog and review its exam plan before you begin.
              </p>
            </div>
            <div className="rounded-lg border p-5">
              <h3 className="font-heading text-lg font-medium">
                2. Take the practice exam
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Work through the questions at your own pace, one at a time.
              </p>
            </div>
            <div className="rounded-lg border p-5">
              <h3 className="font-heading text-lg font-medium">
                3. Review your breakdown
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                See your score and which domains to study next.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-lg border p-6 text-center">
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