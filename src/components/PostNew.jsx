import React, { useState } from 'react'
import Avatar from './Avatar'
import ProfilePreview from './ProfilePreview'
import { Heart, MessageCircle, Share2, Bookmark, Flag, Repeat, MoreHorizontal } from 'lucide-react'
import { likesAPI } from '../api'
import useBookmark from '../hooks/useBookmark'
import useReport from '../hooks/useReport'
import ReportModal from './ReportModal'
import useRetweet from '../hooks/useRetweet'
import PostViewer from './PostViewer'
import { useNavigate } from 'react-router-dom'

export default function Post({ post, onOpenProfile }) {
  const navigate = useNavigate()
  const [showPreview, setShowPreview] = useState(false)
  const [liked, setLiked] = useState(post?.liked_by_user || false)
  const [expanded, setExpanded] = useState(false)
  const [likes, setLikes] = useState(post?.likes_count || 0)
  const [liking, setLiking] = useState(false)
  const { saved, toggle: toggleBookmark, loading: bookmarkLoading } = useBookmark(post?.id)
  const { submit: submitReport, loading: reportLoading } = useReport()
  const [reportOpen, setReportOpen] = useState(false)
  const { retweeted, count: retweetCount, toggle: toggleRetweet, loading: retweetLoading } = useRetweet(post?.id, post?.retweeted_by_user || false, post?.retweets_count || 0)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const toggleLike = async () => {
    if (liking) return
    const prevLiked = liked
    const prevLikes = likes
    setLiked(!prevLiked)
    setLikes(prevLiked ? Math.max(0, likes - 1) : likes + 1)
    setLiking(true)
    try {
      const res = await likesAPI.toggleLike(post.id)
      if (res && typeof res.likes_count === 'number') setLikes(res.likes_count)
      if (res && typeof res.liked === 'boolean') setLiked(res.liked)
    } catch (err) {
      setLiked(prevLiked)
      setLikes(prevLikes)
    } finally {
      setLiking(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'ahora'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString('es-ES')
  }

  return (
    <article className="group hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150 border-b border-gray-200 dark:border-gray-700">
      <div className="p-4 md:p-5 flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 relative">
          <Avatar
            src={post.author?.avatar_url}
            alt={post.author?.username}
            size={48}
            onClick={() => {
              const username = post.author?.username
              if (onOpenProfile) onOpenProfile(username)
              if (username) navigate(`/@${username}`)
            }}
            className="cursor-pointer hover:opacity-80 transition"
          />
          {showPreview && (
            <div className="absolute left-16 top-0 z-50">
              <ProfilePreview userId={post.author?.id} shortProfile={{ username: post.author?.username, avatar_url: post.author?.avatar_url }} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div
              className="flex items-center gap-2 cursor-pointer group/author"
              onMouseEnter={() => setShowPreview(true)}
              onMouseLeave={() => setShowPreview(false)}
            >
              <p className="font-bold text-sm md:text-base text-gray-900 dark:text-white group-hover/author:underline">
                {post.author?.username || 'Usuario'}
              </p>
              {post.author?.verified && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                  ✓
                </span>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                @{(post.author?.username || '').toLowerCase()}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">·</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
                {formatDate(post.created_at)}
              </span>
            </div>

            {/* Menu */}
            <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-500 dark:text-gray-400 rounded-full transition"
                aria-label="Más opciones"
              >
                <MoreHorizontal size={16} />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <button
                    onClick={() => setReportOpen(true)}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    Reportar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Post Content */}
          <div
            className="mb-3 text-gray-900 dark:text-white text-sm md:text-base leading-normal cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition"
            onClick={() => setViewerOpen(true)}
          >
            {!expanded && post.content && post.content.length > 300 ? (
              <>
                <p className="line-clamp-3">{post.content}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpanded(true)
                  }}
                  className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 text-sm font-semibold mt-2 transition"
                >
                  Ver más
                </button>
              </>
            ) : (
              <p>{post.content}</p>
            )}
          </div>

          {/* Image */}
          {post.image_url && (
            <div className="mb-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition cursor-pointer group/image" onClick={() => setViewerOpen(true)}>
              <img
                src={post.image_url}
                alt="post media"
                loading="lazy"
                className="w-full h-auto group-hover/image:opacity-80 transition"
              />
            </div>
          )}

          {/* Stats */}
          <div className="mb-4 text-xs text-gray-500 dark:text-gray-400 flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-3">
            {post.replies_count > 0 && <span className="hover:text-blue-500 cursor-pointer transition">{post.replies_count} respuestas</span>}
            {retweetCount > 0 && <span className="hover:text-green-500 cursor-pointer transition">{retweetCount} retweets</span>}
            <span className="hover:text-red-500 cursor-pointer transition">{likes} {likes === 1 ? 'me gusta' : 'me gusta'}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 max-w-xs md:max-w-sm">
            {/* Comentar */}
            <button
              onClick={() => setViewerOpen(true)}
              className="group/btn flex items-center gap-2 px-3 py-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition"
              aria-label="Comentar"
            >
              <MessageCircle size={16} className="group-hover/btn:scale-110 transition" />
              <span className="text-xs opacity-0 group-hover/btn:opacity-100 transition">Comentar</span>
            </button>

            {/* Retweet */}
            <button
              onClick={async () => {
                try {
                  await toggleRetweet()
                } catch (e) {
                  console.error(e)
                }
              }}
              disabled={retweetLoading}
              className={`group/btn flex items-center gap-2 px-3 py-2 rounded-full transition ${
                retweeted
                  ? 'text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-500 dark:hover:text-green-400'
              }`}
            >
              <Repeat size={16} className="group-hover/btn:scale-110 transition" />
              <span className="text-xs opacity-0 group-hover/btn:opacity-100 transition">{retweetCount || 0}</span>
            </button>

            {/* Like */}
            <button
              onClick={toggleLike}
              disabled={liking}
              className={`group/btn flex items-center gap-2 px-3 py-2 rounded-full transition ${
                liked
                  ? 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400'
              }`}
            >
              <Heart
                size={16}
                className={`group-hover/btn:scale-110 transition ${liked ? 'fill-current' : ''}`}
              />
              <span className="text-xs opacity-0 group-hover/btn:opacity-100 transition">{likes}</span>
            </button>

            {/* Compartir */}
            <button
              onClick={async () => {
                const shareUrl = `${window.location.origin}/p/${post.id}`
                if (navigator.share) {
                  try {
                    await navigator.share({ title: post.author?.username, text: post.content, url: shareUrl })
                  } catch (e) {
                    /* ignore */
                  }
                } else {
                  try {
                    await navigator.clipboard.writeText(shareUrl)
                    alert('URL copiada al portapapeles')
                  } catch (err) {
                    console.error('Clipboard error', err)
                    alert(shareUrl)
                  }
                }
              }}
              className="group/btn flex items-center gap-2 px-3 py-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition"
            >
              <Share2 size={16} className="group-hover/btn:scale-110 transition" />
              <span className="text-xs opacity-0 group-hover/btn:opacity-100 transition">Compartir</span>
            </button>

            {/* Guardar */}
            <button
              onClick={async () => {
                try {
                  await toggleBookmark()
                } catch (err) {
                  console.error('Bookmark error', err)
                  alert('Necesitas iniciar sesión para guardar posts')
                }
              }}
              disabled={bookmarkLoading}
              className={`group/btn flex items-center gap-2 px-3 py-2 rounded-full transition ml-auto ${
                saved
                  ? 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 dark:hover:text-blue-400'
              }`}
            >
              <Bookmark size={16} className={`group-hover/btn:scale-110 transition ${saved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} onSubmit={submitReport} post={post} />
      <PostViewer post={post} onClose={() => setViewerOpen(false)} />
    </article>
  )
}
