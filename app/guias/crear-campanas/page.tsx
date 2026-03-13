import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Map, Target, Users, Clock, Sparkles, Flag } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Como Crear una Campana de Rol: Arcos y Planificacion | RolHub',
  description: 'Guia para planificar campanas de rol. Arcos narrativos, milestones, villanos, y como mantener una historia durante meses.',
  keywords: [
    'crear campana rol',
    'planificar campana D&D',
    'arcos narrativos RPG',
    'campana larga rol',
    'disenar campana'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/crear-campanas',
  },
  openGraph: {
    title: 'Crear Campanas de Rol | RolHub',
    description: 'Planifica historias que duren meses.',
    type: 'article',
  },
}

const campaignStructure = [
  {
    act: 'Acto 1: El Gancho',
    sessions: '1-4 sesiones',
    goal: 'Establecer el mundo, los personajes, y la amenaza inicial.',
    events: ['Incidente incitante', 'Conocer al grupo', 'Primera victoria/derrota'],
    tip: 'Los jugadores deben saber que esta en juego al final del Acto 1.',
  },
  {
    act: 'Acto 2: La Escalada',
    sessions: '5-15 sesiones',
    goal: 'Desarrollar la trama, los personajes, y las stakes.',
    events: ['Subtramas de personajes', 'Encuentros con el villano', 'Alianzas y enemigos'],
    tip: 'Este es el corazon de la campana. Toma tu tiempo.',
  },
  {
    act: 'Acto 3: El Climax',
    sessions: '2-4 sesiones',
    goal: 'Resolucion de la trama principal.',
    events: ['Punto de no retorno', 'Confrontacion final', 'Epilogo'],
    tip: 'Todo lo sembrado en actos anteriores debe dar fruto.',
  },
]

const villainDesign = [
  {
    aspect: 'Motivacion',
    question: 'Por que hace lo que hace?',
    tip: 'El villano debe creer que tiene razon.',
  },
  {
    aspect: 'Plan',
    question: 'Que esta tratando de lograr?',
    tip: 'El plan debe funcionar si los heroes no intervienen.',
  },
  {
    aspect: 'Recursos',
    question: 'Que tiene a su disposicion?',
    tip: 'Esbirros, dinero, magia, informacion.',
  },
  {
    aspect: 'Debilidad',
    question: 'Como puede ser derrotado?',
    tip: 'Debe haber una forma, aunque sea dificil.',
  },
  {
    aspect: 'Conexion',
    question: 'Por que les importa a los PJs?',
    tip: 'Lo personal es mas memorable que lo epico.',
  },
]

const planningMethods = [
  {
    method: 'El Sandbox',
    desc: 'Creas el mundo, los jugadores deciden que hacer.',
    pros: 'Maxima libertad, emergente.',
    cons: 'Requiere mucha improvisacion.',
    ideal: 'DMs experimentados con tiempo de prep.',
  },
  {
    method: 'Los Rails',
    desc: 'Historia lineal con puntos fijos.',
    pros: 'Facil de preparar, narrativa solida.',
    cons: 'Los jugadores pueden sentirse limitados.',
    ideal: 'DMs nuevos o campanas cortas.',
  },
  {
    method: 'Nodos Conectados',
    desc: 'Puntos clave conectados, los jugadores eligen el camino.',
    pros: 'Estructura + libertad.',
    cons: 'Requiere preparar multiples caminos.',
    ideal: 'Balance entre prep y flexibilidad.',
  },
  {
    method: 'Fronts/Amenazas',
    desc: 'El mundo avanza con o sin los jugadores.',
    pros: 'Mundo vivo, consecuencias reales.',
    cons: 'Los jugadores pueden perder.',
    ideal: 'Campanas de intriga o supervivencia.',
  },
]

const milestoneTypes = [
  {
    type: 'Milestone de Trama',
    example: 'Derrotar al primer lugarteniente del villano.',
    reward: 'Nueva informacion, acceso a nueva area.',
  },
  {
    type: 'Milestone de Personaje',
    example: 'El paladin enfrenta a su hermano corrupto.',
    reward: 'Cierre de arco, item tematico.',
  },
  {
    type: 'Milestone de Relacion',
    example: 'Ganan la confianza de una faccion.',
    reward: 'Aliados, recursos, informacion.',
  },
  {
    type: 'Milestone de Mundo',
    example: 'Previenen (o no) un evento catastrofico.',
    reward: 'El mundo cambia basado en sus acciones.',
  },
]

const sessionPrepChecklist = [
  {
    item: 'Donde quedaron?',
    detail: 'Revisa el resumen de la sesion anterior.',
  },
  {
    item: 'Que va a pasar si no hacen nada?',
    detail: 'El mundo sigue. Las facciones actuan.',
  },
  {
    item: 'Que quieren lograr los jugadores?',
    detail: 'Sus objetivos personales y de grupo.',
  },
  {
    item: '3 encuentros posibles',
    detail: 'Combate, social, exploracion. No todos van a pasar.',
  },
  {
    item: '3 NPCs con nombre',
    detail: 'Listos para aparecer si hace falta.',
  },
  {
    item: 'Un secret o revelacion',
    detail: 'Algo que avanza la trama si la sesion lo necesita.',
  },
]

const commonMistakes = [
  {
    mistake: 'Planificar 20 sesiones de una',
    fix: 'Planifica en arcos de 3-5 sesiones. Ajusta segun como va.',
  },
  {
    mistake: 'Enamorarte de tu historia',
    fix: 'La historia es de los jugadores. Vos la facilitas.',
  },
  {
    mistake: 'Villano ausente',
    fix: 'El villano debe aparecer (o sus efectos) regularmente.',
  },
  {
    mistake: 'Ignorar backstories',
    fix: 'Cada personaje debe tener al menos un arco propio.',
  },
  {
    mistake: 'No dejar que fallen',
    fix: 'El fracaso hace que el exito signifique algo.',
  },
]

const pacingTips = [
  'Alterna sesiones de accion y sesiones de roleplay',
  'Despues de un climax, da una sesion de calma',
  'Los arcos de personaje van intercalados con la trama principal',
  'Cada 3-4 sesiones, algo significativo debe cambiar',
  'El Acto 2 puede tener multiples "mini-actos"',
]

export default function CrearCampanasPage() {
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
          <span className="text-xs font-ui font-semibold text-parchment">18 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-stone"><Map className="h-8 w-8 text-gold" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Crear Campanas
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Una campana es una historia que se cuenta durante meses o años.
          Requiere planificacion, pero tambien flexibilidad. Esta guia
          te ayuda a crear la estructura sin perder la magia de lo emergente.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Filosofia de la Campana</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>Planifica lo suficiente para tener direccion, no tanto que pierdas flexibilidad.</strong>
          <br /><br />
          La mejor campana es un esqueleto solido con carne que crece
          de las decisiones de los jugadores.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Target className="h-6 w-6" /> Estructura de 3 Actos
        </h2>
        <div className="space-y-4">
          {campaignStructure.map((act, i) => (
            <ParchmentPanel key={act.act} className="p-5 border border-gold-dim">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-heading text-ink">{act.act}</h3>
                <span className="font-mono text-xs text-gold bg-gold/10 px-2 py-1 rounded">{act.sessions}</span>
              </div>
              <p className="font-body text-ink text-sm mb-2"><strong>Objetivo:</strong> {act.goal}</p>
              <ul className="font-body text-ink text-sm mb-2">
                {act.events.map((event, j) => (
                  <li key={j}>• {event}</li>
                ))}
              </ul>
              <p className="font-ui text-xs text-gold-dim">Tip: {act.tip}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> Disenar el Villano
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {villainDesign.map((aspect) => (
              <div key={aspect.aspect} className="p-3 bg-gold/5 rounded">
                <h4 className="font-heading text-ink text-sm">{aspect.aspect}</h4>
                <p className="font-body text-ink text-sm">{aspect.question}</p>
                <p className="font-ui text-xs text-gold-dim">Tip: {aspect.tip}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Map className="h-6 w-6" /> Metodos de Planificacion
        </h2>
        <div className="space-y-4">
          {planningMethods.map((method) => (
            <ParchmentPanel key={method.method} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{method.method}</h3>
              <p className="font-body text-ink text-sm mb-2">{method.desc}</p>
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div className="p-1 bg-emerald/10 rounded">
                  <span className="font-ui text-emerald">Pro:</span>
                  <span className="font-body text-ink"> {method.pros}</span>
                </div>
                <div className="p-1 bg-blood/10 rounded">
                  <span className="font-ui text-blood">Con:</span>
                  <span className="font-body text-ink"> {method.cons}</span>
                </div>
              </div>
              <p className="font-ui text-xs text-gold-dim">Ideal para: {method.ideal}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Flag className="h-6 w-6" /> Tipos de Milestones
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {milestoneTypes.map((milestone) => (
            <ParchmentPanel key={milestone.type} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{milestone.type}</h4>
              <p className="font-body text-ink text-sm mb-1">Ej: {milestone.example}</p>
              <p className="font-ui text-xs text-gold-dim">Reward: {milestone.reward}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Clock className="h-6 w-6" /> Checklist Pre-Sesion
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {sessionPrepChecklist.map((item) => (
              <div key={item.item} className="flex items-start gap-3">
                <span className="text-gold">□</span>
                <div>
                  <span className="font-heading text-ink text-sm">{item.item}</span>
                  <p className="font-body text-ink text-xs text-gold-dim">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Pacing
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <ul className="font-body text-ink space-y-2">
            {pacingTips.map((tip, i) => (
              <li key={i} className="p-2 bg-gold/5 rounded">• {tip}</li>
            ))}
          </ul>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Errores Comunes
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
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>La mejor campana es la que los jugadores recuerdan.</strong>
            <br /><br />
            No la que tenias planeada, sino la que emergio de sus decisiones.
            Tu trabajo es crear el espacio para que eso pase.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Los puzzles son una herramienta poderosa en cualquier campana.
          </p>
          <Link href="/guias/puzzles-acertijos" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Puzzles y Acertijos
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/oneshot-festival" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Festival
          </Link>
          <Link href="/guias/puzzles-acertijos" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Puzzles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
