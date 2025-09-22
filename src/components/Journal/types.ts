export type MoodOption = {
  value: string
  label: string
}

export type JournalAttachment = {
  id: string
  thumbnailUrl?: string
  label?: string
}

export type JournalEntry = {
  id: string
  title: string
  date: string
  mood: MoodOption["value"]
  tags: string[]
  content: string
  prompt?: string
  attachments?: JournalAttachment[]
}

export type NewEntryPayload = {
  title: string
  content: string
  mood: MoodOption["value"]
  tags: string[]
  prompt?: string
  attachments?: Array<Omit<JournalAttachment, "id">>
}
