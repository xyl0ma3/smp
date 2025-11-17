import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Heart, MessageSquare, Users, Zap, Shield, Sparkles } from 'lucide-react'
import { Button } from '../components/base'
import useAuth from '../hooks/useAuth'

/**
 * Landing Page V2 - Rediseñada con mejor UX
 */
export default function LandingPageV2() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const features = [
    {
      icon: Heart,
      title: 'Conecta con otros',
      description: 'Sigue a tus usuarios favoritos y descubre nuevo contenido cada día.'
    },
    {
      icon: MessageSquare,
      title: 'Comparte tus ideas',
      description: 'Publica fotos, videos y texto. Expresa tu creatividad sin límites.'
    },
    {
      icon: Users,
      title: 'Comunidad activa',
      description: 'Únete a miles de usuarios compartiendo sus pasiones e intereses.'
    },
    {
      icon: Zap,
      title: 'Reacciones en tiempo real',
      description: 'Recibe notificaciones instantáneas de tus seguidores y amigos.'
    },
    {
      icon: Shield,
      title: 'Privacidad garantizada',
      description: 'Controla completamente quién ve tu contenido y tus datos.'
    },
    {
      icon: Sparkles,
      title: 'Experiencia fluida',
      description: 'Interfaz limpia, rápida y optimizada para todos los dispositivos.'
    }
  ]

  return (
    <>
      {/* Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800">
        <div className="container-center h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/Octocat.png" alt="logo" className="h-8 w-auto" />
            <span className="font-bold text-lg text-gray-900 dark:text-white">SMP</span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" onClick={() => navigate('/feed')}>
                  Ir al feed
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/signup')}>
                  Iniciar sesión
                </Button>
                <Button onClick={() => navigate('/signup')}>
                  Registrarse
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-b from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-black px-4 py-20">
        <div className="container-center max-w-5xl">
          <div className="flex flex-col items-center text-center gap-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              <Sparkles size={16} />
              <span className="text-sm font-semibold">Bienvenido a la red social del futuro</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-gray-900 dark:text-white">Conecta. </span>
              <span className="text-gray-900 dark:text-white">Comparte. </span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                Descubre.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
              Una red social moderna y limpia donde puedes compartir ideas, conectar con otros usuarios y descubrir contenido que realmente te importa.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              {user ? (
                <Button
                  size="lg"
                  onClick={() => navigate('/feed')}
                  className="gap-2"
                >
                  Ir al feed
                  <ArrowRight size={20} />
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={() => navigate('/signup')}
                    className="gap-2"
                  >
                    Comenzar ahora
                    <ArrowRight size={20} />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/search')}
                  >
                    Explorar público
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 border-t border-gray-200 dark:border-gray-800 mt-12 w-full">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">1000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Usuarios activos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">5000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Posts diarios</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Gratis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="container-center max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Características principales
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Todo lo que necesitas para conectar con tu comunidad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-8 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg dark:hover:shadow-blue-900/20 transition-all duration-300 bg-gray-50 dark:bg-gray-900/50"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <feature.icon className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900">
        <div className="container-center max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para unirte a la comunidad?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Crea tu cuenta gratis ahora y comienza a compartir tus ideas con el mundo.
          </p>
          {!user && (
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate('/signup')}
              className="bg-white text-blue-600 hover:bg-blue-50 gap-2"
            >
              Crear cuenta gratis
              <ArrowRight size={20} />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-300 py-12 border-t border-gray-800">
        <div className="container-center max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Características</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Seguridad</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Compañía</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition">Términos</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Redes</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition">Discord</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 SMP. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
