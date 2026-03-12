import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Play, UserPlus, Map, MessageSquare, Sparkles, Volume2 } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Como Jugar en RolHub | Tutorial Paso a Paso',
  description: 'Aprende a jugar tu primera partida de rol en RolHub. Tutorial completo desde crear tu cuenta hasta completar tu primera mision con el DM de inteligencia artificial.',
  keywords: ['como jugar rolhub', 'tutorial rpg online', 'juego de rol con IA', 'DM inteligencia artificial', 'primera partida rol'],
  alternates: {
    canonical: 'https://rol-hub.com/guias/como-jugar',
  },
  openGraph: {
    title: 'Como Jugar en RolHub | Tutorial Paso a Paso',
    description: 'Aprende a jugar tu primera partida de rol en RolHub en 5 minutos.',
    type: 'article',
    publishedTime: '2024-01-15',
    authors: ['RolHub'],
  },
}

const steps = [
  {
    number: 1,
    title: 'Crea tu Cuenta',
    icon: UserPlus,
    time: '30 segundos',
    description: 'Registrate gratis con tu email o cuenta de Google.',
    details: [
      'Ve a rol-hub.com y haz clic en "Empezar a Jugar"',
      'Ingresa tu email y crea una contrasena',
      'Confirma tu cuenta desde el email que recibiras',
      'Listo! Ya puedes empezar tu aventura',
    ],
  },
  {
    number: 2,
    title: 'Elige tu Mundo',
    icon: Map,
    time: '30 segundos',
    description: 'Selecciona el universo donde quieres jugar.',
    details: [
      'Fantasia epica estilo Tierra Media',
      'Apocalipsis zombie con supervivencia',
      'Isekai anime con poderes especiales',
      'Vikingos y mitologia nordica',
    ],
  },
  {
    number: 3,
    title: 'Crea tu Personaje',
    icon: Sparkles,
    time: '2 minutos',
    description: 'Dale vida a tu alter ego en el mundo elegido.',
    details: [
      'Elige entre 3 arquetipos predefinidos',
      'Personaliza el nombre y apariencia',
      'Lee la breve historia de trasfondo',
      'El sistema genera el resto automaticamente',
    ],
  },
  {
    number: 4,
    title: 'Empieza a Jugar',
    icon: Play,
    time: 'Ilimitado',
    description: 'El DM narra tu historia y tu decides que hacer.',
    details: [
      'Lee la narracion del Director de Juego (DM)',
      'Elige entre las opciones sugeridas o escribe tu propia accion',
      'Observa como la historia reacciona a tus decisiones',
      'Continua la aventura a tu ritmo',
    ],
  },
]

export default function ComoJugarPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link
          href="/guias"
          className="inline-flex items-center gap-2 text-gold hover:text-gold-bright transition-colors font-ui"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Guias
        </Link>
      </nav>

      {/* Hero */}
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui text-emerald bg-emerald/20 px-2 py-0.5 rounded">
            Principiante
          </span>
          <span className="text-xs font-ui text-parchment/50">
            5 min lectura
          </span>
        </div>
        <h1 className="font-title text-3xl md:text-4xl text-gold mb-4">
          Como Jugar en RolHub
        </h1>
        <p className="font-body text-xl text-parchment/80 leading-relaxed">
          En menos de 5 minutos estaras viviendo tu primera aventura.
          Este tutorial te guia paso a paso desde cero.
        </p>
      </header>

      {/* Quick Summary */}
      <ParchmentPanel className="p-6 mb-12">
        <h2 className="font-heading text-lg text-gold-dim mb-4">Resumen Rapido</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-10 h-10 rounded-full bg-gold-dim/20 flex items-center justify-center mx-auto mb-2">
                <span className="font-heading text-gold-dim">{step.number}</span>
              </div>
              <p className="font-ui text-sm text-ink/80">{step.title}</p>
              <p className="font-ui text-xs text-ink/50">{step.time}</p>
            </div>
          ))}
        </div>
      </ParchmentPanel>

      {/* Content */}
      <div className="space-y-12">

        {/* Steps */}
        {steps.map((step, index) => (
          <section key={step.number} className="relative">
            {/* Connection line */}
            {index < steps.length - 1 && (
              <div className="absolute left-6 top-16 bottom-0 w-px bg-gold/20 hidden md:block" />
            )}

            <div className="flex gap-6">
              {/* Step number */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
                  <step.icon className="h-5 w-5 text-gold" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="font-heading text-xl text-gold">
                    Paso {step.number}: {step.title}
                  </h2>
                  <span className="text-xs font-ui text-parchment/50 bg-shadow-mid px-2 py-1 rounded">
                    {step.time}
                  </span>
                </div>

                <p className="font-body text-lg text-parchment/90 mb-4">
                  {step.description}
                </p>

                <ParchmentPanel className="p-4">
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-gold-dim mt-1">•</span>
                        <span className="font-body text-ink/80">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </ParchmentPanel>
              </div>
            </div>
          </section>
        ))}

        {/* During the Game */}
        <section className="mt-16">
          <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-3">
            <MessageSquare className="h-6 w-6" />
            Durante la Partida
          </h2>

          <div className="font-body text-parchment/90 space-y-6 text-lg leading-relaxed">
            <p>
              Una vez que empieces, la pantalla de juego tiene todo lo que necesitas:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <ParchmentPanel className="p-5">
                <h3 className="font-heading text-lg text-gold-dim mb-3">Panel de Narracion</h3>
                <p className="font-body text-ink/80 text-base">
                  Aqui aparece todo lo que el DM te cuenta. Las descripciones de escenas,
                  dialogos de personajes, y consecuencias de tus acciones.
                </p>
              </ParchmentPanel>

              <ParchmentPanel className="p-5">
                <h3 className="font-heading text-lg text-gold-dim mb-3">Botones de Accion</h3>
                <p className="font-body text-ink/80 text-base">
                  Opciones sugeridas para continuar la historia.
                  Pero tambien puedes escribir cualquier accion que imagines.
                </p>
              </ParchmentPanel>

              <ParchmentPanel className="p-5">
                <h3 className="font-heading text-lg text-gold-dim mb-3">Tu Personaje</h3>
                <p className="font-body text-ink/80 text-base">
                  Panel lateral con tu vida, inventario y estado actual.
                  Se actualiza automaticamente segun la historia.
                </p>
              </ParchmentPanel>

              <ParchmentPanel className="p-5">
                <h3 className="font-heading text-lg text-gold-dim mb-3">Imagen de Escena</h3>
                <p className="font-body text-ink/80 text-base">
                  Ilustraciones generadas por IA que muestran los momentos clave
                  de tu aventura. Inmersion visual completa.
                </p>
              </ParchmentPanel>
            </div>
          </div>
        </section>

        {/* Voice Feature */}
        <section className="mt-12">
          <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-3">
            <Volume2 className="h-6 w-6" />
            Voz del Narrador
          </h2>

          <div className="font-body text-parchment/90 space-y-4 text-lg leading-relaxed">
            <p>
              Cada mundo tiene una voz unica para el DM. Puedes activar el audio
              para escuchar la narracion mientras juegas, como un audiolibro interactivo.
            </p>

            <ParchmentPanel className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-gold-dim/20">
                  <Volume2 className="h-6 w-6 text-gold-dim" />
                </div>
                <div>
                  <p className="font-heading text-ink mb-1">Tip</p>
                  <p className="font-body text-ink/70 text-base">
                    Usa audifonos para la mejor experiencia. El narrador tiene
                    diferentes tonos segun el mundo: epico en fantasia, tenso en zombies,
                    energetico en isekai.
                  </p>
                </div>
              </div>
            </ParchmentPanel>
          </div>
        </section>

        {/* Tips */}
        <section className="mt-12">
          <h2 className="font-heading text-2xl text-gold mb-6">
            Consejos para tu Primera Partida
          </h2>

          <div className="space-y-4">
            {[
              {
                title: 'No hay respuestas incorrectas',
                desc: 'Haz lo que tu personaje haria. No existe una forma "correcta" de jugar.',
              },
              {
                title: 'Se especifico',
                desc: 'En vez de "ataco", di "lanzo mi hacha al orco mas cercano apuntando a su pierna". Mas detalle = mejor narracion.',
              },
              {
                title: 'Acepta los fracasos',
                desc: 'Fallar no es perder. Los fracasos crean historias interesantes y giros inesperados.',
              },
              {
                title: 'Guarda tu progreso',
                desc: 'Puedes pausar en cualquier momento y continuar despues. Tu aventura queda guardada.',
              },
              {
                title: 'Experimenta',
                desc: 'Prueba diferentes mundos y personajes. Cada combinacion ofrece una experiencia distinta.',
              },
            ].map((tip) => (
              <ParchmentPanel key={tip.title} className="p-4">
                <h4 className="font-heading text-gold-dim mb-1">{tip.title}</h4>
                <p className="font-body text-ink/70 text-base">{tip.desc}</p>
              </ParchmentPanel>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16">
          <ParchmentPanel variant="ornate" className="p-8 text-center">
            <h2 className="font-heading text-2xl text-gold-dim mb-4">
              Listo para Empezar?
            </h2>
            <p className="font-body text-ink/80 mb-6 max-w-xl mx-auto">
              Ya sabes todo lo necesario. El resto lo aprenderas jugando.
              Tu primera aventura te espera.
            </p>
            <Link
              href="/onboarding"
              className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors"
            >
              Crear mi Personaje
            </Link>
          </ParchmentPanel>
        </section>

      </div>

      {/* Navigation */}
      <nav className="border-t border-gold/20 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link
            href="/guias/que-es-rol"
            className="flex items-center gap-2 text-parchment/60 hover:text-gold transition-colors font-ui"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior: Que es el Juego de Rol
          </Link>
          <Link
            href="/guias/crear-personaje"
            className="flex items-center gap-2 text-gold hover:text-gold-bright transition-colors font-ui"
          >
            Siguiente: Como Crear tu Personaje
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "Como Jugar en RolHub",
            "description": "Tutorial paso a paso para empezar tu primera partida de rol en RolHub",
            "totalTime": "PT5M",
            "step": steps.map((step, index) => ({
              "@type": "HowToStep",
              "position": index + 1,
              "name": step.title,
              "text": step.description,
              "itemListElement": step.details.map((detail, i) => ({
                "@type": "HowToDirection",
                "position": i + 1,
                "text": detail
              }))
            }))
          })
        }}
      />
    </article>
  )
}
