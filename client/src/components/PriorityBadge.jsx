const styles = {
  Low: 'bg-ink/5 text-ink/50',
  Medium: 'bg-brand-50 text-brand-700',
  High: 'bg-signal-amber/10 text-signal-amber',
  Urgent: 'bg-signal-rust/10 text-signal-rust',
};

export default function PriorityBadge({ priority }) {
  const style = styles[priority] || 'bg-ink/5 text-ink/50';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {priority}
    </span>
  );
}
