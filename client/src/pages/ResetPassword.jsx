import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import useAuth from '../hooks/useAuth';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');

    setSubmitting(true);
    try {
      const data = await authService.resetPassword(token, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Password reset — you are now logged in');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired reset link');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-medium text-ink dark:text-paper">Set a new password</h1>
      <p className="mt-2 text-sm text-slate">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full rounded-md border border-line bg-transparent px-3 py-2.5 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
        />
        <input
          type="password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          className="w-full rounded-md border border-line bg-transparent px-3 py-2.5 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-ink py-2.5 text-sm font-medium text-paper hover:bg-ink-light disabled:opacity-60 dark:bg-accent dark:text-ink"
        >
          {submitting ? 'Resetting…' : 'Reset password'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate">
        <Link to="/login" className="font-medium text-accent hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
};

export default ResetPassword;
