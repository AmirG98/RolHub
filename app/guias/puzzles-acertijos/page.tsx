import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Puzzle, Lightbulb, AlertTriangle, Clock, Key, Brain } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Puzzles y Acertijos en Rol: Disenarlos Bien | RolHub',
  description: 'Como crear puzzles justos y satisfactorios para juegos de rol. Tipos de puzzles, errores comunes, y como no frustrar a tus jugadores.',
  keywords: [
    'puzzles D&D',
    'acertijos rol',
    'enigmas RPG',
    'crear puzzles juegos de rol',
    'rompecabezas D&D'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/puzzles-acertijos',
  },
  openGraph: {
    title: 'Puzzles y Acertijos en Rol | RolHub',
    description: 'Desafios mentales justos y satisfactorios.',
    type: 'article',
  },
}

const puzzleTypes = [
  {
    type: 'Acertijo de Palabras',
    desc: 'La respuesta es una palabra o frase que encaja con las pistas.',
    example: '"Tengo ciudades pero no casas, tengo montanas pero no arboles, tengo agua pero no peces."',
    answer: 'Un mapa.',
    difficulty: 'Facil a medio',
  },
  {
    type: 'Puzzle Fisico',
    desc: 'Requiere manipular objetos en el espacio.',
    example: 'Cuatro estatuas miran al centro. Girarlas para que miren puntos cardinales.',
    answer: 'Descripcion fisica clara de la solucion.',
    difficulty: 'Medio',
  },
  {
    type: 'Puzzle de Logica',
    desc: 'Deducir la respuesta de pistas contradictorias o complementarias.',
    example: 'Cinco puertas, cinco nobles. Solo uno dice la verdad. Quien es el asesino?',
    answer: 'Requiere razonamiento eliminatorio.',
    difficulty: 'Dificil',
  },
  {
    type: 'Puzzle de Patron',
    desc: 'Encontrar la regla que conecta una serie.',
    example: 'Simbolos en secuencia. El siguiente abre la puerta.',
    answer: 'El patron debe ser detectable con observacion.',
    difficulty: 'Medio',
  },
  {
    type: 'Puzzle de Conocimiento',
    desc: 'Requiere saber algo especifico del mundo.',
    example: 'Las tres fases de la luna en orden.',
    answer: 'Debe haber forma de obtener el conocimiento en el juego.',
    difficulty: 'Variable',
  },
]

const designPrinciples = [
  {
    principle: 'Multiples Soluciones',
    desc: 'Siempre ten al menos 2 formas de resolver el puzzle.',
    why: 'Los jugadores piensan diferente a vos.',
  },
  {
    principle: 'Progreso Visible',
    desc: 'Los jugadores deben saber cuando estan acercandose.',
    why: 'Feedback previene frustracion.',
  },
  {
    principle: 'Contexto Narrativo',
    desc: 'El puzzle debe tener sentido en el mundo.',
    why: 'Un puzzle random rompe la inmersion.',
  },
  {
    principle: 'Fallo No Bloquea',
    desc: 'Si no lo resuelven, hay otra forma de avanzar.',
    why: 'Ningun puzzle debe detener la historia.',
  },
  {
    principle: 'Recompensa Proporcional',
    desc: 'La dificultad debe corresponder con la recompensa.',
    why: 'Puzzles dificiles para premios triviales frustran.',
  },
]

const escapeValves = [
  {
    valve: 'Tirada de Habilidad',
    how: 'Una tirada alta da una pista gratuita.',
    cost: 'Pueden perder el "aha!" moment.',
  },
  {
    valve: 'NPC que Ayuda',
    how: 'Un companero o espiritu da indirectas.',
    cost: 'Tiene que sentirse natural, no un deus ex machina.',
  },
  {
    valve: 'Timer Narrativo',
    how: 'Si tardan mucho, algo pasa (guardias llegan, etc).',
    cost: 'Genera presion, puede saltear el puzzle.',
  },
  {
    valve: 'Solucion por Fuerza',
    how: 'Pueden romper la puerta, trepar el muro.',
    cost: 'Con consecuencia: alarmas, dano, etc.',
  },
]

const commonMistakes = [
  {
    mistake: 'Puzzle que solo vos entendes',
    fix: 'Testea con alguien mas antes de usarlo.',
  },
  {
    mistake: 'La respuesta es obvia para vos',
    fix: 'Vos sabes la respuesta. Ellos no. Da mas pistas.',
  },
  {
    mistake: 'Puzzle que requiere meta-conocimiento',
    fix: 'Si necesitan saber historia medieval real, dales esa info.',
  },
  {
    mistake: 'No hay forma de fallar interesantemente',
    fix: 'El fallo debe avanzar la historia, aunque diferente.',
  },
  {
    mistake: 'El puzzle esta en el camino principal',
    fix: 'Puzzles obligatorios DEBEN tener valvula de escape.',
  },
]

const examplePuzzles = [
  {
    name: 'Las Tres Copas',
    setup: 'Una copa de oro, una de plata, una de bronce. Solo una tiene agua pura.',
    pistas: ['La inscripcion de la copa de oro dice "No soy pura"', 'La copa de plata esta fria al tacto', 'El agua de la copa de bronce burbujea levemente'],
    solucion: 'La copa de plata (fria = pura, el oro miente sobre si mismo, el bronce esta envenenado).',
    escape: 'Una tirada de Naturaleza identifica el veneno.',
  },
  {
    name: 'El Puente de las Preguntas',
    setup: 'Un guardian hace 3 preguntas. Responder correctamente o caer.',
    pistas: ['Las preguntas son sobre historia del dungeon', 'La info esta en murales anteriores', 'El guardian sonrie cuando aciertan'],
    solucion: 'Recordar detalles de exploracion previa.',
    escape: 'Se puede luchar contra el guardian (dificil) o encontrar otro camino.',
  },
  {
    name: 'La Habitacion de los Espejos',
    setup: 'Cuatro espejos muestran versiones alteradas de los PJs. Uno muestra la "verdad".',
    pistas: ['Un espejo invierte colores', 'Otro envejece', 'Otro muestra heridas', 'Uno muestra exactamente igual'],
    solucion: 'El que muestra exactamente igual es mentira (la magia lo altera). El de heridas es "verdad".',
    escape: 'Romper todos los espejos abre la puerta (con consecuencia: mala suerte).',
  },
]

const presentationTips = [
  'Describe el puzzle lentamente. Deja que anoten.',
  'Repeti las pistas si preguntan. No cobres tiradas por eso.',
  'Si estan perdidos, agrega una pista narrativamente.',
  'Celebra las soluciones creativas que no esperabas.',
  'Si resuelven rapido, no agregues complicaciones. Dejalos ganar.',
]

export default function PuzzlesAcertijosPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-stone px-2 py-1 rounded">DM Avanzado</span>
          <span className="text-xs font-ui font-semibold text-parchment">14 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-stone"><Puzzle className="h-8 w-8 text-gold" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Puzzles y Acertijos
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Un buen puzzle hace que los jugadores se sientan inteligentes.
          Un mal puzzle los frustra y detiene el juego. Esta guia
          te ayuda a crear desafios mentales justos y satisfactorios.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Regla de Oro de los Puzzles</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>Si el puzzle puede detener el juego, no es un buen puzzle.</strong>
          <br /><br />
          Siempre tiene que haber forma de avanzar, aunque no resuelvan el puzzle.
          El puzzle es un desafio opcional, no un bloqueo obligatorio.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Brain className="h-6 w-6" /> Tipos de Puzzles
        </h2>
        <div className="space-y-4">
          {puzzleTypes.map((puzzle) => (
            <ParchmentPanel key={puzzle.type} className="p-5 border border-gold-dim">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-heading text-ink">{puzzle.type}</h3>
                <span className="font-mono text-xs text-gold bg-gold/10 px-2 py-1 rounded">{puzzle.difficulty}</span>
              </div>
              <p className="font-body text-ink text-sm mb-2">{puzzle.desc}</p>
              <div className="p-2 bg-gold/10 rounded mb-2">
                <p className="font-body text-ink text-sm italic">Ejemplo: {puzzle.example}</p>
              </div>
              <p className="font-ui text-xs text-gold-dim">Respuesta: {puzzle.answer}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Lightbulb className="h-6 w-6" /> Principios de Diseno
        </h2>
        <div className="space-y-3">
          {designPrinciples.map((principle) => (
            <ParchmentPanel key={principle.principle} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{principle.principle}</h4>
              <p className="font-body text-ink text-sm mb-1">{principle.desc}</p>
              <p className="font-ui text-xs text-gold-dim">Por que: {principle.why}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Key className="h-6 w-6" /> Valvulas de Escape
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {escapeValves.map((valve) => (
            <ParchmentPanel key={valve.valve} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{valve.valve}</h4>
              <p className="font-body text-ink text-sm mb-1">{valve.how}</p>
              <p className="font-ui text-xs text-blood">Costo: {valve.cost}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Puzzle className="h-6 w-6" /> Puzzles de Ejemplo
        </h2>
        <div className="space-y-4">
          {examplePuzzles.map((puzzle) => (
            <ParchmentPanel key={puzzle.name} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{puzzle.name}</h3>
              <p className="font-body text-ink text-sm mb-2"><strong>Setup:</strong> {puzzle.setup}</p>
              <div className="mb-2">
                <span className="font-ui text-xs text-gold-dim">Pistas:</span>
                <ul className="font-body text-ink text-sm ml-4">
                  {puzzle.pistas.map((pista, i) => (
                    <li key={i}>• {pista}</li>
                  ))}
                </ul>
              </div>
              <p className="font-body text-ink text-sm mb-2"><strong>Solucion:</strong> {puzzle.solucion}</p>
              <p className="font-ui text-xs text-gold-dim"><strong>Escape:</strong> {puzzle.escape}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" /> Errores Comunes
        </h2>
        <div className="space-y-3">
          {commonMistakes.map((item, i) => (
            <ParchmentPanel key={i} className="p-4 border border-gold-dim/50">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">Error</span>
                  <p className="font-body text-ink text-sm">{item.mistake}</p>
                </div>
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Solucion</span>
                  <p className="font-body text-ink text-sm">{item.fix}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Clock className="h-6 w-6" /> Tips de Presentacion
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <ul className="font-body text-ink space-y-2">
            {presentationTips.map((tip, i) => (
              <li key={i} className="p-2 bg-gold/5 rounded">• {tip}</li>
            ))}
          </ul>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>El objetivo es que se sientan inteligentes, no que demuestres lo inteligente que sos vos.</strong>
            <br /><br />
            Un puzzle que los jugadores resuelven en 5 minutos es perfecto.
            Un puzzle que vos crees "facil" puede tomar 30 minutos.
            Siempre subestima la dificultad.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            La musica y ambientacion complementan los puzzles perfectamente.
          </p>
          <Link href="/guias/musica-ambientacion" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Musica y Ambientacion
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/crear-campanas" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Crear Campanas
          </Link>
          <Link href="/guias/musica-ambientacion" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Musica <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
