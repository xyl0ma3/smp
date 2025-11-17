import './App.css';
import './styles/timeline.css';
import './styles/design-system.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LayoutV2 from './components/LayoutV2'
import TimelineV2 from './components/TimelineV2'
import DebugBar from './components/DebugBar'
import LandingPage from './pages/LandingPage'
import RequireAuth from './components/RequireAuth'
import SearchPage from './pages/SearchPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import CreatePost from './pages/CreatePost'
import BookmarksPage from './pages/BookmarksPage'
import Auth from './components/Auth'
import Ping from './pages/Ping'
import MessagesPage from './pages/MessagesPage'
import AdminPanel from './components/AdminPanel'
import Onboarding from './components/Onboarding'
import supabase from './supabase'
import useAuth from './hooks/useAuth'

function App() {
  const { user } = useAuth()

  const handleLogout = () => {
    // useAuth maneja el logout automáticamente
  }

  return (
    <BrowserRouter>
      <LayoutV2 user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/feed" element={<RequireAuth><TimelineV2 onOpenProfile={(id) => {}} /></RequireAuth>} />
          <Route path="/search" element={<SearchPage onProfile={(id) => {}} />} />
          <Route path="/bookmarks" element={<RequireAuth><BookmarksPage /></RequireAuth>} />
          <Route path="/notifications" element={<RequireAuth><NotificationsPage user={user} /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><SettingsPage user={user} /></RequireAuth>} />
          <Route path="/@:username" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/profile/:username" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/compose" element={<RequireAuth><CreatePost user={user} onClose={() => window.history.back()} onPosted={() => window.history.back()} /></RequireAuth>} />
          <Route path="/messages" element={<RequireAuth><MessagesPage /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><AdminPanel /></RequireAuth>} />
          <Route path="/signup" element={<Auth onUser={(u) => {}} />} />
          <Route path="/ping" element={<Ping />} />
          <Route path="*" element={<div className="p-8 text-center">Página no encontrada</div>} />
        </Routes>
      </LayoutV2>
      <DebugBar />
    </BrowserRouter>
  )
}

export default App;

