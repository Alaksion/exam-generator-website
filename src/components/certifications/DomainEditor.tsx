import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import type { CreateFormValues } from '@/lib/certification-schema'

type Domain = CreateFormValues['config']['domains'][number]

interface DomainEditorProps {
  domainIndex: number
  domain: Domain
  onUpdate: (next: Domain) => void
  onRemove?: () => void
}

export function DomainEditor({
  domainIndex,
  domain,
  onUpdate,
  onRemove,
}: DomainEditorProps) {
  function updateTopic(topicIndex: number, value: string) {
    onUpdate({
      ...domain,
      topics: domain.topics.map((t, i) => (i === topicIndex ? value : t)),
    })
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">Domain {domainIndex + 1}</p>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            className="shrink-0"
            onClick={onRemove}
          >
            Remove domain
          </Button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
        <Label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Domain name</span>
          <Input
            placeholder={`Domain ${domainIndex + 1} name`}
            value={domain.name}
            onChange={(e) => onUpdate({ ...domain, name: e.target.value })}
          />
        </Label>
        <Label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Weight</span>
          <NumberInput
            min={0}
            value={domain.weight}
            onValueChange={(next) => onUpdate({ ...domain, weight: next })}
          />
        </Label>
      </div>

      <div className="mt-3">
        <p className="mb-1 text-xs text-muted-foreground">Topics</p>
        <div className="flex flex-col gap-2">
          {domain.topics.map((topic, topicIndex) => (
            <div key={topicIndex} className="flex items-center gap-2">
              <Input
                placeholder={`Topic ${topicIndex + 1} name`}
                value={topic}
                onChange={(e) => updateTopic(topicIndex, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                className="shrink-0"
                disabled={domain.topics.length <= 1}
                onClick={() =>
                  onUpdate({
                    ...domain,
                    topics: domain.topics.filter((_, i) => i !== topicIndex),
                  })
                }
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-2"
          onClick={() => onUpdate({ ...domain, topics: [...domain.topics, ''] })}
        >
          Add topic
        </Button>
      </div>
    </div>
  )
}
