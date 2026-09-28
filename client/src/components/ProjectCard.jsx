import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';

export default function ProjectCard({ project }) {
  const due = new Date(project.dueDate).toLocaleDateString();

  return (
    <Link to={`/projects/${project._id}`} className="card block p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base text-ink">{project.name}</h3>
        <StatusBadge status={project.status} />
      </div>
      {project.description && (
        <p className="mt-2 line-clamp-2 text-sm text-ink/60">{project.description}</p>
      )}
      <div className="mt-4 flex items-center justify-between text-xs text-ink/50">
        <span>Due {due}</span>
        <span>{project.members?.length || 0} members</span>
      </div>
    </Link>
  );
}
