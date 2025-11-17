import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, Loader } from 'lucide-react'
import { Button, Input, Alert } from './base'
import supabase from '../supabase'
import { logger } from '../utils/logger'

/**
 * Componente Auth V2 - Mejorado con mejor UX
 */
export default function AuthV2({ onUser }) {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (authError) {
        logger.error('AUTH', 'Error en login', authError)
        setError(authError.message || 'Error al iniciar sesión')
        return
      }

      logger.info('AUTH', 'Login exitoso', { userId: data.user?.id })
      setSuccess('Bienvenido de vuelta!')
      onUser?.(data.user)
      setTimeout(() => navigate('/feed'), 1500)
    } catch (e) {
      logger.error('AUTH', 'Excepción en login', e)
      setError('Error inesperado. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username || formData.email.split('@')[0]
          }
        }
      })

      if (signupError) {
        logger.error('AUTH', 'Error en signup', signupError)
        setError(signupError.message || 'Error al crear cuenta')
        return
      }

      logger.info('AUTH', 'Signup exitoso', { userId: data.user?.id })
      setSuccess('¡Cuenta creada! Comprobando email...')
      onUser?.(data.user)
      setTimeout(() => navigate('/feed'), 2000)
    } catch (e) {
      logger.error('AUTH', 'Excepción en signup', e)
      setError('Error inesperado. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-black px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/Octocat.png" alt="logo" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isLogin ? 'Bienvenido de vuelta' : 'Crear cuenta'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLogin
              ? '¿Aún no tienes cuenta? '
              : '¿Ya tienes cuenta? '
            }
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
                setSuccess(null)
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              {isLogin ? 'Registrarse' : 'Iniciar sesión'}
            </button>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
          {/* Alerts */}
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
              dismissible
              className="mb-6"
            />
          )}

          {success && (
            <Alert
              type="success"
              message={success}
              dismissible={false}
              className="mb-6"
            />
          )}

          {/* Form */}
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            {!isLogin && (
              <Input
                name="username"
                type="text"
                label="Nombre de usuario"
                placeholder="tu_usuario"
                value={formData.username}
                onChange={handleChange}
                icon={User}
                required
              />
            )}

            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
            />

            <div className="relative">
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Contraseña"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                icon={Lock}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {!isLogin && (
              <div className="relative">
                <Input
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  label="Confirmar contraseña"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  icon={Lock}
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
                </>
              ) : (
                isLogin ? 'Iniciar sesión' : 'Crear cuenta'
              )}
            </Button>
          </form>

          {/* Terms */}
          {!isLogin && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              Al registrarte, aceptas nuestros{' '}
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                Términos de servicio
              </a>
              {' '}y{' '}
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                Política de privacidad
              </a>
            </p>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400">
                o continúa con
              </span>
            </div>
          </div>

          {/* Social Login */}
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            disabled={true}
          >
            Google (Próximamente)
          </Button>
        </div>

        {/* Links */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            ← Volver a inicio
          </button>
        </div>
      </div>
    </div>
  )
}
