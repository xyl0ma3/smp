import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Home, Search, Bell, Mail, Bookmark, Heart, Settings, LogOut, Shield, Plus } from 'lucide-react'
import { Button, AvatarBase } from './base'
import ComposePostV2 from './ComposePostV2'
import supabase from '../supabase'

/**
 * Navbar mejorado con diseño moderno
 */
export default function NavbarV2({ user, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [composeOpen, setComposeOpen] = useState(false)

  const navItems = [
    { icon: Home, label: 'Inicio', href: '/feed', matches: ['/feed'] },
    { icon: Search, label: 'Explorar', href: '/search', matches: ['/search'] },
    { icon: Bell, label: 'Notificaciones', href: '/notifications', matches: ['/notifications'] },
    { icon: Mail, label: 'Mensajes', href: '/messages', matches: ['/messages'] },
    { icon: Bookmark, label: 'Guardados', href: '/bookmarks', matches: ['/bookmarks'] }
  ]

  const isActive = (paths) => paths.some(p => location.pathname.startsWith(p))

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout?.()
    navigate('/')
  }

  return (
    <>
      {/* Main Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="container-center h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate('/feed')}
              className="flex-shrink-0 font-bold text-xl text-blue-500 hover:text-blue-600 transition"
              title="Volver a inicio"
            >
              {/* Logo */}
              <img src="/Octocat.png" alt="logo" className="h-8 w-auto" />
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition
                    ${isActive(item.matches)
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
                    }
                  `}
                  title={item.label}
                >
                  <item.icon size={20} />
                  <span className="hidden lg:inline text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Compose Button */}
            {user && (
              <Button
                size="md"
                onClick={() => setComposeOpen(true)}
                className="hidden sm:inline-flex gap-2"
              >
                <Plus size={18} />
                <span className="hidden md:inline">Publicar</span>
              </Button>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                >
                  <AvatarBase
                    src={user.user_metadata?.avatar_url}
                    alt={user.email}
                    size="sm"
                  />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-20 overflow-hidden">
                      {/* Profile Info */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {user.email?.split('@')[0] || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={() => {
                            const username = user.user_metadata?.username || user.email?.split('@')[0] || user.id
                            navigate(`/@${encodeURIComponent(username)}`)
                            setUserMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 transition"
                        >
                          <AvatarBase src={user.user_metadata?.avatar_url} alt="profile" size="xs" />
                          Mi Perfil
                        </button>

                        <button
                          onClick={() => {
                            navigate('/settings')
                            setUserMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 transition"
                        >
                          <Settings size={16} />
                          Configuración
                        </button>

                        <div className="border-t border-gray-200 dark:border-gray-800 my-2" />

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition"
                        >
                          <LogOut size={16} />
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Button onClick={() => navigate('/signup')} size="md">
                Registrarse
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 md:hidden">
          <div className="container-center py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  navigate(item.href)
                  setMobileMenuOpen(false)
                }}
                className={`
                  w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition
                  ${isActive(item.matches)
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
                  }
                `}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {composeOpen && (
        <ComposePostV2
          onClose={() => setComposeOpen(false)}
          onPosted={() => {
            setComposeOpen(false)
          }}
        />
      )}
    </>
  )
}
