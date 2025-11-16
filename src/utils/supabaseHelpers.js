/**
 * Utilidades para manejo seguro de Supabase
 * Envuelve operaciones comunes con logging y manejo de errores
 */

import supabase from '../supabase'
import { logger } from './logger'

const SUPABASE_TAG = 'SUPABASE'

/**
 * Obtener usuario autenticado de forma segura
 */
export async function getAuthUser() {
  try {
    const { data, error } = await supabase.auth.getUser()
    
    if (error) {
      logger.warn(SUPABASE_TAG, 'No authenticated user', error)
      return null
    }
    
    logger.debug(SUPABASE_TAG, 'Usuario autenticado', { userId: data?.user?.id })
    return data?.user || null
  } catch (e) {
    logger.error(SUPABASE_TAG, 'Error getting auth user', e)
    return null
  }
}

/**
 * Obtener posts públicos con manejo de errores
 */
export async function fetchPublicPosts(limit = 50, offset = 0) {
  try {
    logger.debug(SUPABASE_TAG, 'Fetching public posts', { limit, offset })
    
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        author_id,
        image_url,
        likes_count,
        replies_count,
        reposts_count,
        profiles(
          id,
          username,
          avatar_url,
          verified
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      logger.error(SUPABASE_TAG, 'Error fetching public posts', error)
      return { data: [], error, success: false }
    }
    
    logger.debug(SUPABASE_TAG, 'Public posts fetched', { count: data?.length })
    return { data: data || [], error: null, success: true }
  } catch (e) {
    logger.error(SUPABASE_TAG, 'Exception fetching public posts', e)
    return { data: [], error: e, success: false }
  }
}

/**
 * Obtener timeline del usuario (posts propios + seguidos)
 */
export async function fetchUserTimeline(userId, limit = 50, offset = 0) {
  try {
    if (!userId) {
      logger.warn(SUPABASE_TAG, 'fetchUserTimeline called without userId')
      return { data: [], error: 'No userId provided', success: false }
    }

    logger.debug(SUPABASE_TAG, 'Fetching user timeline', { userId, limit, offset })
    
    const { data, error } = await supabase.rpc(
      'get_timeline_feed',
      {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset
      }
    )
    
    if (error) {
      logger.error(SUPABASE_TAG, 'Error fetching user timeline via RPC', error)
      // Fallback: obtener posts públicos si falla RPC
      return fetchPublicPosts(limit, offset)
    }
    
    logger.debug(SUPABASE_TAG, 'User timeline fetched', { count: data?.length })
    return { data: data || [], error: null, success: true }
  } catch (e) {
    logger.error(SUPABASE_TAG, 'Exception fetching user timeline', e)
    // Fallback a posts públicos
    return fetchPublicPosts(limit, offset)
  }
}

/**
 * Crear un nuevo post
 */
export async function createPost(content, imageUrl = null) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      logger.warn(SUPABASE_TAG, 'createPost: User not authenticated')
      return { data: null, error: 'Not authenticated', success: false }
    }

    logger.debug(SUPABASE_TAG, 'Creating post', { userId: user.id, contentLength: content.length })
    
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          content,
          author_id: user.id,
          image_url: imageUrl
        }
      ])
      .select()
    
    if (error) {
      logger.error(SUPABASE_TAG, 'Error creating post', error)
      return { data: null, error, success: false }
    }
    
    logger.info(SUPABASE_TAG, 'Post created successfully', { postId: data?.[0]?.id })
    return { data: data?.[0] || null, error: null, success: true }
  } catch (e) {
    logger.error(SUPABASE_TAG, 'Exception creating post', e)
    return { data: null, error: e, success: false }
  }
}

/**
 * Dar like a un post
 */
export async function likePost(postId) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      logger.warn(SUPABASE_TAG, 'likePost: User not authenticated')
      return { success: false, error: 'Not authenticated' }
    }

    logger.debug(SUPABASE_TAG, 'Liking post', { postId, userId: user.id })
    
    // Verificar si ya existe like
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()
    
    if (existingLike) {
      // Ya existe, eliminar
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
      
      if (error) {
        logger.error(SUPABASE_TAG, 'Error unliking post', error)
        return { success: false, error }
      }
      
      logger.debug(SUPABASE_TAG, 'Post unliked')
      return { success: true, liked: false }
    } else {
      // No existe, crear
      const { error } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: user.id }])
      
      if (error) {
        logger.error(SUPABASE_TAG, 'Error liking post', error)
        return { success: false, error }
      }
      
      logger.debug(SUPABASE_TAG, 'Post liked')
      return { success: true, liked: true }
    }
  } catch (e) {
    logger.error(SUPABASE_TAG, 'Exception liking post', e)
    return { success: false, error: e }
  }
}

/**
 * Obtener perfiles públicos (para búsqueda, etc)
 */
export async function fetchProfiles(limit = 20) {
  try {
    logger.debug(SUPABASE_TAG, 'Fetching profiles', { limit })
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, bio, verified, followers_count')
      .limit(limit)
    
    if (error) {
      logger.error(SUPABASE_TAG, 'Error fetching profiles', error)
      return { data: [], error, success: false }
    }
    
    logger.debug(SUPABASE_TAG, 'Profiles fetched', { count: data?.length })
    return { data: data || [], error: null, success: true }
  } catch (e) {
    logger.error(SUPABASE_TAG, 'Exception fetching profiles', e)
    return { data: [], error: e, success: false }
  }
}

/**
 * Normalizar respuesta de posts (mapear profiles a author)
 */
export function normalizePostData(posts) {
  return (posts || []).map(post => ({
    id: post.id,
    content: post.content,
    created_at: post.created_at,
    image_url: post.image_url,
    likes_count: post.likes_count || 0,
    replies_count: post.replies_count || 0,
    reposts_count: post.reposts_count || 0,
    author_id: post.author_id,
    author: post.profiles ? {
      id: post.profiles.id,
      username: post.profiles.username,
      avatar_url: post.profiles.avatar_url,
      verified: post.profiles.verified
    } : post.author,
    liked_by_user: post.liked_by_user || false
  }))
}

export default {
  getAuthUser,
  fetchPublicPosts,
  fetchUserTimeline,
  createPost,
  likePost,
  fetchProfiles,
  normalizePostData
}
