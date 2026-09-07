import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import categoryService from '../services/categoryService';
import Loader from '../components/Loader';

const palette = ['bg-moss-light text-moss', 'bg-accent/10 text-accent', 'bg-rust/10 text-rust', 'bg-ink/5 text-ink dark:bg-paper/10 dark:text-paper'];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService
      .getAll()
      .then((res) => setCategories(res.categories))
      .catch(() => toast.error('Could not load categories'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullscreen label="Loading categories" />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-medium text-ink dark:text-paper">Categories</h1>
      <p className="mt-2 text-sm text-slate">Browse posts by subject.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, idx) => (
          <Link
            key={cat._id}
            to={`/explore?category=${cat._id}`}
            className="group rounded-lg border border-line p-5 transition-colors hover:border-accent dark:border-line-dark"
          >
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${palette[idx % palette.length]}`}>
              {cat.postCount} posts
            </span>
            <h2 className="mt-3 font-display text-xl font-medium text-ink group-hover:text-accent dark:text-paper">
              {cat.name}
            </h2>
            {cat.description && <p className="mt-1.5 line-clamp-2 text-sm text-slate">{cat.description}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;
