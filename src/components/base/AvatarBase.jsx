import React from 'react'

/**
 * Componente Avatar mejorado y reutilizable
 */
export default function AvatarBase({
  src,
  alt = 'Avatar',
  size = 'md', // xs, sm, md, lg, xl
  status, // 'online', 'offline', 'away'
  verified = false,
  onClick,
  className = ''
}) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500'
  }

  return (
    <div className="relative inline-block">
      {/* Avatar */}
      <img
        src={src || `https://ui-avatars.com/api/?name=${alt}&background=random`}
        alt={alt}
        className={`
          ${sizeClasses[size]}
          rounded-full object-cover
          ${onClick ? 'cursor-pointer hover:opacity-80 transition' : ''}
          border-2 border-white dark:border-gray-800
          ${className}
        `}
        onClick={onClick}
      />

      {/* Status Indicator */}
      {status && (
        <div
          className={`
            absolute bottom-0 right-0
            ${sizeClasses[size] === 'w-6 h-6' ? 'w-1.5 h-1.5' : 'w-3 h-3'}
            ${statusColors[status]}
            rounded-full border-2 border-white dark:border-gray-800
          `}
        />
      )}

      {/* Verified Badge */}
      {verified && (
        <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  )
}
