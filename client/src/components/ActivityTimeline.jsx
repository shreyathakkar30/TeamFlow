export default function ActivityTimeline({ activity }) {
  if (!activity.length) {
    return <p className="text-sm text-ink/50">No activity recorded yet.</p>;
  }

  return (
    <ol className="relative space-y-5 border-l border-black/10 pl-5">
      {activity.map((a) => (
        <li key={a._id} className="relative">
          <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-brand-400" />
          <p className="text-sm text-ink">
            <span className="font-medium">{a.user?.name || 'Someone'}</span> · {a.action}
            {a.previousValue && a.newValue && (
              <span className="text-ink/50">
                {' '}
                ({a.previousValue} → {a.newValue})
              </span>
            )}
          </p>
          <p className="text-xs text-ink/40">{new Date(a.createdAt).toLocaleString()}</p>
        </li>
      ))}
    </ol>
  );
}
