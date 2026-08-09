import { Link } from 'react-router-dom'
import { useCertifications } from '@/hooks/use-certifications'
import { NetworkErrorBlock } from '@/components/NetworkErrorBlock'

export function CatalogPage() {
  const { data, error, isPending, refetch } = useCertifications()

  const active = (data?.items ?? []).filter((cert) => cert.isActive)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-medium">Catalog</h1>
        <p className="text-sm text-muted-foreground">
          Choose a certification to view its exam plan and generate a practice
          exam.
        </p>
      </div>

      {isPending ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading certifications…
        </p>
      ) : error ? (
        <NetworkErrorBlock error={error} onRetry={() => refetch()} />
      ) : active.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No active certifications are available yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {active.map((cert) => (
            <Link
              key={cert.id}
              to={`/certifications/${cert.id}`}
              className="group flex flex-col justify-between rounded-lg border p-5 transition-colors hover:border-primary/40"
            >
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {cert.provider}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {cert.code}
                  </span>
                </div>
                <h2 className="text-lg font-medium">{cert.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cert.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {cert.config.questionCount} questions
                </p>
              </div>
              <span className="mt-4 text-sm font-medium text-primary group-hover:underline">
                View exam plan →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
