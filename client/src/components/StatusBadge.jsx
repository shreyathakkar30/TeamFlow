const styles = {
  Planning: 'bg-brand-50 text-brand-700',
  Active: 'bg-signal-moss/10 text-signal-moss',
  'On Hold': 'bg-signal-amber/10 text-signal-amber',
  Completed: 'bg-ink/5 text-ink/60',
  Pending: 'bg-ink/5 text-ink/60',
  'In Progress': 'bg-brand-50 text-brand-700',
  'Under Review': 'bg-signal-plum/10 text-signal-plum',
};

export default function StatusBadge({ status }) {
  const style = styles[status] || 'bg-ink/5 text-ink/60';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
