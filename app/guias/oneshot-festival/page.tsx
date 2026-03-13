import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, PartyPopper, Trophy, Users, Sparkles, Music, Star } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'One-Shot Festival: Competencias y Roleplay Ligero | RolHub',
  description: 'Guia para crear one-shots de festival. Competencias, juegos, roleplay ligero, y diversión sin presion.',
  keywords: [
    'festival one-shot',
    'feria D&D',
    'one-shot ligero RPG',
    'competencias juegos de rol',
    'roleplay casual'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/oneshot-festival',
  },
  openGraph: {
    title: 'One-Shot Festival | RolHub',
    description: 'Competencias, premios y diversión.',
    type: 'article',
  },
}

const festivalElements = [
  {
    element: 'Competencias',
    desc: 'Eventos donde los PJs compiten contra NPCs o entre si.',
    examples: ['Torneo de combate', 'Concurso de bebida', 'Carrera de obstaculos'],
    icon: Trophy,
  },
  {
    element: 'Juegos de Azar',
    desc: 'Puestos donde pueden ganar premios o perder monedas.',
    examples: ['Dados', 'Cartas', 'Rueda de la fortuna'],
    icon: Star,
  },
  {
    element: 'Encuentros Sociales',
    desc: 'NPCs interesantes para conocer y hablar.',
    examples: ['El bardo famoso', 'La adivina misteriosa', 'El vendedor sospechoso'],
    icon: Users,
  },
  {
    element: 'Eventos Espontaneos',
    desc: 'Cosas que pasan mientras exploran.',
    examples: ['Un ladron roba algo', 'Un nino se pierde', 'Un espectaculo sale mal'],
    icon: Sparkles,
  },
]

const festivalStructure = [
  {
    phase: 'Llegada',
    time: '10-15 min',
    desc: 'Describe el festival. Los sonidos, los olores, las atracciones.',
    tip: 'Da 3-4 opciones claras de que hacer primero.',
  },
  {
    phase: 'Exploracion Libre',
    time: '30-40 min',
    desc: 'Los jugadores eligen que hacer. Competencias, juegos, socializar.',
    tip: 'Deja que fluya. Salta entre grupos si se separan.',
  },
  {
    phase: 'El Evento Principal',
    time: '20-30 min',
    desc: 'La gran competencia o evento del dia.',
    tip: 'Todos participan de alguna forma.',
  },
  {
    phase: 'La Celebracion',
    time: '10-15 min',
    desc: 'Premios, reconocimientos, despedida.',
    tip: 'Es el momento de los NPCs que conocieron durante el festival.',
  },
]

const competitions = [
  {
    name: 'Torneo de Arena',
    mechanic: 'Combates 1v1, eliminacion directa.',
    rounds: '3 rondas: facil, medio, dificil.',
    premio: 'Oro, arma especial, titulo.',
  },
  {
    name: 'Concurso de Bebida',
    mechanic: 'Tiradas de CON progresivamente dificiles.',
    rounds: 'Cada ronda sube la dificultad.',
    premio: 'Respeto de los locales, descuentos, informacion.',
  },
  {
    name: 'Carrera de Obstaculos',
    mechanic: 'Secuencia de tiradas: atletismo, acrobacia, percepcion.',
    rounds: 'Una sola carrera, multiples obstaculos.',
    premio: 'Botas magicas, fama, entrada VIP.',
  },
  {
    name: 'Concurso de Talentos',
    mechanic: 'Cualquier habilidad. Roleplay + tirada.',
    rounds: 'Cada participante hace su acto.',
    premio: 'Oro, contactos artisticos, item unico.',
  },
  {
    name: 'Duelo de Ingenio',
    mechanic: 'Acertijos y adivinanzas contra NPC.',
    rounds: 'Mejor de 3.',
    premio: 'Libro de conocimiento, favor de un sabio.',
  },
]

const miniGames = [
  {
    game: 'Tiro al Blanco',
    desc: 'Tirada de DEX contra CD variable por distancia.',
    reward: 'Premios escalados por exito.',
  },
  {
    game: 'Lucha de Brazos',
    desc: 'Tirada opuesta de STR.',
    reward: 'Oro apostado, respeto de los fuertes.',
  },
  {
    game: 'El Tahur',
    desc: 'Juego de cartas con tiradas de engano.',
    reward: 'Oro ganado, o perdido.',
  },
  {
    game: 'El Misterio de la Carpa',
    desc: 'Adivina que hay debajo. Percepcion o intuicion.',
    reward: 'Item sorpresa (bueno o malo).',
  },
  {
    game: 'Prueba tu Fuerza',
    desc: 'Golpea el martillo. Tirada de STR.',
    reward: 'Premios por nivel de exito.',
  },
]

const npcSuggestions = [
  {
    npc: 'El Bardo Famoso',
    role: 'Puede dar informacion de la region, o necesitar ayuda.',
    hook: 'Alguien le robo su instrumento. Ayudaran?',
  },
  {
    npc: 'La Adivina',
    role: 'Da pistas sobre el futuro de los personajes.',
    hook: 'Sus predicciones son inquietantemente precisas.',
  },
  {
    npc: 'El Comerciante Exotico',
    role: 'Vende items raros o quest hooks.',
    hook: 'Tiene algo que necesitan, pero el precio es extrano.',
  },
  {
    npc: 'El Campeon Retirado',
    role: 'Mentor potencial o rival a superar.',
    hook: 'Reconoce a uno de los PJs de algun lado.',
  },
  {
    npc: 'Los Ninos Locales',
    role: 'Guias del festival, vendedores de rumores.',
    hook: 'Saben donde esta el mejor loot.',
  },
]

const spontaneousEvents = [
  'Un ladronzuelo intenta robar a un PJ',
  'Un espectaculo de fuegos artificiales sale mal',
  'Un animal exotico escapa de su jaula',
  'Un antiguo rival de un PJ aparece',
  'La comida de un puesto estaba envenenada (no letal)',
  'Un nino perdido necesita ayuda para encontrar a sus padres',
  'Un duelo se sale de control y amenaza a espectadores',
]

const dmTips = [
  'Ten una lista de nombres de NPCs random',
  'Deja que los jugadores inventen detalles del festival',
  'No todo tiene que ser una tirada — el roleplay puro funciona',
  'Si se aburren de algo, pasa algo inesperado',
  'Los NPCs recurrentes crean conexion rapida',
  'El festival puede tener un lado oscuro si queres tension',
]

const festivalThemes = [
  { theme: 'Cosecha', vibe: 'Otonal, comida, gratitud, danzas.', events: 'Concurso de calabazas, carreras de cerdos.' },
  { theme: 'Solsticio', vibe: 'Magico, luces, misterio.', events: 'Rituales, fuegos artificiales, apariciones.' },
  { theme: 'Victoria', vibe: 'Militar, heroico, competitivo.', events: 'Torneos, desfiles, ceremonias.' },
  { theme: 'Comercio', vibe: 'Cosmopolita, diverso, bullicioso.', events: 'Subastas, degustaciones, intercambios.' },
]

export default function OneshotFestivalPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-gold px-2 py-1 rounded">One-Shot</span>
          <span className="text-xs font-ui font-semibold text-parchment">12 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><PartyPopper className="h-8 w-8 text-shadow" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            One-Shot: Festival
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          No todo tiene que ser mazmorras y dragones. A veces, la mejor sesion
          es una donde los personajes van a una feria, compiten en juegos,
          conocen NPCs, y se divierten sin que el mundo este en peligro.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Filosofia del Festival</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>A veces los personajes solo necesitan pasarla bien.</strong>
          <br /><br />
          Un festival es espacio para el roleplay puro, la comedia, y conocer
          a los personajes fuera del peligro. Es un respiro que hace que
          las sesiones intensas sean mas impactantes por contraste.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Elementos del Festival
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {festivalElements.map((elem) => (
            <ParchmentPanel key={elem.element} className="p-5 border border-gold-dim">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gold flex-shrink-0">
                  <elem.icon className="h-5 w-5 text-shadow" />
                </div>
                <div>
                  <h3 className="font-heading text-ink mb-1">{elem.element}</h3>
                  <p className="font-body text-ink text-sm mb-2">{elem.desc}</p>
                  <ul className="font-ui text-xs text-gold-dim">
                    {elem.examples.map((ex, i) => (
                      <li key={i}>• {ex}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Music className="h-6 w-6" /> Estructura del One-Shot
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-4">
            {festivalStructure.map((phase, i) => (
              <div key={phase.phase} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-shadow font-bold text-sm">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-heading text-ink">{phase.phase}</h4>
                    <span className="font-mono text-xs text-gold bg-gold/10 px-2 py-1 rounded">{phase.time}</span>
                  </div>
                  <p className="font-body text-ink text-sm mb-1">{phase.desc}</p>
                  <p className="font-ui text-xs text-gold-dim">Tip: {phase.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Trophy className="h-6 w-6" /> Competencias
        </h2>
        <div className="space-y-4">
          {competitions.map((comp) => (
            <ParchmentPanel key={comp.name} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{comp.name}</h3>
              <p className="font-body text-ink text-sm mb-1"><strong>Mecanica:</strong> {comp.mechanic}</p>
              <p className="font-body text-ink text-sm mb-1"><strong>Rondas:</strong> {comp.rounds}</p>
              <p className="font-ui text-xs text-gold-dim"><strong>Premio:</strong> {comp.premio}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Star className="h-6 w-6" /> Mini-Juegos
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {miniGames.map((game) => (
            <ParchmentPanel key={game.game} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{game.game}</h4>
              <p className="font-body text-ink text-sm mb-1">{game.desc}</p>
              <p className="font-ui text-xs text-gold-dim">Reward: {game.reward}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> NPCs del Festival
        </h2>
        <div className="space-y-3">
          {npcSuggestions.map((npc) => (
            <ParchmentPanel key={npc.npc} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{npc.npc}</h4>
              <p className="font-body text-ink text-sm mb-1">{npc.role}</p>
              <p className="font-ui text-xs text-gold-dim italic">Hook: {npc.hook}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Eventos Espontaneos
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-3">
            Si la sesion necesita un impulso, tira d8 o elige:
          </p>
          <ul className="font-body text-ink space-y-2">
            {spontaneousEvents.map((event, i) => (
              <li key={i} className="p-2 bg-gold/5 rounded">
                <span className="font-mono text-gold-dim mr-2">{i + 1}.</span>
                {event}
              </li>
            ))}
          </ul>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Temas de Festival
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {festivalThemes.map((theme) => (
            <ParchmentPanel key={theme.theme} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">Festival de {theme.theme}</h4>
              <p className="font-body text-ink text-sm mb-1">{theme.vibe}</p>
              <p className="font-ui text-xs text-gold-dim">Eventos: {theme.events}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tips para el DM
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <ul className="font-body text-ink space-y-2">
            {dmTips.map((tip, i) => (
              <li key={i} className="p-2 bg-gold/5 rounded">• {tip}</li>
            ))}
          </ul>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>El festival es para los personajes, no para la trama.</strong>
            <br /><br />
            No todo tiene que conectar con la historia principal.
            A veces la mejor sesion es una donde los jugadores se rien,
            hacen cosas estupidas, y conocen mejor a sus personajes.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Para sesiones mas estructuradas, aprende a crear campanas.
          </p>
          <Link href="/guias/crear-campanas" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Crear Campanas
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/oneshot-supervivencia" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Supervivencia
          </Link>
          <Link href="/guias/crear-campanas" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Crear Campanas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
