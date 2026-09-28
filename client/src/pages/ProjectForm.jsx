import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectsApi } from '../api/projectsApi';
import { usersApi } from '../api/usersApi';
import { getErrorMessage } from '../api/axios';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function ProjectForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'Planning',
    startDate: '',
    dueDate: '',
    members: [],
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    usersApi.list({ limit: 100 }).then((res) => setUsers(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    projectsApi
      .getById(id)
      .then((res) => {
        const p = res.data;
        setForm({
          name: p.name,
          description: p.description || '',
          status: p.status,
          startDate: toDateInput(p.startDate),
          dueDate: toDateInput(p.dueDate),
          members: p.members.map((m) => m._id),
        });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleMember = (userId) => {
    setForm((f) => ({
      ...f,
      members: f.members.includes(userId)
        ? f.members.filter((m) => m !== userId)
        : [...f.members, userId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await projectsApi.update(id, form);
        navigate(`/projects/${id}`);
      } else {
        const res = await projectsApi.create(form);
        navigate(`/projects/${res.data._id}`);
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
      <h1 className="font-display text-2xl text-ink">{isEdit ? 'Edit project' : 'New project'}</h1>
      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <div>
          <label className="label">Project name</label>
          <input
            required
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
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

        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {['Planning', 'Active', 'On Hold', 'Completed'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Team members</label>
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-black/10 p-3">
            {users.map((u) => (
              <label key={u.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.members.includes(u.id)}
                  onChange={() => toggleMember(u.id)}
                />
                {u.name} <span className="text-ink/40">({u.email})</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
