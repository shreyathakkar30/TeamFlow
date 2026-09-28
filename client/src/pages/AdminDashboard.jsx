import { useEffect, useState } from 'react';
import { dashboardApi } from '../api/dashboardApi';
import { getErrorMessage } from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const StatCard = ({ label, value, tone = 'text-ink' }) => (
  <div className="card p-5">
    <p className="text-xs uppercase tracking-wide text-ink/40">{label}</p>
    <p className={`mt-2 font-display text-3xl ${tone}`}>{value}</p>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError('');
    dashboardApi
      .admin()
      .then((res) => setStats(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-ink">Admin dashboard</h1>
        <p className="text-sm text-ink/50">An overview of everything happening across TeamFlow.</p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-ink/60">People &amp; projects</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total users" value={stats.totalUsers} />
          <StatCard label="Total projects" value={stats.totalProjects} />
          <StatCard label="Active projects" value={stats.activeProjects} tone="text-signal-moss" />
          <StatCard label="Completed projects" value={stats.completedProjects} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-ink/60">Tasks</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <StatCard label="Total tasks" value={stats.totalTasks} />
          <StatCard label="Pending" value={stats.pendingTasks} />
          <StatCard label="In progress" value={stats.inProgressTasks} tone="text-brand-600" />
          <StatCard label="Overdue" value={stats.overdueTasks} tone="text-signal-rust" />
          <StatCard label="Completed" value={stats.completedTasks} tone="text-signal-moss" />
        </div>
      </div>
    </div>
  );
}
