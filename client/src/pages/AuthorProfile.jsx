import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiGithub, FiTwitter, FiLinkedin, FiGlobe } from 'react-icons/fi';
import userService from '../services/userService';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/format';

const socialIcons = { website: FiGlobe, twitter: FiTwitter, github: FiGithub, linkedin: FiLinkedin };

const AuthorProfile = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    userService
      .getPublicProfile(id)
      .then(setData)
      .catch(() => toast.error('Could not load this profile'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullscreen label="Loading profile" />;
  if (!data) return null;

  const { user, posts } = data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink/10 text-2xl font-semibold text-ink dark:bg-paper/10 dark:text-paper">
          {user.avatar?.url ? (
            <img src={user.avatar.url} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user.name?.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <h1 className="font-display text-3xl font-medium text-ink dark:text-paper">{user.name}</h1>
          <p className="text-sm text-slate">Joined {formatDate(user.createdAt)}</p>
          {user.bio && <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink/80 dark:text-paper/80">{user.bio}</p>}
          <div className="mt-3 flex gap-3">
            {Object.entries(user.socialLinks || {})
              .filter(([, url]) => url)
              .map(([key, url]) => {
                const Icon = socialIcons[key];
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate hover:text-accent"
                    aria-label={key}
                  >
                    <Icon size={17} />
                  </a>
                );
              })}
          </div>
        </div>
      </div>

      <h2 className="mt-12 font-display text-2xl font-medium text-ink dark:text-paper">Published posts</h2>
      {posts.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No posts yet" description={`${user.name} hasn't published anything yet.`} />
        </div>
      ) : (
        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} variant="grid" />
          ))}
        </div>
      )}
    </div>
  );
};

export default AuthorProfile;
