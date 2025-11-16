import React, { useEffect, useState } from 'react'
import supabase from '../supabase'
import { MessageCircle, Repeat, Heart, Share2, RefreshCw, AlertCircle, Sparkles, TrendingUp, Clock } from 'lucide-react'
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
  const [viewMode, setViewMode] = useState('latest') // 'latest', 'trending', 'following'
  const [sortBy, setSortBy] = useState('recent')

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
    <div className="w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 min-h-screen border-r border-gray-200 dark:border-gray-800">
      {/* Hero Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              ✨
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timeline</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isAuthenticated ? 'Feed Personalizado' : 'Descubre Posts'}
              </p>
            </div>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
            title="Actualizar"
          >
            <RefreshCw
              size={20}
              className={`text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
          </button>
        </div>

        {/* View Mode Selector */}
        <div className="max-w-2xl mx-auto px-4 pb-4 flex gap-2 overflow-x-auto border-t border-gray-200 dark:border-gray-800 pt-3">
          {[
            { id: 'latest', label: 'Últimos', icon: Clock },
            { id: 'trending', label: 'Tendencia', icon: TrendingUp },
            ...(isAuthenticated ? [{ id: 'following', label: 'Siguiendo', icon: Sparkles }] : [])
          ].map(mode => {
            const Icon = mode.icon
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center gap-2 transition-all font-medium text-sm ${
                  viewMode === mode.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={16} />
                {mode.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-2xl mx-auto m-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex gap-3 animate-slide-in-down">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-300">Error al cargar posts</p>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-spin" style={{ backgroundSize: '200% 200%' }}></div>
              <div className="absolute inset-1 bg-white dark:bg-gray-950 rounded-full flex items-center justify-center">
                <span className="text-xl">📱</span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Cargando posts...</p>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="max-w-2xl mx-auto">
        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No hay posts aún</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              {isAuthenticated
                ? 'Sigue a más usuarios para ver su contenido'
                : 'Inicia sesión para ver posts de usuarios que sigues'}
            </p>
            {!isAuthenticated && (
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all hover:shadow-lg">
                Inicia Sesión
              </button>
            )}
          </div>
        )}

        {/* Posts Grid */}
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {posts.map((post, idx) => (
            <div
              key={post.id}
              style={{ animationDelay: `${idx * 30}ms` }}
              className="animate-fade-in transition-all hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
            >
              <Post
                post={post}
                onOpenProfile={() => onOpenProfile && onOpenProfile(post.author?.username || post.author?.id)}
              />
            </div>
          ))}
        </div>

        {/* Load More Indicator */}
        {!loading && posts.length > 0 && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            {posts.length} posts cargados
          </div>
        )}
      </div>
    </div>
  )
}
