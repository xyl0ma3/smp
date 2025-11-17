import React from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'

/**
 * Componente Alert para notificaciones y mensajes
 */
export default function Alert({
  type = 'info', // info, success, warning, error
  title,
  message,
  onClose,
  dismissible = true,
  className = '',
  icon: CustomIcon
}) {
  const typeConfig = {
    info: {
      icon: Info,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-500 dark:text-blue-400'
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-800 dark:text-green-200',
      iconColor: 'text-green-500 dark:text-green-400'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      iconColor: 'text-yellow-500 dark:text-yellow-400'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-500 dark:text-red-400'
    }
  }

  const config = typeConfig[type]
  const Icon = CustomIcon || config.icon

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        ${className}
      `}
    >
      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1">
        {title && <p className="font-semibold mb-1">{title}</p>}
        {message && <p className="text-sm">{message}</p>}
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-inherit hover:opacity-70 transition"
        >
          <X size={18} />
        </button>
      )}
    </div>
  )
}
