import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import commentService from '../services/commentService';
import CommentItem from './CommentItem';
import Loader from './Loader';

const CommentSection = ({ postId }) => {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const { comments: data } = await commentService.getForPost(postId);
      setComments(data);
    } catch (error) {
      toast.error('Could not load comments');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      await commentService.add({ postId, content: text.trim() });
      setText('');
      toast.success('Comment posted');
      fetchComments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not post comment');
    } finally {
      setPosting(false);
    }
  };

  const totalCount = comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);

  return (
    <section className="mt-16 border-t border-line pt-10 dark:border-line-dark">
      <h2 className="font-display text-2xl font-medium text-ink dark:text-paper">
        {totalCount} {totalCount === 1 ? 'Comment' : 'Comments'}
      </h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mt-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Add to the discussion…"
            className="w-full rounded-md border border-line bg-transparent p-3 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={posting || !text.trim()}
              className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-ink-light disabled:opacity-50 dark:bg-accent dark:text-ink"
            >
              {posting ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-6 rounded-md bg-ink/5 p-4 text-sm text-slate dark:bg-paper/5">
          <Link to="/login" className="font-medium text-accent">
            Log in
          </Link>{' '}
          to join the discussion.
        </p>
      )}

      <div className="mt-4 divide-y divide-line dark:divide-line-dark">
        {loading ? (
          <Loader label="Loading comments" />
        ) : comments.length === 0 ? (
          <p className="py-8 text-sm text-slate">No comments yet — be the first to say something.</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postId={postId}
              onChanged={fetchComments}
              onReplyAdded={fetchComments}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default CommentSection;
