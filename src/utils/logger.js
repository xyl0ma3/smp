/**
 * Sistema centralizado de logging y error handling
 * Registra eventos, errores y facilita depuración
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4
}

let currentLogLevel = LOG_LEVELS.DEBUG
let logHistory = []
let errorCallbacks = []
let debugMode = true

export const logger = {
  /**
   * Registra un evento de debug
   */
  debug(tag, message, data = null) {
    this._log(LOG_LEVELS.DEBUG, tag, message, data)
  },

  /**
   * Registra un evento informativo
   */
  info(tag, message, data = null) {
    this._log(LOG_LEVELS.INFO, tag, message, data)
  },

  /**
   * Registra una advertencia
   */
  warn(tag, message, data = null) {
    this._log(LOG_LEVELS.WARN, tag, message, data)
  },

  /**
   * Registra un error
   */
  error(tag, message, error = null) {
    const errorObj = {
      message,
      stack: error?.stack || null,
      details: error?.toString?.() || String(error)
    }
    this._log(LOG_LEVELS.ERROR, tag, message, errorObj)
    
    // Ejecutar callbacks de error
    errorCallbacks.forEach(cb => {
      try {
        cb({ tag, message, error: errorObj })
      } catch (e) {
        console.error('Error en callback de error:', e)
      }
    })
  },

  /**
   * Registra un error crítico (app no puede continuar)
   */
  critical(tag, message, error = null) {
    const errorObj = {
      message,
      stack: error?.stack || null,
      details: error?.toString?.() || String(error),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
    this._log(LOG_LEVELS.CRITICAL, tag, message, errorObj)
    
    // Notificar todas las suscripciones críticas
    errorCallbacks.forEach(cb => {
      try {
        cb({ tag, message, error: errorObj, critical: true })
      } catch (e) {
        console.error('Error en callback crítico:', e)
      }
    })
  },

  /**
   * Método interno para registrar logs
   */
  _log(level, tag, message, data) {
    if (level < currentLogLevel) return

    const timestamp = new Date().toISOString()
    const levelName = Object.keys(LOG_LEVELS).find(k => LOG_LEVELS[k] === level)
    
    const logEntry = {
      timestamp,
      level: levelName,
      tag,
      message,
      data,
      id: logHistory.length
    }

    logHistory.push(logEntry)
    
    // Limitar historial en memoria
    if (logHistory.length > 500) {
      logHistory = logHistory.slice(-500)
    }

    // Mostrar en consola si está habilitado
    if (debugMode) {
      const prefix = `[${levelName}] ${tag}`
      const style = this._getConsoleStyle(level)
      
      if (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.CRITICAL) {
        console.error(`%c${prefix}: ${message}`, style, data)
      } else if (level === LOG_LEVELS.WARN) {
        console.warn(`%c${prefix}: ${message}`, style, data)
      } else {
        console.log(`%c${prefix}: ${message}`, style, data)
      }
    }
  },

  /**
   * Obtiene el estilo para consola según nivel
   */
  _getConsoleStyle(level) {
    const styles = {
      [LOG_LEVELS.DEBUG]: 'color: #888; font-weight: bold;',
      [LOG_LEVELS.INFO]: 'color: #06f; font-weight: bold;',
      [LOG_LEVELS.WARN]: 'color: #f90; font-weight: bold;',
      [LOG_LEVELS.ERROR]: 'color: #f30; font-weight: bold;',
      [LOG_LEVELS.CRITICAL]: 'color: #f00; font-weight: bold; font-size: 14px;'
    }
    return styles[level] || 'color: inherit;'
  },

  /**
   * Obtiene todo el historial de logs
   */
  getHistory(filter = null) {
    if (!filter) return [...logHistory]
    return logHistory.filter(entry => {
      if (filter.tag && !entry.tag.includes(filter.tag)) return false
      if (filter.level && entry.level !== filter.level) return false
      if (filter.since) {
        const sinceTime = new Date(filter.since).getTime()
        const entryTime = new Date(entry.timestamp).getTime()
        if (entryTime < sinceTime) return false
      }
      return true
    })
  },

  /**
   * Limpia el historial de logs
   */
  clearHistory() {
    logHistory = []
  },

  /**
   * Suscribirse a errores
   */
  onError(callback) {
    errorCallbacks.push(callback)
    return () => {
      errorCallbacks = errorCallbacks.filter(cb => cb !== callback)
    }
  },

  /**
   * Establecer nivel mínimo de log
   */
  setLogLevel(level) {
    if (typeof level === 'string') {
      currentLogLevel = LOG_LEVELS[level] || LOG_LEVELS.DEBUG
    } else {
      currentLogLevel = level
    }
  },

  /**
   * Habilitar/deshabilitar modo debug
   */
  setDebugMode(enabled) {
    debugMode = enabled
  },

  /**
   * Exportar logs a JSON (para enviar a servidor, etc)
   */
  exportLogs() {
    return {
      exported_at: new Date().toISOString(),
      entries: logHistory,
      user_agent: navigator.userAgent,
      url: window.location.href
    }
  }
}

export default logger
