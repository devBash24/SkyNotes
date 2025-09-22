import { ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { JournalEntry } from "./types"

type EntryCardProps = {
  entry: JournalEntry
  isActive?: boolean
  onSelect?: (entry: JournalEntry) => void
}

const moodStyles: Record<string, string> = {
  energised: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  reflective: "bg-slate-100 text-slate-700 border border-slate-200",
  grateful: "bg-amber-100 text-amber-700 border border-amber-200",
  calm: "bg-sky-100 text-sky-700 border border-sky-200",
}

export function EntryCard({ entry, isActive, onSelect }: EntryCardProps) {
  const handleClick = () => {
    onSelect?.(entry)
  }

  const leadAttachment = entry.attachments?.[0]

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          handleClick()
        }
      }}
      className={cn(
        "group flex flex-col gap-3 border-border/60 transition-colors hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isActive && "border-primary bg-primary/5"
      )}
    >
      <div className="mx-4 mt-4 overflow-hidden rounded-lg border border-border/60 bg-muted/40 shadow-sm">
        {leadAttachment?.thumbnailUrl ? (
          <img
            src={leadAttachment.thumbnailUrl}
            alt={leadAttachment.label ?? `${entry.title} attachment`}
            className="h-32 w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-32 w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="size-6" />
            <span className="text-xs uppercase tracking-wide">No attachment</span>
          </div>
        )}
      </div>
      <CardHeader className="flex flex-col space-y-1 pt-0">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base font-semibold text-foreground/90 group-hover:text-foreground">
            {entry.title}
          </CardTitle>
          <Badge
            variant="outline"
            className={cn("rounded-full px-2.5 py-1 text-xs capitalize", moodStyles[entry.mood] ?? "bg-muted text-muted-foreground")}
          >
            {entry.mood}
          </Badge>
        </div>
        <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
          {entry.date}
        </CardDescription>
      </CardHeader>
      <Separator className="bg-border/70" />
      <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
        {leadAttachment?.label ? (
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-foreground/60">
            Attachment: <span className="text-muted-foreground">{leadAttachment.label}</span>
          </p>
        ) : null}
        {entry.prompt ? (
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-foreground/60">
            Prompt: <span className="text-muted-foreground">{entry.prompt}</span>
          </p>
        ) : null}
        <p className="line-clamp-3 leading-relaxed text-foreground/80">{entry.content}</p>
        <div className="flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <Badge key={`${entry.id}-${tag}`} variant="secondary" className="rounded-full px-2.5 py-1 text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
