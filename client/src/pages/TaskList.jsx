import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tasksApi } from '../api/tasksApi';
import { projectsApi } from '../api/projectsApi';
import { usersApi } from '../api/usersApi';
import { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import TaskCard from '../components/TaskCard.jsx';
import SearchInput from '../components/SearchInput.jsx';
import FilterPanel from '../components/FilterPanel.jsx';
import Pagination from '../components/Pagination.jsx';

export default function TaskList() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', project: '', assignedTo: '', sortBy: 'createdAt' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    projectsApi.list({ limit: 100 }).then((res) => setProjects(res.data)).catch(() => {});
    if (isAdmin) usersApi.list({ limit: 100 }).then((res) => setUsers(res.data)).catch(() => {});
  }, [isAdmin]);

  const load = () => {
    setLoading(true);
    setError('');
    tasksApi
      .list({ search, ...filters, page, limit: 10 })
      .then((res) => {
        setTasks(res.data);
        setTotalPages(res.pagination.totalPages);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [search, filters, page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Tasks</h1>
          <p className="text-sm text-ink/50">Search, filter, and track work across your projects.</p>
        </div>
        {isAdmin && (
          <Link to="/tasks/new" className="btn-primary">
            New task
          </Link>
        )}
      </div>

      <div className="space-y-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search tasks…" />
        <FilterPanel
          filters={filters}
          onChange={(f) => {
            setFilters(f);
            setPage(1);
          }}
          options={{
            status: ['Pending', 'In Progress', 'Under Review', 'Completed'],
            priority: ['Low', 'Medium', 'High', 'Urgent'],
            project: projects,
            assignedTo: isAdmin ? users : undefined,
          }}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : tasks.length ? (
        <>
          <div className="space-y-2">
            {tasks.map((t) => (
              <TaskCard key={t._id} task={t} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <p className="text-sm text-ink/50">No tasks match your filters.</p>
      )}
    </div>
  );
}
