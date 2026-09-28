import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { tasksApi } from '../api/tasksApi';
import { projectsApi } from '../api/projectsApi';
import { getErrorMessage } from '../api/axios';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function TaskForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    project: searchParams.get('project') || '',
    assignedTo: '',
    priority: 'Medium',
    status: 'Pending',
    startDate: '',
    dueDate: '',
  });
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    projectsApi.list({ limit: 100 }).then((res) => setProjects(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    tasksApi
      .getById(id)
      .then((res) => {
        const t = res.data;
        setForm({
          title: t.title,
          description: t.description || '',
          project: t.project?._id || t.project,
          assignedTo: t.assignedTo?._id || '',
          priority: t.priority,
          status: t.status,
          startDate: toDateInput(t.startDate),
          dueDate: toDateInput(t.dueDate),
        });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  // Load the selected project's members so assignment stays valid.
  useEffect(() => {
    if (!form.project) {
      setMembers([]);
      return;
    }
    projectsApi
      .getById(form.project)
      .then((res) => setMembers(res.data.members))
      .catch(() => setMembers([]));
  }, [form.project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, assignedTo: form.assignedTo || null };
      if (isEdit) {
        await tasksApi.update(id, payload);
        navigate(`/tasks/${id}`);
      } else {
        const res = await tasksApi.create(payload);
        navigate(`/tasks/${res.data._id}`);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-display text-2xl text-ink">{isEdit ? 'Edit task' : 'New task'}</h1>
      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <div>
          <label className="label">Title</label>
          <input
            required
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            rows={3}
            className="input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div>
          <label className="label">Project</label>
          <select
            required
            className="input"
            value={form.project}
            onChange={(e) => setForm({ ...form, project: e.target.value, assignedTo: '' })}
          >
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Assigned to</label>
          <select
            className="input"
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Priority</label>
            <select
              className="input"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {['Low', 'Medium', 'High', 'Urgent'].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {['Pending', 'In Progress', 'Under Review', 'Completed'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start date</label>
            <input
              type="date"
              required
              className="input"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Due date</label>
            <input
              type="date"
              required
              className="input"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
