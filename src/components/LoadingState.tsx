export function LoadingState() {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]/90 p-8 text-center shadow-sm">
      <p className="text-sm text-[var(--muted)]">データを読み込み中です...</p>
    </div>
  )
}
