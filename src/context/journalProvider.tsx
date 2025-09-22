/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { JournalEntry, NewEntryPayload } from "@/components/Journal/types"
import { useAuth } from "@/context/useAuth"
import { useApi } from "@/hooks/useApi"

export type StatusType = "idle" | "loading" | "error"

type JournalProviderContextValue = {
  journalEntries: JournalEntry[]
  status: StatusType
  addEntry: (payload: NewEntryPayload) => Promise<JournalEntry>
  deleteEntry: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

type JournalProviderProps = {
  children: ReactNode
}

const JournalProviderContext = createContext<JournalProviderContextValue | null>(null)

const fallbackId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const normaliseEntry = (entry: Partial<JournalEntry>): JournalEntry => ({
  id: entry.id ?? fallbackId(),
  title: entry.title ?? "Untitled entry",
  content: entry.content ?? "",
  mood: entry.mood ?? "reflective",
  tags: Array.isArray(entry.tags) ? entry.tags : [],
  date: entry.date ?? new Date().toISOString(),
  prompt: entry.prompt,
  attachments: Array.isArray(entry.attachments)
    ? entry.attachments.map((attachment) => ({
        id: attachment.id ?? fallbackId(),
        thumbnailUrl: attachment.thumbnailUrl,
        label: attachment.label,
      }))
    : [],
})

export const JournalProvider = ({ children }: JournalProviderProps) => {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { callApi } = useApi()
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [status, setStatus] = useState<StatusType>("idle")

  const fetchEntries = useCallback(async () => {
    if (!user) {
      setJournalEntries([])
      setStatus("idle")
      return
    }

    setStatus("loading")
    try {
      const response = await callApi("/entries")
      const entriesSource:JournalEntry[]  = Array.isArray(response)
        ? response
        : Array.isArray(response?.items)
          ? response.items
          : []
      const entries= entriesSource.map((entry) => normaliseEntry(entry))
      setJournalEntries(entries)
      setStatus("idle")
    } catch (error) {
      console.error("Failed to load journal entries", error)
      setStatus("error")
    }
  }, [callApi, user])

  useEffect(() => {
    if (isAuthLoading) {
      return
    }

    void fetchEntries()
  }, [fetchEntries, isAuthLoading])

  const addEntry = useCallback(
    async (payload: NewEntryPayload) => {
      if (!user) {
        throw new Error("You must be signed in to create a journal entry.")
      }

      setStatus("loading")
      try {
        const response = await callApi("/entries", {
          method: "POST",
          body: JSON.stringify(payload),
        })

        const created = normaliseEntry(response?.entry ?? response ?? payload)
        setJournalEntries((previous) => [created, ...previous])
        setStatus("idle")
        return created
      } catch (error) {
        console.error("Failed to create journal entry", error)
        setStatus("error")
        throw error
      }
    },
    [callApi, user]
  )

  const deleteEntry = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error("You must be signed in to delete a journal entry.")
      }

      setStatus("loading")
      try {
        await callApi(`/entries/${id}`, { method: "DELETE" })
        setJournalEntries((previous) => previous.filter((entry) => entry.id !== id))
        setStatus("idle")
      } catch (error) {
        console.error("Failed to delete journal entry", error)
        setStatus("error")
        throw error
      }
    },
    [callApi, user]
  )

  const value: JournalProviderContextValue = useMemo(
    () => ({
      journalEntries,
      status,
      addEntry,
      deleteEntry,
      refetch: fetchEntries,
    }),
    [journalEntries, status, addEntry, deleteEntry, fetchEntries]
  )

  return <JournalProviderContext.Provider value={value}>{children}</JournalProviderContext.Provider>
}

export const useJournal = () => {
  const ctx = useContext(JournalProviderContext)

  if (!ctx) {
    throw new Error("useJournal must be used within a JournalProvider")
  }
  return ctx
}
