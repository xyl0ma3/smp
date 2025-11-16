import { useEffect, useState } from 'react'
import supabase from '../supabase'
import { likeAPI } from '../api'

/**
 * Hook para gestionar los likes de un post
 * @param {number} postId - ID del post
 * @param {string} userId - ID del usuario
 * @returns {Object} - { liked, likesCount, toggle, loading }
 */
export default function useLike(postId, userId) {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!postId || !userId) return

    const checkLike = async () => {
      try {
        const hasLiked = await likeAPI.hasLiked(postId, userId)
        setLiked(hasLiked)
      } catch (error) {
        console.error('Error checking like:', error)
      }
    }

    checkLike()

    // Real-time subscription
    const subscription = supabase
      .channel(`likes:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${postId}`
        },
        async () => {
          await checkLike()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [postId, userId])

  const toggle = async () => {
    if (loading || !postId || !userId) return

    setLoading(true)
    const prevLiked = liked
    const prevCount = likesCount

    try {
      // Optimistic update
      setLiked(!prevLiked)
      setLikesCount((prev) => (prevLiked ? Math.max(0, prev - 1) : prev + 1))

      if (prevLiked) {
        await likeAPI.unlike(postId, userId)
      } else {
        await likeAPI.like(postId, userId)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      // Rollback on error
      setLiked(prevLiked)
      setLikesCount(prevCount)
    } finally {
      setLoading(false)
    }
  }

  return { liked, likesCount, toggle, loading }
}
