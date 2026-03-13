import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Users, MessageSquare, Heart, Lightbulb, Theater, Handshake, Clock, Sparkles } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Como Ser un Buen Jugador de Rol: 10 Consejos Esenciales | RolHub',
  description: 'Aprende a ser mejor jugador de rol. Consejos para roleplay, trabajo en equipo, y como hacer que la experiencia sea memorable para todos.',
  keywords: [
    'como ser buen jugador rol',
    'consejos roleplay',
    'etiqueta juegos de rol',
    'mejorar en D&D',
    'roleplay tips',
    'jugador de rol principiante'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/ser-buen-jugador',
  },
  openGraph: {
    title: 'Como Ser un Buen Jugador de Rol | RolHub',
    description: '10 consejos esenciales para ser mejor jugador y hacer la experiencia memorable.',
    type: 'article',
    publishedTime: '2024-01-15',
    authors: ['RolHub'],
  },
}

const tips = [
  {
    number: 1,
    title: 'Escucha activamente',
    icon: MessageSquare,
    description: 'El rol es una conversacion. Presta atencion a lo que narra el DM y construye sobre eso.',
    dos: [
      'Reacciona a los detalles de la narracion',
      'Hace preguntas sobre la escena',
      'Recorda lo que paso antes y referencialo',
    ],
    donts: [
      'Ignorar la narracion para planear tu turno',
      'Preguntar "que paso?" porque no prestaste atencion',
    ],
  },
  {
    number: 2,
    title: 'Di "si, y..."',
    icon: Sparkles,
    description: 'En vez de bloquear ideas, construi sobre ellas. Acepta lo que proponen y agrega algo.',
    dos: [
      '"Buena idea, y ademas podriamos..."',
      'Seguir el hilo de la historia que se va armando',
      'Aceptar giros inesperados como oportunidades',
    ],
    donts: [
      '"No, mi personaje nunca haria eso"',
      'Rechazar ideas solo porque no fueron tuyas',
    ],
  },
  {
    number: 3,
    title: 'Deja brillar a otros',
    icon: Users,
    description: 'No acapares el protagonismo. Dale espacio a los demas para que tengan sus momentos.',
    dos: [
      'Preguntarle a otro personaje su opinion',
      'Dejar que alguien mas lidere una escena',
      'Celebrar los exitos de los demas',
    ],
    donts: [
      'Interrumpir cuando otro esta hablando',
      'Resolver todo vos solo sin consultar',
    ],
  },
  {
    number: 4,
    title: 'Acepta el fracaso',
    icon: Heart,
    description: 'Los fallos crean las mejores historias. No te frustres cuando las cosas salen mal.',
    dos: [
      'Roleplay las consecuencias del fallo',
      'Reir de las pifias y momentos ridiculos',
      'Ver el fallo como un giro dramatico',
    ],
    donts: [
      'Enojarte cuando tiras mal',
      'Buscar excusas para evitar consecuencias',
    ],
  },
  {
    number: 5,
    title: 'Conoce a tu personaje',
    icon: Theater,
    description: 'Pensa en quien es tu personaje mas alla de sus stats. Motivaciones, miedos, quirks.',
    dos: [
      'Darle una voz o forma de hablar distintiva',
      'Tomar decisiones basadas en su personalidad',
      'Dejarlo crecer y cambiar con la historia',
    ],
    donts: [
      'Actuar siempre de forma optima ignorando el personaje',
      'Cambiar de personalidad segun te convenga',
    ],
  },
  {
    number: 6,
    title: 'Colabora, no compitas',
    icon: Handshake,
    description: 'El objetivo es crear una buena historia juntos, no "ganar" ni ser el mejor.',
    dos: [
      'Ayudar a otros personajes aunque no te beneficie',
      'Compartir recursos e informacion',
      'Buscar soluciones que involucren a todos',
    ],
    donts: [
      'Robarle items o gloria a otros jugadores',
      'Sabotear planes para destacar vos',
    ],
  },
  {
    number: 7,
    title: 'Describe, no solo declares',
    icon: Lightbulb,
    description: 'En vez de decir "ataco", describe COMO atacas. Los detalles hacen la diferencia.',
    dos: [
      '"Giro mi espada en un arco ascendente hacia su cuello"',
      'Describir emociones y reacciones de tu personaje',
      'Agregar detalles sensoriales cuando actuas',
    ],
    donts: [
      '"Uso mi habilidad" sin contexto',
      'Solo decir numeros y mecanicas',
    ],
  },
  {
    number: 8,
    title: 'Toma riesgos',
    icon: Sparkles,
    description: 'Las decisiones seguras son aburridas. Arriesgate, aunque pueda salir mal.',
    dos: [
      'Intentar cosas locas de vez en cuando',
      'Poner a tu personaje en situaciones dificiles',
      'Seguir un plan aunque sea arriesgado',
    ],
    donts: [
      'Siempre elegir la opcion mas segura',
      'Evitar conflicto a toda costa',
    ],
  },
  {
    number: 9,
    title: 'Respeta el tono',
    icon: Theater,
    description: 'Si la escena es seria, no la arruines con chistes. Lee el ambiente.',
    dos: [
      'Adaptar tu energia al momento',
      'Dejar que los momentos dramaticos respiren',
      'Saber cuando es momento de humor y cuando no',
    ],
    donts: [
      'Hacer chistes en momentos emotivos',
      'Romper la inmersion constantemente',
    ],
  },
  {
    number: 10,
    title: 'Divertite',
    icon: Heart,
    description: 'Al final del dia, es un juego. Si vos te divertis, probablemente los demas tambien.',
    dos: [
      'Relajarte y disfrutar el proceso',
      'No tomarte todo demasiado en serio',
      'Recordar que es ficcion y experimentar',
    ],
    donts: [
      'Estresarte por jugar "perfecto"',
      'Olvidar que el objetivo es pasarla bien',
    ],
  },
]

export default function SerBuenJugadorPage() {
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
          <span className="text-xs font-ui font-bold text-white bg-gold-dim px-2 py-1 rounded">
            Intermedio
          </span>
          <span className="text-xs font-ui font-semibold text-parchment">
            10 min lectura
          </span>
        </div>
        <h1 className="font-title text-3xl md:text-4xl text-gold-bright mb-4">
          Como Ser un Buen Jugador
        </h1>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Ser buen jugador no es tirar bien los dados — es hacer que la experiencia
          sea memorable para todos. Estos 10 consejos te van a convertir en el tipo
          de jugador que todos quieren en su mesa.
        </p>
      </header>

      {/* Intro */}
      <section className="mb-12">
        <ParchmentPanel className="p-6 border border-gold-dim">
          <h2 className="font-heading text-lg text-ink mb-3">La Verdad sobre Ser Buen Jugador</h2>
          <p className="font-body text-ink leading-relaxed">
            Un buen jugador no es necesariamente el que mejor conoce las reglas
            o el que tiene las mejores stats. Es el que <strong>hace que todos la pasen bien</strong>,
            incluyendose a si mismo. El rol es colaborativo — tu objetivo es crear
            una historia memorable junto con los demas.
          </p>
        </ParchmentPanel>
      </section>

      {/* Tips */}
      <div className="space-y-8">
        {tips.map((tip) => (
          <section key={tip.number} id={`tip-${tip.number}`}>
            <ParchmentPanel className="p-6 border border-gold-dim">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold flex items-center justify-center">
                  <span className="font-heading text-xl text-shadow font-bold">{tip.number}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <tip.icon className="h-5 w-5 text-gold-dim" />
                    <h2 className="font-heading text-xl text-ink">{tip.title}</h2>
                  </div>
                  <p className="font-body text-ink text-lg">{tip.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-emerald/10 rounded-lg border border-emerald/30">
                  <h4 className="font-heading text-emerald mb-2 text-sm">Hace esto</h4>
                  <ul className="space-y-1">
                    {tip.dos.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-ink text-sm">
                        <span className="text-emerald font-bold">+</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-blood/10 rounded-lg border border-blood/30">
                  <h4 className="font-heading text-blood mb-2 text-sm">Evita esto</h4>
                  <ul className="space-y-1">
                    {tip.donts.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-ink text-sm">
                        <span className="text-blood font-bold">-</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ParchmentPanel>
          </section>
        ))}
      </div>

      {/* Summary */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Resumen: El Buen Jugador...
        </h2>

        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Escucha mas de lo que habla',
              'Construye sobre las ideas de otros',
              'Deja que todos tengan su momento',
              'Abraza el fracaso como parte de la historia',
              'Conoce a su personaje profundamente',
              'Colabora en vez de competir',
              'Describe sus acciones con detalle',
              'Toma riesgos interesantes',
              'Respeta el tono de la escena',
              'Nunca olvida que es para divertirse',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-gold-bright font-bold">✓</span>
                <span className="font-body text-ink">{item}</span>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      {/* CTA */}
      <section className="mt-16">
        <ParchmentPanel variant="ornate" className="p-8 text-center border-2 border-gold">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Listo para Ser Ese Jugador?
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            La mejor forma de mejorar es practicando. Empeza una partida
            y aplica estos consejos. Vas a ver la diferencia.
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
            href="/guias/roleplay-101"
            className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold"
          >
            Siguiente: Roleplay 101
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
            "headline": "Como Ser un Buen Jugador de Rol: 10 Consejos Esenciales",
            "description": "Aprende a ser mejor jugador de rol con estos 10 consejos esenciales.",
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
              "@id": "https://rol-hub.com/guias/ser-buen-jugador"
            }
          })
        }}
      />
    </article>
  )
}
