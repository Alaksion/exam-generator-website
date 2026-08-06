import { useState } from 'react'
import { toast } from 'sonner'
import { useCertifications } from '@/hooks/use-certifications'
import { useDeleteExam, useExamDownload, useExams } from '@/hooks/use-exams'
import { NetworkErrorBlock } from '@/components/NetworkErrorBlock'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ExamListItem, Provider } from '@/lib/types'

const STATUS_OPTIONS = ['READY', 'GENERATING', 'FAILED', 'ALL'] as const
const ALL = 'ALL'
const PROVIDER_OPTIONS: Array<Provider> = ['aws', 'azure', 'gcp']

export function HistoryPage() {
  const [status, setStatus] = useState<string>('READY')
  const [provider, setProvider] = useState<Provider | typeof ALL>(ALL)
  const [certificationId, setCertificationId] = useState<string>(ALL)
  const [pendingDelete, setPendingDelete] = useState<ExamListItem | null>(null)

  const certifications = useCertifications()
  const exams = useExams({
    status: status === ALL ? undefined : status,
    provider: provider === ALL ? undefined : provider,
    certificationId: certificationId === ALL ? undefined : certificationId,
  })
  const download = useExamDownload()
  const deleteExam = useDeleteExam()

  const handleDownload = (exam: ExamListItem) => {
    download.mutate(exam.id, {
      onSuccess: ({ downloadUrl }) => {
        window.open(downloadUrl, '_blank', 'noopener,noreferrer')
      },
      onError: () => {
        toast.error('Unable to download the PDF right now.')
      },
    })
  }

  const handleDelete = () => {
    if (!pendingDelete) return
    deleteExam.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast.success('Exam deleted')
        setPendingDelete(null)
      },
      onError: () => {
        toast.error('Unable to delete the exam.')
      },
    })
  }

  const filterBar = (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={status} onValueChange={(v) => setStatus(v ?? 'READY')}>
        <SelectTrigger size="sm" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={provider}
        onValueChange={(v) => setProvider((v ?? ALL) as Provider | typeof ALL)}
      >
        <SelectTrigger size="sm" aria-label="Filter by provider">
          <SelectValue />
        </SelectTrigger>
<SelectContent>
          <SelectItem value={ALL}>All providers</SelectItem>
          {PROVIDER_OPTIONS.map((p) => (
            <SelectItem key={p} value={p}>
              {p.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={certificationId} onValueChange={(v) => setCertificationId(v ?? 'ALL')}>
        <SelectTrigger size="sm" aria-label="Filter by certification">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All certifications</SelectItem>
          {(certifications.data?.items ?? []).map((cert) => (
            <SelectItem key={cert.id} value={cert.id}>
              {cert.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-medium">History</h1>
        <p className="text-sm text-muted-foreground">
          Browse and manage generated exams.
        </p>
      </div>

      <div className="mb-4">{filterBar}</div>

      {exams.isPending ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading exams…
        </p>
      ) : exams.error ? (
        <NetworkErrorBlock error={exams.error} onRetry={() => exams.refetch()} />
      ) : (exams.data?.items.length ?? 0) === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No exams match these filters.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.data?.items.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="font-medium">{exam.title}</TableCell>
                <TableCell>{exam.provider.toUpperCase()}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{exam.status}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(exam.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(exam)}
                      disabled={download.isPending}
                    >
                      Download
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setPendingDelete(exam)}
                      disabled={deleteExam.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete exam?</DialogTitle>
            <DialogDescription>
              This will permanently delete
              {pendingDelete ? ` "${pendingDelete.title}"` : ' this exam'} and it
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteExam.isPending}
            >
              {deleteExam.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}