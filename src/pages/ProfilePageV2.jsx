import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Link as LinkIcon, Calendar, Heart, MessageCircle, Share2 } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import { supabase } from '../supabase'
import Button from '../components/base/Button'
import Card from '../components/base/Card'
import AvatarBase from '../components/base/AvatarBase'
import Alert from '../components/base/Alert'
import PostV2 from '../components/PostV2'

export default function ProfilePageV2() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [following, setFollowing] = useState(false)
  const [tab, setTab] = useState('posts') // 'posts', 'media', 'likes'

  useEffect(() => {
    fetchProfile()
  }, [username])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      
      // Decode username (handle special characters)
      const decodedUsername = decodeURIComponent(username)
      
      // Get user by username or id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .or(`username.eq.${decodedUsername},id.eq.${username}`)
        .single()
      
      if (userError) throw userError
      
      setProfile(userData)
      
      // Fetch user's posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*, user:users(*)')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
      
      if (postsError) throw postsError
      setPosts(postsData || [])
      
      // Check if current user follows this profile
      if (currentUser && currentUser.id !== userData.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', currentUser.id)
          .eq('following_id', userData.id)
          .single()
        
        setFollowing(!!followData)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('No se pudo cargar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/signup')
      return
    }
    
    try {
      if (following) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id)
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: profile.id
          })
      }
      setFollowing(!following)
    } catch (err) {
      console.error('Error updating follow:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-400 hover:text-white mb-4 transition"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
        <Alert type="error" title="Error" message={error || 'Perfil no encontrado'} />
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profile.id
  const filteredPosts = tab === 'media' 
    ? posts.filter(p => p.image_url)
    : tab === 'likes'
    ? posts.filter(p => p.likes_count > 0)
    : posts

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">{profile.username}</span>
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-neutral-900 border-b border-neutral-800">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
          <div className="text-neutral-600">
            <Heart size={48} className="opacity-20" />
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex justify-between items-start -mt-16 mb-4">
            <AvatarBase
              src={profile.avatar_url}
              name={profile.username}
              isVerified={profile.is_verified}
              size="lg"
              className="w-32 h-32 border-4 border-neutral-950"
            />
            
            {!isOwnProfile && (
              <Button
                variant={following ? 'outline' : 'primary'}
                size="md"
                onClick={handleFollow}
              >
                {following ? 'Siguiendo' : 'Seguir'}
              </Button>
            )}
          </div>

          {/* Name and Bio */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
            <p className="text-neutral-400">@{profile.username}</p>
            
            {profile.bio && (
              <p className="text-neutral-300 mt-2">{profile.bio}</p>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-neutral-400 text-sm mb-4">
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                {profile.location}
              </div>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                <LinkIcon size={16} />
                Sitio web
              </a>
            )}
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              Se unió en {new Date(profile.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-sm">
            <button className="hover:text-primary transition">
              <span className="font-bold">{profile.following_count || 0}</span>
              <span className="text-neutral-400"> Siguiendo</span>
            </button>
            <button className="hover:text-primary transition">
              <span className="font-bold">{profile.followers_count || 0}</span>
              <span className="text-neutral-400"> Seguidores</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="flex divide-x divide-neutral-800 max-w-2xl mx-auto">
          {['posts', 'media', 'likes'].map((tabName) => (
            <button
              key={tabName}
              onClick={() => setTab(tabName)}
              className={`flex-1 py-4 font-semibold transition ${
                tab === tabName
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tabName === 'posts' && 'Posts'}
              {tabName === 'media' && 'Media'}
              {tabName === 'likes' && 'Me gusta'}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="max-w-2xl mx-auto">
        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle size={48} className="mx-auto mb-4 text-neutral-600" />
            <p className="text-neutral-400">
              {tab === 'posts' && 'Sin posts todavía'}
              {tab === 'media' && 'Sin media todavía'}
              {tab === 'likes' && 'Sin likes todavía'}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostV2 key={post.id} post={post} onUpdate={fetchProfile} />
          ))
        )}
      </div>
    </div>
  )
}
