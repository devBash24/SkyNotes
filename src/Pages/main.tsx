import { useCallback, useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { NotebookPen } from "lucide-react"
import { useAuth } from "@/context/useAuth"
import { useJournal } from "@/context/journalProvider"
import type { JournalEntry } from "@/components/Journal/types"
import  {ApplicationHeader} from '@/components/Journal/ApplicationHeader'
import  {JournalFeed} from '@/components/Journal/JournalFeed'
import  {EntryDetailModal} from '@/components/Journal/EntryDetailModal'




const todaysDate = new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(new Date())

const formatDate = (value: string | undefined) => {
  if (!value) return "—"
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
  } catch {
    return value
  }
}

export const MainPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut, isLoading: isAuthLoading } = useAuth()
  const { journalEntries, status } = useJournal()
  const [activeEntryId, setActiveEntryId] = useState<string | undefined>(undefined)
  const [previewEntry, setPreviewEntry] = useState<JournalEntry | undefined>()

  const handleSignInNavigation = useCallback(() => {
    navigate("/auth", { state: { returnTo: location.pathname + location.search } })
  }, [navigate, location.pathname, location.search])

  useEffect(() => {
    if (journalEntries.length === 0) {
      setActiveEntryId(undefined)
      setPreviewEntry(undefined)
      return
    }

    setActiveEntryId((current) => {
      if (current && journalEntries.some((entry) => entry.id === current)) {
        return current
      }
      return journalEntries[0].id
    })

    setPreviewEntry((current) => {
      if (current) {
        const match = journalEntries.find((entry) => entry.id === current.id)
        if (match) {
          return match
        }
      }
      return journalEntries[0]
    })
  }, [journalEntries])

  useEffect(() => {
    const state = location.state as { highlightEntryId?: string } | null
    if (!state?.highlightEntryId) {
      return
    }

    const match = journalEntries.find((entry) => entry.id === state.highlightEntryId)
    if (match) {
      setActiveEntryId(match.id)
      setPreviewEntry(match)
    }

    navigate(location.pathname + location.search, { replace: true })
  }, [journalEntries, location.pathname, location.search, location.state, navigate])

  const highlightedEntryId = useMemo(
    () => previewEntry?.id ?? activeEntryId,
    [previewEntry?.id, activeEntryId]
  )

  const handleEntrySelect = (entry: JournalEntry) => {
    setActiveEntryId(entry.id)
    setPreviewEntry(entry)
  }

  const handleEntryModalChange = (open: boolean) => {
    if (!open) {
      setPreviewEntry(undefined)
    }
  }

  useEffect(() => {
    if (!isAuthLoading && !user) {
      handleSignInNavigation()
    }
  }, [isAuthLoading, user, handleSignInNavigation])

  const navigateToComposer = () => {
    if (!user) {
      navigate("/auth", { state: { returnTo: "/entries/new" } })
      return
    }

    navigate("/entries/new")
  }

  const totalEntries = journalEntries.length
  const latestEntry = journalEntries[0]
  const latestEntryDate = latestEntry?.date

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ApplicationHeader
        currentPath={location.pathname}
        currentHash={location.hash}
        onSignOut={signOut}
        onSignIn={handleSignInNavigation}
        onAddEntry={navigateToComposer}
        isAuthenticated={Boolean(user)}
        isAuthLoading={isAuthLoading}
      />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
        <section className="rounded-2xl border border-border/60 bg-secondary/10 px-6 py-6 shadow-sm sm:px-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{todaysDate}</p>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Journal feed</h1>
                <p className="text-sm text-muted-foreground">
                  Review what you captured recently. Select an entry to open its details in the panel below.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-xl border border-border/60 bg-background px-3 py-2 text-left text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{totalEntries}</span> total entries
                </div>
                <div className="rounded-xl border border-border/60 bg-background px-3 py-2 text-left text-xs text-muted-foreground">
                  Last entry: <span className="font-semibold text-foreground">{formatDate(latestEntryDate)}</span>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/15"
                  onClick={navigateToComposer}
                >
                  <NotebookPen className="size-4" />
                  New entry
                </button>
              </div>
            </div>
          </div>
        </section>

        <JournalFeed
          entries={journalEntries}
          status={status}
          activeEntryId={highlightedEntryId}
          onSelectEntry={handleEntrySelect}
          onAddEntry={navigateToComposer}
        />
      </main>
      <EntryDetailModal entry={previewEntry} open={Boolean(previewEntry)} onOpenChange={handleEntryModalChange} />
    </div>
  )
}
