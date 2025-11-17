import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, Mail, Lock, Palette, Volume2, Eye, LogOut, Trash2 } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import { supabase } from '../supabase'
import Button from '../components/base/Button'
import Card from '../components/base/Card'
import Alert from '../components/base/Alert'
import AvatarBase from '../components/base/AvatarBase'

export default function SettingsPageV2() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    privateAccount: false,
    darkMode: true,
    soundEnabled: true,
    compactMode: false
  })
  
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [user])

  const loadSettings = async () => {
    try {
      if (!user) return
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (data) {
        setSettings(data.settings || settings)
      }
    } catch (err) {
      console.error('Error loading settings:', err)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: settings,
          updated_at: new Date().toISOString()
        })
      
      setMessage({ type: 'success', text: 'Configuración guardada' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
      setMessage({ type: 'error', text: 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (err) {
      console.error('Error logging out:', err)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setSaving(true)
      
      // Delete user data
      await supabase
        .from('users')
        .delete()
        .eq('id', user.id)
      
      await logout()
      navigate('/')
    } catch (err) {
      console.error('Error deleting account:', err)
      setMessage({ type: 'error', text: 'Error al eliminar cuenta' })
    } finally {
      setSaving(false)
      setDeleteConfirm(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Configuración</span>
        </button>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {message && (
          <Alert
            type={message.type}
            title={message.type === 'success' ? 'Éxito' : 'Error'}
            message={message.text}
            dismissible
            onDismiss={() => setMessage(null)}
            className="mb-6"
          />
        )}

        {/* Account Section */}
        <Card className="mb-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-800">
            <AvatarBase src={user?.user_metadata?.avatar_url} name={user?.email} size="lg" />
            <div>
              <h2 className="text-xl font-bold">{user?.email}</h2>
              <p className="text-neutral-400 text-sm">ID: {user?.id.slice(0, 8)}...</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-primary" />
                <div>
                  <p className="font-semibold">Correo Electrónico</p>
                  <p className="text-neutral-400 text-sm">{user?.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Cambiar</Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock size={20} className="text-primary" />
                <div>
                  <p className="font-semibold">Contraseña</p>
                  <p className="text-neutral-400 text-sm">Última cambio: hace 3 meses</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Cambiar</Button>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="mb-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Bell size={20} />
            Notificaciones
          </h3>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-900 transition cursor-pointer">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-primary" />
                <div>
                  <p className="font-semibold">Notificaciones por Email</p>
                  <p className="text-neutral-400 text-sm">Recibe alertas importantes</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-5 h-5 rounded accent-primary"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-900 transition cursor-pointer">
              <div className="flex items-center gap-3">
                <Volume2 size={18} className="text-primary" />
                <div>
                  <p className="font-semibold">Sonidos</p>
                  <p className="text-neutral-400 text-sm">Sonidos de notificación</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                className="w-5 h-5 rounded accent-primary"
              />
            </label>
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="mb-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Eye size={20} />
            Privacidad y Seguridad
          </h3>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-900 transition cursor-pointer">
              <div>
                <p className="font-semibold">Cuenta Privada</p>
                <p className="text-neutral-400 text-sm">Requiere aprobación para seguirte</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privateAccount}
                onChange={(e) => setSettings({ ...settings, privateAccount: e.target.checked })}
                className="w-5 h-5 rounded accent-primary"
              />
            </label>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="mb-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Palette size={20} />
            Apariencia
          </h3>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-900 transition cursor-pointer">
              <div>
                <p className="font-semibold">Modo Oscuro</p>
                <p className="text-neutral-400 text-sm">Tema oscuro automático</p>
              </div>
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                className="w-5 h-5 rounded accent-primary"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-900 transition cursor-pointer">
              <div>
                <p className="font-semibold">Modo Compacto</p>
                <p className="text-neutral-400 text-sm">Interfaz más condensada</p>
              </div>
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => setSettings({ ...settings, compactMode: e.target.checked })}
                className="w-5 h-5 rounded accent-primary"
              />
            </label>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3 mb-6">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>

        {/* Danger Zone */}
        <Card className="border-red-500/20 bg-red-500/5">
          <h3 className="text-lg font-bold mb-4 text-red-400 flex items-center gap-2">
            <Trash2 size={20} />
            Zona de Peligro
          </h3>

          {!deleteConfirm ? (
            <Button
              variant="danger"
              size="md"
              onClick={() => setDeleteConfirm(true)}
            >
              Eliminar Cuenta
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-red-400 text-sm">
                ⚠️ Esta acción es irreversible. Se eliminarán todos tus datos.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="danger"
                  size="md"
                  onClick={handleDeleteAccount}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? 'Eliminando...' : 'Confirmar Eliminación'}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Logout */}
        <div className="mt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLogout}
            className="w-full"
          >
            <LogOut size={18} className="mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
