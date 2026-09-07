import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiTrendingUp } from 'react-icons/fi';
import HeroBanner from '../components/HeroBanner';
import PostCard from '../components/PostCard';
import TagCloud from '../components/TagCloud';
import Loader from '../components/Loader';
import postService from '../services/postService';
import categoryService from '../services/categoryService';
import tagService from '../services/tagService';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

const LATEST_PAGE_SIZE = 6;

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  // "Latest posts" loads incrementally via infinite scroll rather than
  // pagination controls - a better fit for a casual, endless home feed.
  const [latest, setLatest] = useState([]);
  const [latestPage, setLatestPage] = useState(1);
  const [hasMoreLatest, setHasMoreLatest] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [featuredRes, latestRes, trendingRes, categoriesRes, tagsRes] = await Promise.all([
          postService.getFeatured(),
          postService.getPosts({ sort: 'latest', limit: LATEST_PAGE_SIZE, page: 1 }),
          postService.getTrending(),
          categoryService.getAll(),
          tagService.getPopular(12),
        ]);
        setFeatured(featuredRes.posts);
        setLatest(latestRes.posts);
        setHasMoreLatest(latestRes.page < latestRes.pages);
        setTrending(trendingRes.posts);
        setCategories(categoriesRes.categories);
        setTags(tagsRes.tags);
      } catch (error) {
        toast.error('Could not load the homepage right now');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const loadMoreLatest = useCallback(async () => {
    setLoadingMore(true);
    try {
      const nextPage = latestPage + 1;
      const res = await postService.getPosts({ sort: 'latest', limit: LATEST_PAGE_SIZE, page: nextPage });
      setLatest((prev) => [...prev, ...res.posts]);
      setLatestPage(nextPage);
      setHasMoreLatest(nextPage < res.pages);
    } catch (error) {
      toast.error('Could not load more posts');
    } finally {
      setLoadingMore(false);
    }
  }, [latestPage]);

  const sentinelRef = useInfiniteScroll({
    onIntersect: loadMoreLatest,
    hasMore: hasMoreLatest,
    loading: loadingMore,
  });

  if (loading) return <Loader fullscreen label="Loading Inkline" />;

  const heroPost = featured[0];
  const restFeatured = featured.slice(1, 4);

  return (
    <div>
      <HeroBanner featuredPost={heroPost} />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            {restFeatured.length > 0 && (
              <section className="mb-14">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-display text-2xl font-medium text-ink dark:text-paper">Featured</h2>
                </div>
                <div className="grid gap-8 sm:grid-cols-3">
                  {restFeatured.map((post) => (
                    <PostCard key={post._id} post={post} variant="grid" />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-2xl font-medium text-ink dark:text-paper">Latest posts</h2>
                <Link to="/explore" className="link-underline text-sm font-medium text-accent">
                  View all
                </Link>
              </div>
              <div>
                {latest.map((post) => (
                  <PostCard key={post._id} post={post} variant="row" />
                ))}
              </div>

              {/* Infinite scroll sentinel - triggers loadMoreLatest when scrolled into view */}
              {hasMoreLatest && (
                <div ref={sentinelRef} className="py-6">
                  {loadingMore && <Loader label="Loading more posts" />}
                </div>
              )}
              {!hasMoreLatest && latest.length > LATEST_PAGE_SIZE && (
                <p className="py-6 text-center text-sm text-slate">You've reached the end.</p>
              )}
            </section>
          </div>

          <aside className="space-y-10">
            {trending.length > 0 && (
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-medium text-ink dark:text-paper">
                  <FiTrendingUp className="text-accent" /> Trending
                </h3>
                <ol className="space-y-4">
                  {trending.slice(0, 5).map((post, idx) => (
                    <li key={post._id} className="flex gap-3">
                      <span className="font-display text-lg text-accent">{String(idx + 1).padStart(2, '0')}</span>
                      <Link
                        to={`/post/${post.slug}`}
                        className="text-sm font-medium leading-snug text-ink hover:text-accent dark:text-paper"
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {categories.length > 0 && (
              <div>
                <h3 className="mb-4 font-display text-lg font-medium text-ink dark:text-paper">Categories</h3>
                <ul className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <li key={cat._id}>
                      <Link
                        to={`/explore?category=${cat._id}`}
                        className="rounded-full bg-moss-light px-3 py-1 text-xs font-medium text-moss hover:bg-moss/20 dark:bg-moss/20"
                      >
                        {cat.name} <span className="text-moss/70">({cat.postCount})</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <TagCloud tags={tags} />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Home;
