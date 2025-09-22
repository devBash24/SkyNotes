import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { EntryComposer } from "@/components/Journal/EntryComposer"
import type { NewEntryPayload } from "@/components/Journal/types"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/useAuth"
import { useJournal } from "@/context/journalProvider"

export const NewEntryPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoading } = useAuth()
  const { addEntry } = useJournal()
  const [isSaving, setIsSaving] = useState(false)

  const returnTo = useMemo(() => {
    const state = location.state as { returnTo?: string } | null
    return state?.returnTo ?? "/"
  }, [location.state])

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth", { replace: true, state: { returnTo: location.pathname } })
    }
  }, [isLoading, user, navigate, location.pathname])

  const handleCancel = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate("/")
    }
  }

  const handleCreate = async (payload: NewEntryPayload) => {
    if (!user) {
      navigate("/auth", { state: { returnTo: location.pathname } })
      return
    }

    setIsSaving(true)

    try {
      const created = await addEntry(payload)
      navigate(returnTo, { replace: true, state: { highlightEntryId: created.id } })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
          <Button variant="ghost" className="h-9 gap-2" onClick={handleCancel}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <span className="text-sm font-medium text-muted-foreground">New journal entry</span>
          <div className="w-16" aria-hidden="true" />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Capture today&apos;s reflection</h1>
          <p className="text-sm text-muted-foreground">
            Add a title, choose how you felt, and include any details or attachment links. You can always refine the entry later.
          </p>
        </div>
        <EntryComposer onCreate={handleCreate} isSaving={isSaving} onCancel={handleCancel} />
      </main>
    </div>
  )
}
