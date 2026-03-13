import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Sliders, Target, Palette, Shield, Zap, Volume2 } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Personalizar tu Partida en RolHub: Ajustes y Preferencias | RolHub',
  description: 'Como ajustar tono, dificultad, y preferencias en RolHub. Personaliza la experiencia a tu gusto.',
  keywords: [
    'personalizar RolHub',
    'ajustes partida rol',
    'preferencias RPG IA',
    'configurar dificultad rol',
    'tono partida D&D'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/personalizar-partida',
  },
  openGraph: {
    title: 'Personalizar tu Partida | RolHub',
    description: 'Hace que el juego sea exactamente lo que queres.',
    type: 'article',
  },
}

const toneOptions = [
  {
    tone: 'Epico',
    desc: 'Heroismo, grandeza, desafios imposibles superados.',
    bestFor: 'Fantasia clasica, aventuras heroicas.',
    notFor: 'Horror, supervivencia cruda.',
  },
  {
    tone: 'Oscuro',
    desc: 'Moralmente gris, consecuencias duras, victorias agridulces.',
    bestFor: 'Grimdark, horror, noir.',
    notFor: 'Aventuras ligeras, comedia.',
  },
  {
    tone: 'Ligero',
    desc: 'Humor, situaciones absurdas, bajo stakes.',
    bestFor: 'Comedia, aventuras casuales.',
    notFor: 'Drama serio, tragedia.',
  },
  {
    tone: 'Realista',
    desc: 'Consecuencias logicas, recursos limitados, mundo creible.',
    bestFor: 'Supervivencia, historico, sci-fi.',
    notFor: 'Fantasia alta, epica.',
  },
]

const difficultyLevels = [
  {
    level: 'Narrativo',
    combat: 'Los combates son cinematicos, rara vez peligrosos.',
    consequences: 'Las consecuencias son dramaticas pero no punitivas.',
    death: 'La muerte es rara y siempre significativa.',
    bestFor: 'Nuevos jugadores, historias enfocadas en roleplay.',
  },
  {
    level: 'Balanceado',
    combat: 'Combates desafiantes pero justos.',
    consequences: 'Las malas decisiones tienen costos.',
    death: 'Posible con decisiones muy malas.',
    bestFor: 'La mayoria de los jugadores.',
  },
  {
    level: 'Dificil',
    combat: 'Los combates pueden ser letales.',
    consequences: 'El mundo no perdona errores.',
    death: 'Real y siempre acechando.',
    bestFor: 'Jugadores que buscan desafio.',
  },
  {
    level: 'Hardcore',
    combat: 'Cada combate puede ser el ultimo.',
    consequences: 'Una mala tirada puede ser fatal.',
    death: 'Permanente. Sin resurrecciones faciles.',
    bestFor: 'Fans del roguelike y OSR.',
  },
]

const pacingOptions = [
  {
    pacing: 'Cinematico',
    desc: 'Escenas rapidas, cortes a lo importante, accion constante.',
    sessions: 'Mucho pasa en poco tiempo.',
    roleplay: 'Momentos de roleplay breves e intensos.',
  },
  {
    pacing: 'Equilibrado',
    desc: 'Mezcla de accion, exploracion, y roleplay.',
    sessions: 'Ritmo variado segun la escena.',
    roleplay: 'Tiempo para conversaciones y reflexion.',
  },
  {
    pacing: 'Inmersivo',
    desc: 'Lento, descriptivo, enfocado en la experiencia.',
    sessions: 'Poco avance de trama, mucha profundidad.',
    roleplay: 'Conversaciones largas, momentos contemplativos.',
  },
]

const contentPreferences = [
  {
    category: 'Violencia',
    options: ['Minima (fade to black)', 'Moderada (consecuencias visibles)', 'Detallada (descripcion grafica)'],
  },
  {
    category: 'Romance',
    options: ['Ninguno', 'Sugerido (fade to black)', 'Desarrollado (emotivo, no explicito)'],
  },
  {
    category: 'Horror',
    options: ['Ninguno', 'Tension y misterio', 'Horror explicito'],
  },
  {
    category: 'Politica/Intriga',
    options: ['Minima', 'Presente pero secundaria', 'Central a la historia'],
  },
]

const customizationExamples = [
  {
    request: 'Quiero mas descripcion de ambientes',
    response: 'El DM detallara cada locacion con mas detalle sensorial.',
  },
  {
    request: 'Menos combate, mas roleplay',
    response: 'Los encuentros tendran soluciones diplomaticas mas accesibles.',
  },
  {
    request: 'NPCs mas memorables',
    response: 'Los NPCs tendran quirks y personalidades mas marcadas.',
  },
  {
    request: 'Que los dados importen mas',
    response: 'Las tiradas tendran consecuencias mas dramaticas.',
  },
]

const whenToAdjust = [
  {
    signal: 'Te aburris',
    adjustment: 'Subi el ritmo, agrega conflicto, cambia de genero temporalmente.',
  },
  {
    signal: 'Te sentis abrumado',
    adjustment: 'Baja la dificultad, reduce la cantidad de facciones, simplifica.',
  },
  {
    signal: 'Los combates son largos',
    adjustment: 'Reduce HP enemigo, agrega objetivos alternativos.',
  },
  {
    signal: 'Queres mas desafio',
    adjustment: 'Subi dificultad, agrega consecuencias, limita recursos.',
  },
]

const quickCommands = [
  { command: '"Mas accion"', effect: 'Acelera el ritmo, agrega amenazas.' },
  { command: '"Momento de calma"', effect: 'Desacelera, permite roleplay.' },
  { command: '"Subamos la tension"', effect: 'Agrega peligro inminente.' },
  { command: '"Esto es muy dificil"', effect: 'Ajusta el encuentro.' },
  { command: '"Quiero explorar este lugar"', effect: 'Detalla el ambiente.' },
  { command: '"Saltemos adelante"', effect: 'Skip temporal.' },
]

export default function PersonalizarPartidaPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-gold-bright px-2 py-1 rounded">RolHub</span>
          <span className="text-xs font-ui font-semibold text-parchment">12 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><Sliders className="h-8 w-8 text-shadow" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Personalizar tu Partida
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Cada jugador es diferente. RolHub se adapta a lo que vos queres.
          Esta guia te ayuda a ajustar tono, dificultad, ritmo, y contenido
          para que la experiencia sea exactamente lo que buscas.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">Tu Juego, Tus Reglas</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>No existe la forma "correcta" de jugar rol.</strong>
          <br /><br />
          Algunos quieren desafio tactico. Otros quieren drama emocional.
          Algunos quieren terror. Otros quieren comedia. Todo es valido.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Palette className="h-6 w-6" /> Tono
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {toneOptions.map((tone) => (
            <ParchmentPanel key={tone.tone} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{tone.tone}</h3>
              <p className="font-body text-ink text-sm mb-2">{tone.desc}</p>
              <div className="text-xs">
                <span className="font-ui text-emerald">Ideal para: </span>
                <span className="font-body text-ink">{tone.bestFor}</span>
              </div>
              <div className="text-xs">
                <span className="font-ui text-blood">Evitar con: </span>
                <span className="font-body text-ink">{tone.notFor}</span>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Target className="h-6 w-6" /> Dificultad
        </h2>
        <div className="space-y-4">
          {difficultyLevels.map((level) => (
            <ParchmentPanel key={level.level} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{level.level}</h3>
              <div className="grid md:grid-cols-3 gap-2 text-xs mb-2">
                <div className="p-2 bg-gold/10 rounded">
                  <span className="font-ui text-gold-dim">Combate:</span>
                  <p className="font-body text-ink">{level.combat}</p>
                </div>
                <div className="p-2 bg-gold/10 rounded">
                  <span className="font-ui text-gold-dim">Consecuencias:</span>
                  <p className="font-body text-ink">{level.consequences}</p>
                </div>
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-blood">Muerte:</span>
                  <p className="font-body text-ink">{level.death}</p>
                </div>
              </div>
              <p className="font-ui text-xs text-gold-dim">Mejor para: {level.bestFor}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6" /> Ritmo
        </h2>
        <div className="space-y-4">
          {pacingOptions.map((pacing) => (
            <ParchmentPanel key={pacing.pacing} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{pacing.pacing}</h3>
              <p className="font-body text-ink text-sm mb-2">{pacing.desc}</p>
              <div className="grid md:grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-gold/10 rounded">
                  <span className="font-ui text-gold-dim">Sesiones:</span>
                  <p className="font-body text-ink">{pacing.sessions}</p>
                </div>
                <div className="p-2 bg-gold/10 rounded">
                  <span className="font-ui text-gold-dim">Roleplay:</span>
                  <p className="font-body text-ink">{pacing.roleplay}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Shield className="h-6 w-6" /> Contenido
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-4">
            {contentPreferences.map((pref) => (
              <div key={pref.category} className="p-3 bg-gold/5 rounded">
                <h4 className="font-heading text-ink text-sm mb-2">{pref.category}</h4>
                <div className="flex flex-wrap gap-2">
                  {pref.options.map((opt, i) => (
                    <span key={i} className="font-ui text-xs bg-gold/10 text-ink px-2 py-1 rounded">
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Volume2 className="h-6 w-6" /> Comandos Rapidos
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="grid md:grid-cols-2 gap-3">
            {quickCommands.map((cmd) => (
              <div key={cmd.command} className="p-2 bg-gold/5 rounded">
                <span className="font-mono text-ink text-sm">{cmd.command}</span>
                <p className="font-body text-ink text-xs text-gold-dim">{cmd.effect}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Ejemplos de Personalizacion
        </h2>
        <div className="space-y-3">
          {customizationExamples.map((ex, i) => (
            <ParchmentPanel key={i} className="p-4 border border-gold-dim/50">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-2 bg-gold/10 rounded">
                  <span className="font-ui text-xs text-gold-dim">Pedis:</span>
                  <p className="font-body text-ink text-sm">"{ex.request}"</p>
                </div>
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Resultado:</span>
                  <p className="font-body text-ink text-sm">{ex.response}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Cuando Ajustar
        </h2>
        <div className="space-y-3">
          {whenToAdjust.map((item, i) => (
            <ParchmentPanel key={i} className="p-4 border border-gold-dim/50">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">Senal:</span>
                  <p className="font-body text-ink text-sm">{item.signal}</p>
                </div>
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Ajuste:</span>
                  <p className="font-body text-ink text-sm">{item.adjustment}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>Podes cambiar todo en cualquier momento.</strong>
            <br /><br />
            No estas casado con tus elecciones iniciales.
            Si algo no funciona, ajustalo. El juego es tuyo.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Jugar en solitario es otra forma valida de disfrutar el rol.
          </p>
          <Link href="/guias/jugar-solo" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Jugar en Solitario
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/tips-dm-ia" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Tips DM IA
          </Link>
          <Link href="/guias/jugar-solo" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Jugar Solo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
