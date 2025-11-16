import React, { useEffect, useState } from 'react'
import supabase from '../supabase'
import { MessageCircle, Repeat, Heart, Share2, RefreshCw, AlertCircle } from 'lucide-react'
import Post from './Post'
import { logger } from '../utils/logger'
import { fetchPublicPosts, fetchUserTimeline, getAuthUser, normalizePostData } from '../utils/supabaseHelpers'

const TAG = 'TIMELINE'

export default function Timeline({ onOpenProfile }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      logger.debug(TAG, 'Iniciando carga de posts')
      
      // Obtener usuario autenticado
      const user = await getAuthUser()
      setIsAuthenticated(!!user)
      
      logger.debug(TAG, user ? 'Usuario autenticado' : 'Usuario no autenticado', { userId: user?.id })
      
      // Obtener posts
      let result
      if (user) {
        logger.debug(TAG, 'Obteniendo timeline personalizado del usuario')
        result = await fetchUserTimeline(user.id, 50, 0)
      } else {
        logger.debug(TAG, 'Obteniendo posts públicos')
        result = await fetchPublicPosts(50, 0)
      }
      
      if (!result.success) {
        logger.error(TAG, 'Error al obtener posts', result.error)
        setError('No se pudieron cargar los posts')
        setPosts([])
        return
      }
      
      // Normalizar datos
      const normalized = normalizePostData(result.data)
      logger.info(TAG, `Posts cargados correctamente: ${normalized.length}`, { count: normalized.length })
      
      setPosts(normalized)
      setError(null)
    } catch (e) {
      logger.error(TAG, 'Excepción al cargar posts', e)
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

  // Helper function to format time
  function formatTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return 'ahora'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString('es-ES')
  }

  useEffect(() => {
    fetchPosts()

    // realtime updates
    const postsSub = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts()
      })
      .subscribe()

    return () => {
      postsSub.unsubscribe()
    }
  }, [])

  return (
    <div className="w-full bg-white dark:bg-twitter-900 border-r border-gray-200 dark:border-twitter-800">
      {/* Header con botón de refresh */}
      <div className="sticky top-16 md:top-20 z-40 bg-white dark:bg-twitter-900 border-b border-gray-200 dark:border-twitter-800 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80 p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Timeline {isAuthenticated && <span className="text-xs text-gray-500">(personalizado)</span>}
        </h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`p-2 rounded-full transition-all duration-300 hover:bg-gray-100 dark:hover:bg-twitter-800 ${
            refreshing ? 'animate-spin' : 'hover:scale-110'
          }`}
          title="Actualizar timeline"
        >
          <RefreshCw size={20} className="text-gray-600 dark:text-gray-300 hover:text-twitter-600 dark:hover:text-twitter-400" />
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="m-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-300">Error</p>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin">
            <span className="text-4xl">🔄</span>
          </div>
        </div>
      )}

      {/* Posts list */}
      <div className="divide-y divide-gray-200 dark:divide-twitter-800">
        {/* skeleton if loading */}
        {loading && (
          <div className="p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 dark:bg-twitter-800 rounded-md p-4 mb-4 animate-pulse-subtle">
                <div className="h-4 w-1/4 bg-gray-200 dark:bg-twitter-700 rounded mb-2"></div>
                <div className="h-6 w-full bg-gray-200 dark:bg-twitter-700 rounded"></div>
              </div>
            ))}
          </div>
        )}
        {posts.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 px-4 animate-slide-in-up">
            <span className="text-4xl mb-3">📝</span>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              No hay posts todavía. ¡Sé el primero en publicar!
            </p>
            {error && (
              <p className="text-sm text-red-500 mt-2">
                Intenta recargar la página o revisar tu conexión
              </p>
            )}
          </div>
        )}

        {posts.map((p, idx) => (
          <div key={p.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-fade-in">
            <Post post={p} onOpenProfile={() => onOpenProfile && onOpenProfile(p.author?.username || p.author?.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}
