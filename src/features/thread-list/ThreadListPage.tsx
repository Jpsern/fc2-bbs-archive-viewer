import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Thread } from '../../types/domain'

type ThreadListPageProps = {
  threads: Thread[]
}

type SortOrder = 'desc' | 'asc'

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

export function ThreadListPage({ threads }: ThreadListPageProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const sortedThreads = useMemo(() => {
    const cloned = [...threads]
    cloned.sort((a, b) => {
      const diff = toTimestamp(a.updatedAt) - toTimestamp(b.updatedAt)
      return sortOrder === 'desc' ? -diff : diff
    })
    return cloned
  }, [threads, sortOrder])

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">FC2掲示板アーカイブビューア</h1>
          <p className="mt-1 text-sm text-slate-600">スレッド数: {sortedThreads.length}</p>
        </div>

        <label className="text-sm font-medium text-slate-700">
          日付ソート
          <select
            className="ml-2 rounded border border-slate-300 bg-white px-2 py-1"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
          >
            <option value="desc">新しい順</option>
            <option value="asc">古い順</option>
          </select>
        </label>
      </header>

      {sortedThreads.length === 0 ? (
        <p className="rounded border border-slate-200 bg-slate-50 p-4 text-slate-600">
          スレッドがありません。`npm run convert` を実行してデータを生成してください。
        </p>
      ) : (
        <ul className="space-y-4">
          {sortedThreads.map((thread) => (
            <li key={thread.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link to={`/threads/${thread.id}`} className="text-lg font-semibold text-slate-900 hover:underline">
                    {thread.title || '(no subject)'}
                  </Link>
                  <p className="mt-1 text-sm text-slate-600">投稿者: {thread.author || '(unknown)'}</p>
                </div>
                <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">返信数: {thread.replyCount}</span>
              </div>

              <dl className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <div>
                  <dt className="font-medium">投稿日時</dt>
                  <dd>{formatDate(thread.createdAt)}</dd>
                </div>
                <div>
                  <dt className="font-medium">最終更新</dt>
                  <dd>{formatDate(thread.updatedAt)}</dd>
                </div>
              </dl>

              <p className="mt-3 text-sm leading-6 text-slate-700">{toExcerpt(thread)}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
