import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import adminService from '../services/adminService';
import postService from '../services/postService';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import useDebounce from '../hooks/useDebounce';
import { formatDate } from '../utils/format';

const statusStyles = {
  published: 'bg-moss-light text-moss',
  draft: 'bg-ink/10 text-ink dark:bg-paper/10 dark:text-paper',
  pending: 'bg-accent/10 text-accent',
};

const ManagePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({ pages: 1 });
  const debouncedSearch = useDebounce(search, 400);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getPosts({ search: debouncedSearch, status, page });
      setPosts(res.posts);
      setPageInfo(res);
    } catch (error) {
      toast.error('Could not load posts');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleStatusChange = async (post, newStatus) => {
    try {
      await adminService.updatePostStatus(post._id, newStatus);
      toast.success(`Post ${newStatus === 'published' ? 'approved' : 'moved to draft'}`);
      fetchPosts();
    } catch (error) {
      toast.error('Could not update post status');
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}" permanently?`)) return;
    try {
      await postService.deletePost(post._id);
      toast.success('Post deleted');
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete post');
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by title…"
          className="max-w-sm flex-1 rounded-full border border-line bg-transparent px-4 py-2 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-full border border-line bg-transparent px-3 py-2 text-sm text-ink outline-none dark:border-line-dark dark:bg-paper-dark dark:text-paper"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {loading ? (
        <Loader label="Loading posts" />
      ) : (
        <div className="divide-y divide-line rounded-lg border border-line dark:divide-line-dark dark:border-line-dark">
          {posts.map((post) => (
            <div key={post._id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${statusStyles[post.status]}`}>
                    {post.status}
                  </span>
                  <span className="text-xs text-slate">{formatDate(post.createdAt)}</span>
                </div>
                <Link to={`/post/${post.slug}`} className="mt-1 block truncate text-sm font-medium text-ink hover:text-accent dark:text-paper">
                  {post.title}
                </Link>
                <p className="text-xs text-slate">{post.author?.name} · {post.category?.name}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {post.status !== 'published' && (
                  <button
                    onClick={() => handleStatusChange(post, 'published')}
                    className="rounded-full border border-line p-1.5 text-ink/70 hover:border-moss hover:text-moss dark:border-line-dark dark:text-paper/70"
                    aria-label="Approve post"
                  >
                    <FiCheck size={15} />
                  </button>
                )}
                {post.status !== 'draft' && (
                  <button
                    onClick={() => handleStatusChange(post, 'draft')}
                    className="rounded-full border border-line p-1.5 text-ink/70 hover:border-accent hover:text-accent dark:border-line-dark dark:text-paper/70"
                    aria-label="Move to draft"
                  >
                    <FiX size={15} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(post)}
                  className="rounded-full border border-line p-1.5 text-ink/70 hover:border-rust hover:text-rust dark:border-line-dark dark:text-paper/70"
                  aria-label="Delete post"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} pages={pageInfo.pages} onChange={setPage} />
    </div>
  );
};

export default ManagePosts;
