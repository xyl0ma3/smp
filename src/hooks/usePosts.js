import { useEffect, useState } from 'react'
import supabase from '../supabase'

/**
 * Hook para obtener y gestionar posts
 * @param {string} authorId - ID del autor (opcional)
 * @param {number} limit - Límite de posts
 * @returns {Object} - { posts, loading, error, refetch }
 */
export default function usePosts(authorId = null, limit = 20) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id(id, username, avatar_url, is_verified),
          likes:likes(count)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (authorId) {
        query = query.eq('author_id', authorId)
      }

      const { data, error: err } = await query

      if (err) throw err

      const mapped = data.map((post) => ({
        ...post,
        author: post.profiles,
        likes_count: post.likes?.[0]?.count || 0,
      }))

      setPosts(mapped)
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()

    // Real-time subscription
    const channel = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          fetchPosts()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [authorId, limit])

  return { posts, loading, error, refetch: fetchPosts }
}
