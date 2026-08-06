import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCertifications } from '@/hooks/use-certifications'
import { NetworkErrorBlock } from '@/components/NetworkErrorBlock'

export function ManagementListPage() {
  const { data, error, isPending, refetch } = useCertifications()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Certification management</h1>
          <p className="text-sm text-muted-foreground">
            Create and edit the certifications offered in the catalog.
          </p>
        </div>
        <Button render={<Link to="/manage/certifications/new" />}>
          New certification
        </Button>
      </div>

      {isPending ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading certifications…
        </p>
      ) : error ? (
        <NetworkErrorBlock error={error} onRetry={() => refetch()} />
      ) : (data?.items?.length ?? 0) === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No certifications yet.
          </p>
          <Button render={<Link to="/manage/certifications/new" />}>
            Create your first certification
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell className="font-medium">
                  <Link
                    to={`/manage/certifications/${cert.id}/edit`}
                    className="hover:underline"
                  >
                    {cert.name}
                  </Link>
                </TableCell>
                <TableCell>{cert.provider.toUpperCase()}</TableCell>
                <TableCell>{cert.code}</TableCell>
                <TableCell>
                  {cert.isActive ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
