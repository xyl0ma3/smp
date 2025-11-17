import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, MessageCircle, UserPlus, Repeat2, Bookmark, Bell } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import { supabase } from '../supabase'
import Card from '../components/base/Card'
import AvatarBase from '../components/base/AvatarBase'
import Alert from '../components/base/Alert'

export default function NotificationsPageV2() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'likes', 'comments', 'follows'

  useEffect(() => {
    if (user) {
      fetchNotifications()
      
      // Subscribe to realtime notifications
      const subscription = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            setNotifications(prev => [payload.new, ...prev])
          }
        )
        .subscribe()
      
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*, actor:users(*), post:posts(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      setNotifications(data || [])
    } catch (err) {
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter)

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart size={18} className="text-red-500" />
      case 'comment':
        return <MessageCircle size={18} className="text-blue-500" />
      case 'follow':
        return <UserPlus size={18} className="text-green-500" />
      case 'retweet':
        return <Repeat2 size={18} className="text-purple-500" />
      case 'save':
        return <Bookmark size={18} className="text-yellow-500" />
      default:
        return <Bell size={18} className="text-primary" />
    }
  }

  const getNotificationMessage = (notification) => {
    const actorName = notification.actor?.username || 'Usuario'
    
    switch (notification.type) {
      case 'like':
        return `${actorName} le gustó tu post`
      case 'comment':
        return `${actorName} comentó en tu post`
      case 'follow':
        return `${actorName} comenzó a seguirte`
      case 'retweet':
        return `${actorName} retwitteó tu post`
      case 'save':
        return `${actorName} guardó tu post`
      default:
        return notification.message || 'Nueva notificación'
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Notificaciones</span>
          </button>
          
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllAsRead}
              className="text-primary hover:text-primary/80 text-sm font-semibold transition"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-14 z-30 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 px-4 py-2">
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'likes', 'comments', 'follows'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              {f === 'all' && 'Todas'}
              {f === 'likes' && '❤️ Me gusta'}
              {f === 'comments' && '💬 Comentarios'}
              {f === 'follows' && '👥 Seguidores'}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-2xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={48} className="mx-auto mb-4 text-neutral-600" />
            <p className="text-neutral-400">
              {filter === 'all'
                ? 'No hay notificaciones'
                : `No hay notificaciones de ${filter}`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`p-4 transition cursor-pointer ${
                  !notification.read
                    ? 'bg-neutral-900/50 hover:bg-neutral-900'
                    : 'hover:bg-neutral-950'
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AvatarBase
                            src={notification.actor?.avatar_url}
                            name={notification.actor?.username}
                            size="sm"
                          />
                          <p className="font-semibold">
                            {notification.actor?.username || 'Usuario'}
                          </p>
                        </div>
                        <p className="text-neutral-300 text-sm">
                          {getNotificationMessage(notification)}
                        </p>
                        
                        {notification.post?.content && (
                          <p className="text-neutral-500 text-sm mt-2 line-clamp-2">
                            "{notification.post.content}"
                          </p>
                        )}
                        
                        <p className="text-neutral-600 text-xs mt-2">
                          {new Date(notification.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="text-neutral-600 hover:text-red-500 transition"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                {notification.type === 'follow' && notification.actor && (
                  <div className="mt-3 ml-10">
                    <button className="px-4 py-2 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary/90 transition">
                      Seguir de vuelta
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
