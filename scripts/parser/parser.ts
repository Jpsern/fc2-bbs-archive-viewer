import path from 'node:path'
import type { ParseError, Post, Thread } from '../shared/domain'

type BuildResult = {
  threads: Thread[]
  errors: ParseError[]
}

const REQUIRED_KEYS = [
  'POSTED BY',
  'SUBJECT',
  'EMAIL',
  'SITE',
  'DATE',
  'USER AGENT',
  'IP',
  'ICON',
  'COLOR',
  'AUTHORIZED',
] as const

const toIsoDate = (value: string): string | null => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

const isReplyMarker = (lines: string[], i: number): boolean => lines[i] === 'REPLY:' && (lines[i + 1]?.startsWith('POSTED BY:') ?? false)

const isPostStart = (lines: string[], i: number): boolean => lines[i].startsWith('POSTED BY:') || isReplyMarker(lines, i)

export const parseTextToPosts = (text: string, file: string): { posts: Post[]; errors: ParseError[] } => {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const posts: Post[] = []
  const errors: ParseError[] = []

  let i = 0
  while (i < lines.length) {
    if (!isPostStart(lines, i)) {
      i += 1
      continue
    }

    const type = isReplyMarker(lines, i) ? 'reply' : 'parent'
    const startLine = i + 1
    if (type === 'reply') i += 1

    const headers = new Map<string, string>()
    while (i < lines.length && lines[i] !== '') {
      const match = lines[i].match(/^([A-Z ]+):\s*(.*)$/)
      if (!match) break
      headers.set(match[1], match[2])
      i += 1
    }

    if (i < lines.length && lines[i] === '') i += 1

    const bodyLines: string[] = []
    while (i < lines.length && !isPostStart(lines, i)) {
      if (lines[i] === '-----' && isReplyMarker(lines, i + 1)) break
      bodyLines.push(lines[i])
      i += 1
    }

    for (const key of REQUIRED_KEYS) {
      if (!headers.has(key)) {
        errors.push({
          file,
          line: startLine,
          code: 'MISSING_REQUIRED_FIELD',
          message: `Missing required field: ${key}`,
        })
      }
    }

    const dateRaw = headers.get('DATE') ?? ''
    const isoDate = toIsoDate(dateRaw)
    if (!isoDate) {
      errors.push({
        file,
        line: startLine,
        code: 'INVALID_DATE',
        message: `Invalid DATE: ${dateRaw}`,
      })
    }

    const authorizedRaw = (headers.get('AUTHORIZED') ?? '').trim().toLowerCase()
    const authorized = authorizedRaw === 'true' || authorizedRaw === '1' || authorizedRaw === 'yes'

    posts.push({
      id: '',
      type,
      author: headers.get('POSTED BY') ?? '',
      subject: headers.get('SUBJECT') ?? '',
      email: headers.get('EMAIL') ?? '',
      site: headers.get('SITE') ?? '',
      date: isoDate ?? dateRaw,
      userAgent: headers.get('USER AGENT') ?? '',
      ip: headers.get('IP') ?? '',
      icon: headers.get('ICON') ?? '',
      color: headers.get('COLOR') ?? '',
      authorized,
      body: bodyLines.join('\n').trimEnd(),
    })

    if (lines[i] === '-----') i += 1
  }

  return { posts, errors }
}

const safeDate = (value: string): number => {
  const t = new Date(value).getTime()
  return Number.isNaN(t) ? 0 : t
}

export const buildThreadsFromPosts = (posts: Post[], file: string): BuildResult => {
  const threads: Thread[] = []
  const errors: ParseError[] = []
  let currentThread: Thread | null = null

  for (const post of posts) {
    if (post.type === 'parent') {
      const threadId = `${path.basename(file, path.extname(file))}-t${threads.length + 1}`
      currentThread = {
        id: threadId,
        title: post.subject || '(no subject)',
        createdAt: post.date,
        updatedAt: post.date,
        author: post.author,
        replyCount: 0,
        posts: [],
      }
      threads.push(currentThread)
    } else if (!currentThread) {
      errors.push({
        file,
        line: 1,
        code: 'THREAD_STRUCTURE',
        message: 'Reply post found before any parent post',
      })
      const orphanId = `${path.basename(file, path.extname(file))}-t${threads.length + 1}`
      currentThread = {
        id: orphanId,
        title: post.subject || '(orphan reply)',
        createdAt: post.date,
        updatedAt: post.date,
        author: post.author,
        replyCount: 0,
        posts: [],
      }
      threads.push(currentThread)
    }

    const thread = currentThread
    if (!thread) continue
    const postId = `${thread.id}-p${thread.posts.length + 1}`
    thread.posts.push({ ...post, id: postId })
  }

  for (const thread of threads) {
    thread.posts.sort((a, b) => safeDate(a.date) - safeDate(b.date))
    const first = thread.posts[0]
    const last = thread.posts[thread.posts.length - 1]
    thread.createdAt = first?.date ?? thread.createdAt
    thread.updatedAt = last?.date ?? thread.updatedAt
    thread.replyCount = Math.max(0, thread.posts.length - 1)
    if (!thread.title) thread.title = first?.subject || '(no subject)'
  }

  return { threads, errors }
}

export const parseFileToThreads = (text: string, file: string): BuildResult => {
  const parsed = parseTextToPosts(text, file)
  const built = buildThreadsFromPosts(parsed.posts, file)
  return {
    threads: built.threads,
    errors: [...parsed.errors, ...built.errors],
  }
}
