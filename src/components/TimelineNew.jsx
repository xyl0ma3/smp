import React, { useEffect, useState } from 'react'
import supabase from '../supabase'
import { Heart, MessageCircle, Share2, RefreshCw, AlertCircle, TrendingUp, Zap } from 'lucide-react'
import PostNew from './PostNew'
import { logger } from '../utils/logger'
import { fetchPublicPosts, fetchUserTimeline, getAuthUser, normalizePostData } from '../utils/supabaseHelpers'

const TAG = 'TIMELINE'

export default function Timeline({ onOpenProfile }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [filter, setFilter] = useState('latest') // 'latest', 'trending'

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      logger.debug(TAG, 'Iniciando carga de posts')
      
      // Obtener usuario autenticado
      const user = await getAuthUser()
      setIsAuthenticated(!!user)
      
      if (user) {
        logger.debug(TAG, 'Usuario autenticado', { userId: user.id })
      } else {
        logger.debug(TAG, 'Usuario no autenticado, usando posts públicos')
      }
      
      // Obtener posts
      let result
      if (user) {
        logger.debug(TAG, 'Obteniendo timeline del usuario')
        result = await fetchUserTimeline(user.id, 50, 0)
      } else {
        logger.debug(TAG, 'Obteniendo posts públicos')
        result = await fetchPublicPosts(50, 0)
      }
      
      if (!result.success) {
        logger.error(TAG, 'Error al obtener posts', {
          success: result.success,
          error: result.error?.message || result.error
        })
        setError('No se pudieron cargar los posts. Intenta recargar.')
        setPosts([])
        return
      }
      
      // Normalizar datos
      const normalized = normalizePostData(result.data)
      logger.info(TAG, `Posts cargados correctamente`, { count: normalized.length, isAuthenticated: !!user })
      
      setPosts(normalized)
      setError(null)
    } catch (e) {
      logger.error(TAG, 'Excepción al cargar posts', {
        message: e.message,
        stack: e.stack
      })
      setError('Error al cargar posts')
      setPosts([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Refresh timeline
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPosts()
  }

  useEffect(() => {
    fetchPosts()

    // realtime updates
    const postsSub = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        logger.debug(TAG, 'Realtime update detectado, recargando posts')
        fetchPosts()
      })
      .subscribe()

    return () => {
      postsSub.unsubscribe()
    }
  }, [])

  const sortedPosts = filter === 'trending' 
    ? [...posts].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
    : posts

  return (
    <div className="w-full bg-white dark:bg-gray-950 min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Para ti
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {isAuthenticated ? 'Tu timeline personalizado' : 'Posts públicos'}
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition disabled:opacity-50 group"
          >
            <RefreshCw
              size={20}
              className={`${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`}
            />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4 -mx-4 md:-mx-6 px-4 md:px-6 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setFilter('latest')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
              filter === 'latest'
                ? 'text-blue-500 dark:text-blue-400 border-blue-500 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 border-transparent hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Heart size={16} />
              Reciente
            </div>
          </button>
          <button
            onClick={() => setFilter('trending')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
              filter === 'trending'
                ? 'text-blue-500 dark:text-blue-400 border-blue-500 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 border-transparent hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={16} />
              Tendencias
            </div>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="m-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex gap-3 animate-pulse-subtle">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-300">Error al cargar posts</p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col gap-4 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl p-4 bg-gradient-to-r from-gray-200 dark:from-gray-800 to-gray-100 dark:to-gray-900 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4 py-12">
            <div className="mb-4 text-5xl">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No hay posts aún
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {isAuthenticated 
                ? 'Sé el primero en publicar algo increíble' 
                : 'Inicia sesión para ver posts personalizados'}
            </p>
            {error && (
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold transition"
              >
                <RefreshCw size={16} />
                Reintentar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {sortedPosts.map((post, idx) => (
          <div
            key={post.id}
            style={{ animationDelay: `${idx * 30}ms` }}
            className="animate-fade-in"
          >
            <PostNew post={post} onOpenProfile={onOpenProfile} />
          </div>
        ))}
      </div>

      {/* Load More Indicator */}
      {!loading && posts.length > 0 && (
        <div className="p-4 text-center border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleRefresh}
            className="text-sm font-semibold text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition"
          >
            Cargar más posts
          </button>
        </div>
      )}
    </div>
  )
}
