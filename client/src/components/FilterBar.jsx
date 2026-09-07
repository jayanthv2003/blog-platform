import { FiSearch } from 'react-icons/fi';

const sortOptions = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'mostViewed', label: 'Most Viewed' },
  { value: 'mostLiked', label: 'Most Liked' },
];

const FilterBar = ({ filters, onChange, categories = [] }) => {
  const update = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate" size={15} />
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Search by title, tag, author…"
          className="w-full rounded-full border border-line bg-transparent py-2 pl-9 pr-4 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filters.category || ''}
          onChange={(e) => update({ category: e.target.value })}
          className="rounded-full border border-line bg-transparent px-3 py-2 text-sm text-ink outline-none dark:border-line-dark dark:bg-paper-dark dark:text-paper"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={filters.sort || 'latest'}
          onChange={(e) => update({ sort: e.target.value })}
          className="rounded-full border border-line bg-transparent px-3 py-2 text-sm text-ink outline-none dark:border-line-dark dark:bg-paper-dark dark:text-paper"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
