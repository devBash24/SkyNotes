import { X, CalendarDays } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { JournalEntry } from "@/components/Journal/types"

const moodBadgeStyles: Record<string, string> = {
  energised: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  reflective: "bg-slate-100 text-slate-700 border border-slate-200",
  grateful: "bg-amber-100 text-amber-700 border border-amber-200",
  calm: "bg-sky-100 text-sky-700 border border-sky-200",
}

type EntryDetailModalProps = {
  entry?: JournalEntry
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const EntryDetailModal = ({ entry, open, onOpenChange }: EntryDetailModalProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto px-2 py-4 sm:items-center sm:px-4 sm:py-10">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-t-3xl border border-border/70 bg-background shadow-xl sm:max-h-[90vh] sm:rounded-2xl">
            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute right-4 top-4 rounded-full border border-border/60 bg-background/70 p-2 text-muted-foreground transition hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </Dialog.Close>
            {entry ? (
              <div className="flex max-h-[90vh] flex-col">
                <Dialog.Title className="px-8 pt-8 text-2xl font-semibold text-foreground/90">
                  {entry.title}
                </Dialog.Title>
                <Dialog.Description className="flex items-center gap-2 px-8 text-sm text-muted-foreground">
                  <CalendarDays className="size-4" />
                  {entry.date}
                </Dialog.Description>
                <div className="flex-1 overflow-y-auto px-8 py-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge
                      variant="outline"
                      className={moodBadgeStyles[entry.mood] ?? "bg-muted text-muted-foreground"}
                    >
                      {entry.mood}
                    </Badge>
                    {entry.tags.map((tag) => (
                      <Badge key={`${entry.id}-modal-${tag}`} variant="secondary" className="rounded-full px-2.5 py-1 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {entry.attachments?.length ? (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {entry.attachments.map((attachment) => (
                        <figure key={attachment.id} className="overflow-hidden rounded-xl border border-border/60 bg-muted/40">
                          {attachment.thumbnailUrl ? (
                            <img
                              src={attachment.thumbnailUrl}
                              alt={attachment.label ?? `${entry.title} attachment`}
                              className="h-48 w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-48 w-full items-center justify-center text-muted-foreground">
                              <span className="text-xs uppercase tracking-wide">Attachment</span>
                            </div>
                          )}
                          {attachment.label ? (
                            <figcaption className="px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              {attachment.label}
                            </figcaption>
                          ) : null}
                        </figure>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-xl border border-dashed border-border/60 bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
                      No attachments yet. Add an image or file link to enrich this memory.
                    </div>
                  )}
                  {entry.prompt ? (
                    <div className="mt-6 rounded-md border border-dashed border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                      Prompt: {entry.prompt}
                    </div>
                  ) : null}
                  <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                    {entry.content}
                  </p>
                </div>
                <div className="flex justify-end border-t border-border/60 bg-muted/20 px-8 py-4">
                  <Dialog.Close asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Close
                    </Button>
                  </Dialog.Close>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 px-8 py-6 text-center">
                <Dialog.Title className="text-lg font-semibold text-foreground/90">
                  No entry selected
                </Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">
                  Choose an entry from the list to see the full reflection here.
                </Dialog.Description>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
