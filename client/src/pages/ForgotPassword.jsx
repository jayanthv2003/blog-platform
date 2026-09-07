import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-medium text-ink dark:text-paper">Reset your password</h1>
      <p className="mt-2 text-sm text-slate">
        Enter the email associated with your account and we'll send a reset link.
      </p>

      {sent ? (
        <div className="mt-8 rounded-md bg-moss-light p-4 text-sm text-moss dark:bg-moss/10">
          If an account exists for <strong>{email}</strong>, a reset link is on its way. Check your inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-line bg-transparent px-3 py-2.5 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
            placeholder="you@example.com"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-ink py-2.5 text-sm font-medium text-paper hover:bg-ink-light disabled:opacity-60 dark:bg-accent dark:text-ink"
          >
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate">
        <Link to="/login" className="font-medium text-accent hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
