import { useState, useEffect } from 'react'
import supabase from '../supabase'

export default function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkIsAdmin()
  }, [])

  const checkIsAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      // Usar RPC para verificar si es admin
      const { data, error } = await supabase.rpc('is_admin', { p_user_id: user.id })
      
      if (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } else {
        setIsAdmin(!!data)
      }
    } catch (e) {
      console.error('Exception checking admin:', e)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  return { isAdmin, loading }
}
