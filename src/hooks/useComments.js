import { useEffect, useState } from 'react'
import supabase from '../supabase'

/**
 * Hook para gestionar comentarios de un post
 * @param {number} postId - ID del post
 * @returns {Object} - { comments, loading, addComment, deleteComment, refetch }
 */
export default function useComments(postId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchComments = async () => {
    if (!postId) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:author_id(id, username, avatar_url, is_verified)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const mapped = data.map((comment) => ({
        ...comment,
        author: comment.profiles,
      }))

      setComments(mapped)
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!postId) return

    fetchComments()

    // Real-time subscription
    const subscription = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchComments()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [postId])

  const addComment = async (content, authorId) => {
    if (!postId || !authorId) return false

    try {
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        author_id: authorId,
        content: content.trim(),
      })

      if (error) throw error

      await fetchComments()
      return true
    } catch (error) {
      console.error('Error adding comment:', error)
      return false
    }
  }

  const deleteComment = async (commentId) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      setComments((prev) => prev.filter((c) => c.id !== commentId))
      return true
    } catch (error) {
      console.error('Error deleting comment:', error)
      return false
    }
  }

  return { comments, loading, addComment, deleteComment, refetch: fetchComments }
}
