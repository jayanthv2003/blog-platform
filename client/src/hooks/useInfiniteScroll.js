import { useRef, useCallback } from 'react';

// Attach the returned ref to a sentinel element at the bottom of a list.
// Calls onIntersect() once whenever that element scrolls into view, as long
// as hasMore is true and nothing is currently loading.
const useInfiniteScroll = ({ onIntersect, hasMore, loading }) => {
  const observerRef = useRef(null);

  const sentinelRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onIntersect();
        }
      }, { rootMargin: '200px' });

      if (node) observerRef.current.observe(node);
    },
    [onIntersect, hasMore, loading]
  );

  return sentinelRef;
};

export default useInfiniteScroll;
