import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiTrash2, FiFlag } from 'react-icons/fi';
import adminService from '../services/adminService';
import commentService from '../services/commentService';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import { formatDate } from '../utils/format';

const ManageComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spamOnly, setSpamOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({ pages: 1 });

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getComments({ spamOnly, page });
      setComments(res.comments);
      setPageInfo(res);
    } catch (error) {
      toast.error('Could not load comments');
    } finally {
      setLoading(false);
    }
  }, [spamOnly, page]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleToggleSpam = async (comment) => {
    try {
      await commentService.toggleSpam(comment._id);
      toast.success(comment.isSpam ? 'Comment unflagged' : 'Comment flagged as spam');
      fetchComments();
    } catch (error) {
      toast.error('Could not update comment');
    }
  };

  const handleDelete = async (comment) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try {
      await commentService.remove(comment._id);
      toast.success('Comment deleted');
      fetchComments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete comment');
    }
  };

  return (
    <div>
      <label className="mb-5 flex w-fit items-center gap-2 text-sm text-ink dark:text-paper">
        <input
          type="checkbox"
          checked={spamOnly}
          onChange={(e) => {
            setSpamOnly(e.target.checked);
            setPage(1);
          }}
          className="rounded border-line accent-accent"
        />
        Show flagged only
      </label>

      {loading ? (
        <Loader label="Loading comments" />
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate">No comments to show.</p>
      ) : (
        <div className="divide-y divide-line rounded-lg border border-line dark:divide-line-dark dark:border-line-dark">
          {comments.map((comment) => (
            <div key={comment._id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate">
                  <span className="font-medium text-ink dark:text-paper">{comment.author?.name}</span>
                  <span>{comment.author?.email}</span>
                  <span>{formatDate(comment.createdAt)}</span>
                  {comment.isSpam && <span className="rounded-full bg-rust/10 px-2 py-0.5 text-rust">Flagged</span>}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-ink/90 dark:text-paper/90">{comment.content}</p>
                <Link to={`/post/${comment.post?.slug}`} className="text-xs text-accent hover:underline">
                  on "{comment.post?.title}"
                </Link>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => handleToggleSpam(comment)}
                  className="rounded-full border border-line p-1.5 text-ink/70 hover:border-accent hover:text-accent dark:border-line-dark dark:text-paper/70"
                  aria-label="Toggle spam flag"
                >
                  <FiFlag size={15} />
                </button>
                <button
                  onClick={() => handleDelete(comment)}
                  className="rounded-full border border-line p-1.5 text-ink/70 hover:border-rust hover:text-rust dark:border-line-dark dark:text-paper/70"
                  aria-label="Delete comment"
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

export default ManageComments;
