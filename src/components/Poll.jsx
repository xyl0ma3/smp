import React, { useEffect, useState } from 'react'
import { pollsAPI } from '../api'

export default function Poll({ pollId }) {
  const [poll, setPoll] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const data = await pollsAPI.get(pollId)
    setPoll(data)
    setLoading(false)
  }

  useEffect(() => { if (pollId) load() }, [pollId])

  const vote = async (optionId) => {
    await pollsAPI.vote(pollId, optionId)
    await load()
  }

  if (loading) return <div className="mt-3">Cargando encuesta...</div>
  if (!poll) return null

  return (
    <div className="mt-4">
      <div className="font-semibold">{poll.question}</div>
      <ul className="mt-2 space-y-2">
        {poll.options && poll.options.map(opt => (
          <li key={opt.id} className="flex items-center justify-between">
            <button onClick={() => vote(opt.id)} className="text-left flex-1 text-sm py-2 px-3 rounded-md bg-gray-100 dark:bg-slate-700">{opt.option_text}</button>
            <div className="ml-2 text-xs text-[rgb(var(--muted))]">{opt.votes_count || 0}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
