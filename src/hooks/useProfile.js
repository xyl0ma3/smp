import { useEffect, useState } from 'react'
import supabase from '../supabase'
import { profileAPI } from '../api'

/**
 * Hook para obtener y gestionar el perfil de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Object} - { profile, loading, error, updateProfile }
 */
export default function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await profileAPI.getProfile(userId)
        setProfile(data)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel(`profile:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          setProfile(payload.new)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const updateProfile = async (updates) => {
    if (!userId) return false
    setLoading(true)
    try {
      const success = await profileAPI.updateProfile(userId, updates)
      if (success) {
        setProfile((prev) => ({ ...prev, ...updates }))
      }
      return success
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { profile, loading, error, updateProfile }
}
