import React, { useState } from 'react'

export default function ReportModal({ open, onClose, onSubmit, defaultReasonOptions = ['spam', 'abuse', 'sexual', 'other'], post }) {
  const [reason, setReason] = useState(defaultReasonOptions[0] || 'other')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      await onSubmit({ post_id: post?.id, reason, details })
      setDetails('')
      onClose()
    } catch (err) {
      console.error(err)
      alert('Error al enviar el reporte')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Reportar contenido</h3>
          <button onClick={onClose} className="text-sm text-gray-500">Cerrar</button>
        </div>
        <p className="text-sm text-[rgb(var(--muted))] mt-2">Selecciona el motivo y añade detalles si lo deseas.</p>

        <div className="mt-3">
          <label className="block text-xs font-medium text-[rgb(var(--muted))]">Motivo</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-2 bg-white dark:bg-slate-700">
            {defaultReasonOptions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="mt-3">
          <label className="block text-xs font-medium text-[rgb(var(--muted))]">Detalles (opcional)</label>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} className="mt-1 w-full rounded-md border px-2 py-2 bg-white dark:bg-slate-700" />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-md bg-gray-100 dark:bg-slate-700">Cancelar</button>
          <button onClick={submit} disabled={loading} className="px-3 py-2 rounded-md bg-rose-600 text-white">{loading ? 'Enviando...' : 'Enviar reporte'}</button>
        </div>
      </div>
    </div>
  )
}
