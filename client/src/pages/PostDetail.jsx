import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiHeart, FiBookmark, FiEdit2, FiTrash2, FiClock, FiEye } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';
import postService from '../services/postService';
import PostCard from '../components/PostCard';
import CommentSection from '../components/CommentSection';
import Loader from '../components/Loader';
import { formatDate, formatCompactNumber } from '../utils/format';

const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    try {
      const { post: data } = await postService.getPost(slug);
      setPost(data);
      setLiked(data.likes?.some((id) => id === user?._id));
      setLikeCount(data.likeCount ?? data.likes?.length ?? 0);
      setSaved(user?.savedPosts?.some?.((id) => id === data._id) || false);

      const { posts: relatedPosts } = await postService.getRelated(data._id);
      setRelated(relatedPosts);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Post not found');
    } finally {
      setLoading(false);
    }
  }, [slug, user]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleLike = async () => {
    if (!isAuthenticated) return toast.info('Log in to like this post');
    setLiked((l) => !l);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    try {
      await postService.toggleLike(post._id);
    } catch (error) {
      setLiked((l) => !l);
      setLikeCount((c) => (liked ? c + 1 : c - 1));
      toast.error('Something went wrong');
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) return toast.info('Log in to save this post');
    setSaved((s) => !s);
    try {
      await postService.toggleSave(post._id);
      toast.success(saved ? 'Removed from saved posts' : 'Saved for later');
    } catch (error) {
      setSaved((s) => !s);
      toast.error('Something went wrong');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await postService.deletePost(post._id);
      toast.success('Post deleted');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete post');
    }
  };

  if (loading) return <Loader fullscreen label="Loading post" />;
  if (!post) return null;

  const isOwner = user?._id === post.author?._id;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Link
          to={`/explore?category=${post.category?._id}`}
          className="inline-block rounded-full bg-moss-light px-2.5 py-0.5 text-xs font-medium text-moss dark:bg-moss/20"
        >
          {post.category?.name}
        </Link>

        <h1 className="mt-4 font-display text-4xl font-medium leading-tight text-ink sm:text-5xl dark:text-paper">
          {post.title}
        </h1>
        {post.subtitle && <p className="mt-3 text-lg leading-relaxed text-slate">{post.subtitle}</p>}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4 dark:border-line-dark">
          <div className="flex items-center gap-3">
            <Link to={`/author/${post.author?._id}`}>
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-ink/10 font-semibold text-ink dark:bg-paper/10 dark:text-paper">
                {post.author?.avatar?.url ? (
                  <img src={post.author.avatar.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  post.author?.name?.charAt(0).toUpperCase()
                )}
              </div>
            </Link>
            <div>
              <Link to={`/author/${post.author?._id}`} className="font-medium text-ink hover:text-accent dark:text-paper">
                {post.author?.name}
              </Link>
              <div className="flex items-center gap-2 text-xs text-slate">
                <span>{formatDate(post.createdAt)}</span>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <FiClock size={11} /> {post.readTime} min read
                </span>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <FiEye size={11} /> {formatCompactNumber(post.views)} views
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${
                liked ? 'border-rust bg-rust/10 text-rust' : 'border-line text-ink/70 hover:border-rust hover:text-rust dark:border-line-dark dark:text-paper/70'
              }`}
            >
              <FiHeart size={15} className={liked ? 'fill-rust' : ''} /> {formatCompactNumber(likeCount)}
            </button>
            <button
              onClick={handleSave}
              aria-label="Save post"
              className={`rounded-full border p-2 ${
                saved ? 'border-accent bg-accent/10 text-accent' : 'border-line text-ink/70 hover:border-accent hover:text-accent dark:border-line-dark dark:text-paper/70'
              }`}
            >
              <FiBookmark size={15} className={saved ? 'fill-accent' : ''} />
            </button>
            {(isOwner || isAdmin) && (
              <>
                <Link
                  to={`/edit-post/${post._id}`}
                  className="rounded-full border border-line p-2 text-ink/70 hover:border-accent hover:text-accent dark:border-line-dark dark:text-paper/70"
                  aria-label="Edit post"
                >
                  <FiEdit2 size={15} />
                </Link>
                <button
                  onClick={handleDelete}
                  className="rounded-full border border-line p-2 text-ink/70 hover:border-rust hover:text-rust dark:border-line-dark dark:text-paper/70"
                  aria-label="Delete post"
                >
                  <FiTrash2 size={15} />
                </button>
              </>
            )}
          </div>
        </div>

        {post.coverImage?.url && (
          <img src={post.coverImage.url} alt={post.title} className="mt-8 w-full rounded-lg" />
        )}

        <div className="prose-article mt-8" dangerouslySetInnerHTML={{ __html: post.content }} />

        {post.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/explore?tag=${tag}`}
                className="rounded-full border border-line px-3 py-1 text-xs text-ink/80 hover:border-accent hover:text-accent dark:border-line-dark dark:text-paper/80"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <CommentSection postId={post._id} />
      </motion.div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-line pt-10 dark:border-line-dark">
          <h2 className="mb-6 font-display text-2xl font-medium text-ink dark:text-paper">Related reading</h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {related.slice(0, 4).map((p) => (
              <PostCard key={p._id} post={p} variant="grid" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
};

export default PostDetail;
