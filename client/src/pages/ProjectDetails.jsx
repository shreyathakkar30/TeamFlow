import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { projectsApi } from '../api/projectsApi';
import { tasksApi } from '../api/tasksApi';
import { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import TaskCard from '../components/TaskCard.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';

export default function ProjectDetails() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([projectsApi.getById(id), tasksApi.list({ project: id, limit: 50 })])
      .then(([projectRes, tasksRes]) => {
        setProject(projectRes.data);
        setTasks(tasksRes.data);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await projectsApi.remove(id);
      navigate('/projects');
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleting(false);
    }
  };

  const removeMember = async (userId) => {
    try {
      const res = await projectsApi.removeMember(id, userId);
      setProject(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error && !project) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">{project.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status={project.status} />
            <span className="text-sm text-ink/50">
              {new Date(project.startDate).toLocaleDateString()} –{' '}
              {new Date(project.dueDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Link to={`/projects/${id}/edit`} className="btn-secondary">
              Edit
            </Link>
            <button className="btn-danger" onClick={() => setConfirmDelete(true)}>
              Delete
            </button>
          </div>
        )}
      </div>

      {project.description && <p className="text-sm text-ink/70">{project.description}</p>}
      <ErrorMessage message={error} />

      <div>
        <h2 className="mb-3 text-sm font-medium text-ink/60">Team members</h2>
        <ul className="flex flex-wrap gap-2">
          {project.members.map((m) => (
            <li
              key={m._id}
              className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-sm"
            >
              {m.name}
              {isAdmin && (
                <button
                  className="text-ink/40 hover:text-signal-rust"
                  onClick={() => removeMember(m._id)}
                  aria-label={`Remove ${m.name}`}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink/60">Tasks</h2>
          {isAdmin && (
            <Link to={`/tasks/new?project=${id}`} className="btn-secondary text-xs">
              Add task
            </Link>
          )}
        </div>
        {tasks.length ? (
          <div className="space-y-2">
            {tasks.map((t) => (
              <TaskCard key={t._id} task={t} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/50">No tasks in this project yet.</p>
        )}
      </div>

      <ConfirmationModal
        open={confirmDelete}
        title="Delete this project?"
        description="This will also delete all tasks inside it. This cannot be undone."
        confirmLabel="Delete project"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
