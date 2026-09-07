import { Link } from 'react-router-dom';

const TagCloud = ({ tags = [], title = 'Popular tags' }) => {
  if (tags.length === 0) return null;

  return (
    <div>
      {title && <p className="mb-3 text-sm font-medium text-ink dark:text-paper">{title}</p>}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag._id || tag.name}
            to={`/explore?tag=${tag.name}`}
            className="rounded-full border border-line px-3 py-1 text-xs text-ink/80 hover:border-accent hover:text-accent dark:border-line-dark dark:text-paper/80"
          >
            #{tag.name}
            {typeof tag.postCount === 'number' && <span className="ml-1 text-slate">{tag.postCount}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TagCloud;
