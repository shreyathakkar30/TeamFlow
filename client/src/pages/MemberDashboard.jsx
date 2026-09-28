import { useEffect, useState } from 'react';
import { dashboardApi } from '../api/dashboardApi';
import { getErrorMessage } from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import TaskCard from '../components/TaskCard.jsx';
import ProjectCard from '../components/ProjectCard.jsx';

const StatCard = ({ label, value, tone = 'text-ink' }) => (
  <div className="card p-5">
    <p className="text-xs uppercase tracking-wide text-ink/40">{label}</p>
    <p className={`mt-2 font-display text-3xl ${tone}`}>{value}</p>
  </div>
);

export default function MemberDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError('');
    dashboardApi
      .member()
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-ink">My dashboard</h1>
        <p className="text-sm text-ink/50">What's on your plate right now.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Pending" value={data.pendingTasks} />
        <StatCard label="In progress" value={data.inProgressTasks} tone="text-brand-600" />
        <StatCard label="Overdue" value={data.overdueTasks} tone="text-signal-rust" />
        <StatCard label="Completed" value={data.completedTasks} tone="text-signal-moss" />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-ink/60">My projects</h2>
        {data.projects.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {data.projects.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/50">You haven't been added to any projects yet.</p>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-ink/60">Recent tasks</h2>
        {data.tasks.length ? (
          <div className="space-y-2">
            {data.tasks.map((t) => (
              <TaskCard key={t._id} task={t} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/50">No tasks assigned to you yet.</p>
        )}
      </div>
    </div>
  );
}
