import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Button from '../components/base/Button'

export default function TermsOfService() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Términos de Servicio</h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">1. Aceptación de Términos</h2>
            <p>
              Al acceder y utilizar SMP, aceptas estar vinculado por estos Términos de Servicio. Si no estás de acuerdo con alguna parte de estos términos, no puedes utilizar el servicio.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. Descripción del Servicio</h2>
            <p>
              SMP es una plataforma de red social que permite a los usuarios crear, compartir y interactuar con contenido. El servicio incluye funciones como publicación de posts, seguimiento de usuarios, reacciones y mensajería directa.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">3. Requisitos de Usuario</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Debes tener al menos 13 años para usar SMP</li>
              <li>Eres responsable de mantener la confidencialidad de tu contraseña</li>
              <li>Aceptas proporcionar información precisa y completa durante el registro</li>
              <li>Eres responsable de toda la actividad bajo tu cuenta</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. Contenido del Usuario</h2>
            <p>
              Al publicar contenido en SMP, garantizas que:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tienes derechos para usar el contenido</li>
              <li>El contenido no infringe derechos de terceros</li>
              <li>El contenido no es ilegal, difamatorio o dañino</li>
              <li>Otorgas a SMP una licencia para usar, reproducir y distribuir el contenido</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5. Comportamiento Prohibido</h2>
            <p>No puedes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Publicar contenido ilegal, obsceno o abusivo</li>
              <li>Acosar, amenazar o discriminar a otros usuarios</li>
              <li>Intentar acceder no autorizado a cuentas o sistemas</li>
              <li>Usar la plataforma para spam o phishing</li>
              <li>Infringir derechos de propiedad intelectual</li>
              <li>Usar bots automatizados sin autorización</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">6. Moderación y Suspensión</h2>
            <p>
              Nos reservamos el derecho de moderar, editar o eliminar contenido, y suspender o terminar cuentas que violen estos términos. Las decisiones de moderación se tomarán a nuestra discreción.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">7. Limitación de Responsabilidad</h2>
            <p>
              SMP se proporciona "tal cual" sin garantías de ningún tipo. No somos responsables por:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pérdida de datos o contenido</li>
              <li>Interrupciones del servicio</li>
              <li>Daños causados por virus o malware</li>
              <li>Acciones de otros usuarios</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">8. Cambios a los Términos</h2>
            <p>
              Nos reservamos el derecho de modificar estos Términos en cualquier momento. Continuando el uso del servicio después de cambios, aceptas los nuevos términos.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">9. Terminación</h2>
            <p>
              Podemos terminar tu acceso al servicio sin previo aviso si violas estos términos. También puedes eliminar tu cuenta en cualquier momento.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">10. Contacto</h2>
            <p>
              Para preguntas sobre estos Términos, contacta con nosotros en{' '}
              <a href="mailto:legal@smp.social" className="text-blue-600 dark:text-blue-400 hover:underline">
                legal@smp.social
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
