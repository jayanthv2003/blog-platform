import { Link } from 'react-router-dom';
import { FiHeart, FiEye, FiClock } from 'react-icons/fi';
import { formatDate, formatCompactNumber, truncate } from '../utils/format';

const CategoryTag = ({ category }) => {
  if (!category) return null;
  return (
    <Link
      to={`/explore?category=${category._id}`}
      className="inline-block rounded-full bg-moss-light px-2.5 py-0.5 text-xs font-medium text-moss hover:bg-moss/20 dark:bg-moss/20 dark:text-moss"
    >
      {category.name}
    </Link>
  );
};

const Meta = ({ post }) => (
  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate">
    <span>{formatDate(post.createdAt)}</span>
    <span aria-hidden>·</span>
    <span className="inline-flex items-center gap-1">
      <FiClock size={12} /> {post.readTime} min read
    </span>
    <span aria-hidden>·</span>
    <span className="inline-flex items-center gap-1">
      <FiEye size={12} /> {formatCompactNumber(post.views)}
    </span>
    <span aria-hidden>·</span>
    <span className="inline-flex items-center gap-1">
      <FiHeart size={12} /> {formatCompactNumber(post.likeCount ?? post.likes?.length ?? 0)}
    </span>
  </div>
);

const PostCard = ({ post, variant = 'grid' }) => {
  if (!post) return null;

  if (variant === 'row') {
    return (
      <article className="group flex flex-col gap-4 border-b border-line py-6 sm:flex-row sm:items-start dark:border-line-dark">
        {post.coverImage?.url && (
          <Link to={`/post/${post.slug}`} className="block w-full shrink-0 overflow-hidden rounded-md sm:w-44">
            <img
              src={post.coverImage.url}
              alt={post.title}
              className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] sm:h-28"
              loading="lazy"
            />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <CategoryTag category={post.category} />
          <Link to={`/post/${post.slug}`}>
            <h3 className="mt-2 font-display text-xl font-medium leading-snug text-ink group-hover:text-accent dark:text-paper">
              {post.title}
            </h3>
          </Link>
          {post.subtitle && (
            <p className="mt-1.5 line-clamp-2 text-sm text-slate">{post.subtitle}</p>
          )}
          <div className="mt-3 flex items-center gap-2 text-sm text-ink/80 dark:text-paper/80">
            <Link to={`/author/${post.author?._id}`} className="font-medium hover:text-accent">
              {post.author?.name}
            </Link>
          </div>
          <Meta post={post} />
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col">
      <Link to={`/post/${post.slug}`} className="block overflow-hidden rounded-lg bg-ink/5 dark:bg-paper/5">
        {post.coverImage?.url ? (
          <img
            src={post.coverImage.url}
            alt={post.title}
            className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center">
            <span className="font-display text-3xl text-ink/20 dark:text-paper/20">In</span>
          </div>
        )}
      </Link>
      <div className="mt-3">
        <CategoryTag category={post.category} />
        <Link to={`/post/${post.slug}`}>
          <h3 className="mt-2 font-display text-lg font-medium leading-snug text-ink group-hover:text-accent dark:text-paper">
            {post.title}
          </h3>
        </Link>
        {post.excerpt && <p className="mt-1.5 line-clamp-2 text-sm text-slate">{truncate(post.excerpt, 110)}</p>}
        <div className="mt-3 flex items-center gap-2 text-sm text-ink/80 dark:text-paper/80">
          <Link to={`/author/${post.author?._id}`} className="font-medium hover:text-accent">
            {post.author?.name}
          </Link>
        </div>
        <Meta post={post} />
      </div>
    </article>
  );
};

export default PostCard;
