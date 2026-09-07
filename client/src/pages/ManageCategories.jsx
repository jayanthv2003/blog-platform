import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiTrash2, FiEdit2, FiPlus } from 'react-icons/fi';
import categoryService from '../services/categoryService';
import Loader from '../components/Loader';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    categoryService
      .getAll()
      .then((res) => setCategories(res.categories))
      .catch(() => toast.error('Could not load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchCategories, []);

  const resetForm = () => {
    setForm({ name: '', description: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await categoryService.update(editingId, form);
        toast.success('Category updated');
      } else {
        await categoryService.create(form);
        toast.success('Category created');
      }
      resetForm();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '' });
    setEditingId(cat._id);
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await categoryService.remove(cat._id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete category');
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_260px]">
      {loading ? (
        <Loader label="Loading categories" />
      ) : (
        <div className="divide-y divide-line rounded-lg border border-line dark:divide-line-dark dark:border-line-dark">
          {categories.map((cat) => (
            <div key={cat._id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-ink dark:text-paper">
                  {cat.name} <span className="text-xs text-slate">({cat.postCount} posts)</span>
                </p>
                {cat.description && <p className="text-xs text-slate">{cat.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(cat)}
                  className="rounded-full border border-line p-1.5 text-ink/70 hover:border-accent hover:text-accent dark:border-line-dark dark:text-paper/70"
                  aria-label="Edit category"
                >
                  <FiEdit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="rounded-full border border-line p-1.5 text-ink/70 hover:border-rust hover:text-rust dark:border-line-dark dark:text-paper/70"
                  aria-label="Delete category"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="h-fit rounded-lg border border-line p-4 dark:border-line-dark">
        <p className="mb-3 text-sm font-medium text-ink dark:text-paper">
          {editingId ? 'Edit category' : 'New category'}
        </p>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Category name"
          className="mb-2 w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Short description (optional)"
          rows={2}
          className="mb-3 w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-light disabled:opacity-60 dark:bg-accent dark:text-ink"
          >
            <FiPlus size={14} /> {editingId ? 'Save' : 'Add'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate hover:bg-ink/5 dark:hover:bg-paper/10"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ManageCategories;
