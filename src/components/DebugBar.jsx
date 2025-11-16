/**
 * Componente DebugBar
 * Barra de depuración visible en UI mostrando estado de la app
 */

import React, { useState, useEffect } from 'react'
import { logger } from '../utils/logger'
import { ChevronDown, X, Copy, Download, Trash2 } from 'lucide-react'

export default function DebugBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [logs, setLogs] = useState([])
  const [tab, setTab] = useState('recent') // 'recent', 'errors', 'info'
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    const updateLogs = () => {
      const history = logger.getHistory()
      setLogs(history)
    }

    if (autoRefresh) {
      const interval = setInterval(updateLogs, 500)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const filteredLogs = () => {
    switch (tab) {
      case 'errors':
        return logs.filter(l => ['ERROR', 'CRITICAL'].includes(l.level))
      case 'info':
        return logs.filter(l => ['INFO', 'WARN'].includes(l.level))
      case 'recent':
      default:
        return logs.slice(-50)
    }
  }

  const exportLogs = () => {
    const exported = logger.exportLogs()
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = () => {
    const text = filteredLogs()
      .map(l => `[${l.timestamp}] ${l.level} | ${l.tag}: ${l.message}`)
      .join('\n')
    navigator.clipboard.writeText(text)
    alert('Logs copiados al portapapeles')
  }

  const clearLogs = () => {
    if (window.confirm('¿Limpiar todos los logs?')) {
      logger.clearHistory()
      setLogs([])
    }
  }

  const getLevelColor = (level) => {
    const colors = {
      DEBUG: 'text-gray-500',
      INFO: 'text-blue-600',
      WARN: 'text-yellow-600',
      ERROR: 'text-red-600',
      CRITICAL: 'text-red-800 font-bold'
    }
    return colors[level] || 'text-gray-600'
  }

  const getBgColor = (level) => {
    const colors = {
      DEBUG: 'bg-gray-50',
      INFO: 'bg-blue-50',
      WARN: 'bg-yellow-50',
      ERROR: 'bg-red-50',
      CRITICAL: 'bg-red-100'
    }
    return colors[level] || 'bg-gray-50'
  }

  const filteredLogsList = filteredLogs()
  const errorCount = logs.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL').length

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-96 z-50 bg-white dark:bg-gray-900 shadow-2xl rounded-t-lg border-t border-gray-300 dark:border-gray-700">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-gray-800 dark:bg-gray-950 text-white flex justify-between items-center cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-800 transition"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">🔍 Debug</span>
          {errorCount > 0 && (
            <span className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5 font-bold">
              {errorCount} errors
            </span>
          )}
          <span className="text-xs text-gray-400">({logs.length} total)</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-3 h-3"
            />
            <span>Auto</span>
          </label>
          <ChevronDown
            size={16}
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Panel */}
      {isOpen && (
        <div className="flex flex-col max-h-96 bg-white dark:bg-gray-900">
          {/* Tabs */}
          <div className="flex gap-1 p-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            {['recent', 'errors', 'info'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 text-xs rounded transition ${
                  tab === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {t === 'recent' ? '📋 Recent' : t === 'errors' ? '❌ Errors' : 'ℹ️ Info'}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-1 p-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              onClick={copyToClipboard}
              title="Copiar logs"
              className="p-1 rounded bg-blue-500 hover:bg-blue-600 text-white transition text-xs flex items-center gap-1"
            >
              <Copy size={12} /> Copy
            </button>
            <button
              onClick={exportLogs}
              title="Descargar logs como JSON"
              className="p-1 rounded bg-green-500 hover:bg-green-600 text-white transition text-xs flex items-center gap-1"
            >
              <Download size={12} /> Export
            </button>
            <button
              onClick={clearLogs}
              title="Limpiar logs"
              className="p-1 rounded bg-red-500 hover:bg-red-600 text-white transition text-xs flex items-center gap-1"
            >
              <Trash2 size={12} /> Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto p-1 rounded bg-gray-400 hover:bg-gray-500 text-white transition text-xs flex items-center gap-1"
            >
              <X size={12} /> Close
            </button>
          </div>

          {/* Logs */}
          <div className="flex-1 overflow-y-auto font-mono text-xs">
            {filteredLogsList.length === 0 ? (
              <div className="p-3 text-gray-500 text-center italic">
                No logs para mostrar ({tab})
              </div>
            ) : (
              filteredLogsList.map((log, idx) => (
                <div
                  key={log.id}
                  className={`p-2 border-b dark:border-gray-700 ${getBgColor(log.level)} hover:opacity-75 transition`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`font-bold ${getLevelColor(log.level)}`}>
                      [{log.level}]
                    </span>
                    <span className="text-gray-500">{log.timestamp.split('T')[1]}</span>
                  </div>
                  <div className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">{log.tag}:</span> {log.message}
                  </div>
                  {log.data && (
                    <details className="mt-1 text-gray-600 dark:text-gray-400">
                      <summary className="cursor-pointer text-blue-600 hover:underline">
                        Ver datos
                      </summary>
                      <pre className="bg-gray-200 dark:bg-gray-800 p-1 rounded mt-1 overflow-auto max-h-40 text-xs">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
