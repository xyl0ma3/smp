import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Button from '../components/base/Button'

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Política de Privacidad</h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">1. Introducción</h2>
            <p>
              En SMP ("nosotros", "nuestro" o "nos"), respetamos la privacidad de nuestros usuarios. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos tu información cuando utilizas nuestro sitio web y servicio.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. Información que Recopilamos</h2>
            <p>Podemos recopilar información sobre ti de varias maneras, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Información que proporcionas directamente:</strong> Nombre, correo electrónico, nombre de usuario, fotografía de perfil, biografía y contenido que publicas.</li>
              <li><strong>Información automática:</strong> Dirección IP, tipo de navegador, páginas visitadas, tiempo en el sitio y dispositivo utilizado.</li>
              <li><strong>Información de terceros:</strong> Datos de proveedores de autenticación (si los utilizas).</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">3. Cómo Usamos Tu Información</h2>
            <p>Utilizamos la información recopilada para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proporcionar, mantener y mejorar nuestro servicio</li>
              <li>Procesar transacciones y enviar información relacionada</li>
              <li>Enviar notificaciones, actualizaciones y comunicaciones</li>
              <li>Responder a tus consultas y solicitudes de soporte</li>
              <li>Cumplir con obligaciones legales</li>
              <li>Prevenir fraude y actividad maliciosa</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. Seguridad de Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger tu información personal. Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5. Tu Privacidad y Derechos</h2>
            <p>Tienes derecho a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acceder a tu información personal</li>
              <li>Corregir información inexacta</li>
              <li>Solicitar la eliminación de tu cuenta y datos</li>
              <li>Retirar tu consentimiento en cualquier momento</li>
              <li>Optar por no recibir comunicaciones de marketing</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">6. Cookies</h2>
            <p>
              Utilizamos cookies para mejorar tu experiencia. Puedes configurar tu navegador para rechazar cookies, pero algunas características del sitio pueden no funcionar correctamente.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">7. Enlaces Externos</h2>
            <p>
              Nuestro sitio puede contener enlaces a sitios web de terceros. No somos responsables de sus políticas de privacidad. Te recomendamos que leas sus políticas antes de proporcionar información personal.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">8. Cambios a Esta Política</h2>
            <p>
              Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier momento. Los cambios serán efectivos cuando se publiquen en el sitio.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">9. Contacto</h2>
            <p>
              Si tienes preguntas sobre esta Política de Privacidad, por favor contacta con nosotros en{' '}
              <a href="mailto:privacy@smp.social" className="text-blue-600 dark:text-blue-400 hover:underline">
                privacy@smp.social
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
