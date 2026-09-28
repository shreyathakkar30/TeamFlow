import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import PriorityBadge from './PriorityBadge.jsx';

export default function TaskCard({ task }) {
  const overdue = task.status !== 'Completed' && new Date(task.dueDate) < new Date();

  return (
    <Link
      to={`/tasks/${task._id}`}
      className={`card flex items-center justify-between gap-4 p-4 transition hover:shadow-md ${
        overdue ? 'border-signal-rust/30' : ''
      }`}
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-ink">{task.title}</p>
        <p className="mt-1 truncate text-xs text-ink/50">
          {task.project?.name} · {task.assignedTo?.name || 'Unassigned'}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {overdue && (
          <span className="rounded-full bg-signal-rust/10 px-2.5 py-0.5 text-xs font-medium text-signal-rust">
            Overdue
          </span>
        )}
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
      </div>
    </Link>
  );
}
