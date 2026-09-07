import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiSun,
  FiMoon,
  FiMenu,
  FiX,
  FiPenTool,
  FiUser,
  FiBookmark,
  FiHeart,
  FiGrid,
  FiLogOut,
} from 'react-icons/fi';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/explore', label: 'Explore' },
    { to: '/categories', label: 'Categories' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur dark:border-line-dark dark:bg-paper-dark/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="font-display text-2xl font-semibold tracking-tight text-ink dark:text-paper">
          Inkline
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="link-underline font-body text-[15px] text-ink/80 hover:text-ink dark:text-paper/80 dark:hover:text-paper"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSearch}
                  className="overflow-hidden"
                >
                  <input
                    autoFocus
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search articles…"
                    className="w-full rounded-full border border-line bg-transparent px-4 py-1.5 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
                  />
                </motion.form>
              )}
            </AnimatePresence>
          </div>
          <button
            aria-label="Toggle search"
            onClick={() => setSearchOpen((o) => !o)}
            className="rounded-full p-2 text-ink/70 hover:bg-ink/5 dark:text-paper/70 dark:hover:bg-paper/10"
          >
            <FiSearch size={18} />
          </button>

          <button
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="rounded-full p-2 text-ink/70 hover:bg-ink/5 dark:text-paper/70 dark:hover:bg-paper/10"
          >
            {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/write"
                className="hidden items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-paper hover:bg-ink-light sm:flex dark:bg-accent dark:text-ink dark:hover:bg-accent-dark"
              >
                <FiPenTool size={14} /> Write
              </Link>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-line bg-ink/5 text-sm font-semibold text-ink dark:border-line-dark dark:bg-paper/10 dark:text-paper"
                >
                  {user?.avatar?.url ? (
                    <img src={user.avatar.url} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase()
                  )}
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-line bg-paper shadow-lg dark:border-line-dark dark:bg-paper-darkcard"
                    >
                      <div className="border-b border-line px-4 py-3 dark:border-line-dark">
                        <p className="truncate font-medium text-ink dark:text-paper">{user?.name}</p>
                        <p className="truncate text-xs text-slate">{user?.email}</p>
                      </div>
                      <MenuLink to="/profile" icon={<FiUser size={15} />} onClick={() => setMenuOpen(false)}>
                        Profile
                      </MenuLink>
                      <MenuLink to="/my-posts" icon={<FiPenTool size={15} />} onClick={() => setMenuOpen(false)}>
                        My Posts
                      </MenuLink>
                      <MenuLink to="/saved-posts" icon={<FiBookmark size={15} />} onClick={() => setMenuOpen(false)}>
                        Saved Posts
                      </MenuLink>
                      <MenuLink to="/liked-posts" icon={<FiHeart size={15} />} onClick={() => setMenuOpen(false)}>
                        Liked Posts
                      </MenuLink>
                      {isAdmin && (
                        <MenuLink to="/admin" icon={<FiGrid size={15} />} onClick={() => setMenuOpen(false)}>
                          Admin Dashboard
                        </MenuLink>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-rust hover:bg-rust/5"
                      >
                        <FiLogOut size={15} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="rounded-full px-4 py-1.5 text-sm font-medium text-ink hover:bg-ink/5 dark:text-paper dark:hover:bg-paper/10"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-paper hover:bg-ink-light dark:bg-accent dark:text-ink"
              >
                Sign up
              </Link>
            </div>
          )}

          <button
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-full p-2 text-ink/70 hover:bg-ink/5 dark:text-paper/70 dark:hover:bg-paper/10 md:hidden"
          >
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-line md:hidden dark:border-line-dark"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-2 py-2 text-ink hover:bg-ink/5 dark:text-paper dark:hover:bg-paper/10"
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-2 py-2 text-ink hover:bg-ink/5 dark:text-paper dark:hover:bg-paper/10"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-2 py-2 text-ink hover:bg-ink/5 dark:text-paper dark:hover:bg-paper/10"
                  >
                    Sign up
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <Link
                  to="/write"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-2 py-2 text-ink hover:bg-ink/5 dark:text-paper dark:hover:bg-paper/10"
                >
                  Write
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const MenuLink = ({ to, icon, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-ink/5 dark:text-paper dark:hover:bg-paper/10"
  >
    {icon} {children}
  </Link>
);

export default Navbar;
