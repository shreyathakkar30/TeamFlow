import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-canvas text-center">
      <h1 className="font-display text-2xl text-ink">You don't have access to this page</h1>
      <p className="text-sm text-ink/60">Ask an administrator if you think this is a mistake.</p>
      <Link to="/" className="btn-primary mt-2">
        Back to dashboard
      </Link>
    </div>
  );
}
