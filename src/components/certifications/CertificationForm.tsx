import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { DomainEditor } from '@/components/certifications/DomainEditor'
import {
  createFormSchema,
  difficultySumMessage,
  difficultyTotalFor,
  domainWeightMessage,
  domainWeightTotalFor,
  PROVIDERS,
  type CreateFormValues,
} from '@/lib/certification-schema'

export interface CertificationFormProps {
  onSubmit: (values: CreateFormValues) => void
  isSubmitting?: boolean
  initialValues?: CreateFormValues
}

const emptyDomain = () => ({
  name: '',
  weight: 100,
  topics: [''],
})

const defaultValues = (): CreateFormValues => ({
  provider: 'aws',
  code: '',
  name: '',
  description: '',
  isActive: true,
  config: {
    questionCount: 10,
    difficultyDistribution: { easy: 40, medium: 40, hard: 20 },
    domains: [emptyDomain()],
  },
})

export function CertificationForm({
  onSubmit,
  isSubmitting = false,
  initialValues,
}: CertificationFormProps) {
  const [form, setForm] = useState<CreateFormValues>(
    initialValues ?? defaultValues(),
  )
  const [deactivateOpen, setDeactivateOpen] = useState(false)

  const isEdit = Boolean(initialValues)

  useEffect(() => {
    if (initialValues) setForm(initialValues)
  }, [initialValues])

  const result = createFormSchema.safeParse(form)
  const isValid = result.success

  const set = <K extends keyof CreateFormValues>(key: K, value: CreateFormValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const setConfig = (
    updater: (config: CreateFormValues['config']) => CreateFormValues['config'],
  ) => setForm((prev) => ({ ...prev, config: updater(prev.config) }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!result.success) return
    onSubmit(result.data)
  }

  function handleIsActiveChange(checked: boolean) {
    if (form.isActive && !checked) {
      setDeactivateOpen(true)
      return
    }
    set('isActive', checked)
  }

  function confirmDeactivate() {
    set('isActive', false)
    setDeactivateOpen(false)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {!isEdit && (
          <>
            <Field>
              <FieldLabel>Provider</FieldLabel>
              <Select
                value={form.provider}
                onValueChange={(value) =>
                  set('provider', value as CreateFormValues['provider'])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="code">Code</FieldLabel>
              <Input
                id="code"
                value={form.code}
                placeholder="e.g. CLF-C02"
                onChange={(e) => set('code', e.target.value)}
              />
            </Field>
          </>
        )}
      </div>

      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input
          id="name"
          value={form.name}
          placeholder="e.g. AWS Certified Cloud Practitioner"
          onChange={(e) => set('name', e.target.value)}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <Textarea
          id="description"
          value={form.description}
          placeholder="Short description"
          onChange={(e) => set('description', e.target.value)}
        />
      </Field>

      <Field>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            className="size-4 rounded border-input accent-primary"
            onChange={(e) => handleIsActiveChange(e.target.checked)}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="questionCount">Question count</FieldLabel>
          <NumberInput
            id="questionCount"
            min={1}
            max={100}
            value={form.config.questionCount}
            onValueChange={(next) =>
              setConfig((c) => ({ ...c, questionCount: next }))
            }
          />
          {result.success === false &&
            result.error.issues.some((i) =>
              i.path.join('.').startsWith('config.questionCount'),
            ) && (
              <FieldError
                errors={[
                  { message: 'Question count must be between 1 and 100' },
                ]}
              />
            )}
        </Field>

        <Field className="sm:col-span-2">
          <FieldLabel>Difficulty distribution (%)</FieldLabel>
          <div className="flex flex-1 items-end gap-3">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <Label key={level} className="flex flex-1 flex-col gap-1">
                <span className="text-xs text-muted-foreground capitalize">
                  {level}
                </span>
                <NumberInput
                  min={0}
                  value={form.config.difficultyDistribution[level]}
                  onValueChange={(next) =>
                    setConfig((c) => ({
                      ...c,
                      difficultyDistribution: {
                        ...c.difficultyDistribution,
                        [level]: next,
                      },
                    }))
                  }
                />
              </Label>
            ))}
            <div className="flex h-8 shrink-0 items-center text-sm font-medium tabular-nums">
              = {difficultyTotalFor(form.config.difficultyDistribution)}%
            </div>
          </div>
          {difficultyTotalFor(form.config.difficultyDistribution) !== 100 && (
            <FieldError
              errors={[
                {
                  message: difficultySumMessage(
                    difficultyTotalFor(form.config.difficultyDistribution),
                  ),
                },
              ]}
            />
          )}
        </Field>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Domains</p>
        <div className="flex flex-col gap-4">
          {form.config.domains.map((domain, domainIndex) => (
            <DomainEditor
              key={domainIndex}
              domainIndex={domainIndex}
              domain={domain}
              onUpdate={(next) =>
                setConfig((c) => ({
                  ...c,
                  domains: c.domains.map((d, i) =>
                    i === domainIndex ? next : d,
                  ),
                }))
              }
              onRemove={
                form.config.domains.length > 1
                  ? () =>
                      setConfig((c) => ({
                        ...c,
                        domains: c.domains.filter((_, i) => i !== domainIndex),
                      }))
                  : undefined
              }
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-3"
          onClick={() =>
            setConfig((c) => ({ ...c, domains: [...c.domains, emptyDomain()] }))
          }
        >
          Add domain
        </Button>
        {domainWeightTotalFor(form.config.domains) !== 100 && (
          <FieldError
            errors={[
              {
                message: domainWeightMessage(
                  domainWeightTotalFor(form.config.domains),
                ),
              },
            ]}
          />
        )}
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting
            ? isEdit
              ? 'Saving…'
              : 'Creating…'
            : isEdit
              ? 'Save changes'
              : 'Create certification'}
        </Button>
      </div>

      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate certification</DialogTitle>
            <DialogDescription>
              Deactivating removes this certification from the management list,
              with no way back to it in the UI.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeactivateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDeactivate}>
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}
