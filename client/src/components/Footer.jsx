import { Link } from 'react-router-dom';
import Newsletter from './Newsletter';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line dark:border-line-dark">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1.4fr]">
          <div>
            <p className="font-display text-xl font-semibold text-ink dark:text-paper">Inkline</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate">
              A place for writers to publish, and readers to find something worth their time.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-ink dark:text-paper">Explore</p>
            <ul className="space-y-2 text-sm text-slate">
              <li><Link to="/explore" className="hover:text-accent">Latest posts</Link></li>
              <li><Link to="/explore?sort=trending" className="hover:text-accent">Trending</Link></li>
              <li><Link to="/categories" className="hover:text-accent">Categories</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-ink dark:text-paper">Account</p>
            <ul className="space-y-2 text-sm text-slate">
              <li><Link to="/write" className="hover:text-accent">Start writing</Link></li>
              <li><Link to="/login" className="hover:text-accent">Log in</Link></li>
              <li><Link to="/register" className="hover:text-accent">Sign up</Link></li>
            </ul>
          </div>

          <Newsletter compact />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-xs text-slate sm:flex-row sm:items-center dark:border-line-dark">
          <p>© {year} Inkline. All rights reserved.</p>
          <p>Built with the MERN stack.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
