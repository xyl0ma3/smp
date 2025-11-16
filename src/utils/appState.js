/**
 * Monitoreo de estado global de la aplicación
 * Rastrea errores, eventos importantes y predice problemas futuros
 */

import { logger } from './logger'

const APP_TAG = 'APP_STATE'

export const appState = {
  // Estado actual
  current: {
    isOnline: navigator.onLine,
    isLoading: false,
    hasErrors: false,
    lastAction: null,
    lastActionTime: null,
    performanceMetrics: {},
    userAuthenticated: false,
    activePage: null
  },

  // Historial de eventos
  history: [],
  maxHistory: 100,

  // Suscriptores
  subscribers: [],

  /**
   * Actualizar estado global
   */
  update(updates) {
    const before = { ...this.current }
    this.current = { ...this.current, ...updates, lastActionTime: new Date().toISOString() }
    
    logger.debug(APP_TAG, 'Estado actualizado', {
      before,
      after: this.current,
      changes: updates
    })

    // Notificar suscriptores
    this._notifySubscribers(this.current)
    
    // Detectar transiciones problemáticas
    this._detectProblems(before, this.current)

    return this.current
  },

  /**
   * Registrar acción realizada
   */
  recordAction(action, data = null) {
    const timestamp = new Date().toISOString()
    const actionEntry = {
      timestamp,
      action,
      data,
      state: { ...this.current }
    }

    this.history.push(actionEntry)
    
    // Limitar historial
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory)
    }

    logger.debug(APP_TAG, `Acción: ${action}`, data)
    return actionEntry
  },

  /**
   * Registrar transición entre páginas
   */
  recordPageTransition(fromPage, toPage) {
    this.recordAction('page_transition', { from: fromPage, to: toPage })
    this.update({ activePage: toPage })
  },

  /**
   * Registrar problema potencial
   */
  recordProblem(severity, title, description, context = {}) {
    const problem = {
      timestamp: new Date().toISOString(),
      severity, // 'low', 'medium', 'high', 'critical'
      title,
      description,
      context,
      canRecover: this._canRecover(severity),
      suggestedFix: this._suggestFix(severity, title)
    }

    logger[severity === 'critical' ? 'critical' : 'warn'](
      APP_TAG,
      `${severity.toUpperCase()}: ${title}`,
      problem
    )

    this.update({ hasErrors: true })
    return problem
  },

  /**
   * Detectar problemas automáticamente
   */
  _detectProblems(before, after) {
    // Problema: usuario perdió conexión
    if (before.isOnline && !after.isOnline) {
      this.recordProblem(
        'high',
        'Conexión perdida',
        'El navegador detectó pérdida de conexión de red',
        { timestamp: after.lastActionTime }
      )
    }

    // Problema: muchos errores en corto tiempo
    const recentErrors = logger.getHistory({ level: 'ERROR' }).slice(-5)
    if (recentErrors.length === 5) {
      const timeDiff = new Date(recentErrors[4].timestamp) - new Date(recentErrors[0].timestamp)
      if (timeDiff < 10000) {
        this.recordProblem(
          'high',
          'Múltiples errores detectados',
          `Se registraron ${recentErrors.length} errores en ${(timeDiff / 1000).toFixed(1)}s`,
          { errors: recentErrors }
        )
      }
    }

    // Problema: aplicación en estado de carga prolongado
    if (after.isLoading && before.isLoading) {
      if (after.lastActionTime) {
        const loadingDuration = new Date() - new Date(after.lastActionTime)
        if (loadingDuration > 30000) { // 30 segundos
          this.recordProblem(
            'medium',
            'Carga prolongada',
            `La operación lleva más de ${(loadingDuration / 1000).toFixed(0)} segundos`,
            { duration: loadingDuration }
          )
        }
      }
    }
  },

  /**
   * Predecir si la app puede recuperarse
   */
  _canRecover(severity) {
    const severityMap = {
      'low': true,
      'medium': true,
      'high': false,
      'critical': false
    }
    return severityMap[severity] !== false
  },

  /**
   * Sugerir solución
   */
  _suggestFix(severity, title) {
    const suggestions = {
      'Conexión perdida': 'Verifica tu conexión de red y recarga la página',
      'Múltiples errores': 'Recarga la página. Si persiste, limpia el caché del navegador',
      'Carga prolongada': 'Intenta refrescar la página o reportar el problema',
      'Default': 'Recarga la página o reporta el problema al administrador'
    }

    return suggestions[title] || suggestions['Default']
  },

  /**
   * Suscribirse a cambios de estado
   */
  subscribe(callback) {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback)
    }
  },

  /**
   * Notificar suscriptores
   */
  _notifySubscribers(state) {
    this.subscribers.forEach(callback => {
      try {
        callback(state)
      } catch (e) {
        logger.error(APP_TAG, 'Error en callback de suscriptor', e)
      }
    })
  },

  /**
   * Obtener diagnóstico completo
   */
  getDiagnostics() {
    return {
      timestamp: new Date().toISOString(),
      current_state: this.current,
      recent_history: this.history.slice(-20),
      recent_errors: logger.getHistory({ level: 'ERROR' }).slice(-10),
      recent_warnings: logger.getHistory({ level: 'WARN' }).slice(-10),
      all_logs: logger.getHistory()
    }
  },

  /**
   * Exportar diagnósticos (para enviar a servidor)
   */
  exportDiagnostics() {
    const diagnostics = this.getDiagnostics()
    return {
      ...diagnostics,
      exported_at: new Date().toISOString(),
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        online: navigator.onLine
      }
    }
  }
}

// Monitorear cambios de conectividad
window.addEventListener('online', () => {
  appState.update({ isOnline: true })
  logger.info(APP_TAG, 'Conexión restaurada')
})

window.addEventListener('offline', () => {
  appState.update({ isOnline: false })
  logger.warn(APP_TAG, 'Conexión perdida')
})

// Monitorear errores globales
window.addEventListener('error', (event) => {
  logger.error(APP_TAG, `Error no capturado: ${event.message}`, event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  logger.error(APP_TAG, 'Promise rechazada no manejada', event.reason)
})

export default appState
