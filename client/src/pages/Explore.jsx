import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import FilterBar from '../components/FilterBar';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import postService from '../services/postService';
import categoryService from '../services/categoryService';
import useDebounce from '../hooks/useDebounce';

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({ page: 1, pages: 1, total: 0 });

  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    author: searchParams.get('author') || '',
    sort: searchParams.get('sort') || 'latest',
    page: Number(searchParams.get('page')) || 1,
  };

  const debouncedSearch = useDebounce(filters.search, 400);

  const updateFilters = (next) => {
    const params = {};
    Object.entries({ ...next, page: next.page || 1 }).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    setSearchParams(params);
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { posts: data, page, pages, total } = await postService.getPosts({
        ...filters,
        search: debouncedSearch,
        limit: 9,
      });
      setPosts(data);
      setPageInfo({ page, pages, total });
    } catch (error) {
      toast.error('Could not load posts');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.category, filters.tag, filters.author, filters.sort, filters.page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    categoryService.getAll().then((res) => setCategories(res.categories)).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-medium text-ink dark:text-paper">Explore</h1>
      <p className="mt-2 text-sm text-slate">
        {pageInfo.total} {pageInfo.total === 1 ? 'story' : 'stories'}
        {filters.tag && <> tagged <strong>#{filters.tag}</strong></>}
      </p>

      <div className="mt-6">
        <FilterBar filters={filters} categories={categories} onChange={updateFilters} />
      </div>

      <div className="mt-8">
        {loading ? (
          <Loader label="Loading posts" />
        ) : posts.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            description="Try a different search term, category, or tag."
          />
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} variant="row" />
            ))}
          </div>
        )}
      </div>

      <Pagination page={pageInfo.page} pages={pageInfo.pages} onChange={(page) => updateFilters({ ...filters, page })} />
    </div>
  );
};

export default Explore;
