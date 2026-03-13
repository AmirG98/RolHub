import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Crown, Users, Sparkles, MessageSquare, Target, Heart } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Como Ser un Buen DM: Guia para Narradores | RolHub',
  description: 'Aprende a ser un gran Game Master. Tips de narracion, manejo de mesa, improvisacion y como hacer que tus jugadores se diviertan.',
  keywords: [
    'como ser buen DM',
    'game master tips',
    'narrador juegos de rol',
    'dirigir partida D&D',
    'consejos dungeon master'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/ser-buen-dm',
  },
  openGraph: {
    title: 'Como Ser un Buen DM | RolHub',
    description: 'La guia definitiva para narradores de juegos de rol.',
    type: 'article',
  },
}

const coreSkills = [
  {
    title: 'Escuchar Activamente',
    icon: MessageSquare,
    description: 'Presta atencion a lo que los jugadores dicen y quieren. Sus ideas a menudo son mejores que las tuyas.',
    tip: 'Cuando un jugador propone algo interesante, encontra la forma de decir "si".',
  },
  {
    title: 'Ser Flexible',
    icon: Sparkles,
    description: 'Tu plan no sobrevivira el contacto con los jugadores. Y eso esta bien.',
    tip: 'Prepara situaciones, no soluciones. Deja que los jugadores encuentren su camino.',
  },
  {
    title: 'Conocer a tus Jugadores',
    icon: Users,
    description: 'Cada jugador disfruta cosas diferentes: combate, roleplay, puzzles, exploracion.',
    tip: 'Pregunta que les gusto de la sesion. Adapta el contenido a sus preferencias.',
  },
  {
    title: 'Mantener el Ritmo',
    icon: Target,
    description: 'Si una escena se arrastra, avanzala. Si esta emocionante, dejala respirar.',
    tip: 'Corta escenas en su punto mas alto. Deja a los jugadores queriendo mas.',
  },
]

const doAndDont = [
  {
    do: 'Di "si, y..." o "si, pero..."',
    dont: 'Di "no" sin ofrecer alternativa',
    why: 'Los jugadores quieren agencia. Siempre hay forma de que intenten algo.',
  },
  {
    do: 'Deja que los personajes brillen',
    dont: 'Hagas que tus NPCs resuelvan todo',
    why: 'Los heroes son los jugadores, no tus personajes.',
  },
  {
    do: 'Acepta cuando te equivocas',
    dont: 'Discutas reglas por 20 minutos',
    why: 'Una decision rapida e imperfecta es mejor que una perfecta que mata el ritmo.',
  },
  {
    do: 'Prepara lo necesario',
    dont: 'Sobreplanifiques cada detalle',
    why: 'La mitad de tu preparacion no se usara. Aprende a improvisar.',
  },
  {
    do: 'Pide feedback',
    dont: 'Asumas que todo esta bien',
    why: 'Los jugadores no siempre dicen cuando algo no les gusta.',
  },
  {
    do: 'Celebra los exitos de los jugadores',
    dont: 'Compitas contra ellos',
    why: 'Tu trabajo es crear momentos memorables, no "ganar".',
  },
]

const narrationTips = [
  {
    title: 'Usa los Cinco Sentidos',
    desc: 'No solo lo que ven. Que huelen? Que escuchan? Que sienten bajo sus pies?',
  },
  {
    title: 'Menos es Mas',
    desc: 'Descripciones cortas e impactantes. Un detalle memorable vale mas que un parrafo.',
  },
  {
    title: 'Voces y Manierismos',
    desc: 'No necesitas ser actor. Un acento leve o una frase repetida hacen memorable al NPC.',
  },
  {
    title: 'Pausa Dramatica',
    desc: 'El silencio crea tension. Usa pausas antes de revelaciones importantes.',
  },
  {
    title: 'Describe Consecuencias',
    desc: 'Cuando algo pasa, muestra el impacto. El mundo reacciona a los jugadores.',
  },
]

const sessionStructure = [
  { phase: 'Recap', time: '5 min', desc: 'Recorda la sesion anterior. Deja que los jugadores la cuenten.' },
  { phase: 'Accion Inicial', time: '10-15 min', desc: 'Empeza con algo interesante. No reuniones de planeamiento.' },
  { phase: 'Desarrollo', time: '60-90 min', desc: 'El grueso de la sesion. Alterna accion, roleplay, exploracion.' },
  { phase: 'Climax', time: '15-20 min', desc: 'El momento mas tenso. Combate, revelacion, decision importante.' },
  { phase: 'Resolucion', time: '10 min', desc: 'Cierra hilos. Deja un gancho para la proxima.' },
]

export default function SerBuenDMPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-gold-dim px-2 py-1 rounded">Game Master</span>
          <span className="text-xs font-ui font-semibold text-parchment">15 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><Crown className="h-8 w-8 text-shadow" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Como Ser un Buen DM
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          El DM no es el enemigo de los jugadores ni el autor de una novela.
          Es el facilitador de una historia colaborativa. Tu trabajo es crear
          momentos memorables, no controlar el resultado.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Regla de Oro del DM</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>Tu objetivo es que todos se diviertan.</strong>
          <br /><br />
          Eso incluye a vos tambien. Si no te diviertes, algo esta mal.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Habilidades Fundamentales
        </h2>
        <div className="space-y-4">
          {coreSkills.map((skill) => (
            <ParchmentPanel key={skill.title} className="p-6 border border-gold-dim">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gold-dim flex-shrink-0">
                  <skill.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-xl text-ink mb-2">{skill.title}</h3>
                  <p className="font-body text-ink mb-3">{skill.description}</p>
                  <p className="font-ui text-sm text-ink">
                    <Sparkles className="h-4 w-4 inline mr-1 text-gold-dim" />
                    <strong>Tip:</strong> {skill.tip}
                  </p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Que Hacer y Que Evitar
        </h2>
        <div className="space-y-3">
          {doAndDont.map((item, i) => (
            <ParchmentPanel key={i} className="p-4 border border-gold-dim/50">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Hace</span>
                  <p className="font-body text-ink text-sm">{item.do}</p>
                </div>
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">Evita</span>
                  <p className="font-body text-ink text-sm">{item.dont}</p>
                </div>
                <div className="p-2">
                  <span className="font-ui text-xs text-ink">Por que</span>
                  <p className="font-body text-ink text-sm">{item.why}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tips de Narracion
        </h2>
        <div className="space-y-3">
          {narrationTips.map((tip) => (
            <ParchmentPanel key={tip.title} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{tip.title}</h4>
              <p className="font-body text-ink text-sm">{tip.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Estructura de una Sesion
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-4">
            {sessionStructure.map((phase, i) => (
              <div key={phase.phase} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-shadow font-bold">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-heading text-ink">{phase.phase}</h4>
                    <span className="text-xs font-ui text-gold-dim">~{phase.time}</span>
                  </div>
                  <p className="font-body text-ink text-sm">{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <div className="flex items-start gap-4">
            <Heart className="h-8 w-8 text-gold-dim flex-shrink-0" />
            <div>
              <h3 className="font-heading text-xl text-ink mb-2">Recorda</h3>
              <p className="font-body text-ink leading-relaxed">
                Los mejores DMs no son los que tienen las mejores voces o las historias
                mas complejas. Son los que hacen que sus jugadores se sientan heroes,
                que celebran sus exitos y convierten sus fracasos en momentos memorables.
                <br /><br />
                <strong>Vos no sos el enemigo. Sos el fan numero uno de tus jugadores.</strong>
              </p>
            </div>
          </div>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Listo para Narrar?
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            La mejor forma de aprender es haciendo. Empeza con una sesion corta
            y anda mejorando con cada partida.
          </p>
          <Link href="/guias/improvisar" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Aprender a Improvisar
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Todas las Guias
          </Link>
          <Link href="/guias/improvisar" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Improvisar <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
