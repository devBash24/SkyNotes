import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import type { MoodOption, NewEntryPayload } from "./types"

const moodOptions: MoodOption[] = [
  { value: "reflective", label: "Reflective" },
  { value: "grateful", label: "Grateful" },
  { value: "energised", label: "Energised" },
  { value: "calm", label: "Calm" },
]

const suggestedTags = ["morning", "gratitude", "focus", "idea", "personal growth"]

const writingPrompts = [
  "What is one small joy from today?",
  "How did you move closer to your goals?",
  "What challenged you and what did you learn?",
  "Who did you appreciate today and why?",
]

const helperCopy = {
  attachmentLabel: "Give the attachment a short label so it is easier to recognise later.",
  attachmentUrl: "Paste an image link or leave blank if you do not have one right now.",
}

type EntryComposerProps = {
  onCreate: (payload: NewEntryPayload) => void
  isSaving?: boolean
  onCancel?: () => void
}

export function EntryComposer({ onCreate, isSaving, onCancel }: EntryComposerProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mood, setMood] = useState<MoodOption["value"]>("reflective")
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [prompt, setPrompt] = useState<string | undefined>(writingPrompts[0])
  const [attachmentUrl, setAttachmentUrl] = useState("")
  const [attachmentLabel, setAttachmentLabel] = useState("")

  const canSubmit = useMemo(() => title.trim().length > 0 && content.trim().length > 0, [title, content])

  const toggleTag = (tag: string) => {
    setActiveTags((tags) => (tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag]))
  }

  const handleSubmit = () => {
    if (!canSubmit) return

    const formattedAttachmentUrl = attachmentUrl.trim()
    const formattedAttachmentLabel = attachmentLabel.trim()

    onCreate({
      title: title.trim(),
      content: content.trim(),
      mood,
      tags: activeTags,
      prompt,
      attachments: formattedAttachmentUrl
        ? [
            {
              thumbnailUrl: formattedAttachmentUrl,
              label: formattedAttachmentLabel || undefined,
            },
          ]
        : undefined,
    })

    setTitle("")
    setContent("")
    setActiveTags([])
    setAttachmentUrl("")
    setAttachmentLabel("")
  }

  const handlePromptShuffle = () => {
    setPrompt((current) => {
      const currentIndex = writingPrompts.indexOf(current ?? "")
      const nextIndex = (currentIndex + 1) % writingPrompts.length
      return writingPrompts[nextIndex]
    })
  }

  return (
    <Card className="flex h-full flex-col border-border/70 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-semibold text-foreground/90">New entry</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Capture the highlights of your day. Short reflections work best.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Title</label>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Start with a clear headline"
            className="bg-secondary/40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
            <span className="font-medium">Mood</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                onClick={() => setMood(option.value)}
                variant={mood === option.value ? "default" : "outline"}
                className="rounded-full px-3 py-1 text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
            <span className="font-medium">Prompt</span>
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handlePromptShuffle}>
              Shuffle
            </Button>
          </div>
          <p className="rounded-md border border-dashed border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {prompt}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reflection</label>
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write a short reflection about your day..."
            className="min-h-[160px] resize-none bg-secondary/40"
          />
        </div>
        <div className="grid gap-2 rounded-lg border border-dashed border-border/60 bg-muted/30 p-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Attachment</span>
          <Input
            value={attachmentUrl}
            onChange={(event) => setAttachmentUrl(event.target.value)}
            placeholder="Paste an image link (optional)"
            className="bg-background/80"
          />
          <p className="text-xs text-muted-foreground">{helperCopy.attachmentUrl}</p>
          <Input
            value={attachmentLabel}
            onChange={(event) => setAttachmentLabel(event.target.value)}
            placeholder="Give it a helpful label"
            className="bg-background/80"
          />
          <p className="text-xs text-muted-foreground">{helperCopy.attachmentLabel}</p>
        </div>
        <Separator className="bg-border/80" />
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Suggested tags</span>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <Button
                key={tag}
                type="button"
                variant={activeTags.includes(tag) ? "default" : "outline"}
                onClick={() => toggleTag(tag)}
                className="rounded-full px-3 py-1 text-xs capitalize"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 border-t border-border/60 bg-muted/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-muted-foreground">Entries autosave locally</span>
        <div className="flex w-full justify-end gap-2 sm:w-auto">
          {onCancel ? (
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          <Button
            type="button"
            disabled={!canSubmit || isSaving}
            onClick={handleSubmit}
            className="w-full sm:w-auto"
          >
            {isSaving ? "Saving..." : "Add entry"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
