import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Button from '../components/base/Button'

export default function CookiePolicy() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Política de Cookies</h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">1. ¿Qué son las Cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Nos ayudan a mejorar tu experiencia y reconocerte en futuras visitas.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. Tipos de Cookies que Usamos</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong>Cookies Esenciales:</strong> Necesarias para que el sitio funcione correctamente. Incluyen autenticación y seguridad.
              </li>
              <li>
                <strong>Cookies de Preferencia:</strong> Recuerdan tus preferencias, como idioma y tema (claro/oscuro).
              </li>
              <li>
                <strong>Cookies de Análisis:</strong> Nos ayudan a entender cómo usas el sitio mediante Google Analytics y similares.
              </li>
              <li>
                <strong>Cookies de Marketing:</strong> Utilizadas para mostrar anuncios relevantes y rastrear campañas.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">3. Control de Cookies</h2>
            <p>
              Puedes controlar las cookies en tu navegador:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Chrome: Configuración → Privacidad y seguridad → Cookies</li>
              <li>Firefox: Opciones → Privacidad → Cookies</li>
              <li>Safari: Preferencias → Privacidad → Cookies</li>
              <li>Edge: Configuración → Privacidad → Cookies</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. Cookies de Terceros</h2>
            <p>
              Algunos servicios de terceros (como Google Analytics) pueden establecer sus propias cookies. Revisamos regularmente estas políticas y las incluimos en nuestra política de privacidad.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5. Duración de las Cookies</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cookies de Sesión:</strong> Se eliminan cuando cierras el navegador</li>
              <li><strong>Cookies Persistentes:</strong> Se almacenan por un período específico o hasta que las elimines</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">6. Rechazo de Cookies</h2>
            <p>
              Si rechazas cookies no esenciales, algunas características del sitio pueden no funcionar correctamente. Tu experiencia puede ser limitada.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">7. Cambios a Esta Política</h2>
            <p>
              Podemos actualizar esta Política de Cookies en cualquier momento. Los cambios serán publicados en esta página.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">8. Contacto</h2>
            <p>
              Si tienes preguntas sobre nuestra uso de cookies, por favor contacta con nosotros en{' '}
              <a href="mailto:cookies@smp.social" className="text-blue-600 dark:text-blue-400 hover:underline">
                cookies@smp.social
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
