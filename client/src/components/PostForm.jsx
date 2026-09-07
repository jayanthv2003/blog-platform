import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import ImageUploader from './ImageUploader';
import categoryService from '../services/categoryService';

const quillModules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
};

const emptyPost = {
  title: '',
  subtitle: '',
  category: '',
  tags: '',
  content: '',
  status: 'published',
  coverImage: { url: '', public_id: '' },
};

const PostForm = ({ initialValue, submitting, submitLabel, onSubmit }) => {
  const [form, setForm] = useState({ ...emptyPost, ...initialValue });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService.getAll().then((res) => setCategories(res.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialValue) {
      setForm((prev) => ({ ...prev, ...initialValue }));
    }
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim() || !form.category) {
      toast.error('Title, content, and category are required');
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink dark:text-paper">Title</label>
        <input
          type="text"
          required
          maxLength={150}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Give your post a title"
          className="w-full rounded-md border border-line bg-transparent px-3 py-2.5 font-display text-xl text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink dark:text-paper">Subtitle</label>
        <input
          type="text"
          maxLength={220}
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          placeholder="A short supporting line (optional)"
          className="w-full rounded-md border border-line bg-transparent px-3 py-2.5 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
        />
      </div>

      <ImageUploader value={form.coverImage} onChange={(coverImage) => setForm({ ...form, coverImage })} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink dark:text-paper">Category</label>
          <select
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-md border border-line bg-transparent px-3 py-2.5 text-sm text-ink outline-none dark:border-line-dark dark:bg-paper-dark dark:text-paper"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink dark:text-paper">Tags</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="comma, separated, tags"
            className="w-full rounded-md border border-line bg-transparent px-3 py-2.5 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink dark:text-paper">Content</label>
        <ReactQuill
          theme="snow"
          value={form.content}
          onChange={(content) => setForm({ ...form, content })}
          modules={quillModules}
          placeholder="Write your story…"
        />
      </div>

      <div className="flex items-center justify-between border-t border-line pt-6 dark:border-line-dark">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink dark:text-paper">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="rounded-md border border-line bg-transparent px-3 py-2 text-sm text-ink outline-none dark:border-line-dark dark:bg-paper-dark dark:text-paper"
          >
            <option value="published">Publish now</option>
            <option value="draft">Save as draft</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-ink-light disabled:opacity-60 dark:bg-accent dark:text-ink"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
