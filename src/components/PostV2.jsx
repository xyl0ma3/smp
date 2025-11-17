import React, { useState } from 'react'
import { Heart, MessageCircle, Repeat2, Share, Bookmark, MoreHorizontal, Flag } from 'lucide-react'
import { AvatarBase, Button } from './base'
import { useNavigate } from 'react-router-dom'
import { logger } from '../utils/logger'

/**
 * Componente Post V2 - Rediseñado con mejor UX
 */
export default function PostV2({ post, onOpenProfile }) {
  const navigate = useNavigate()
  const [liked, setLiked] = useState(post?.liked_by_user || false)
  const [saved, setSaved] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [likes, setLikes] = useState(post?.likes_count || 0)

  if (!post) return null

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'ahora'
    if (diffMins < 60) return `hace ${diffMins}m`
    if (diffHours < 24) return `hace ${diffHours}h`
    if (diffDays < 7) return `hace ${diffDays}d`
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
  }

  const toggleLike = () => {
    setLiked(!liked)
    setLikes(liked ? likes - 1 : likes + 1)
  }

  return (
    <article className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors duration-150 cursor-pointer">
      <div className="p-4 md:p-5 flex gap-4">
        {/* Avatar */}
        <AvatarBase
          src={post.author?.avatar_url}
          alt={post.author?.username}
          size="md"
          verified={post.author?.verified}
          onClick={() => {
            if (post.author?.username) {
              navigate(`/@${encodeURIComponent(post.author.username)}`)
              onOpenProfile?.(post.author.username)
            }
          }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <p className="font-bold text-sm md:text-base text-gray-900 dark:text-white truncate">
                {post.author?.username || 'Usuario'}
              </p>
              <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                @{(post.author?.username || '').toLowerCase()}
              </span>
              <span className="text-sm text-gray-400 dark:text-gray-600 flex-shrink-0">·</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                {formatDate(post.created_at)}
              </span>
            </div>

            {/* Menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-500 dark:text-gray-400 rounded-full transition opacity-0 group-hover:opacity-100"
                title="Más opciones"
              >
                <MoreHorizontal size={16} />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50">
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        // TODO: Implementar reporte
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition"
                    >
                      <Flag size={14} />
                      Reportar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content Text */}
          {post.content && (
            <p className="mb-3 text-gray-900 dark:text-white text-sm md:text-base leading-normal">
              {post.content}
            </p>
          )}

          {/* Image */}
          {post.image_url && (
            <div className="mb-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
              <img
                src={post.image_url}
                alt="post media"
                className="w-full h-auto object-cover hover:opacity-90 transition"
                loading="lazy"
              />
            </div>
          )}

          {/* Stats */}
          {(post.replies_count > 0 || post.retweets_count > 0 || likes > 0) && (
            <div className="mb-4 text-xs text-gray-500 dark:text-gray-400 flex gap-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              {post.replies_count > 0 && (
                <span className="hover:text-blue-500 cursor-pointer transition">
                  {post.replies_count} {post.replies_count === 1 ? 'respuesta' : 'respuestas'}
                </span>
              )}
              {post.retweets_count > 0 && (
                <span className="hover:text-green-500 cursor-pointer transition">
                  {post.retweets_count} {post.retweets_count === 1 ? 'retweet' : 'retweets'}
                </span>
              )}
              {likes > 0 && (
                <span className="hover:text-red-500 cursor-pointer transition">
                  {likes} {likes === 1 ? 'me gusta' : 'me gusta'}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 max-w-xs md:max-w-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 dark:hover:text-blue-400 transition"
              title="Responder"
            >
              <MessageCircle size={16} />
              <span className="text-xs">{post.replies_count || 0}</span>
            </button>

            <button
              className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-500 dark:hover:text-green-400 transition"
              title="Retweet"
            >
              <Repeat2 size={16} />
              <span className="text-xs">{post.retweets_count || 0}</span>
            </button>

            <button
              onClick={toggleLike}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition ${
                liked
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
                  : 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400'
              }`}
              title={liked ? 'Quitar like' : 'Me gusta'}
            >
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
              <span className="text-xs">{likes || 0}</span>
            </button>

            <button
              onClick={() => setSaved(!saved)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition ml-auto ${
                saved
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400'
                  : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 dark:hover:text-blue-400'
              }`}
              title={saved ? 'Quitar de guardados' : 'Guardar'}
            >
              <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
