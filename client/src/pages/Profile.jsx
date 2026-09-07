import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiGithub, FiTwitter, FiLinkedin, FiGlobe } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';
import userService from '../services/userService';
import ImageUploader from '../components/ImageUploader';

const Profile = () => {
  const { user, updateUserInContext } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || { url: '', public_id: '' },
    socialLinks: {
      website: user?.socialLinks?.website || '',
      twitter: user?.socialLinks?.twitter || '',
      github: user?.socialLinks?.github || '',
      linkedin: user?.socialLinks?.linkedin || '',
    },
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { user: updated } = await userService.updateProfile(form);
      updateUserInContext(updated);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (passwordForm.newPassword !== passwordForm.confirm) return toast.error('New passwords do not match');

    setSavingPassword(true);
    try {
      await userService.changePassword(passwordForm);
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-medium text-ink dark:text-paper">Your profile</h1>

      <form onSubmit={handleProfileSubmit} className="mt-8 space-y-6">
        <div className="max-w-[180px]">
          <ImageUploader
            label="Profile picture"
            value={form.avatar}
            onChange={(avatar) => setForm({ ...form, avatar })}
            aspect="aspect-square"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink dark:text-paper">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-md border border-line bg-transparent px-3 py-2.5 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink dark:text-paper">Bio</label>
          <textarea
            rows={3}
            maxLength={280}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="A little about you"
            className="w-full rounded-md border border-line bg-transparent px-3 py-2.5 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink dark:text-paper">Social links</p>
          <div className="space-y-2">
            {[
              { key: 'website', icon: <FiGlobe size={15} />, placeholder: 'https://your-site.com' },
              { key: 'twitter', icon: <FiTwitter size={15} />, placeholder: 'https://x.com/username' },
              { key: 'github', icon: <FiGithub size={15} />, placeholder: 'https://github.com/username' },
              { key: 'linkedin', icon: <FiLinkedin size={15} />, placeholder: 'https://linkedin.com/in/username' },
            ].map(({ key, icon, placeholder }) => (
              <div key={key} className="flex items-center gap-2 rounded-md border border-line px-3 dark:border-line-dark">
                <span className="text-slate">{icon}</span>
                <input
                  type="url"
                  value={form.socialLinks[key]}
                  onChange={(e) =>
                    setForm({ ...form, socialLinks: { ...form.socialLinks, [key]: e.target.value } })
                  }
                  placeholder={placeholder}
                  className="w-full bg-transparent py-2.5 text-sm text-ink outline-none dark:text-paper"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={savingProfile}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-ink-light disabled:opacity-60 dark:bg-accent dark:text-ink"
        >
          {savingProfile ? 'Saving…' : 'Save profile'}
        </button>
      </form>

      <div className="mt-14 border-t border-line pt-8 dark:border-line-dark">
        <h2 className="font-display text-xl font-medium text-ink dark:text-paper">Change password</h2>
        <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
          <input
            type="password"
            required
            placeholder="Current password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            className="w-full rounded-md border border-line bg-transparent px-3 py-2.5 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="New password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            className="w-full rounded-md border border-line bg-transparent px-3 py-2.5 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Confirm new password"
            value={passwordForm.confirm}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
            className="w-full rounded-md border border-line bg-transparent px-3 py-2.5 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
          />
          <button
            type="submit"
            disabled={savingPassword}
            className="rounded-full border border-ink px-6 py-2.5 text-sm font-medium text-ink hover:bg-ink hover:text-paper disabled:opacity-60 dark:border-paper dark:text-paper dark:hover:bg-paper dark:hover:text-ink"
          >
            {savingPassword ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
