import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-sm transition-colors ${
    isActive ? 'bg-brand-50 text-brand-700 font-medium' : 'text-ink/60 hover:bg-black/[0.03] hover:text-ink'
  }`;

export default function Sidebar() {
  const { isAdmin } = useAuth();

  return (
    <nav className="w-56 shrink-0 space-y-1 border-r border-black/5 bg-panel px-3 py-6">
      <NavLink to="/" end className={linkClass}>
        Dashboard
      </NavLink>
      <NavLink to="/projects" className={linkClass}>
        Projects
      </NavLink>
      <NavLink to="/tasks" className={linkClass}>
        Tasks
      </NavLink>
      {isAdmin && (
        <NavLink to="/users" className={linkClass}>
          Users
        </NavLink>
      )}
      <NavLink to="/profile" className={linkClass}>
        Profile
      </NavLink>
    </nav>
  );
}
