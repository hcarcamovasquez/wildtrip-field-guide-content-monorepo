import { useEffect, useRef, useState } from 'react'

interface UseInfiniteScrollOptions {
  threshold?: number
  hasMore: boolean
  onLoadMore: () => void
  isLoading?: boolean
}

export function useInfiniteScroll({
  threshold = 100,
  hasMore,
  onLoadMore,
  isLoading = false,
}: UseInfiniteScrollOptions) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        setIsIntersecting(entry.isIntersecting)
        
        if (entry.isIntersecting && hasMore && !isLoading) {
          onLoadMore()
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    )

    observer.observe(sentinelRef.current)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, onLoadMore, threshold, isLoading])

  return { sentinelRef, isIntersecting }
}