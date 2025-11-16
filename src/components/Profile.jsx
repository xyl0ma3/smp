import React, { useEffect, useState } from 'react'
import supabase from '../supabase'
import useProfile from '../hooks/useProfile'
import usePosts from '../hooks/usePosts'
import useFollow from '../hooks/useFollow'
import useAuth from '../hooks/useAuth'
import Avatar from './Avatar'
import { ArrowLeft, MapPin, Link as LinkIcon, Calendar } from 'lucide-react'

export default function Profile({ userId, onBack }) {
  const { user: currentUser } = useAuth()
  const { profile, loading: profileLoading, updateProfile } = useProfile(userId)
  const { posts, loading: postsLoading } = usePosts(userId)
  const { isFollowing, toggle: toggleFollow } = useFollow(currentUser?.id, userId)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    setIsOwnProfile(currentUser?.id === userId)
  }, [currentUser, userId])

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <span className="text-4xl">🔄</span>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Perfil no encontrado</p>
      </div>
    )
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="w-full bg-white dark:bg-twitter-900 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-twitter-900 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-md z-10 border-b border-gray-200 dark:border-twitter-800 px-4 py-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-4 text-twitter-600 dark:text-twitter-400 hover:bg-twitter-50 dark:hover:bg-twitter-800 rounded-full p-2 transition-colors"
        >
          <ArrowLeft size={20} />
          <div className="flex flex-col text-left">
            <span className="font-bold text-gray-900 dark:text-white">{profile.username}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>
        </button>
      </div>

      {/* Cover Image */}
      <div className="h-52 bg-gradient-to-r from-twitter-600 to-twitter-500 relative">
        {profile.cover_url && (
          <img
            src={profile.cover_url}
            alt="cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4">
        {/* Avatar and Follow Button */}
        <div className="flex items-end justify-between -mt-16 mb-4 relative z-10">
          <Avatar src={profile.avatar_url} alt={profile.username} size={128} />
          {!isOwnProfile && currentUser && (
            <button
              onClick={toggleFollow}
              className={`px-6 py-2 rounded-full font-bold transition-all duration-200 ${
                isFollowing
                  ? 'bg-gray-200 dark:bg-twitter-800 text-gray-900 dark:text-white hover:bg-red-100 dark:hover:bg-red-900'
                  : 'bg-twitter-600 text-white hover:bg-twitter-700'
              }`}
            >
              {isFollowing ? 'Siguiendo' : 'Seguir'}
            </button>
          )}
        </div>

        {/* Name and Handle */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.username}</h1>
          <p className="text-gray-500 dark:text-gray-400">@{profile.username.toLowerCase()}</p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-gray-900 dark:text-white mb-4 text-base leading-normal">
            {profile.bio}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 text-gray-500 dark:text-gray-400 mb-4">
          {profile.location && (
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{profile.location}</span>
            </div>
          )}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-twitter-600 dark:text-twitter-400 hover:underline"
            >
              <LinkIcon size={16} />
              <span>{new URL(profile.website).hostname}</span>
            </a>
          )}
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>Se unió en {joinDate}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-4">
          <div>
            <span className="font-bold text-gray-900 dark:text-white">{profile.following_count || 0}</span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">Siguiendo</span>
          </div>
          <div>
            <span className="font-bold text-gray-900 dark:text-white">{profile.followers_count || 0}</span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">Seguidores</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-twitter-800 my-4"></div>

        {/* Posts Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Posts</h2>
          {postsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin">
                <span className="text-4xl">🔄</span>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <span className="text-4xl mb-3">📝</span>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                {isOwnProfile
                  ? '¡Publica tu primer post!'
                  : 'Este usuario aún no ha publicado posts'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 border border-gray-200 dark:border-twitter-800 rounded-lg hover:bg-gray-50 dark:hover:bg-twitter-800 transition-colors"
                >
                  <p className="text-gray-900 dark:text-white">{post.content}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(post.created_at).toLocaleString('es-ES')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
