import { useEffect, useState } from 'react'
import supabase from '../supabase'
import { profileAPI } from '../api'

/**
 * Hook para gestionar la configuración del usuario
 * @param {string} userId - ID del usuario
 * @returns {Object} - { settings, loading, updateSettings }
 */
export default function useSettings(userId) {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications_enabled: true,
    private_account: false,
    show_analytics: true,
    email_notifications: true,
    push_notifications: true
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchSettings = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await profileAPI.getSettings(userId)
        if (data) {
          setSettings({
            ...settings,
            ...data
          })
        }
      } catch (err) {
        console.error('Error fetching settings:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()

    // Real-time subscription
    const subscription = supabase
      .channel(`settings:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_settings',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          setSettings({
            ...settings,
            ...payload.new
          })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const updateSettings = async (updates) => {
    if (!userId) return false

    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)

    try {
      const success = await profileAPI.updateSettings(userId, updates)
      if (!success) {
        // Rollback if failed
        setSettings(settings)
      }
      return success
    } catch (err) {
      setError(err.message)
      setSettings(settings)
      return false
    }
  }

  return { settings, loading, error, updateSettings }
}
