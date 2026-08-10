import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import { Textarea } from '@/components/ui/textarea'
import { FieldError } from '@/components/ui/field'
import {
  TOPIC_CONTEXT_MAX_LENGTH,
  TOPIC_CONTEXT_MIN_LENGTH,
  topicContextMaxMessage,
  topicContextMinMessage,
  type CreateFormValues,
} from '@/lib/certification-schema'

type Domain = CreateFormValues['config']['domains'][number]
type Topic = Domain['topics'][number]

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
  function updateTopic(topicIndex: number, value: Topic) {
    onUpdate({
      ...domain,
      topics: domain.topics.map((t, i) => (i === topicIndex ? value : t)),
    })
  }

  function contextErrorFor(topic: Topic): string | null {
    const length = topic.context.trim().length
    if (length < TOPIC_CONTEXT_MIN_LENGTH) return topicContextMinMessage()
    if (length > TOPIC_CONTEXT_MAX_LENGTH) return topicContextMaxMessage()
    return null
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
          {domain.topics.map((topic, topicIndex) => {
            const contextLength = topic.context.trim().length
            const contextError = contextErrorFor(topic)
            return (
              <div
                key={topicIndex}
                className="flex flex-col gap-2 rounded-md border p-3"
              >
                <div className="flex items-center gap-2">
                  <Input
                    aria-label={`Topic ${topicIndex + 1} name`}
                    placeholder={`Topic ${topicIndex + 1} name`}
                    value={topic.name}
                    onChange={(e) =>
                      updateTopic(topicIndex, {
                        ...topic,
                        name: e.target.value,
                      })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="shrink-0"
                    disabled={domain.topics.length <= 1}
                    onClick={() =>
                      onUpdate({
                        ...domain,
                        topics: domain.topics.filter(
                          (_, i) => i !== topicIndex,
                        ),
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
                <div className="flex flex-col gap-1">
                  <Textarea
                    aria-label={`Topic ${topicIndex + 1} context`}
                    placeholder="Describe what this topic covers (20–1500 characters)"
                    value={topic.context}
                    aria-invalid={Boolean(contextError)}
                    onChange={(e) =>
                      updateTopic(topicIndex, {
                        ...topic,
                        context: e.target.value,
                      })
                    }
                  />
                  <div className="flex items-center justify-between gap-2">
                    <FieldError errors={contextError ? [{ message: contextError }] : []} />
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
                      {contextLength}/{TOPIC_CONTEXT_MAX_LENGTH}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-2"
          onClick={() =>
            onUpdate({
              ...domain,
              topics: [...domain.topics, { name: '', context: '' }],
            })
          }
        >
          Add topic
        </Button>
      </div>
    </div>
  )
}
