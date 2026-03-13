import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Table, Zap, BookOpen, Dices, Skull, Sparkles } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Tabla Comparativa de Sistemas de Rol | RolHub',
  description: 'Comparativa rapida de sistemas de reglas para rol: Story Mode, PbtA, Year Zero, D&D 5e. Cual elegir segun tu estilo de juego.',
  keywords: [
    'sistemas rol comparativa',
    'D&D vs PbtA',
    'Year Zero Engine',
    'Story Mode rol',
    'que sistema elegir'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/tabla-sistemas',
  },
  openGraph: {
    title: 'Tabla Comparativa de Sistemas | RolHub',
    description: 'Que sistema de reglas elegir segun tu estilo.',
    type: 'article',
  },
}

const systems = [
  {
    name: 'Story Mode',
    complexity: '⭐',
    dice: 'Ninguno',
    focus: 'Narrativa pura',
    combat: 'Descriptivo',
    death: 'Solo si narrativamente tiene sentido',
    bestFor: 'Principiantes, narrativa cinematica',
    notFor: 'Quienes buscan crunch mecanico',
    vibe: 'Pelicula interactiva',
    color: 'bg-emerald',
  },
  {
    name: 'PbtA',
    complexity: '⭐⭐',
    dice: '2d6',
    focus: 'Ficcion primero',
    combat: 'Movimientos narrativos',
    death: 'Posible pero dramatica',
    bestFor: 'Drama, desarrollo de personaje',
    notFor: 'Combate tactico detallado',
    vibe: 'Serie de TV con protagonistas complejos',
    color: 'bg-gold',
  },
  {
    name: 'Year Zero',
    complexity: '⭐⭐⭐',
    dice: 'Pool de d6',
    focus: 'Supervivencia, recursos',
    combat: 'Letal y rapido',
    death: 'Muy posible, trauma acumulativo',
    bestFor: 'Horror, post-apocalipsis, gritty',
    notFor: 'Fantasia heroica',
    vibe: 'Thriller de supervivencia',
    color: 'bg-stone',
  },
  {
    name: 'D&D 5e',
    complexity: '⭐⭐⭐⭐',
    dice: 'd20 + modificadores',
    focus: 'Combate tactico + roleplay',
    combat: 'Turnos, posiciones, habilidades',
    death: 'Sistema de saving throws',
    bestFor: 'Fantasia heroica clasica',
    notFor: 'Sesiones muy cortas',
    vibe: 'Aventura epica con reglas claras',
    color: 'bg-blood',
  },
]

const comparisonTable = [
  {
    aspect: 'Tiempo de aprender',
    storyMode: '5 min',
    pbta: '15 min',
    yearZero: '30 min',
    dnd5e: '1-2 horas',
  },
  {
    aspect: 'Sesion tipica',
    storyMode: '30-60 min',
    pbta: '1-2 horas',
    yearZero: '2-3 horas',
    dnd5e: '3-4 horas',
  },
  {
    aspect: 'Prep del DM',
    storyMode: 'Ninguna',
    pbta: 'Minima',
    yearZero: 'Moderada',
    dnd5e: 'Considerable',
  },
  {
    aspect: 'Dados necesarios',
    storyMode: 'Ninguno',
    pbta: '2d6',
    yearZero: '10+ d6',
    dnd5e: 'Set completo (d4-d20)',
  },
  {
    aspect: 'Hojas de personaje',
    storyMode: 'Una linea',
    pbta: 'Playbook (1 pag)',
    yearZero: '1-2 paginas',
    dnd5e: '2-4 paginas',
  },
  {
    aspect: 'Curva de poder',
    storyMode: 'Plana',
    pbta: 'Suave',
    yearZero: 'Plana (todos fragiles)',
    dnd5e: 'Exponencial',
  },
]

const whenToUse = [
  {
    system: 'Story Mode',
    scenarios: [
      'Primera vez jugando rol',
      'Queres contar una historia sin interrupciones de dados',
      'Sesion corta (30-45 min)',
      'Jugadores que no quieren aprender reglas',
      'Drama emocional intenso',
    ],
  },
  {
    system: 'PbtA',
    scenarios: [
      'Querés drama y desarrollo de personajes',
      'Te gustan los éxitos parciales (7-9)',
      'Preferis ficcion sobre mecanicas',
      'Mundos como Apocalypse World, Monsterhearts, Dungeon World',
      'Sesiones de 1-2 horas',
    ],
  },
  {
    system: 'Year Zero',
    scenarios: [
      'Querés tension de supervivencia real',
      'Te gusta el push your luck (empujar dados)',
      'Horror, post-apocalipsis, ciencia ficcion dura',
      'Mundos como Alien RPG, Forbidden Lands, Mutant',
      'Consecuencias permanentes (trauma, mutaciones)',
    ],
  },
  {
    system: 'D&D 5e',
    scenarios: [
      'Fantasia clasica heroica',
      'Te gusta el combate tactico detallado',
      'Querés progresion de nivel significativa',
      'Tenés tiempo para sesiones largas',
      'Querés usar contenido oficial (modulos, aventuras)',
    ],
  },
]

const diceComparison = [
  {
    system: 'Story Mode',
    how: 'Sin dados. El DM decide basado en la coherencia narrativa.',
    feel: 'Todo fluye. No hay interrupciones.',
    fail: 'El fallo es una eleccion narrativa, no aleatoria.',
  },
  {
    system: 'PbtA',
    how: '2d6 + stat. 10+ exito, 7-9 exito con costo, 6- fallo.',
    feel: 'Simple y elegante. Los 7-9 son donde brilla.',
    fail: 'El fallo siempre avanza la historia.',
  },
  {
    system: 'Year Zero',
    how: 'Pool de d6. Cada 6 es un exito. Podes empujar (re-tirar) pero sufris.',
    feel: 'Tenso. Cada tirada tiene peso.',
    fail: 'El fallo duele. Recursos perdidos, trauma ganado.',
  },
  {
    system: 'D&D 5e',
    how: 'd20 + modificador vs DC. Critico en 20, pifia en 1.',
    feel: 'Swing grande. Un dado puede cambiar todo.',
    fail: 'El fallo es binario pero hay mecanicas de rescate.',
  },
]

const quickPicks = [
  {
    profile: 'Nunca jugue rol',
    recommendation: 'Story Mode',
    why: 'Cero friccion. Empezas a jugar en 5 minutos.',
  },
  {
    profile: 'Jugue videojuegos RPG',
    recommendation: 'PbtA o D&D 5e',
    why: 'PbtA si preferis narrativa, D&D si preferis combate.',
  },
  {
    profile: 'Quiero horror y tension',
    recommendation: 'Year Zero',
    why: 'El sistema refuerza la fragilidad y el miedo.',
  },
  {
    profile: 'Quiero campañas largas',
    recommendation: 'D&D 5e',
    why: 'El sistema de niveles da sensacion de progreso.',
  },
  {
    profile: 'Tengo poco tiempo',
    recommendation: 'Story Mode o PbtA',
    why: 'Sesiones cortas sin perder profundidad.',
  },
  {
    profile: 'Quiero drama entre personajes',
    recommendation: 'PbtA',
    why: 'Los movimientos generan conflicto dramatico.',
  },
]

export default function TablaSistemasPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-emerald px-2 py-1 rounded">Comparativas</span>
          <span className="text-xs font-ui font-semibold text-parchment">8 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-emerald"><Table className="h-8 w-8 text-white" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Tabla de Sistemas
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Cuatro sistemas de reglas, cuatro experiencias diferentes.
          Esta guia te ayuda a elegir el correcto para tu estilo de juego.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Regla de Oro</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>No hay sistema "mejor". Hay sistema adecuado.</strong>
          <br /><br />
          El mejor sistema es el que vos y tus jugadores (o la IA)
          van a disfrutar mas. Podes cambiar entre sesiones.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6" /> Vista Rapida
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {systems.map((sys) => (
            <ParchmentPanel key={sys.name} className="p-5 border border-gold-dim">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${sys.color}`}></div>
                <h3 className="font-heading text-lg text-ink">{sys.name}</h3>
                <span className="font-ui text-xs text-gold-dim ml-auto">{sys.complexity}</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-body text-ink"><strong>Dados:</strong> {sys.dice}</p>
                <p className="font-body text-ink"><strong>Foco:</strong> {sys.focus}</p>
                <p className="font-body text-ink"><strong>Combate:</strong> {sys.combat}</p>
                <p className="font-body text-ink"><strong>Muerte:</strong> {sys.death}</p>
              </div>
              <div className="mt-3 p-2 bg-gold/5 rounded">
                <p className="font-ui text-xs text-gold-dim">Vibe: {sys.vibe}</p>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6" /> Comparativa Detallada
        </h2>
        <ParchmentPanel className="p-4 border border-gold-dim overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-dim">
                <th className="font-heading text-ink text-left p-2">Aspecto</th>
                <th className="font-ui text-emerald text-center p-2">Story Mode</th>
                <th className="font-ui text-gold text-center p-2">PbtA</th>
                <th className="font-ui text-parchment text-center p-2">Year Zero</th>
                <th className="font-ui text-blood text-center p-2">D&D 5e</th>
              </tr>
            </thead>
            <tbody>
              {comparisonTable.map((row) => (
                <tr key={row.aspect} className="border-b border-gold-dim/30">
                  <td className="font-body text-ink p-2">{row.aspect}</td>
                  <td className="font-body text-ink text-center p-2">{row.storyMode}</td>
                  <td className="font-body text-ink text-center p-2">{row.pbta}</td>
                  <td className="font-body text-ink text-center p-2">{row.yearZero}</td>
                  <td className="font-body text-ink text-center p-2">{row.dnd5e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Dices className="h-6 w-6" /> Como Funcionan los Dados
        </h2>
        <div className="space-y-4">
          {diceComparison.map((sys) => (
            <ParchmentPanel key={sys.system} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-3">{sys.system}</h3>
              <div className="space-y-2">
                <p className="font-body text-ink text-sm"><strong>Mecanica:</strong> {sys.how}</p>
                <p className="font-body text-ink text-sm"><strong>Sensacion:</strong> {sys.feel}</p>
                <p className="font-body text-ink text-sm"><strong>Fallo:</strong> {sys.fail}</p>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Cuando Usar Cada Uno
        </h2>
        <div className="space-y-4">
          {whenToUse.map((sys) => (
            <ParchmentPanel key={sys.system} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-3">{sys.system}</h3>
              <ul className="space-y-1">
                {sys.scenarios.map((scenario, i) => (
                  <li key={i} className="font-body text-ink text-sm flex items-start gap-2">
                    <span className="text-gold">•</span>
                    {scenario}
                  </li>
                ))}
              </ul>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Skull className="h-6 w-6" /> Guia Rapida de Eleccion
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-4">
            {quickPicks.map((pick) => (
              <div key={pick.profile} className="p-3 bg-gold/5 rounded">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                  <span className="font-heading text-ink text-sm">"{pick.profile}"</span>
                  <span className="text-gold-dim hidden md:block">→</span>
                  <span className="font-heading text-gold text-sm">{pick.recommendation}</span>
                </div>
                <p className="font-body text-ink text-xs text-gold-dim">{pick.why}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Consejo Final</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>Empeza con Story Mode o PbtA.</strong>
            <br /><br />
            Son los mas faciles de aprender y los que mejor fluyen.
            Una vez que entiendas como funciona el rol, podes
            explorar sistemas mas complejos si te interesa.
            <br /><br />
            La complejidad de reglas ≠ calidad de la experiencia.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Aprender el Vocabulario
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Terminos avanzados que vas a encontrar en el rol.
          </p>
          <Link href="/guias/glosario-extendido" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Glosario Extendido
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/rol-vs-videojuegos" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Rol vs Videojuegos
          </Link>
          <Link href="/guias/glosario-extendido" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Glosario <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
