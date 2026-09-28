import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { tasksApi, commentsApi } from '../api/tasksApi';
import { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import CommentList from '../components/CommentList.jsx';
import ActivityTimeline from '../components/ActivityTimeline.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';

const STATUSES = ['Pending', 'In Progress', 'Under Review', 'Completed'];

export default function TaskDetails() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canUpdateStatus = isAdmin || task?.assignedTo?._id === user?.id;

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([tasksApi.getById(id), tasksApi.getComments(id), tasksApi.getActivity(id)])
      .then(([taskRes, commentsRes, activityRes]) => {
        setTask(taskRes.data);
        setComments(commentsRes.data);
        setActivity(activityRes.data);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleStatusChange = async (status) => {
    try {
      const res = await tasksApi.updateStatus(id, status);
      setTask((t) => ({ ...t, status: res.data.status }));
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await tasksApi.addComment(id, newComment);
      setComments((c) => [...c, res.data]);
      setNewComment('');
      tasksApi.getActivity(id).then((r) => setActivity(r.data));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleEditComment = async (commentId, text) => {
    try {
      const res = await commentsApi.update(commentId, text);
      setComments((cs) => cs.map((c) => (c._id === commentId ? res.data : c)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentsApi.remove(commentId);
      setComments((cs) => cs.filter((c) => c._id !== commentId));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteTask = async () => {
    setDeleting(true);
    try {
      await tasksApi.remove(id);
      navigate('/tasks');
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error && !task) return <ErrorMessage message={error} onRetry={load} />;

  const overdue = task.status !== 'Completed' && new Date(task.dueDate) < new Date();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-ink/40">{task.project?.name}</p>
          <h1 className="font-display text-2xl text-ink">{task.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
            {overdue && (
              <span className="rounded-full bg-signal-rust/10 px-2.5 py-0.5 text-xs font-medium text-signal-rust">
                Overdue
              </span>
            )}
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Link to={`/tasks/${id}/edit`} className="btn-secondary">
              Edit
            </Link>
            <button className="btn-danger" onClick={() => setConfirmDelete(true)}>
              Delete
            </button>
          </div>
        )}
      </div>

      <ErrorMessage message={error} />

      {task.description && <p className="text-sm text-ink/70">{task.description}</p>}

      <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-ink/40">Assigned to</dt>
          <dd className="mt-1">{task.assignedTo?.name || 'Unassigned'}</dd>
        </div>
        <div>
          <dt className="text-ink/40">Created by</dt>
          <dd className="mt-1">{task.createdBy?.name}</dd>
        </div>
        <div>
          <dt className="text-ink/40">Start date</dt>
          <dd className="mt-1">{new Date(task.startDate).toLocaleDateString()}</dd>
        </div>
        <div>
          <dt className="text-ink/40">Due date</dt>
          <dd className="mt-1">{new Date(task.dueDate).toLocaleDateString()}</dd>
        </div>
      </dl>

      {canUpdateStatus && (
        <div>
          <label className="label">Update status</label>
          <select
            className="input max-w-xs"
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-medium text-ink/60">Comments</h2>
          <form onSubmit={handleAddComment} className="mb-4 flex gap-2">
            <input
              className="input"
              placeholder="Add a comment…"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button className="btn-primary shrink-0">Post</button>
          </form>
          <CommentList comments={comments} onEdit={handleEditComment} onDelete={handleDeleteComment} />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium text-ink/60">Activity history</h2>
          <ActivityTimeline activity={activity} />
        </div>
      </div>

      <ConfirmationModal
        open={confirmDelete}
        title="Delete this task?"
        description="This cannot be undone."
        confirmLabel="Delete task"
        danger
        loading={deleting}
        onConfirm={handleDeleteTask}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
