import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Image, Send, X, AlertCircle } from 'lucide-react'
import { Button, Alert, AvatarBase } from './base'
import { createPost } from '../utils/supabaseHelpers'
import { logger } from '../utils/logger'
import useAuth from '../hooks/useAuth'

/**
 * Componente para crear posts - V2 mejorado
 */
export default function ComposePostV2({ onClose, onPosted }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [previewImage, setPreviewImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no puede exceder 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewImage(event.target?.result)
        setImageUrl(event.target?.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim() && !imageUrl) {
      setError('Escribe algo o sube una imagen')
      return
    }

    if (content.length > 500) {
      setError('El post no puede exceder 500 caracteres')
      return
    }

    setLoading(true)
    setError(null)

    try {
      logger.debug('COMPOSE', 'Creando post', { contentLength: content.length, hasImage: !!imageUrl })

      const result = await createPost(content, imageUrl)

      if (!result.success) {
        logger.error('COMPOSE', 'Error al crear post', result.error)
        setError(result.error?.message || 'Error al crear el post')
        return
      }

      logger.info('COMPOSE', 'Post creado exitosamente', { postId: result.data?.id })
      setContent('')
      setImageUrl('')
      setPreviewImage(null)
      onPosted?.()
      setTimeout(() => onClose?.(), 1000)
    } catch (e) {
      logger.error('COMPOSE', 'Excepción al crear post', e)
      setError('Error inesperado. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <Alert
          type="warning"
          title="Debes iniciar sesión"
          message="Necesitas estar autenticado para crear posts"
        />
        <Button
          onClick={() => navigate('/signup')}
          size="lg"
          className="mt-4"
        >
          Ir a iniciar sesión
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/95 backdrop-blur">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Crear post
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
            title="Cerrar"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
              dismissible
            />
          )}

          {/* User Info */}
          <div className="flex items-center gap-4">
            <AvatarBase
              src={user.user_metadata?.avatar_url}
              alt={user.email}
              size="md"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {user.user_metadata?.username || user.email?.split('@')[0]}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Público
              </p>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¿Qué está pasando?!"
            maxLength={500}
            className="w-full p-4 text-lg border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none resize-none"
            rows={6}
          />

          {/* Character Count */}
          <div className="flex justify-between items-center">
            <div />
            <span className={`text-sm font-semibold ${
              content.length > 450
                ? 'text-red-500 dark:text-red-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {content.length}/500
            </span>
          </div>

          {/* Image Preview */}
          {previewImage && (
            <div className="relative rounded-lg overflow-hidden border-2 border-blue-500">
              <img
                src={previewImage}
                alt="preview"
                className="w-full h-64 object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImageUrl('')
                  setPreviewImage(null)
                }}
                className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-black rounded-full transition text-white"
                title="Remover imagen"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-800" />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <label
                htmlFor="image-input"
                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full text-blue-500 dark:text-blue-400 cursor-pointer transition"
                title="Agregar imagen"
              >
                <Image size={20} />
              </label>
              <input
                id="image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="md"
                isLoading={loading}
                disabled={loading || (!content.trim() && !imageUrl)}
                icon={Send}
              >
                Publicar
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
