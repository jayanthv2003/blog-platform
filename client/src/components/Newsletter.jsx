import { useState } from 'react';
import { toast } from 'react-toastify';
import newsletterService from '../services/newsletterService';

const Newsletter = ({ compact = false }) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const { message } = await newsletterService.subscribe(email.trim());
      toast.success(message || 'Subscribed successfully');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not subscribe right now');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-ink dark:text-paper">
        {compact ? 'Get new posts by email' : 'Subscribe to the newsletter'}
      </p>
      {!compact && (
        <p className="mb-3 text-sm text-slate">One email a week. No noise, unsubscribe anytime.</p>
      )}
      <form onSubmit={handleSubmit} className="flex max-w-sm gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-full border border-line bg-transparent px-4 py-2 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
        />
        <button
          type="submit"
          disabled={submitting}
          className="shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-light disabled:opacity-60 dark:bg-accent dark:text-ink"
        >
          {submitting ? '...' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
};

export default Newsletter;
