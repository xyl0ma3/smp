import React, { useState } from 'react'
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  Heart,
  User,
  Settings,
  LogOut,
  MoreHorizontal,
  Share2,
  Zap,
  FileText,
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import Avatar from './Avatar'

export default function Sidebar({ 
  onNavigate, 
  currentPage, 
  user, 
  onLogout,
  unreadNotifications = 0 
}) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navItems = [
    { 
      icon: Home, 
      label: 'Inicio', 
      page: 'feed',
      badge: null
    },
    { 
      icon: Search, 
      label: 'Explorar', 
      page: 'search',
      badge: null
    },
    { 
      icon: Bell, 
      label: 'Notificaciones', 
      page: 'notifications',
      badge: unreadNotifications > 0 ? unreadNotifications : null
    },
    { 
      icon: Mail, 
      label: 'Mensajes', 
      page: 'messages',
      badge: null
    },
    { 
      icon: Bookmark, 
      label: 'Guardados', 
      page: 'saved',
      badge: null
    },
    { 
      icon: Heart, 
      label: 'Mis Likes', 
      page: 'likes',
      badge: null
    },
    { 
      icon: User, 
      label: 'Perfil', 
      page: 'profile',
      badge: null
    },
    { 
      icon: Settings, 
      label: 'Configuración', 
      page: 'settings',
      badge: null
    },
  ]

  const handleNavigate = (page) => {
    onNavigate?.(page)
    setShowUserMenu(false)
  }

  return (
    <div className="w-64 h-screen bg-white dark:bg-twitter-900 border-r border-gray-200 dark:border-twitter-800 flex flex-col overflow-y-auto hidden lg:flex">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-twitter-800 sticky top-0 bg-white dark:bg-twitter-900 z-10">
        <div className="text-4xl font-bold text-twitter-600 dark:text-twitter-400">
          𝕏
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-3">
        {navItems.map(({ icon: Icon, label, page, badge }) => (
          <button
            key={page}
            onClick={() => handleNavigate(page)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-full font-semibold transition-all duration-200 relative ${
              currentPage === page
                ? 'bg-twitter-50 dark:bg-twitter-800 text-twitter-600 dark:text-twitter-400 border-2 border-twitter-600 dark:border-twitter-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-twitter-800 border-2 border-transparent'
            }`}
          >
            <Icon size={24} />
            <span>{label}</span>
            {badge && (
              <span className="absolute -top-1 -right-1 bg-twitter-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Botón Crear */}
      <div className="px-4 pb-4 border-b border-gray-200 dark:border-twitter-800">
        <button
          onClick={() => handleNavigate('compose')}
          className="w-full bg-gradient-to-r from-twitter-600 to-twitter-500 hover:from-twitter-700 hover:to-twitter-600 text-white font-bold py-3 rounded-full text-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
        >
          <Share2 size={20} />
          Publicar
        </button>
      </div>

      {/* User Profile Card */}
      {user && (
        <div className="p-4 border-t border-gray-200 dark:border-twitter-800 relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center justify-between group hover:bg-gray-100 dark:hover:bg-twitter-800 p-3 rounded-full transition-all duration-200"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar
                src={user.user_metadata?.avatar_url}
                alt={user.user_metadata?.full_name || user.email}
                size={44}
              />
              <div className="flex-1 min-w-0 text-left">
                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  @{user.email?.split('@')[0] || 'user'}
                </p>
              </div>
            </div>
            <MoreHorizontal size={16} className="text-gray-500 flex-shrink-0" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute left-4 right-4 bottom-20 bg-white dark:bg-twitter-800 border border-gray-200 dark:border-twitter-700 rounded-lg shadow-xl overflow-hidden z-50">
              <button
                onClick={() => {
                  handleNavigate('profile')
                  setShowUserMenu(false)
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-twitter-700 text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2"
              >
                <User size={16} />
                Ver perfil
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-twitter-700 text-sm font-medium text-gray-900 dark:text-white border-t border-gray-200 dark:border-twitter-700 flex items-center gap-2">
                <Zap size={16} />
                Cambiar cuenta
              </button>
              <div className="px-4 py-3 border-t border-gray-200 dark:border-twitter-700 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tema</span>
                <ThemeToggle />
              </div>
              <button
                onClick={() => {
                  onLogout?.()
                  setShowUserMenu(false)
                }}
                className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium text-red-600 dark:text-red-400 border-t border-gray-200 dark:border-twitter-700 flex items-center gap-2"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
