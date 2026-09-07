import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import userService from '../services/userService';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const SavedPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .getSavedPosts()
      .then((res) => setPosts(res.posts))
      .catch(() => toast.error('Could not load saved posts'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullscreen label="Loading saved posts" />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-medium text-ink dark:text-paper">Saved posts</h1>
      {posts.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No saved posts yet"
            description="Bookmark posts you want to come back to later."
            action={
              <Link to="/explore" className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper dark:bg-accent dark:text-ink">
                Explore posts
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} variant="grid" />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPosts;
