export default function LoadingSpinner({ fullScreen = false, label = 'Loading' }) {
  const spinner = (
    <div className="flex items-center gap-2 text-ink/60">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
      <span className="text-sm">{label}…</span>
    </div>
  );

  if (fullScreen) {
    return <div className="flex h-screen w-full items-center justify-center bg-canvas">{spinner}</div>;
  }

  return <div className="flex items-center justify-center py-10">{spinner}</div>;
}
