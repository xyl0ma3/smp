import { lazy, Suspense } from 'react'

// Lazy load components for better performance
export const lazyLoad = (importFunc, fallback = null) => {
  const Component = lazy(importFunc)
  
  return {
    Component,
    LazyComponent: (props) => (
      <Suspense fallback={fallback || <LoadingSpinner />}>
        <Component {...props} />
      </Suspense>
    )
  }
}

// Simple loading spinner
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
)

// Loading skeleton for posts
export const PostSkeleton = () => (
  <div className="bg-neutral-900 rounded-2xl p-4 mb-4 animate-pulse">
    <div className="flex gap-3 mb-3">
      <div className="w-12 h-12 bg-neutral-700 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-neutral-700 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-neutral-700 rounded w-1/4"></div>
      </div>
    </div>
    <div className="h-4 bg-neutral-700 rounded mb-2"></div>
    <div className="h-4 bg-neutral-700 rounded w-5/6"></div>
  </div>
)
