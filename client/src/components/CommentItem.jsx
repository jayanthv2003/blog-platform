import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiHeart, FiEdit2, FiTrash2, FiCornerUpLeft, FiFlag } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';
import commentService from '../services/commentService';
import { formatDate } from '../utils/format';

const CommentItem = ({ comment, postId, isReply = false, onChanged, onReplyAdded }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [liked, setLiked] = useState(comment.likes?.some((id) => id === user?._id));
  const [likeCount, setLikeCount] = useState(comment.likeCount ?? comment.likes?.length ?? 0);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [busy, setBusy] = useState(false);

  const isOwner = user?._id === comment.author?._id;

  const handleLike = async () => {
    if (!isAuthenticated) return toast.info('Log in to like comments');
    setLiked((l) => !l);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    try {
      await commentService.toggleLike(comment._id);
    } catch (error) {
      setLiked((l) => !l);
      setLikeCount((c) => (liked ? c + 1 : c - 1));
      toast.error('Something went wrong');
    }
  };

  const handleSaveEdit = async () => {
    if (!content.trim()) return;
    setBusy(true);
    try {
      await commentService.update(comment._id, content.trim());
      toast.success('Comment updated');
      setEditing(false);
      onChanged?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update comment');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment? This cannot be undone.')) return;
    setBusy(true);
    try {
      await commentService.remove(comment._id);
      toast.success('Comment deleted');
      onChanged?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete comment');
    } finally {
      setBusy(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setBusy(true);
    try {
      await commentService.add({ postId, content: replyText.trim(), parentComment: comment._id });
      setReplyText('');
      setReplying(false);
      toast.success('Reply posted');
      onReplyAdded?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not post reply');
    } finally {
      setBusy(false);
    }
  };

  const handleMarkSpam = async () => {
    setBusy(true);
    try {
      await commentService.toggleSpam(comment._id);
      toast.success('Comment moderation updated');
      onChanged?.();
    } catch (error) {
      toast.error('Could not update comment');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={isReply ? 'mt-4 pl-6 sm:pl-10' : 'py-5'}>
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink/10 text-xs font-semibold text-ink dark:bg-paper/10 dark:text-paper">
          {comment.author?.avatar?.url ? (
            <img src={comment.author.avatar.url} alt="" className="h-full w-full object-cover" />
          ) : (
            comment.author?.name?.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <Link to={`/author/${comment.author?._id}`} className="text-sm font-medium text-ink hover:text-accent dark:text-paper">
              {comment.author?.name}
            </Link>
            <span className="text-xs text-slate">
              {formatDate(comment.createdAt)}
              {comment.isEdited && ' · edited'}
            </span>
            {comment.isSpam && (
              <span className="rounded-full bg-rust/10 px-2 py-0.5 text-[11px] font-medium text-rust">
                Flagged
              </span>
            )}
          </div>

          {editing ? (
            <div className="mt-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                maxLength={1000}
                className="w-full rounded-md border border-line bg-transparent p-2 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={busy}
                  className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper dark:bg-accent dark:text-ink"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setContent(comment.content);
                  }}
                  className="rounded-full px-3 py-1 text-xs font-medium text-slate hover:bg-ink/5 dark:hover:bg-paper/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink/90 dark:text-paper/90">
              {comment.content}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate">
            <button onClick={handleLike} className={`inline-flex items-center gap-1 hover:text-rust ${liked ? 'text-rust' : ''}`}>
              <FiHeart size={13} className={liked ? 'fill-rust' : ''} /> {likeCount || ''}
            </button>
            {!isReply && isAuthenticated && (
              <button onClick={() => setReplying((r) => !r)} className="inline-flex items-center gap-1 hover:text-ink dark:hover:text-paper">
                <FiCornerUpLeft size={13} /> Reply
              </button>
            )}
            {isOwner && !editing && (
              <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1 hover:text-ink dark:hover:text-paper">
                <FiEdit2 size={13} /> Edit
              </button>
            )}
            {(isOwner || isAdmin) && (
              <button onClick={handleDelete} disabled={busy} className="inline-flex items-center gap-1 hover:text-rust">
                <FiTrash2 size={13} /> Delete
              </button>
            )}
            {isAdmin && !isOwner && (
              <button onClick={handleMarkSpam} disabled={busy} className="inline-flex items-center gap-1 hover:text-rust">
                <FiFlag size={13} /> {comment.isSpam ? 'Unflag' : 'Flag spam'}
              </button>
            )}
          </div>

          {replying && (
            <div className="mt-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                maxLength={1000}
                placeholder={`Reply to ${comment.author?.name}…`}
                className="w-full rounded-md border border-line bg-transparent p-2 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleReply}
                  disabled={busy}
                  className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper dark:bg-accent dark:text-ink"
                >
                  Post reply
                </button>
                <button
                  onClick={() => setReplying(false)}
                  className="rounded-full px-3 py-1 text-xs font-medium text-slate hover:bg-ink/5 dark:hover:bg-paper/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {comment.replies?.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postId={postId}
              isReply
              onChanged={onChanged}
              onReplyAdded={onReplyAdded}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
