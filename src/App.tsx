import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ErrorState } from './components/ErrorState'
import { LoadingState } from './components/LoadingState'
import { ThreadDetailPage } from './features/thread-detail/ThreadDetailPage'
import { ThreadListPage } from './features/thread-list/ThreadListPage'
import { loadThreads } from './lib/loadThreads'
import type { Thread } from './types/domain'

function App() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadThreads()
      .then((data) => {
        setThreads(data)
        setError(null)
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'データ読み込みに失敗しました'
        setError(message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
        <LoadingState />
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
        <ErrorState message={error} />
      </main>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<ThreadListPage threads={threads} />} />
      <Route path="/threads/:threadId" element={<ThreadDetailPage threads={threads} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
