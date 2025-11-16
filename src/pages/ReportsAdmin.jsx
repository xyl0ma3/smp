import React, { useEffect, useState } from 'react'
import { reportsAPI } from '../api'
import Avatar from '../components/Avatar'

export default function ReportsAdmin() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const data = await reportsAPI.listReports()
    setReports(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleChangeStatus = async (id, status) => {
    await reportsAPI.updateStatus(id, status)
    await load()
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Reportes</h2>
      {loading && <p className="mt-2">Cargando...</p>}
      {!loading && reports.length === 0 && <p className="mt-2">No hay reportes</p>}
      <ul className="mt-4 space-y-3">
        {reports.map(r => (
          <li key={r.id} className="p-3 bg-white dark:bg-slate-800 rounded-md shadow-sm">
            <div className="flex items-start gap-3">
              <Avatar src={r.reporter?.avatar_url} alt={r.reporter?.username} size={40} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{r.reporter?.username || 'Usuario'}</div>
                    <div className="text-xs text-[rgb(var(--muted))]">{r.reason} • {new Date(r.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-sm">{r.status}</div>
                </div>
                <div className="mt-2 text-sm text-[rgb(var(--muted))]">{r.details}</div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => handleChangeStatus(r.id, 'reviewed')} className="px-2 py-1 bg-sky-600 text-white rounded">Marcar revisado</button>
                  <button onClick={() => handleChangeStatus(r.id, 'dismissed')} className="px-2 py-1 bg-gray-200 rounded">Descartar</button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
