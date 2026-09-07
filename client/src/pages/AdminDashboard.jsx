import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUsers, FiFileText, FiMessageSquare, FiTag, FiEye } from 'react-icons/fi';
import adminService from '../services/adminService';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import { formatDate, formatCompactNumber } from '../utils/format';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getStats()
      .then(setData)
      .catch(() => toast.error('Could not load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading dashboard" />;
  if (!data) return null;

  const { stats, recentPosts, recentUsers } = data;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon={<FiUsers size={18} />} label="Total Users" value={stats.totalUsers} />
        <StatCard icon={<FiFileText size={18} />} label="Total Posts" value={stats.totalPosts} />
        <StatCard icon={<FiMessageSquare size={18} />} label="Total Comments" value={stats.totalComments} />
        <StatCard icon={<FiTag size={18} />} label="Categories" value={stats.totalCategories} />
        <StatCard icon={<FiEye size={18} />} label="Total Views" value={formatCompactNumber(stats.totalViews)} />
        <StatCard icon={<FiFileText size={18} />} label="Drafts Pending" value={stats.draftPosts} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-display text-lg font-medium text-ink dark:text-paper">Recent posts</h2>
          <div className="divide-y divide-line rounded-lg border border-line dark:divide-line-dark dark:border-line-dark">
            {recentPosts.map((post) => (
              <Link key={post._id} to={`/post/${post.slug}`} className="block px-4 py-3 hover:bg-ink/5 dark:hover:bg-paper/5">
                <p className="truncate text-sm font-medium text-ink dark:text-paper">{post.title}</p>
                <p className="text-xs text-slate">
                  {post.author?.name} · {formatDate(post.createdAt)}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-display text-lg font-medium text-ink dark:text-paper">Recent users</h2>
          <div className="divide-y divide-line rounded-lg border border-line dark:divide-line-dark dark:border-line-dark">
            {recentUsers.map((u) => (
              <div key={u._id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink dark:text-paper">{u.name}</p>
                  <p className="text-xs text-slate">{u.email}</p>
                </div>
                <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-medium capitalize text-ink dark:bg-paper/10 dark:text-paper">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
