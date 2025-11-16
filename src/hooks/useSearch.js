import { useState, useCallback } from 'react'
import { searchAPI } from '../api'

/**
 * Hook para búsqueda de usuarios y posts
 * @returns {Object} - { searchUsers, searchPosts, results, loading, clearResults }
 */
export default function useSearch() {
  const [results, setResults] = useState({
    users: [],
    posts: [],
    all: []
  })
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  const searchUsers = useCallback(async (searchQuery, limit = 20) => {
    if (!searchQuery.trim()) {
      setResults({ users: [], posts: [], all: [] })
      return
    }

    setQuery(searchQuery)
    setLoading(true)
    try {
      const users = await searchAPI.searchUsers(searchQuery, limit)
      setResults((prev) => ({
        ...prev,
        users: users || []
      }))
    } catch (error) {
      console.error('Error searching users:', error)
      setResults((prev) => ({ ...prev, users: [] }))
    } finally {
      setLoading(false)
    }
  }, [])

  const searchPosts = useCallback(async (searchQuery, limit = 20) => {
    if (!searchQuery.trim()) {
      setResults({ users: [], posts: [], all: [] })
      return
    }

    setQuery(searchQuery)
    setLoading(true)
    try {
      const posts = await searchAPI.searchPosts(searchQuery, limit)
      setResults((prev) => ({
        ...prev,
        posts: posts || []
      }))
    } catch (error) {
      console.error('Error searching posts:', error)
      setResults((prev) => ({ ...prev, posts: [] }))
    } finally {
      setLoading(false)
    }
  }, [])

  const search = useCallback(async (searchQuery, limit = 10) => {
    if (!searchQuery.trim()) {
      setResults({ users: [], posts: [], all: [] })
      return
    }

    setQuery(searchQuery)
    setLoading(true)
    try {
      const [users, posts] = await Promise.all([
        searchAPI.searchUsers(searchQuery, limit),
        searchAPI.searchPosts(searchQuery, limit)
      ])

      setResults({
        users: users || [],
        posts: posts || [],
        all: [...(users || []), ...(posts || [])]
      })
    } catch (error) {
      console.error('Error searching:', error)
      setResults({ users: [], posts: [], all: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults({ users: [], posts: [], all: [] })
    setQuery('')
  }, [])

  return {
    searchUsers,
    searchPosts,
    search,
    results,
    loading,
    query,
    clearResults
  }
}
