import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Clock, Zap, Target, AlertTriangle, CheckCircle, Play } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Sesiones Cortas de Rol: Jugar en 30-45 Minutos | RolHub',
  description: 'Como jugar rol en sesiones cortas de 30-45 minutos. One-shots express, tecnicas de condensacion, y estructuras rapidas.',
  keywords: [
    'sesiones cortas rol',
    'one-shot rapido D&D',
    'rol en poco tiempo',
    'sesion express RPG',
    'lunch break RPG'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/sesiones-cortas',
  },
  openGraph: {
    title: 'Sesiones Cortas de Rol | RolHub',
    description: 'Rol epico en menos de una hora.',
    type: 'article',
  },
}

const shortFormats = [
  {
    format: 'Lunch Break (30 min)',
    structure: 'Una escena, una decision, una consecuencia.',
    ideal: 'Encuentros aislados, flashbacks, sidequests.',
    icon: Clock,
  },
  {
    format: 'After Work (45 min)',
    structure: 'Setup rapido, nucleo de accion, resolucion.',
    ideal: 'Mini-aventuras completas, one-shots express.',
    icon: Zap,
  },
  {
    format: 'Coffee Break (15 min)',
    structure: 'Una tirada, una narracion, siguiente.',
    ideal: 'Avanzar campana entre sesiones largas.',
    icon: Target,
  },
]

const condensationTechniques = [
  {
    technique: 'In Medias Res Extremo',
    desc: 'Arranca en la puerta del dungeon, no en la taberna.',
    example: '"Estan frente a la puerta del templo. Adentro esta el artefacto. Que hacen?"',
  },
  {
    technique: 'Decision Binaria',
    desc: 'Ofrece dos caminos claros, no exploración abierta.',
    example: '"Izquierda escuchan pelea. Derecha, silencio sospechoso. Cual?"',
  },
  {
    technique: 'Skip Forward',
    desc: 'Salta tiempo narrativamente para mantener el ritmo.',
    example: '"Pasaron dos horas buscando. Encontraron la entrada secreta. Que hacen?"',
  },
  {
    technique: 'Resolucion Comprimida',
    desc: 'Una tirada puede resolver una seccion entera.',
    example: '"Tirada de grupo para pasar las trampas del corredor."',
  },
]

const structureTemplate = {
  phases: [
    { time: '0-5 min', name: 'Hook', desc: 'Situacion inmediata. Que esta pasando AHORA.' },
    { time: '5-15 min', name: 'Accion Principal', desc: 'El nucleo. Combate, puzzle, o negociacion.' },
    { time: '15-25 min', name: 'Complicacion', desc: 'Algo cambia. El plan no funciona perfecto.' },
    { time: '25-30 min', name: 'Resolucion', desc: 'Consecuencias y cierre de la escena.' },
  ],
}

const scenarioIdeas = [
  {
    name: 'El Dilema',
    setup: 'Dos NPCs necesitan ayuda simultaneamente. Solo pueden salvar a uno.',
    core: 'Decision moral bajo presion de tiempo.',
    duration: '25-30 min',
  },
  {
    name: 'La Emboscada',
    setup: 'Los PJs son atacados mientras descansan.',
    core: 'Combate tactico con desventaja inicial.',
    duration: '30-40 min',
  },
  {
    name: 'El Acertijo',
    setup: 'Una puerta, un puzzle, un guardian.',
    core: 'Resolver el acertijo o negociar con el guardian.',
    duration: '20-30 min',
  },
  {
    name: 'El Contrato Express',
    setup: 'Un NPC paga bien por algo simple. Spoiler: no es simple.',
    core: 'La mision se complica de forma inesperada.',
    duration: '35-45 min',
  },
  {
    name: 'El Flashback',
    setup: 'Escena del pasado de un personaje.',
    core: 'Revelar backstory jugando, no contando.',
    duration: '20-25 min',
  },
]

const rulesAdaptations = [
  {
    rule: 'Iniciativa Simplificada',
    normal: 'Tirar iniciativa individual',
    express: 'PJs primero, enemigos despues. O alternado.',
  },
  {
    rule: 'HP Reducido',
    normal: 'HP completo',
    express: 'Mitad de HP para combates mas rapidos.',
  },
  {
    rule: 'Skill Checks',
    normal: 'Cada accion es una tirada',
    express: 'Una tirada por escena o desafio completo.',
  },
  {
    rule: 'Inventario',
    normal: 'Revisar inventario detallado',
    express: '"Tenes lo que necesitas? Si, tira."',
  },
]

const dmTips = [
  'Prepara un timer visible. Ayuda a mantener el ritmo.',
  'Ten las estadisticas pre-calculadas. No busques nada.',
  'Maximo 3 NPCs con nombre. El resto es "el guardia".',
  'Si una escena no avanza en 5 min, fuerza un cambio.',
  'Deja que los jugadores se auto-narren exitos.',
]

const playerTips = [
  'Llega sabiendo que quiere tu personaje en esta escena',
  'Toma decisiones rapido. Pensa mientras otros actuan.',
  'No optimices, actua. Lo perfecto es enemigo de lo rapido.',
  'Colabora. No es tu momento de brillar solo.',
  'Acepta los resultados y segui adelante.',
]

const commonMistakes = [
  {
    mistake: 'Empezar con exposicion larga',
    fix: 'Maximo 30 segundos de setup. Luego: "Que hacen?"',
  },
  {
    mistake: 'Combates de 4+ rondas',
    fix: 'Objetivo: 2-3 rondas maximo. Reduce HP enemigo.',
  },
  {
    mistake: 'Dejar que los jugadores deliberen',
    fix: 'Timer de 60 segundos para decisiones grupales.',
  },
  {
    mistake: 'Subtramas durante la sesion',
    fix: 'Una linea narrativa. Cero tangentes.',
  },
]

export default function SesionesCortasPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-emerald px-2 py-1 rounded">Sesiones</span>
          <span className="text-xs font-ui font-semibold text-parchment">10 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-emerald"><Clock className="h-8 w-8 text-white" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Sesiones Cortas
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          No siempre tenes 4 horas para jugar. A veces solo tenes 30 minutos
          en el almuerzo o 45 despues del trabajo. Eso no significa que no
          podes jugar rol. Solo necesitas adaptar la estructura.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Filosofia del Rol Express</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>Mejor 30 minutos de rol intenso que 4 horas de nada.</strong>
          <br /><br />
          Las sesiones cortas no son rol "de segunda". Son rol concentrado.
          Todo lo que no es esencial se elimina. Lo que queda es pura accion narrativa.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Formatos de Sesion Corta
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {shortFormats.map((format) => (
            <ParchmentPanel key={format.format} className="p-5 border border-gold-dim">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-emerald">
                  <format.icon className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-heading text-ink">{format.format}</h3>
              </div>
              <p className="font-body text-ink text-sm mb-2">{format.structure}</p>
              <p className="font-ui text-xs text-gold-dim">Ideal: {format.ideal}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6" /> Tecnicas de Condensacion
        </h2>
        <div className="space-y-4">
          {condensationTechniques.map((tech) => (
            <ParchmentPanel key={tech.technique} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{tech.technique}</h3>
              <p className="font-body text-ink text-sm mb-2">{tech.desc}</p>
              <div className="p-2 bg-gold/10 rounded">
                <p className="font-body text-ink text-sm italic">"{tech.example}"</p>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Target className="h-6 w-6" /> Estructura de 30 Minutos
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {structureTemplate.phases.map((phase, i) => (
              <div key={phase.name} className="flex items-start gap-4">
                <div className="w-20 flex-shrink-0">
                  <span className="font-mono text-gold text-sm">{phase.time}</span>
                </div>
                <div>
                  <h4 className="font-heading text-ink text-sm">{phase.name}</h4>
                  <p className="font-body text-ink text-sm">{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Play className="h-6 w-6" /> Escenarios Express
        </h2>
        <div className="space-y-4">
          {scenarioIdeas.map((scenario) => (
            <ParchmentPanel key={scenario.name} className="p-5 border border-gold-dim">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-heading text-ink">{scenario.name}</h3>
                <span className="font-mono text-xs text-gold bg-gold/10 px-2 py-1 rounded">{scenario.duration}</span>
              </div>
              <p className="font-body text-ink text-sm mb-1"><strong>Setup:</strong> {scenario.setup}</p>
              <p className="font-body text-ink text-sm"><strong>Core:</strong> {scenario.core}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Adaptacion de Reglas
        </h2>
        <div className="space-y-3">
          {rulesAdaptations.map((rule) => (
            <ParchmentPanel key={rule.rule} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-2">{rule.rule}</h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-stone/30 rounded">
                  <span className="font-ui text-xs text-parchment/70">Normal</span>
                  <p className="font-body text-parchment">{rule.normal}</p>
                </div>
                <div className="p-2 bg-emerald/20 rounded">
                  <span className="font-ui text-xs text-emerald">Express</span>
                  <p className="font-body text-ink">{rule.express}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-heading text-xl text-gold-bright mb-4">Tips para DMs</h2>
            <ParchmentPanel className="p-5 border border-gold-dim">
              <ul className="font-body text-ink text-sm space-y-2">
                {dmTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </ParchmentPanel>
          </div>
          <div>
            <h2 className="font-heading text-xl text-gold-bright mb-4">Tips para Jugadores</h2>
            <ParchmentPanel className="p-5 border border-gold-dim">
              <ul className="font-body text-ink text-sm space-y-2">
                {playerTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </ParchmentPanel>
          </div>
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
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>30 minutos de rol es infinitamente mejor que 0 minutos de rol.</strong>
            <br /><br />
            No dejes que la falta de tiempo te impida jugar.
            Adapta, condensa, enfoca. La magia del rol no necesita horas.
            Necesita intencion.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Para one-shots con mas tiempo, explora formatos tematicos.
          </p>
          <Link href="/guias/oneshot-heist" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            One-Shot: Heist
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/sesion-final" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Sesion Final
          </Link>
          <Link href="/guias/oneshot-heist" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: One-Shot Heist <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
