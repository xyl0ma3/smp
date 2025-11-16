import { useEffect, useState } from 'react'
import supabase from '../supabase'
import { followAPI } from '../api'

/**
 * Hook para gestionar el estado de seguimiento entre usuarios
 * @param {string} followerId - ID del usuario que sigue
 * @param {string} followingId - ID del usuario seguido
 * @returns {Object} - { isFollowing, loading, toggle, followers, following }
 */
export default function useFollow(followerId, followingId) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [followers, setFollowers] = useState(0)
  const [following, setFollowing] = useState(0)

  useEffect(() => {
    if (!followerId || !followingId) return

    const checkFollow = async () => {
      const following = await followAPI.isFollowing(followerId, followingId)
      setIsFollowing(following)
    }

    checkFollow()

    // Real-time subscription
    const subscription = supabase
      .channel(`follows:${followerId}:${followingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
        },
        () => {
          checkFollow()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [followerId, followingId])

  const toggle = async () => {
    if (loading || !followerId || !followingId) return

    setLoading(true)
    try {
      if (isFollowing) {
        await followAPI.unfollow(followerId, followingId)
      } else {
        await followAPI.follow(followerId, followingId)
      }
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setLoading(false)
    }
  }

  return { isFollowing, loading, toggle, followers, following }
}
