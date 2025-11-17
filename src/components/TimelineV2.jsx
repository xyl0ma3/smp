import React, { useEffect, useState } from 'react'
import { RefreshCw, AlertCircle, Heart, TrendingUp } from 'lucide-react'
import PostV2 from './PostV2'
import { Alert, Button } from './base'
import supabase from '../supabase'
import { logger } from '../utils/logger'
import { fetchPublicPosts, fetchUserTimeline, getAuthUser, normalizePostData } from '../utils/supabaseHelpers'

const TAG = 'TIMELINE_V2'

/**
 * Timeline mejorado V2 - Rediseñado con mejor UX
 */
export default function TimelineV2({ onOpenProfile }) {
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

      const user = await getAuthUser()
      setIsAuthenticated(!!user)

      if (user) {
        logger.debug(TAG, 'Usuario autenticado', { userId: user.id })
      } else {
        logger.debug(TAG, 'Usuario no autenticado, usando posts públicos')
      }

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

      const normalized = normalizePostData(result.data)
      logger.info(TAG, `Posts cargados correctamente`, { count: normalized.length, isAuthenticated: !!user })

      if (normalized.length > 0) {
        logger.debug(TAG, 'Primer post estructura:', {
          id: normalized[0].id,
          content: normalized[0].content ? `${normalized[0].content.substring(0, 50)}...` : '[SIN CONTENIDO]',
          author: normalized[0].author,
          image_url: !!normalized[0].image_url
        })
      }

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

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPosts()
  }

  useEffect(() => {
    fetchPosts()

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
      <div className="sticky top-16 z-40 backdrop-blur-md bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-4">
        <div className="container-center">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Para ti
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isAuthenticated ? 'Tu timeline personalizado' : 'Posts públicos'}
              </p>
            </div>

            <Button
              variant="outline"
              size="md"
              icon={RefreshCw}
              onClick={handleRefresh}
              isLoading={refreshing}
              disabled={refreshing}
            >
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 -mx-4 md:-mx-6 px-4 md:px-6">
            <button
              onClick={() => setFilter('latest')}
              className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
                filter === 'latest'
                  ? 'text-blue-500 dark:text-blue-400 border-blue-500'
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
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
                  ? 'text-blue-500 dark:text-blue-400 border-blue-500'
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={16} />
                Tendencias
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="container-center mt-4">
          <Alert
            type="error"
            title="Error al cargar posts"
            message={error}
            onClose={() => setError(null)}
            dismissible
          />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col gap-4 p-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg p-4 bg-gradient-to-r from-gray-200 dark:from-gray-800 to-gray-100 dark:to-gray-900 animate-pulse"
            >
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
            <div className="mb-4 text-6xl">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No hay posts aún
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {isAuthenticated
                ? 'Sé el primero en publicar algo increíble'
                : 'Inicia sesión para ver posts personalizados'}
            </p>
            {error && (
              <Button onClick={handleRefresh} size="md">
                Reintentar
              </Button>
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
            className="animate-fade-in-up group hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
          >
            <PostV2 post={post} onOpenProfile={onOpenProfile} />
          </div>
        ))}
      </div>

      {/* Load More */}
      {!loading && posts.length > 0 && (
        <div className="p-4 text-center border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="ghost"
            onClick={handleRefresh}
          >
            Cargar más posts
          </Button>
        </div>
      )}
    </div>
  )
}
