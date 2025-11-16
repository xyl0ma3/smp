import { useEffect } from 'react'
import { presenceAPI } from '../api'

export default function usePresence(status = 'online', intervalMs = 30000) {
  useEffect(() => {
    let mounted = true
    const send = async () => {
      try {
        await presenceAPI.update(status)
      } catch (err) {
        // ignore
      }
    }
    send()
    const id = setInterval(send, intervalMs)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [status, intervalMs])
}
