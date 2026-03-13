import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Flame, AlertTriangle, Heart, Sparkles, Clock, Target } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Como Crear Tension Dramatica en Rol: Guia | RolHub',
  description: 'Aprende a crear momentos dramaticos memorables. Toma riesgos, acepta fallos, y haz que cada decision importe.',
  keywords: [
    'tension dramatica rol',
    'crear drama D&D',
    'momentos epicos rol',
    'stakes en juegos de rol',
    'drama narrativo RPG'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/tension-dramatica',
  },
  openGraph: {
    title: 'Como Crear Tension Dramatica en Rol | RolHub',
    description: 'Haz que cada momento de tu partida sea memorable.',
    type: 'article',
    publishedTime: '2024-01-15',
    authors: ['RolHub'],
  },
}

const principles = [
  {
    title: 'Acepta el Fracaso',
    icon: AlertTriangle,
    description: 'Los fallos crean las mejores historias. Un heroe que siempre gana es aburrido.',
    example: 'Tu intento de convencer al rey fallo? Ahora tenes que encontrar otra forma de conseguir su ayuda, y eso crea una historia mas interesante.',
    tip: 'Cuando falles, preguntate: "Como puedo hacer este fallo interesante?" en vez de frustrarte.',
  },
  {
    title: 'Toma Riesgos',
    icon: Flame,
    description: 'La opcion segura es aburrida. La opcion arriesgada crea tension.',
    example: 'En vez de esperar refuerzos, tu personaje decide atacar solo para salvar a los rehenes. Probablemente salga mal, pero sera memorable.',
    tip: 'Preguntate: "Que decision haria esta escena mas emocionante?"',
  },
  {
    title: 'Crea Stakes Personales',
    icon: Heart,
    description: 'Si a tu personaje le importa algo, perderlo duele. Y eso es bueno para la historia.',
    example: 'No es solo "salvar al pueblo". Es "salvar al pueblo donde creci, donde vive mi hermana menor".',
    tip: 'Conecta las misiones con la historia personal de tu personaje.',
  },
  {
    title: 'Deja que los Momentos Respiren',
    icon: Clock,
    description: 'No apures las escenas emotivas. El drama necesita espacio.',
    example: 'Despues de una revelacion importante, tomate un momento para reaccionar antes de actuar.',
    tip: 'El silencio tambien comunica. No todo requiere una respuesta inmediata.',
  },
]

const techniques = [
  {
    title: 'El Dilema Imposible',
    description: 'Pon a tu personaje en situaciones donde cualquier decision tiene un costo.',
    example: 'Solo podes salvar a uno: tu mentor o tu hermano. No hay opcion buena.',
    howToUse: 'Cuando el DM te presente opciones, no busques la salida facil. Elige y acepta las consecuencias.',
  },
  {
    title: 'El Sacrificio',
    description: 'Ofrece algo valioso para tu personaje a cambio de algo necesario.',
    example: 'Doy mi espada familiar a cambio de informacion sobre el villano.',
    howToUse: 'Busca oportunidades de sacrificar recursos, objetos queridos, o incluso seguridad.',
  },
  {
    title: 'El Secreto Revelado',
    description: 'Los secretos crean tension. Revelarlos en el momento correcto crea drama.',
    example: 'Revelar que tu personaje trabajo para el villano en el pasado, justo cuando el grupo confia en vos.',
    howToUse: 'Dale secretos a tu personaje y busca el momento dramatico para revelarlos.',
  },
  {
    title: 'La Decision Moral',
    description: 'Las decisiones eticas sin respuesta clara generan tension.',
    example: 'El villano tiene informacion que podria salvar miles. Lo torturas para obtenerla?',
    howToUse: 'No evites las zonas grises. Explora los limites morales de tu personaje.',
  },
  {
    title: 'El Reloj que Corre',
    description: 'La presion temporal aumenta la tension.',
    example: 'Tenes 10 minutos antes de que el ritual se complete. No hay tiempo para planear.',
    howToUse: 'Acepta las limitaciones de tiempo. No busques formas de "pausar" la urgencia.',
  },
]

const whatNotToDo = [
  {
    bad: 'Siempre elegir la opcion segura',
    why: 'Sin riesgo no hay recompensa emocional.',
    better: 'Toma la opcion arriesgada cuando la historia lo amerite.',
  },
  {
    bad: 'Evitar conflicto entre personajes',
    why: 'El desacuerdo crea drama y desarrollo.',
    better: 'Deja que los personajes discutan y tengan opiniones diferentes.',
  },
  {
    bad: 'Resolver todo con combate',
    why: 'La violencia constante se vuelve monotona.',
    better: 'Busca otras formas de resolver conflictos cuando sea posible.',
  },
  {
    bad: 'Ignorar las emociones del personaje',
    why: 'Un personaje sin emociones es un robot.',
    better: 'Deja que tu personaje sienta y reaccione emocionalmente.',
  },
  {
    bad: 'Resistirse a las consecuencias',
    why: 'Las consecuencias son el motor del drama.',
    better: 'Acepta y roleplay las consecuencias de tus acciones.',
  },
]

export default function TensionDramaticaPage() {
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
          <span className="text-xs font-ui font-bold text-white bg-blood px-2 py-1 rounded">
            Avanzado
          </span>
          <span className="text-xs font-ui font-semibold text-parchment">
            10 min lectura
          </span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold">
            <Flame className="h-8 w-8 text-shadow" />
          </div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Como Crear Tension Dramatica
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Los momentos que recordas de tus partidas favoritas no son los exitos faciles.
          Son los fracasos epicos, las decisiones imposibles, los sacrificios.
          Esta guia te ensena a crear esos momentos.
        </p>
      </header>

      {/* Core Insight */}
      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h2 className="font-heading text-xl text-ink mb-3 text-center">La Verdad Incomoda</h2>
          <p className="font-body text-ink text-lg text-center leading-relaxed">
            <strong>El drama viene del sufrimiento.</strong>
            <br /><br />
            Si tu personaje nunca pierde nada, nunca enfrenta dilemas, nunca falla...
            la historia es aburrida. Los mejores momentos vienen cuando las cosas
            salen mal de formas interesantes.
          </p>
        </ParchmentPanel>
      </section>

      {/* Principles */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Los 4 Principios del Drama
        </h2>

        <div className="space-y-4">
          {principles.map((principle) => (
            <ParchmentPanel key={principle.title} className="p-6 border border-gold-dim">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gold-dim flex-shrink-0">
                  <principle.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-xl text-ink mb-2">{principle.title}</h3>
                  <p className="font-body text-ink mb-3">{principle.description}</p>
                  <div className="p-3 bg-gold/10 rounded mb-3">
                    <span className="font-ui text-sm text-gold-dim">Ejemplo:</span>
                    <p className="font-body text-ink italic">{principle.example}</p>
                  </div>
                  <p className="font-ui text-sm text-ink">
                    <Sparkles className="h-4 w-4 inline mr-1 text-gold-dim" />
                    <strong>Tip:</strong> {principle.tip}
                  </p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      {/* Techniques */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tecnicas para Crear Tension
        </h2>

        <div className="space-y-4">
          {techniques.map((tech) => (
            <ParchmentPanel key={tech.title} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{tech.title}</h3>
              <p className="font-body text-ink mb-2">{tech.description}</p>
              <div className="p-3 bg-gold/10 rounded mb-2">
                <p className="font-body text-ink italic text-sm">"{tech.example}"</p>
              </div>
              <p className="font-ui text-sm text-ink">
                <strong>Como usarlo:</strong> {tech.howToUse}
              </p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      {/* What Not To Do */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Que Evitar
        </h2>

        <div className="space-y-3">
          {whatNotToDo.map((item) => (
            <ParchmentPanel key={item.bad} className="p-4 border border-gold-dim/50">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">Evita</span>
                  <p className="font-body text-ink text-sm">{item.bad}</p>
                </div>
                <div className="p-2">
                  <span className="font-ui text-xs text-ink">Por que</span>
                  <p className="font-body text-ink text-sm">{item.why}</p>
                </div>
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Mejor</span>
                  <p className="font-body text-ink text-sm">{item.better}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      {/* The Mindset */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          El Mindset Correcto
        </h2>

        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-4 font-body text-ink leading-relaxed">
            <p>
              Para crear tension dramatica, necesitas cambiar como pensas sobre "ganar".
            </p>
            <p>
              En un videojuego, ganar es vencer al boss. En rol narrativo,
              <strong> ganar es contar una historia memorable</strong>.
              Y las historias memorables tienen fracasos, perdidas y sacrificios.
            </p>
            <p>
              Cuando tu personaje falla, no perdiste. <strong>La historia gano.</strong>
              Ese fallo va a crear complicaciones interesantes, giros inesperados,
              y momentos que vas a recordar por anos.
            </p>
            <div className="p-4 bg-gold/10 rounded-lg border-l-4 border-gold mt-4">
              <p className="font-heading text-ink">
                "Un heroe que siempre gana es un Mary Sue.
                Un heroe que lucha, falla, se levanta y sigue adelante es memorable."
              </p>
            </div>
          </div>
        </ParchmentPanel>
      </section>

      {/* CTA */}
      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Crea tu Propio Drama
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            La proxima vez que juegues, toma un riesgo. Acepta un fallo.
            Hace algo que tu personaje haria aunque sea una mala idea.
            Y mira como la historia se vuelve memorable.
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
            href="/guias/roleplay-101"
            className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior: Roleplay 101
          </Link>
          <Link
            href="/guias"
            className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold"
          >
            Ver Todas las Guias
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
            "headline": "Como Crear Tension Dramatica en Rol",
            "description": "Aprende a crear momentos dramaticos memorables en juegos de rol.",
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
              "@id": "https://rol-hub.com/guias/tension-dramatica"
            }
          })
        }}
      />
    </article>
  )
}
