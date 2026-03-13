import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Settings, Users, MessageCircle, Shield, FileText, CheckCircle } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Sesion Cero: Preparar tu Campana de Rol | RolHub',
  description: 'Como hacer una sesion cero efectiva. Expectativas, limites, creacion de personajes, y establecer las reglas de la mesa.',
  keywords: [
    'sesion cero rol',
    'session zero D&D',
    'preparar campana RPG',
    'expectativas mesa rol',
    'lineas y velos'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/sesion-cero',
  },
  openGraph: {
    title: 'Sesion Cero | RolHub',
    description: 'El fundamento de toda buena campana.',
    type: 'article',
  },
}

const whySessionZero = [
  {
    reason: 'Alinear Expectativas',
    desc: 'Todos saben que tipo de juego van a jugar. Evita sorpresas desagradables.',
  },
  {
    reason: 'Crear Grupo Cohesivo',
    desc: 'Los personajes se crean sabiendo quienes son los otros. Se conectan desde el dia uno.',
  },
  {
    reason: 'Establecer Limites',
    desc: 'Temas sensibles, niveles de violencia, contenido a evitar. Se habla antes de que sea problema.',
  },
  {
    reason: 'Resolver Logistica',
    desc: 'Horarios, frecuencia, duracion, ausencias. Los detalles que arruinan campanas.',
  },
]

const topicsToDiscuss = [
  {
    topic: 'Tono de la Campana',
    questions: [
      'Epico o realista?',
      'Serio o con humor?',
      'Heroico o moralmente gris?',
    ],
    icon: MessageCircle,
  },
  {
    topic: 'Contenido Sensible',
    questions: [
      'Que temas estan completamente fuera?',
      'Que temas se pueden tocar pero con cuidado?',
      'Como indicamos si algo se pone incomodo?',
    ],
    icon: Shield,
  },
  {
    topic: 'Estilo de Juego',
    questions: [
      'Mas combate o mas roleplay?',
      'Narrativo o tactico?',
      'Sandbox o historia guiada?',
    ],
    icon: Settings,
  },
  {
    topic: 'Muerte de Personajes',
    questions: [
      'Pueden morir los personajes?',
      'Si mueren, que pasa?',
      'Cuanta proteccion tiene el plot armor?',
    ],
    icon: Users,
  },
]

const linesAndVeils = {
  lines: {
    title: 'Lineas (Hard No)',
    desc: 'Contenido que NUNCA aparece en la mesa. Ni siquiera se implica.',
    examples: ['Violencia sexual', 'Daño a niños', 'Tortura detallada', 'Fobias especificas de jugadores'],
  },
  veils: {
    title: 'Velos (Fade to Black)',
    desc: 'Contenido que puede existir pero no se describe en detalle.',
    examples: ['Escenas romanticas explicitas', 'Violencia grafica', 'Trauma del pasado'],
  },
}

const characterCreationTips = [
  {
    tip: 'Conexiones entre PJs',
    desc: 'Cada personaje debe tener al menos una conexion con otro PJ antes de empezar.',
    example: '"Somos hermanos", "El me salvo la vida", "Trabajamos juntos antes"',
  },
  {
    tip: 'Motivacion Activa',
    desc: 'Cada personaje necesita una razon para aventurarse, no solo un backstory.',
    example: '"Busco al asesino de mi mentor" es mejor que "Mi mentor fue asesinado"',
  },
  {
    tip: 'Secreto Compartible',
    desc: 'El backstory puede tener secretos, pero el jugador debe compartir TODO con el DM.',
    example: 'El DM sabe que el personaje es un espia. Los otros jugadores no.',
  },
  {
    tip: 'Espacio para Crecer',
    desc: 'No crees un personaje perfecto. Los arcos de personaje necesitan espacio.',
    example: 'El cobarde que aprende valor. El vengador que encuentra paz.',
  },
]

const logisticsChecklist = [
  { item: 'Dia y hora de la sesion', detail: 'Fijo o flexible? Quien avisa si no puede?' },
  { item: 'Duracion de cada sesion', detail: '2 horas? 4 horas? Descansos?' },
  { item: 'Frecuencia', detail: 'Semanal, quincenal, mensual?' },
  { item: 'Plataforma', detail: 'Presencial? Online? Que herramientas?' },
  { item: 'Politica de ausencias', detail: 'Jugamos sin alguien? Cuantos minimos?' },
  { item: 'Comida y bebida', detail: 'Cada uno trae? Se comparte? Se ordena?' },
]

const safetyTools = [
  {
    tool: 'Carta X',
    desc: 'Una carta en la mesa. Cualquiera puede tocarla para pausar y saltar contenido.',
    how: 'Sin explicaciones. Se respeta y se avanza.',
  },
  {
    tool: 'Luces del Semaforo',
    desc: 'Verde = todo bien. Amarillo = con cuidado. Rojo = para.',
    how: 'El DM puede preguntar el color antes de escenas fuertes.',
  },
  {
    tool: 'Palabra de Seguridad',
    desc: 'Una palabra que significa "esto no esta bien para mi".',
    how: 'Ej: "Pausa" o "Vela". Al decirla, la escena se detiene.',
  },
  {
    tool: 'Check-in Post Sesion',
    desc: '5 minutos al final para hablar fuera de personaje.',
    how: '"Estuvo todo bien? Algo que ajustar para la proxima?"',
  },
]

const agenda = [
  { time: '0-10 min', activity: 'Bienvenida y cafe', desc: 'Charla informal mientras llegan todos.' },
  { time: '10-30 min', activity: 'Presentacion de la campana', desc: 'DM explica el mundo, tono, y premisa basica.' },
  { time: '30-50 min', activity: 'Expectativas y limites', desc: 'Discutir tono, contenido sensible, herramientas de seguridad.' },
  { time: '50-70 min', activity: 'Logistica', desc: 'Horarios, frecuencia, ausencias, herramientas.' },
  { time: '70-110 min', activity: 'Creacion de personajes', desc: 'Juntos, estableciendo conexiones.' },
  { time: '110-120 min', activity: 'Gancho inicial', desc: 'El DM cuenta como arranca la primera sesion.' },
]

export default function SesionCeroPage() {
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
          <span className="text-xs font-ui font-semibold text-parchment">15 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-emerald"><Settings className="h-8 w-8 text-white" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Sesion Cero
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          La sesion cero es la reunion donde se establece todo ANTES de jugar.
          Es la diferencia entre una campana que dura años y una que se disuelve
          en dos sesiones. No la saltes.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">Por Que es Obligatoria</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>El 80% de los problemas de mesa se previenen con una buena sesion cero.</strong>
          <br /><br />
          Conflictos de expectativas, temas sensibles sin aviso, personajes que no encajan,
          horarios incompatibles... todo eso se resuelve ANTES de empezar.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Por Que Hacer Sesion Cero
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {whySessionZero.map((item) => (
            <ParchmentPanel key={item.reason} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{item.reason}</h3>
              <p className="font-body text-ink text-sm">{item.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <MessageCircle className="h-6 w-6" /> Temas a Discutir
        </h2>
        <div className="space-y-4">
          {topicsToDiscuss.map((topic) => (
            <ParchmentPanel key={topic.topic} className="p-5 border border-gold-dim">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald flex-shrink-0">
                  <topic.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-ink mb-2">{topic.topic}</h3>
                  <ul className="font-body text-ink text-sm space-y-1">
                    {topic.questions.map((q, i) => (
                      <li key={i}>• {q}</li>
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
          <Shield className="h-6 w-6" /> Lineas y Velos
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <ParchmentPanel className="p-5 border-2 border-blood">
            <h3 className="font-heading text-ink mb-2">{linesAndVeils.lines.title}</h3>
            <p className="font-body text-ink text-sm mb-3">{linesAndVeils.lines.desc}</p>
            <ul className="font-ui text-xs text-ink space-y-1">
              {linesAndVeils.lines.examples.map((ex, i) => (
                <li key={i} className="p-1 bg-blood/10 rounded">• {ex}</li>
              ))}
            </ul>
          </ParchmentPanel>
          <ParchmentPanel className="p-5 border-2 border-gold-dim">
            <h3 className="font-heading text-ink mb-2">{linesAndVeils.veils.title}</h3>
            <p className="font-body text-ink text-sm mb-3">{linesAndVeils.veils.desc}</p>
            <ul className="font-ui text-xs text-ink space-y-1">
              {linesAndVeils.veils.examples.map((ex, i) => (
                <li key={i} className="p-1 bg-gold/10 rounded">• {ex}</li>
              ))}
            </ul>
          </ParchmentPanel>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> Creacion de Personajes
        </h2>
        <div className="space-y-3">
          {characterCreationTips.map((tip) => (
            <ParchmentPanel key={tip.tip} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{tip.tip}</h4>
              <p className="font-body text-ink text-sm mb-2">{tip.desc}</p>
              <p className="font-ui text-xs text-gold-dim italic">Ej: {tip.example}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <FileText className="h-6 w-6" /> Logistica
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {logisticsChecklist.map((item) => (
              <div key={item.item} className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-gold flex-shrink-0 mt-1" />
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
          <Shield className="h-6 w-6" /> Herramientas de Seguridad
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {safetyTools.map((tool) => (
            <ParchmentPanel key={tool.tool} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{tool.tool}</h4>
              <p className="font-body text-ink text-sm mb-2">{tool.desc}</p>
              <p className="font-ui text-xs text-gold-dim">{tool.how}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Agenda de 2 Horas
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {agenda.map((step) => (
              <div key={step.time} className="flex items-start gap-4">
                <div className="w-20 flex-shrink-0">
                  <span className="font-mono text-gold text-sm">{step.time}</span>
                </div>
                <div>
                  <h4 className="font-heading text-ink text-sm">{step.activity}</h4>
                  <p className="font-body text-ink text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>Una sesion cero no es tiempo perdido. Es una inversion.</strong>
            <br /><br />
            Las mejores campanas son las que empiezan con todos en la misma pagina.
            Dedica dos horas a esto y vas a ahorrar meses de problemas.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Despues de la sesion cero viene la primera sesion real.
          </p>
          <Link href="/guias/primera-sesion" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Primera Sesion
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/primera-sesion" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Primera Sesion
          </Link>
          <Link href="/guias/sesion-final" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Sesion Final <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
