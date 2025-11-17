import React from 'react'

/**
 * Componente Button reutilizable con múltiples variantes
 */
export default function Button({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'md', // sm, md, lg
  icon: Icon,
  isLoading,
  disabled,
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      className={`
        inline-flex items-center gap-2 rounded-lg font-semibold 
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        dark:focus:ring-offset-gray-950
        ${variants[variant]}
        ${sizes[size]}
        ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />}
      {isLoading && <span className="animate-spin">⏳</span>}
      {children}
    </button>
  )
}
