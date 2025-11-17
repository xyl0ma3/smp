import { supabase } from '../supabase'

export const likeAPI = {
  async hasLiked(postId, userId) {
    if (!postId || !userId) return false
    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()
    if (error && error.code !== 'PGRST116') return false
    return !!data
  },

  async like(postId, userId) {
    if (!postId || !userId) throw new Error('Missing ids')
    const { error } = await supabase
      .from('likes')
      .insert({ post_id: postId, user_id: userId })
    if (error) throw error
    // update likes_count (best-effort)
    const { data: countData, error: countErr } = await supabase
      .from('likes')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId)
    if (!countErr) {
      await supabase.from('posts').update({ likes_count: countData }).eq('id', postId)
    }
  },

  async unlike(postId, userId) {
    if (!postId || !userId) throw new Error('Missing ids')
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
    if (error) throw error
    // update likes_count
    const { data: countData, error: countErr } = await supabase
      .from('likes')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId)
    if (!countErr) {
      await supabase.from('posts').update({ likes_count: countData }).eq('id', postId)
    }
  }
}

export const postAPI = {
  async create(post) {
    const { data, error } = await supabase.from('posts').insert(post).select().single()
    if (error) throw error
    return data
  },
  async remove(postId) {
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) throw error
  }
}

export const followAPI = {
  async follow(followerId, followingId) {
    const { error } = await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId })
    if (error) throw error
  },
  async unfollow(followerId, followingId) {
    const { error } = await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId)
    if (error) throw error
  }
}

export default { likeAPI, postAPI, followAPI }
