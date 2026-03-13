import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle, XCircle, Lightbulb } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Errores Comunes de Principiantes en Rol: Como Evitarlos | RolHub',
  description: 'Los 10 errores mas comunes que cometen los nuevos jugadores de rol y como evitarlos. Aprende de los errores de otros.',
  keywords: [
    'errores rol principiantes',
    'que no hacer D&D',
    'errores nuevos jugadores',
    'consejos rol principiante',
    'problemas comunes RPG'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/errores-comunes',
  },
  openGraph: {
    title: 'Errores Comunes de Principiantes en Rol | RolHub',
    description: 'Aprende de los errores de otros y empieza con el pie derecho.',
    type: 'article',
    publishedTime: '2024-01-15',
    authors: ['RolHub'],
  },
}

const errors = [
  {
    number: 1,
    title: 'Pensar que hay una forma "correcta" de jugar',
    description: 'Muchos principiantes creen que deben jugar de cierta manera o seguir un guion invisible.',
    why: 'El rol es improvisacion. No hay respuestas correctas ni incorrectas, solo decisiones y consecuencias.',
    fix: 'Hace lo que te parezca interesante o lo que haria tu personaje. Si la decision es "mala" estrategicamente pero "buena" para la historia, adelante.',
    example: 'No tenes que salvar al aldeano solo porque "es lo que un heroe haria". Si tu personaje es cobarde, huir es una decision valida y crea drama.',
  },
  {
    number: 2,
    title: 'No describir las acciones',
    description: 'Decir solo "ataco" o "hablo con el guardia" sin ningun detalle.',
    why: 'El DM necesita detalles para narrar bien. Mas descripcion = mejor respuesta.',
    fix: 'Describe COMO haces las cosas. Que dices exactamente? Como atacas? Que emocion muestra tu personaje?',
    example: 'En vez de "ataco", di "rujo de furia y cargo hacia el orco, levantando mi hacha sobre mi cabeza para un golpe devastador".',
  },
  {
    number: 3,
    title: 'Tener miedo de fallar',
    description: 'Evitar riesgos, solo elegir opciones "seguras", frustrarse con malas tiradas.',
    why: 'El fallo es parte del juego. Las mejores historias salen de fracasos espectaculares.',
    fix: 'Acepta que fallar es divertido. Una pifia memorable es mejor que un exito aburrido.',
    example: 'Tu intento de seducir al dragon termino en desastre? Eso es una anecdota que vas a contar por años.',
  },
  {
    number: 4,
    title: 'Ignorar a los otros jugadores',
    description: 'Enfocarse solo en tu personaje, no interactuar con el grupo, acaparar protagonismo.',
    why: 'El rol es colaborativo. Si solo vos te divertis, algo esta mal.',
    fix: 'Preguntale cosas a otros personajes. Dejales tener su momento. Celebra sus exitos.',
    example: 'En vez de resolver todo vos solo, pregunta "Ey, vos sos el experto en trampas, que pensas de esto?"',
  },
  {
    number: 5,
    title: 'Crear un personaje "lobo solitario"',
    description: 'Hacer un personaje antisocial que no quiere trabajar en equipo.',
    why: 'Es un juego de GRUPO. Un personaje que no coopera arruina la experiencia para todos.',
    fix: 'Tu personaje puede ser oscuro o misterioso, pero tiene que tener una RAZON para estar con el grupo.',
    example: 'En vez de "no confio en nadie", proba "no confio facilmente, pero respeto la habilidad de estos companeros".',
  },
  {
    number: 6,
    title: 'Hacer metagaming',
    description: 'Usar informacion que vos sabes pero tu personaje no.',
    why: 'Rompe la inmersion y la gracia del descubrimiento.',
    fix: 'Preguntate: "Mi personaje SABE esto?" Si no, actua en consecuencia.',
    example: 'Vos leiste que los trolls son debiles al fuego. Pero tu personaje granjero, sabe eso? Probablemente no.',
  },
  {
    number: 7,
    title: 'Interrumpir constantemente',
    description: 'Hablar sobre el DM, interrumpir escenas de otros, no dejar que los momentos respiren.',
    why: 'Algunas escenas necesitan espacio. El drama requiere silencio.',
    fix: 'Espera tu turno. Deja que los momentos emotivos se desarrollen. No todo requiere un comentario.',
    example: 'Si otro jugador esta teniendo una escena emotiva con un NPC, no interrumpas con "bueno, mientras tanto yo...".',
  },
  {
    number: 8,
    title: 'Discutir con el DM',
    description: 'Cuestionar cada decision, pedir re-tiradas, negociar consecuencias.',
    why: 'El DM esta tratando de contar una historia. Las discusiones la frenan.',
    fix: 'Acepta las decisiones del DM en el momento. Si tenes dudas, hablalas DESPUES de la sesion.',
    example: 'Si el DM dice que el ataque fallo, no digas "pero deberia haber pegado porque...". Segui jugando.',
  },
  {
    number: 9,
    title: 'No hacer preguntas',
    description: 'Asumir cosas, no pedir descripciones, no explorar el entorno.',
    why: 'El DM tiene informacion que no puede darte a menos que preguntes.',
    fix: 'Pregunta sobre el entorno, los NPCs, los detalles. "Que veo en la habitacion?" es una pregunta valida.',
    example: '"Hay algo que pueda usar como arma?" puede revelar opciones que el DM no menciono explicitamente.',
  },
  {
    number: 10,
    title: 'Tomarse todo demasiado en serio',
    description: 'Estresarse por las decisiones, frustrarse por el progreso, olvidar que es un juego.',
    why: 'El objetivo principal es divertirse. Si no te estas divirtiendo, algo esta mal.',
    fix: 'Relajate. Rei de los errores. Acepta lo absurdo. Es ficcion.',
    example: 'Tu plan fallo espectacularmente? En vez de enojarte, rei y pregunta "y ahora como salimos de esta?".',
  },
]

export default function ErroresComunesPage() {
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
            Principiante
          </span>
          <span className="text-xs font-ui font-semibold text-parchment">
            8 min lectura
          </span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-blood">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Errores Comunes de Principiantes
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Todos cometemos errores al empezar. La diferencia es que vos
          podes aprender de los errores de otros y evitarlos desde el principio.
        </p>
      </header>

      {/* Intro */}
      <section className="mb-12">
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-6 w-6 text-gold-dim mt-1" />
            <div>
              <h2 className="font-heading text-lg text-ink mb-2">Antes de Empezar</h2>
              <p className="font-body text-ink leading-relaxed">
                Estos errores son <strong>normales</strong>. Todos los jugadores experimentados
                los cometieron alguna vez. No te castigues si te identificas con alguno —
                lo importante es reconocerlos y mejorar.
              </p>
            </div>
          </div>
        </ParchmentPanel>
      </section>

      {/* Errors */}
      <div className="space-y-8">
        {errors.map((error) => (
          <section key={error.number}>
            <ParchmentPanel className="p-6 border border-gold-dim">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blood flex items-center justify-center">
                  <span className="font-heading text-lg text-white font-bold">{error.number}</span>
                </div>
                <div>
                  <h2 className="font-heading text-xl text-ink mb-1">{error.title}</h2>
                  <p className="font-body text-ink">{error.description}</p>
                </div>
              </div>

              <div className="space-y-4 ml-14">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-blood mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-heading text-blood text-sm">Por que es problema:</span>
                    <p className="font-body text-ink">{error.why}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-heading text-emerald text-sm">Como solucionarlo:</span>
                    <p className="font-body text-ink">{error.fix}</p>
                  </div>
                </div>

                <div className="p-3 bg-gold/10 rounded-lg border-l-4 border-gold">
                  <span className="font-heading text-gold-dim text-sm">Ejemplo:</span>
                  <p className="font-body text-ink italic">{error.example}</p>
                </div>
              </div>
            </ParchmentPanel>
          </section>
        ))}
      </div>

      {/* Summary */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          La Regla de Oro
        </h2>

        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <p className="font-body text-ink text-lg text-center leading-relaxed">
            Si todos la estan pasando bien — incluyendote a vos — probablemente
            lo estas haciendo bien. El rol no tiene "forma correcta".
            <br /><br />
            <strong className="text-ink">Relajate, divertite, y aprende sobre la marcha.</strong>
          </p>
        </ParchmentPanel>
      </section>

      {/* CTA */}
      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Listo para Evitar Estos Errores?
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Ahora que sabes que evitar, empeza tu aventura con confianza.
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
            href="/guias/ser-buen-jugador"
            className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold"
          >
            Siguiente: Como Ser un Buen Jugador
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
            "headline": "Errores Comunes de Principiantes en Rol: Como Evitarlos",
            "description": "Los 10 errores mas comunes que cometen los nuevos jugadores de rol y como evitarlos.",
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
              "@id": "https://rol-hub.com/guias/errores-comunes"
            }
          })
        }}
      />
    </article>
  )
}
