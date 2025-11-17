import React from 'react'
import { useLocation } from 'react-router-dom'
import NavbarV2 from './NavbarV2'
import Footer from './Footer'
import DebugBar from './DebugBar'

/**
 * Layout mejorado V2 con mejor estructura y responsividad
 */
export default function LayoutV2({ children, user, onLogout }) {
  const location = useLocation()
  
  // Páginas sin navbar
  const hideNavbarPaths = ['/', '/signup', '/login', '/auth']
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname)

  // Páginas sin footer
  const hideFooterPaths = ['/feed', '/search', '/bookmarks', '/notifications', '/messages', '/settings', '/compose', '/admin']
  const shouldShowFooter = hideFooterPaths.some(p => location.pathname.startsWith(p)) === false

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      {/* Navbar */}
      {shouldShowNavbar && <NavbarV2 user={user} onLogout={onLogout} />}

      {/* Main Content */}
      <main className={`${shouldShowNavbar ? 'pt-20 md:pt-16' : ''} pb-20 md:pb-8`}>
        <div className="w-full min-h-screen">
          {children}
        </div>
      </main>

      {/* Footer */}
      {shouldShowFooter && <Footer />}

      {/* Debug Bar */}
      <DebugBar />
    </div>
  )
}
