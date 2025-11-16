import { useState } from 'react'
import { retweetAPI } from '../api'

export default function useRetweet(postId, initial = false, initialCount = 0) {
  const [retweeted, setRetweeted] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(initialCount)

  const toggle = async () => {
    if (!postId) return
    setLoading(true)
    try {
      const res = await retweetAPI.toggle(postId)
      setRetweeted(res.retweeted)
      setCount(res.retweets_count || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return { retweeted, count, loading, toggle }
}
