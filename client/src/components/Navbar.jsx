import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-black/5 bg-panel px-6">
      <Link to="/" className="font-display text-lg text-ink">
        TeamFlow
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/profile" className="flex items-center gap-2 text-sm text-ink/70 hover:text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </span>
          {user?.name}
        </Link>
        <button className="btn-ghost" onClick={logout}>
          Log out
        </button>
      </div>
    </header>
  );
}
