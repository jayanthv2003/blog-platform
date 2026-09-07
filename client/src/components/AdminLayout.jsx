import { NavLink, Outlet } from 'react-router-dom';
import { FiGrid, FiUsers, FiFileText, FiMessageSquare, FiTag } from 'react-icons/fi';

const links = [
  { to: '/admin', end: true, icon: FiGrid, label: 'Overview' },
  { to: '/admin/users', icon: FiUsers, label: 'Users' },
  { to: '/admin/posts', icon: FiFileText, label: 'Posts' },
  { to: '/admin/comments', icon: FiMessageSquare, label: 'Comments' },
  { to: '/admin/categories', icon: FiTag, label: 'Categories' },
];

const AdminLayout = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-medium text-ink dark:text-paper">Admin dashboard</h1>

      <div className="mt-8 grid gap-8 md:grid-cols-[200px_1fr]">
        <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {links.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-ink text-paper dark:bg-accent dark:text-ink'
                    : 'text-ink/70 hover:bg-ink/5 dark:text-paper/70 dark:hover:bg-paper/10'
                }`
              }
            >
              <Icon size={15} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
