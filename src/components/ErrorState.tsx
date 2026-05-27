type ErrorStateProps = {
  message: string
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-red-900/60 bg-red-950/40 p-6 shadow-sm">
      <p className="text-sm font-medium text-red-200">{message}</p>
    </div>
  )
}
