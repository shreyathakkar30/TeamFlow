import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function CommentList({ comments, onEdit, onDelete }) {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState('');

  const startEdit = (comment) => {
    setEditingId(comment._id);
    setDraft(comment.comment);
  };

  const saveEdit = (id) => {
    onEdit(id, draft);
    setEditingId(null);
  };

  if (!comments.length) {
    return <p className="text-sm text-ink/50">No comments yet. Be the first to add one.</p>;
  }

  return (
    <ul className="space-y-4">
      {comments.map((c) => {
        const isOwner = c.user?._id === user?.id;
        const isEditing = editingId === c._id;

        return (
          <li key={c._id} className="rounded-md border border-black/5 bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink">{c.user?.name || 'Unknown user'}</span>
              <span className="text-xs text-ink/40">{new Date(c.createdAt).toLocaleString()}</span>
            </div>

            {isEditing ? (
              <div className="mt-2 space-y-2">
                <textarea
                  className="input"
                  rows={2}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <div className="flex gap-2">
                  <button className="btn-primary" onClick={() => saveEdit(c._id)}>
                    Save
                  </button>
                  <button className="btn-ghost" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink/80">{c.comment}</p>
            )}

            {isOwner && !isEditing && (
              <div className="mt-2 flex gap-3 text-xs">
                <button className="text-brand-600 hover:underline" onClick={() => startEdit(c)}>
                  Edit
                </button>
                <button className="text-signal-rust hover:underline" onClick={() => onDelete(c._id)}>
                  Delete
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
