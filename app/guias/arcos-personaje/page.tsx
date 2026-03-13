import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, TrendingUp, Star, Heart, Zap, RefreshCw, Sparkles } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Arcos de Personaje: Crecimiento y Cambio | RolHub',
  description: 'Como desarrollar tu personaje durante la campana. Momentos definitorios, crecimiento, y arcos narrativos satisfactorios.',
  keywords: [
    'arco de personaje RPG',
    'desarrollo personaje D&D',
    'crecimiento personaje rol',
    'momentos definitorios',
    'cambio de personaje'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/arcos-personaje',
  },
  openGraph: {
    title: 'Arcos de Personaje | RolHub',
    description: 'Tu personaje no es estatico. Aprende a hacerlo crecer.',
    type: 'article',
  },
}

const arcTypes = [
  {
    type: 'Arco de Crecimiento',
    icon: TrendingUp,
    desc: 'El personaje aprende algo y se convierte en mejor version de si mismo.',
    example: 'El ladron egoista que aprende a sacrificarse por sus amigos.',
    keys: ['Momento de fracaso por su defecto', 'Mentor o ejemplo que lo inspira', 'Momento de decision consciente'],
  },
  {
    type: 'Arco de Redencion',
    icon: RefreshCw,
    desc: 'El personaje cometio errores graves y busca compensar.',
    example: 'El ex-villano que ahora lucha por el bien.',
    keys: ['Confrontacion con su pasado', 'Oportunidad de repetir el error', 'Acto de sacrificio genuino'],
  },
  {
    type: 'Arco de Corrupcion',
    icon: Zap,
    desc: 'El personaje empieza bien pero las circunstancias lo cambian.',
    example: 'El paladin que pierde la fe despues de una tragedia.',
    keys: ['Evento traumatico', 'Tentacion o justificacion', 'Punto de no retorno'],
  },
  {
    type: 'Arco de Revelacion',
    icon: Star,
    desc: 'El personaje descubre algo sobre si mismo que cambia todo.',
    example: 'El huerfano que descubre su linaje real.',
    keys: ['Pistas a lo largo de la historia', 'Momento de revelacion', 'Reaccion y adaptacion'],
  },
]

const momentoDefinitorio = [
  {
    momento: 'El Dilema Moral',
    desc: 'Elegir entre dos opciones donde ninguna es claramente correcta.',
    example: 'Salvar al pueblo o perseguir al villano que escapara.',
  },
  {
    momento: 'El Sacrificio',
    desc: 'Perder algo valioso para lograr algo importante.',
    example: 'Entregar un objeto querido para salvar a un compañero.',
  },
  {
    momento: 'La Confrontacion',
    desc: 'Enfrentar algo del pasado que evitabas.',
    example: 'Encontrar al padre que te abandono.',
  },
  {
    momento: 'La Eleccion de Identidad',
    desc: 'Decidir quien queres ser frente a presion externa.',
    example: 'Rechazar el legado familiar para seguir tu propio camino.',
  },
]

const developmentTips = [
  {
    tip: 'Pequeños Cambios Primero',
    desc: 'El crecimiento es gradual. Una decision menor puede indicar hacia donde va tu personaje.',
  },
  {
    tip: 'Reacciona al Mundo',
    desc: 'Los eventos de la campana deben afectarte. Si tu pueblo fue destruido, mostralo.',
  },
  {
    tip: 'Conexiones con Otros PJs',
    desc: 'Los compañeros son catalizadores de cambio. Deja que te influencien.',
  },
  {
    tip: 'Verbaliza Internamente',
    desc: 'Podes decir en voz alta que piensa tu personaje. "Me siento culpable por..."',
  },
  {
    tip: 'Acepta Consecuencias',
    desc: 'Tus decisiones tienen que tener peso. No retrocedas cuando duelan.',
  },
]

const phaseGuide = [
  {
    phase: 'Inicio de Campana',
    focus: 'Establecer defecto o limitacion',
    actions: ['Mostrar el defecto en accion', 'Establecer creencias iniciales', 'Definir miedos o debilidades'],
  },
  {
    phase: 'Desarrollo',
    focus: 'Desafiar creencias',
    actions: ['Enfrentar situaciones que contradicen tu vision', 'Conocer personajes que muestran otra forma', 'Pequeños cambios en comportamiento'],
  },
  {
    phase: 'Punto de Quiebre',
    focus: 'Momento definitorio',
    actions: ['Crisis que fuerza decision', 'Consecuencias de elecciones pasadas', 'No hay opcion neutral'],
  },
  {
    phase: 'Resolucion',
    focus: 'Nueva normalidad',
    actions: ['Demostrar el cambio con acciones', 'Aplicar lo aprendido a nuevos desafios', 'Posiblemente ayudar a otros con lo mismo'],
  },
]

const questions = [
  'Que cree mi personaje que va a cambiar durante la historia?',
  'Cual es su mayor defecto y como podria superarlo?',
  'Que le da miedo perder?',
  'Que necesita aprender para ser mejor persona?',
  'Quien podria inspirarlo a cambiar?',
  'Cual seria un momento de decision crucial para el?',
]

export default function ArcosPersonajePage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-gold-dim px-2 py-1 rounded">Personaje</span>
          <span className="text-xs font-ui font-semibold text-parchment">10 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><TrendingUp className="h-8 w-8 text-shadow" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Arcos de Personaje
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Tu personaje no deberia ser el mismo al final de la campana que al principio.
          Las aventuras lo cambian, las decisiones lo definen, y el crecimiento
          es lo que hace memorable a un heroe.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">Que es un Arco?</h2>
        <p className="font-body text-ink text-center leading-relaxed">
          <strong>Un arco de personaje es el viaje interno paralelo al viaje externo.</strong>
          <br /><br />
          Mientras tu grupo salva el mundo (viaje externo), tu personaje enfrenta
          sus propios demonios y crece como persona (viaje interno).
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tipos de Arcos
        </h2>
        <div className="space-y-4">
          {arcTypes.map((arc) => (
            <ParchmentPanel key={arc.type} className="p-6 border border-gold-dim">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gold-dim flex-shrink-0">
                  <arc.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-xl text-ink mb-2">{arc.type}</h3>
                  <p className="font-body text-ink mb-2">{arc.desc}</p>
                  <p className="font-ui text-sm text-gold-dim mb-3 italic">Ejemplo: {arc.example}</p>
                  <div className="p-3 bg-gold/10 rounded">
                    <p className="font-ui text-xs text-ink font-bold mb-1">Momentos clave:</p>
                    <ul className="font-body text-ink text-sm">
                      {arc.keys.map((k, i) => (
                        <li key={i}>• {k}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Star className="h-6 w-6" /> Momentos Definitorios
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">
            Estos son los momentos que cambian a tu personaje para siempre:
          </p>
          <div className="space-y-3">
            {momentoDefinitorio.map((m) => (
              <div key={m.momento} className="p-3 bg-gold/5 rounded">
                <h4 className="font-heading text-ink text-sm mb-1">{m.momento}</h4>
                <p className="font-body text-ink text-sm mb-1">{m.desc}</p>
                <p className="font-ui text-xs text-gold-dim italic">Ejemplo: {m.example}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Fases del Arco
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-4">
            {phaseGuide.map((p, i) => (
              <div key={p.phase} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-shadow font-bold">{i + 1}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-heading text-ink">{p.phase}</h4>
                    <span className="text-xs font-ui text-gold-dim">{p.focus}</span>
                  </div>
                  <ul className="font-body text-ink text-sm">
                    {p.actions.map((a, j) => (
                      <li key={j}>• {a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Heart className="h-6 w-6" /> Tips de Desarrollo
        </h2>
        <div className="space-y-3">
          {developmentTips.map((t) => (
            <ParchmentPanel key={t.tip} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{t.tip}</h4>
              <p className="font-body text-ink text-sm">{t.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Preguntas para Planificar
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">
            Hacete estas preguntas para planificar el arco de tu personaje:
          </p>
          <ul className="font-body text-ink space-y-2">
            {questions.map((q, i) => (
              <li key={i} className="p-2 bg-gold/5 rounded">• {q}</li>
            ))}
          </ul>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Lo Mas Importante</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>El arco no se planifica completamente — se descubre jugando.</strong>
            <br /><br />
            Tené una direccion general, pero deja que los eventos de la campana
            y las decisiones en el momento guien el camino. Los mejores arcos
            son los que sorprenden incluso al jugador.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Tu personaje no existe solo. Las relaciones lo definen.
          </p>
          <Link href="/guias/relaciones-pjs" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Relaciones entre PJs
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/escribir-backstory" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Escribir Backstory
          </Link>
          <Link href="/guias/relaciones-pjs" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Relaciones PJs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
