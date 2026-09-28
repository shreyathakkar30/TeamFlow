import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-canvas text-center">
      <h1 className="font-display text-2xl text-ink">Page not found</h1>
      <p className="text-sm text-ink/60">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-2">
        Back to dashboard
      </Link>
    </div>
  );
}
