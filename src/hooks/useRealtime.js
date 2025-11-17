import { useEffect, useRef } from 'react'
import { supabase } from '../supabase'

/**
 * Hook para suscribirse a cambios en tablas y ejecutar handlers.
 * handlers: { posts: { onInsert,onUpdate,onDelete }, users: { onUpdate } }
 */
export default function useRealtime(handlers = {}) {
  const channelRef = useRef(null)

  useEffect(() => {
    // create a channel
    const channel = supabase.channel('public-realtime')

    // Posts
    if (handlers.posts) {
      const { onInsert, onUpdate, onDelete } = handlers.posts
      if (onInsert) {
        channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
          onInsert(payload.new)
        })
      }
      if (onUpdate) {
        channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
          onUpdate(payload.new)
        })
      }
      if (onDelete) {
        channel.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload) => {
          onDelete(payload.old)
        })
      }
    }

    // Users updates
    if (handlers.users && handlers.users.onUpdate) {
      channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, (payload) => {
        handlers.users.onUpdate(payload.new)
      })
    }

    channel.subscribe()
    channelRef.current = channel

    return () => {
      try {
        channel.unsubscribe()
      } catch (e) {
        // ignore
      }
    }
  }, [])
}
