import React from 'react'

/**
 * Componente Input reutilizable con validación visual
 */
export default function Input({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  hint,
  icon: Icon,
  disabled,
  required,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={20} />
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-2
            ${Icon ? 'pl-10' : ''}
            border-2 rounded-lg
            bg-white dark:bg-gray-900
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-600
            transition-all duration-200
            ${error
              ? 'border-red-500 focus:border-red-600 focus:ring-red-500'
              : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500'
            }
            focus:outline-none focus:ring-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 mt-1">{error}</p>
      )}
      
      {hint && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{hint}</p>
      )}
    </div>
  )
}
