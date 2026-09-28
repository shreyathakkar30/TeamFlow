import { useEffect, useState } from 'react';
import { usersApi } from '../api/usersApi';
import { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import SearchInput from '../components/SearchInput.jsx';
import Pagination from '../components/Pagination.jsx';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    usersApi
      .list({ search, page, limit: 10 })
      .then((res) => {
        setUsers(res.data);
        setTotalPages(res.pagination.totalPages);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [search, page]);

  const changeRole = async (id, role) => {
    try {
      const res = await usersApi.update(id, { role });
      setUsers((us) => us.map((u) => (u.id === id ? res.data : u)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const toggleActive = async (id, isActive) => {
    try {
      const res = await usersApi.setStatus(id, !isActive);
      setUsers((us) => us.map((u) => (u.id === id ? res.data : u)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Users</h1>
        <p className="text-sm text-ink/50">Manage roles and account access.</p>
      </div>

      <SearchInput value={search} onChange={(value) => 
        {setSearch(value);
          setPage(1);
        }} 
        placeholder="Search by name or email…" />

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/[0.02] text-xs uppercase tracking-wide text-ink/40">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-ink/60">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      className="input w-auto py-1"
                      value={u.role}
                      disabled={u.id === currentUser.id}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.isActive ? 'bg-signal-moss/10 text-signal-moss' : 'bg-ink/5 text-ink/50'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="btn-ghost text-xs"
                      disabled={u.id === currentUser.id}
                      onClick={() => toggleActive(u.id, u.isActive)}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 pb-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}
