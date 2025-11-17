import './App.css';
import './styles/timeline.css';
import './styles/design-system.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import LayoutV2 from './components/LayoutV2'
import TimelineV2 from './components/TimelineV2'
import DebugBar from './components/DebugBar'
import LandingPageV2 from './pages/LandingPageV2'
import RequireAuth from './components/RequireAuth'
import AuthV2 from './components/AuthV2'
import AdminPanel from './components/AdminPanel'
import supabase from './supabase'
import useAuth from './hooks/useAuth'
import { LoadingSpinner } from './utils/lazyLoad.jsx'

// Lazy load pages for better performance
const SearchPage = lazy(() => import('./pages/SearchPage'))
const NotificationsPageV2 = lazy(() => import('./pages/NotificationsPageV2'))
const SettingsPageV2 = lazy(() => import('./pages/SettingsPageV2'))
const ProfilePageV2 = lazy(() => import('./pages/ProfilePageV2'))
const MessagesPageV2 = lazy(() => import('./pages/MessagesPageV2'))
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'))
const CreatePost = lazy(() => import('./pages/CreatePost'))
const Ping = lazy(() => import('./pages/Ping'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'))

function App() {
  const { user } = useAuth()

  const handleLogout = () => {
    // useAuth maneja el logout automáticamente
  }

  return (
    <BrowserRouter>
      <LayoutV2 user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<LandingPageV2 />} />
          <Route path="/feed" element={<RequireAuth><TimelineV2 onOpenProfile={(id) => {}} /></RequireAuth>} />
          
          {/* Lazy loaded routes */}
          <Route path="/search" element={
            <Suspense fallback={<LoadingSpinner />}>
              <SearchPage onProfile={(id) => {}} />
            </Suspense>
          } />
          
          <Route path="/bookmarks" element={
            <RequireAuth>
              <Suspense fallback={<LoadingSpinner />}>
                <BookmarksPage />
              </Suspense>
            </RequireAuth>
          } />
          
          <Route path="/notifications" element={
            <RequireAuth>
              <Suspense fallback={<LoadingSpinner />}>
                <NotificationsPageV2 />
              </Suspense>
            </RequireAuth>
          } />
          
          <Route path="/settings" element={
            <RequireAuth>
              <Suspense fallback={<LoadingSpinner />}>
                <SettingsPageV2 />
              </Suspense>
            </RequireAuth>
          } />
          
          <Route path="/@:username" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProfilePageV2 />
            </Suspense>
          } />
          
          <Route path="/profile/:username" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProfilePageV2 />
            </Suspense>
          } />
          
          <Route path="/compose" element={
            <RequireAuth>
              <Suspense fallback={<LoadingSpinner />}>
                <CreatePost user={user} onClose={() => window.history.back()} onPosted={() => window.history.back()} />
              </Suspense>
            </RequireAuth>
          } />
          
          <Route path="/messages" element={
            <RequireAuth>
              <Suspense fallback={<LoadingSpinner />}>
                <MessagesPageV2 />
              </Suspense>
            </RequireAuth>
          } />
          
          <Route path="/messages/:conversationId" element={
            <RequireAuth>
              <Suspense fallback={<LoadingSpinner />}>
                <MessagesPageV2 />
              </Suspense>
            </RequireAuth>
          } />
          
          <Route path="/admin" element={<RequireAuth><AdminPanel /></RequireAuth>} />
          <Route path="/signup" element={<AuthV2 onUser={(u) => {}} />} />
          
          <Route path="/ping" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Ping />
            </Suspense>
          } />
          
          <Route path="/privacy" element={
            <Suspense fallback={<LoadingSpinner />}>
              <PrivacyPolicy />
            </Suspense>
          } />
          
          <Route path="/terms" element={
            <Suspense fallback={<LoadingSpinner />}>
              <TermsOfService />
            </Suspense>
          } />
          
          <Route path="/cookies" element={
            <Suspense fallback={<LoadingSpinner />}>
              <CookiePolicy />
            </Suspense>
          } />
          
          <Route path="*" element={<div className="p-8 text-center">Página no encontrada</div>} />
        </Routes>
      </LayoutV2>
      <DebugBar />
    </BrowserRouter>
  )
}

export default App;

