import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Bot, Brain, MessageSquare, Sparkles, Zap, Shield, HelpCircle, CheckCircle, XCircle } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Como Funciona el DM con IA en RolHub | Guia Completa',
  description: 'Entiende como funciona el Director de Juego con inteligencia artificial. Que puede hacer, sus limites, y como sacarle el maximo provecho.',
  keywords: [
    'DM inteligencia artificial',
    'game master IA',
    'rol con IA',
    'Claude DM',
    'narrador automatico',
    'RolHub DM'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/dm-ia',
  },
  openGraph: {
    title: 'Como Funciona el DM con IA en RolHub | RolHub',
    description: 'Todo sobre el Director de Juego con inteligencia artificial.',
    type: 'article',
    publishedTime: '2024-01-15',
    authors: ['RolHub'],
  },
}

const capabilities = [
  {
    title: 'Narrar historias adaptativas',
    icon: MessageSquare,
    description: 'El DM crea narraciones que responden a tus decisiones. Cada partida es unica porque la historia se adapta a lo que vos elegis hacer.',
  },
  {
    title: 'Controlar todos los NPCs',
    icon: Bot,
    description: 'Desde el tabernero amigable hasta el villano principal, el DM da vida a todos los personajes no jugadores con personalidades consistentes.',
  },
  {
    title: 'Recordar el contexto',
    icon: Brain,
    description: 'El DM recuerda lo que paso antes en la sesion y en sesiones anteriores. Tus decisiones tienen consecuencias a largo plazo.',
  },
  {
    title: 'Aplicar reglas automaticamente',
    icon: Shield,
    description: 'Segun el motor que elegiste (Story Mode, PbtA, etc.), el DM sabe cuando pedir tiradas y como interpretar los resultados.',
  },
  {
    title: 'Generar contenido',
    icon: Sparkles,
    description: 'Descripciones de lugares, dialogos de NPCs, consecuencias de acciones — todo generado en tiempo real.',
  },
  {
    title: 'Adaptarse a tu estilo',
    icon: Zap,
    description: 'Si preferis accion, te da accion. Si te gusta el misterio, construye intriga. El DM se adapta a como juegas.',
  },
]

const canDo = [
  'Narrar cualquier tipo de escena (accion, drama, comedia, horror)',
  'Crear NPCs con personalidades unicas sobre la marcha',
  'Recordar detalles de sesiones anteriores',
  'Adaptar la dificultad segun como juegues',
  'Ofrecer multiples opciones de accion',
  'Describir consecuencias coherentes con el mundo',
  'Manejar combate, dialogo y exploracion',
  'Generar descripciones detalladas de lugares',
  'Trackear tu inventario, stats y condiciones',
  'Improvisar cuando haces algo inesperado',
]

const cantDo = [
  'Mostrar imagenes o mapas (por ahora)',
  'Reproducir audio o musica',
  'Recordar cosas de otras campanas (son independientes)',
  'Actuar fuera del lore establecido',
  'Darte ventajas injustas solo porque las pedis',
  'Predecir exactamente que va a pasar',
]

const tips = [
  {
    title: 'Se especifico en tus acciones',
    description: 'Cuanto mas detalle des, mejor respuesta obtenes. "Examino la puerta buscando trampas" es mejor que "miro la puerta".',
  },
  {
    title: 'Pregunta sobre el entorno',
    description: 'El DM sabe mas de lo que dice inicialmente. Preguntas como "hay algo util en la habitacion?" pueden revelar opciones.',
  },
  {
    title: 'Usa la accion libre',
    description: 'No te limites a las opciones sugeridas. Podes escribir cualquier accion que imagines.',
  },
  {
    title: 'Roleplay con los NPCs',
    description: 'Habla directamente con los personajes. "Le digo al guardia: Escucha, ambos sabemos que esto es una perdida de tiempo" funciona.',
  },
  {
    title: 'Acepta las consecuencias',
    description: 'El DM no va a revertir resultados porque no te gustaron. Eso es parte de la experiencia.',
  },
  {
    title: 'Aprovecha tu backstory',
    description: 'Menciona elementos del trasfondo de tu personaje. El DM puede incorporarlos a la narrativa.',
  },
]

export default function DMIAPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link
          href="/guias"
          className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Guias
        </Link>
      </nav>

      {/* Hero */}
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-emerald px-2 py-1 rounded">
            Plataforma
          </span>
          <span className="text-xs font-ui font-semibold text-parchment">
            7 min lectura
          </span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold">
            <Bot className="h-8 w-8 text-shadow" />
          </div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Como Funciona el DM con IA
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          En RolHub, el Director de Juego es una inteligencia artificial.
          Esto significa que podes jugar cuando quieras, sin necesidad de coordinar
          con otras personas. Pero, como funciona exactamente?
        </p>
      </header>

      {/* What is the AI DM */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Que es el DM con IA?
        </h2>

        <div className="font-body text-parchment space-y-4 text-lg leading-relaxed">
          <p>
            El DM de RolHub esta impulsado por <strong className="text-gold-bright">Claude</strong>,
            un modelo de lenguaje avanzado de Anthropic. Pero no es solo una IA generica —
            esta entrenado especificamente para ser un excelente Director de Juego.
          </p>

          <ParchmentPanel className="p-6 border border-gold-dim">
            <h3 className="font-heading text-lg text-ink mb-3">Lo que lo hace especial</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-ink">
                <span className="text-gold-bright font-bold">•</span>
                <span><strong>Conoce las reglas</strong> de cada motor de juego (Story Mode, PbtA, Year Zero, D&D)</span>
              </li>
              <li className="flex items-start gap-2 text-ink">
                <span className="text-gold-bright font-bold">•</span>
                <span><strong>Entiende cada lore</strong> profundamente (Tierra Media, Zombies, Isekai, Vikingos)</span>
              </li>
              <li className="flex items-start gap-2 text-ink">
                <span className="text-gold-bright font-bold">•</span>
                <span><strong>Sabe improvisar</strong> cuando haces algo inesperado</span>
              </li>
              <li className="flex items-start gap-2 text-ink">
                <span className="text-gold-bright font-bold">•</span>
                <span><strong>Mantiene coherencia</strong> a lo largo de toda la campana</span>
              </li>
            </ul>
          </ParchmentPanel>
        </div>
      </section>

      {/* Capabilities */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Que Puede Hacer
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {capabilities.map((cap) => (
            <ParchmentPanel key={cap.title} className="p-5 border border-gold-dim">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gold-dim">
                  <cap.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-ink mb-1">{cap.title}</h3>
                  <p className="font-body text-ink text-sm">{cap.description}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      {/* Can Do / Can't Do */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Capacidades y Limites
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <ParchmentPanel className="p-6 border border-emerald">
            <h3 className="font-heading text-emerald mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" /> Puede
            </h3>
            <ul className="space-y-2">
              {canDo.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-ink text-sm">
                  <span className="text-emerald font-bold mt-0.5">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ParchmentPanel>

          <ParchmentPanel className="p-6 border border-blood">
            <h3 className="font-heading text-blood mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5" /> No Puede (por ahora)
            </h3>
            <ul className="space-y-2">
              {cantDo.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-ink text-sm">
                  <span className="text-blood font-bold mt-0.5">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ParchmentPanel>
        </div>
      </section>

      {/* How It Works Under the Hood */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Como Funciona por Dentro
        </h2>

        <div className="font-body text-parchment space-y-4 text-lg leading-relaxed">
          <ParchmentPanel className="p-6 border border-gold-dim">
            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="font-heading text-2xl text-gold-bright">1</span>
                <div>
                  <h3 className="font-heading text-ink mb-1">Vos escribis tu accion</h3>
                  <p className="font-body text-ink text-base">
                    "Intento convencer al guardia de que me deje pasar"
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="font-heading text-2xl text-gold-bright">2</span>
                <div>
                  <h3 className="font-heading text-ink mb-1">El sistema prepara el contexto</h3>
                  <p className="font-body text-ink text-base">
                    Se le envia al DM: tu personaje, el lore, lo que paso antes, el motor de reglas, tu accion.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="font-heading text-2xl text-gold-bright">3</span>
                <div>
                  <h3 className="font-heading text-ink mb-1">El DM genera la respuesta</h3>
                  <p className="font-body text-ink text-base">
                    Evalua si necesita tirada, determina el resultado, y narra las consecuencias.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="font-heading text-2xl text-gold-bright">4</span>
                <div>
                  <h3 className="font-heading text-ink mb-1">Se actualiza el estado del mundo</h3>
                  <p className="font-body text-ink text-base">
                    Tu inventario, relaciones con NPCs, estado de quests — todo se actualiza automaticamente.
                  </p>
                </div>
              </div>
            </div>
          </ParchmentPanel>
        </div>
      </section>

      {/* Tips */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Consejos para Sacarle el Maximo
        </h2>

        <div className="space-y-3">
          {tips.map((tip) => (
            <ParchmentPanel key={tip.title} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{tip.title}</h4>
              <p className="font-body text-ink text-base">{tip.description}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <HelpCircle className="h-6 w-6" />
          Preguntas Frecuentes
        </h2>

        <div className="space-y-4">
          {[
            {
              q: 'El DM puede hacer trampa o favorecerme?',
              a: 'No. El DM sigue las reglas del motor elegido consistentemente. No va a darte ventajas injustas ni castigarte arbitrariamente.',
            },
            {
              q: 'Puedo pedirle que cambie algo que no me gusto?',
              a: 'Podes intentar influenciar la historia con tus acciones, pero el DM no va a revertir consecuencias ya narradas.',
            },
            {
              q: 'Se acuerda de partidas anteriores?',
              a: 'Se acuerda de todo lo que paso en la campana actual. Cada campana es independiente.',
            },
            {
              q: 'Puedo jugar cosas que el DM no espera?',
              a: 'Si! El DM esta entrenado para improvisar. Sorprendelo.',
            },
            {
              q: 'Y si dice algo que no tiene sentido?',
              a: 'Puede pasar muy ocasionalmente. Segui jugando y la historia se va a acomodar.',
            },
          ].map((faq) => (
            <ParchmentPanel key={faq.q} className="p-5 border border-gold-dim">
              <h4 className="font-heading text-ink mb-2">{faq.q}</h4>
              <p className="font-body text-ink">{faq.a}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16">
        <ParchmentPanel variant="ornate" className="p-8 text-center border-2 border-gold">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Listo para Conocer al DM?
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            La mejor forma de entender como funciona es jugando.
            El DM te esta esperando.
          </p>
          <Link
            href="/onboarding"
            className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold"
          >
            Empezar a Jugar
          </Link>
        </ParchmentPanel>
      </section>

      {/* Navigation */}
      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link
            href="/guias"
            className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui"
          >
            <ArrowLeft className="h-4 w-4" />
            Todas las Guias
          </Link>
          <Link
            href="/guias/como-jugar"
            className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold"
          >
            Siguiente: Como Jugar
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
            "@type": "Article",
            "headline": "Como Funciona el DM con IA en RolHub",
            "description": "Guia completa sobre el Director de Juego con inteligencia artificial en RolHub.",
            "author": {
              "@type": "Organization",
              "name": "RolHub"
            },
            "publisher": {
              "@type": "Organization",
              "name": "RolHub",
              "url": "https://rol-hub.com"
            },
            "datePublished": "2024-01-15",
            "dateModified": new Date().toISOString().split('T')[0],
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://rol-hub.com/guias/dm-ia"
            }
          })
        }}
      />
    </article>
  )
}
