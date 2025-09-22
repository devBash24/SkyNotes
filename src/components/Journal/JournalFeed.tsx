import { NotebookPen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EntryList } from '@/components/Journal/EntryList'
import type { JournalEntry } from '@/components/Journal/types'
import type { StatusType } from '@/context/journalProvider'

type JournalFeedProps = {
  entries: JournalEntry[]
  status: StatusType
  activeEntryId?: string
  onSelectEntry: (entry: JournalEntry) => void
  onAddEntry: () => void
}

export const JournalFeed = ({ entries, status, activeEntryId, onSelectEntry, onAddEntry }: JournalFeedProps) => {
  const isEmpty = entries.length === 0
  const showInlineLoader = status === 'loading' && !isEmpty

  return (
    <section id='entries' className='flex flex-col gap-4'>
      {showInlineLoader ? (
        <div className='rounded-lg border border-dashed border-border/60 bg-muted/40 px-4 py-3 text-sm text-muted-foreground'>
          Refreshing your entries...
        </div>
      ) : null}

      {status === 'error' && isEmpty ? (
        <div className='rounded-xl border border-destructive/40 bg-destructive/10 px-6 py-8 text-center text-sm text-destructive'>
          We couldn't load your entries right now. Please try again shortly.
        </div>
      ) : null}

      {status === 'loading' && isEmpty ? (
        <div className='rounded-xl border border-dashed border-border/60 bg-muted/40 px-6 py-8 text-center text-sm text-muted-foreground'>
          Loading your entries...
        </div>
      ) : null}

      {!isEmpty ? (
        <EntryList entries={entries} activeEntryId={activeEntryId} onSelect={onSelectEntry} />
      ) : status !== 'loading' ? (
        <div className='flex flex-col items-center gap-4 rounded-xl border border-dashed border-border/60 bg-muted/20 px-8 py-12 text-center text-sm text-muted-foreground'>
          <p>No entries yet — your first reflection will appear here.</p>
          <Button onClick={onAddEntry} className='gap-2'>
            <NotebookPen className='size-4' />
            Capture a new entry
          </Button>
        </div>
      ) : null}
    </section>
  )
}
