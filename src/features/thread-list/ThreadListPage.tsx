import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Thread } from '../../types/domain'

type ThreadListPageProps = {
  threads: Thread[]
}

type SortOrder = 'desc' | 'asc'
type MatchMode = 'any' | 'all'
type SearchField = 'subject' | 'author' | 'body'

type SearchFieldState = Record<SearchField, boolean>
const SEARCH_FIELDS: SearchField[] = ['subject', 'author', 'body']

const toTimestamp = (value: string): number => {
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

const toExcerpt = (thread: Thread): string => {
  const parent = thread.posts.find((post) => post.type === 'parent')
  const source = parent?.body ?? thread.posts[0]?.body ?? ''
  return source.replace(/\s+/g, ' ').slice(0, 120)
}

const formatDate = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ja-JP')
}

const toMonthKey = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const toMonthLabel = (monthKey: string): string => {
  const [year, month] = monthKey.split('-')
  if (!year || !month) return monthKey
  return `${year}年${month}月`
}

const getFieldText = (thread: Thread, field: SearchField): string => {
  switch (field) {
    case 'subject':
      return [thread.title, ...thread.posts.map((post) => post.subject)].join(' ')
    case 'author':
      return [thread.author, ...thread.posts.map((post) => post.author)].join(' ')
    case 'body':
      return thread.posts.map((post) => post.body).join(' ')
  }
}

const splitTerms = (query: string): string[] =>
  query
    .split(/[\s,、]+/)
    .map((term) => term.trim().toLocaleLowerCase())
    .filter((term) => term.length > 0)

const includesTerm = (thread: Thread, term: string, fields: SearchFieldState): boolean => {
  const targets = SEARCH_FIELDS.filter((field) => fields[field])
  if (targets.length === 0) return true

  return targets.some((field) => getFieldText(thread, field).toLocaleLowerCase().includes(term))
}

export function ThreadListPage({ threads }: ThreadListPageProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [query, setQuery] = useState('')
  const [matchMode, setMatchMode] = useState<MatchMode>('any')
  const [fields, setFields] = useState<SearchFieldState>({ subject: true, author: true, body: true })
  const [monthFilter, setMonthFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const monthOptions = useMemo(() => {
    const unique = new Set<string>()
    for (const thread of threads) {
      const key = toMonthKey(thread.createdAt)
      if (key) unique.add(key)
    }
    return [...unique].sort((a, b) => (a < b ? 1 : -1))
  }, [threads])

  const filteredAndSortedThreads = useMemo(() => {
    const terms = splitTerms(query)
    const byMonth = monthFilter ? threads.filter((thread) => toMonthKey(thread.createdAt) === monthFilter) : threads

    const filtered = terms.length
      ? byMonth.filter((thread) => {
          if (matchMode === 'all') {
            return terms.every((term) => includesTerm(thread, term, fields))
          }
          return terms.some((term) => includesTerm(thread, term, fields))
        })
      : byMonth

    const cloned = [...filtered]
    cloned.sort((a, b) => {
      const diff = toTimestamp(a.updatedAt) - toTimestamp(b.updatedAt)
      return sortOrder === 'desc' ? -diff : diff
    })
    return cloned
  }, [threads, sortOrder, query, matchMode, fields, monthFilter])

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedThreads.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const pagedThreads = filteredAndSortedThreads.slice(start, start + pageSize)

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/90 p-5 shadow-sm backdrop-blur sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">FC2掲示板アーカイブビューア</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">表示件数: {filteredAndSortedThreads.length}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-[var(--muted)]">
              日付ソート
              <select className="ml-2 rounded-lg border border-[var(--line)]  bg-slate-800 px-2 py-1.5 text-[var(--text)]" value={sortOrder} onChange={(event) => { setSortOrder(event.target.value as SortOrder); setPage(1) }}>
                <option value="desc">新しい順</option>
                <option value="asc">古い順</option>
              </select>
            </label>
            <label className="text-sm font-medium text-[var(--muted)]">
              月
              <select className="ml-2 rounded-lg border border-[var(--line)]  bg-slate-800 px-2 py-1.5 text-[var(--text)]" value={monthFilter} onChange={(event) => { setMonthFilter(event.target.value); setPage(1) }}>
                <option value="">すべて</option>
                {monthOptions.map((month) => <option key={month} value={month}>{toMonthLabel(month)}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-[var(--muted)]">
              件数
              <select className="ml-2 rounded-lg border border-[var(--line)]  bg-slate-800 px-2 py-1.5 text-[var(--text)]" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="thread-search" className="mb-1 block text-sm font-medium text-[var(--muted)]">キーワード検索</label>
            <input id="thread-search" type="text" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="例: Alice バグ報告" className="w-full rounded-xl border border-[var(--line)]  bg-slate-800 px-3 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-cyan-400" />
            <p className="mt-1 text-xs text-[var(--muted)]/80">空白またはカンマ区切りで複数語を指定できます。</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
            <div className="flex items-center gap-2 rounded-lg  bg-slate-800/70 px-3 py-2">
              <span className="font-medium">一致</span>
              <label className="flex items-center gap-1"><input type="radio" name="match-mode" checked={matchMode === 'any'} onChange={() => { setMatchMode('any'); setPage(1) }} />OR</label>
              <label className="flex items-center gap-1"><input type="radio" name="match-mode" checked={matchMode === 'all'} onChange={() => { setMatchMode('all'); setPage(1) }} />AND</label>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-lg  bg-slate-800/70 px-3 py-2">
              <span className="font-medium">対象</span>
              <label className="flex items-center gap-1"><input type="checkbox" checked={fields.subject} onChange={(event) => { setFields((prev) => ({ ...prev, subject: event.target.checked })); setPage(1) }} />件名</label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={fields.author} onChange={(event) => { setFields((prev) => ({ ...prev, author: event.target.checked })); setPage(1) }} />投稿者</label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={fields.body} onChange={(event) => { setFields((prev) => ({ ...prev, body: event.target.checked })); setPage(1) }} />本文</label>
            </div>
          </div>
        </div>
      </header>

      {pagedThreads.length === 0 ? (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]/90 p-6 text-sm text-[var(--muted)] shadow-sm">該当スレッドがありません。検索条件を確認してください。</p>
      ) : (
        <>
          <ul className="space-y-3">
            {pagedThreads.map((thread) => (
              <li key={thread.id} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]/95 p-5 shadow-sm transition hover:shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link to={`/threads/${thread.id}`} className="text-lg font-semibold text-[var(--text)] hover:text-cyan-700 hover:underline">{thread.title || '(no subject)'}</Link>
                    <p className="mt-1 text-sm text-[var(--muted)]">投稿者: {thread.author || '(unknown)'}</p>
                  </div>
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">返信 {thread.replyCount}</span>
                </div>
                <dl className="mt-3 grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2">
                  <div><dt className="font-medium">投稿日時</dt><dd>{formatDate(thread.createdAt)}</dd></div>
                  <div><dt className="font-medium">最終更新</dt><dd>{formatDate(thread.updatedAt)}</dd></div>
                </dl>
                <p className="mt-3 text-sm leading-6 text-slate-300">{toExcerpt(thread)}</p>
              </li>
            ))}
          </ul>

          <nav className="mt-6 flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface)]/90 px-4 py-3 shadow-sm">
            <p className="text-sm text-[var(--muted)]">{currentPage} / {totalPages} ページ</p>
            <div className="flex gap-2">
              <button type="button" className="rounded-lg border border-[var(--line)]  bg-slate-800 px-3 py-1.5 text-sm text-[var(--text)] disabled:opacity-40" disabled={currentPage <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>前へ</button>
              <button type="button" className="rounded-lg border border-[var(--line)]  bg-slate-800 px-3 py-1.5 text-sm text-[var(--text)] disabled:opacity-40" disabled={currentPage >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>次へ</button>
            </div>
          </nav>
        </>
      )}
    </main>
  )
}
