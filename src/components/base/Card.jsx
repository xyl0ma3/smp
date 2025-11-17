import React from 'react'

/**
 * Componente Card reutilizable
 */
export default function Card({
  children,
  className = '',
  hover = true,
  rounded = 'lg',
  padding = 'p-4',
  ...props
}) {
  return (
    <div
      className={`
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        rounded-${rounded}
        ${padding}
        ${hover ? 'hover:shadow-md dark:hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
