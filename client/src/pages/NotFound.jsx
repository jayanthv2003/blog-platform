import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
    <p className="font-display text-8xl font-medium text-accent">404</p>
    <h1 className="mt-4 font-display text-2xl font-medium text-ink dark:text-paper">Page not found</h1>
    <p className="mt-2 text-sm text-slate">
      The page you're looking for doesn't exist, or may have been moved.
    </p>
    <Link
      to="/"
      className="mt-6 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-ink-light dark:bg-accent dark:text-ink"
    >
      Back to home
    </Link>
  </div>
);

export default NotFound;
