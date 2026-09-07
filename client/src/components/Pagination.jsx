import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ page, pages, onChange }) => {
  if (!pages || pages <= 1) return null;

  const pageNumbers = [];
  const windowSize = 1;
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || (i >= page - windowSize && i <= page + windowSize)) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== '...') {
      pageNumbers.push('...');
    }
  }

  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-full p-2 text-ink/70 hover:bg-ink/5 disabled:opacity-30 dark:text-paper/70 dark:hover:bg-paper/10"
        aria-label="Previous page"
      >
        <FiChevronLeft size={18} />
      </button>

      {pageNumbers.map((p, idx) =>
        p === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-sm text-slate">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`h-9 w-9 rounded-full text-sm font-medium ${
              p === page
                ? 'bg-ink text-paper dark:bg-accent dark:text-ink'
                : 'text-ink/70 hover:bg-ink/5 dark:text-paper/70 dark:hover:bg-paper/10'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(Math.min(pages, page + 1))}
        disabled={page === pages}
        className="rounded-full p-2 text-ink/70 hover:bg-ink/5 disabled:opacity-30 dark:text-paper/70 dark:hover:bg-paper/10"
        aria-label="Next page"
      >
        <FiChevronRight size={18} />
      </button>
    </nav>
  );
};

export default Pagination;
