import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { EntryCard } from "./EntryCard"
import type { JournalEntry } from "./types"

type EntryListProps = {
  entries: JournalEntry[]
  activeEntryId?: string
  onSelect: (entry: JournalEntry) => void
}

export function EntryList({ entries, activeEntryId, onSelect }: EntryListProps) {
  return (
    <Card className="flex h-full min-h-[420px] flex-col border-border/70 shadow-sm">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="text-lg font-semibold text-foreground/90">Recent entries</CardTitle>
        <p className="text-sm text-muted-foreground">
          Revisit what you captured earlier in the week to connect patterns and progress.
        </p>
      </CardHeader>
      <Separator className="bg-border/80" />
      <CardContent className="flex-1 space-y-3 overflow-y-auto pr-2">
        {entries.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/60 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            No entries yet. Start today with your first reflection.
          </div>
        ) : (
          entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} isActive={entry.id === activeEntryId} onSelect={onSelect} />
          ))
        )}
      </CardContent>
    </Card>
  )
}
