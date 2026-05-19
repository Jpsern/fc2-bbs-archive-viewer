import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Thread } from '../../types/domain'

type ThreadDetailPageProps = {
  threads: Thread[]
}

const formatDate = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ja-JP')
}

const toTimestamp = (value: string): number => {
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

export function ThreadDetailPage({ threads }: ThreadDetailPageProps) {
  const { threadId } = useParams<{ threadId: string }>()
  const [showMetaByPostId, setShowMetaByPostId] = useState<Record<string, boolean>>({})
  const thread = threads.find((item) => item.id === threadId)

  if (!thread) {
    return (
      <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
        <p className="text-slate-700">指定されたスレッドが見つかりません。</p>
        <Link to="/" className="mt-4 inline-block text-sm text-blue-700 hover:underline">
          一覧に戻る
        </Link>
      </main>
    )
  }

  const posts = [...thread.posts].sort((a, b) => toTimestamp(a.date) - toTimestamp(b.date))

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <Link to="/" className="text-sm text-blue-700 hover:underline">
        ← 一覧に戻る
      </Link>

      <header className="mt-4 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold">{thread.title || '(no subject)'}</h1>
        <p className="mt-1 text-sm text-slate-600">投稿者: {thread.author || '(unknown)'}</p>
      </header>

      <ul className="mt-6 space-y-4">
        {posts.map((post) => {
          const showMeta = showMetaByPostId[post.id] ?? false

          return (
            <li key={post.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-900">{post.author || '(unknown)'}</p>
                <p className="text-xs text-slate-600">{formatDate(post.date)}</p>
              </div>
              <p className="mb-3 text-sm font-medium text-slate-700">{post.subject || '(no subject)'}</p>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">{post.body}</p>

              <button
                type="button"
                className="mt-3 text-xs text-blue-700 hover:underline"
                onClick={() => {
                  setShowMetaByPostId((prev) => ({ ...prev, [post.id]: !showMeta }))
                }}
              >
                {showMeta ? '詳細を隠す' : '詳細を表示'}
              </button>

              {showMeta ? (
                <dl className="mt-3 grid gap-2 rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold">EMAIL</dt>
                    <dd>{post.email || '-'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">SITE</dt>
                    <dd>{post.site || '-'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">USER AGENT</dt>
                    <dd>{post.userAgent || '-'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">IP</dt>
                    <dd>{post.ip || '-'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">ICON</dt>
                    <dd>{post.icon || '-'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">COLOR</dt>
                    <dd>{post.color || '-'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">AUTHORIZED</dt>
                    <dd>{post.authorized ? 'true' : 'false'}</dd>
                  </div>
                </dl>
              ) : null}
            </li>
          )
        })}
      </ul>
    </main>
  )
}
