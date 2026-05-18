import type { Thread } from '../types/domain'

const isThread = (value: unknown): value is Thread => {
  if (typeof value !== 'object' || value === null) return false
  const thread = value as Record<string, unknown>
  return (
    typeof thread.id === 'string' &&
    typeof thread.title === 'string' &&
    typeof thread.createdAt === 'string' &&
    typeof thread.updatedAt === 'string' &&
    typeof thread.author === 'string' &&
    typeof thread.replyCount === 'number' &&
    Array.isArray(thread.posts)
  )
}

export const loadThreads = async (): Promise<Thread[]> => {
  const response = await fetch('/data/threads.json')
  if (!response.ok) throw new Error(`Failed to fetch threads.json: ${response.status}`)

  const raw: unknown = await response.json()
  if (!Array.isArray(raw) || !raw.every(isThread)) {
    throw new Error('Invalid threads.json format')
  }

  return raw
}
