import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2, FiEye, FiHeart } from 'react-icons/fi';
import userService from '../services/userService';
import postService from '../services/postService';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/format';

const statusStyles = {
  published: 'bg-moss-light text-moss',
  draft: 'bg-ink/10 text-ink dark:bg-paper/10 dark:text-paper',
  pending: 'bg-accent/10 text-accent',
};

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = () => {
    setLoading(true);
    userService
      .getMyPosts()
      .then((res) => setPosts(res.posts))
      .catch(() => toast.error('Could not load your posts'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchPosts, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await postService.deletePost(id);
      toast.success('Post deleted');
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete post');
    }
  };

  if (loading) return <Loader fullscreen label="Loading your posts" />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-medium text-ink dark:text-paper">My posts</h1>
        <Link
          to="/write"
          className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-ink-light dark:bg-accent dark:text-ink"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="You haven't written anything yet"
            description="Your published posts and drafts will show up here."
            action={
              <Link to="/write" className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper dark:bg-accent dark:text-ink">
                Write your first post
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 divide-y divide-line dark:divide-line-dark">
          {posts.map((post) => (
            <div key={post._id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${statusStyles[post.status]}`}>
                    {post.status}
                  </span>
                  <span className="text-xs text-slate">{formatDate(post.createdAt)}</span>
                </div>
                <Link
                  to={`/post/${post.slug}`}
                  className="mt-1 block truncate font-display text-lg font-medium text-ink hover:text-accent dark:text-paper"
                >
                  {post.title}
                </Link>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate">
                  <span className="inline-flex items-center gap-1">
                    <FiEye size={12} /> {post.views}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FiHeart size={12} /> {post.likes?.length || 0}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  to={`/edit-post/${post._id}`}
                  className="rounded-full border border-line p-2 text-ink/70 hover:border-accent hover:text-accent dark:border-line-dark dark:text-paper/70"
                  aria-label="Edit post"
                >
                  <FiEdit2 size={15} />
                </Link>
                <button
                  onClick={() => handleDelete(post._id)}
                  className="rounded-full border border-line p-2 text-ink/70 hover:border-rust hover:text-rust dark:border-line-dark dark:text-paper/70"
                  aria-label="Delete post"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPosts;
