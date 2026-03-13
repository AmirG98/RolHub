import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Target, Swords, Users, Clock, Sparkles, AlertTriangle } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Como Disenar Encuentros: Guia para DMs | RolHub',
  description: 'Aprende a crear encuentros memorables. Balance, variedad, stakes y pacing para combates y escenas sociales.',
  keywords: [
    'disenar encuentros D&D',
    'balance combate rol',
    'crear encuentros RPG',
    'pacing sesion rol',
    'stakes narrativos'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/disenar-encuentros',
  },
  openGraph: {
    title: 'Como Disenar Encuentros | RolHub',
    description: 'La guia definitiva para crear combates y escenas memorables.',
    type: 'article',
  },
}

const encounterTypes = [
  {
    type: 'Combate',
    icon: Swords,
    desc: 'Enfrentamiento fisico contra enemigos.',
    when: 'Cuando la tension necesita estallar, o cuando hay consecuencias claras.',
    tips: ['No cada combate debe ser a muerte', 'Objetivos alternativos: escapar, proteger, capturar', 'El entorno es tan importante como los enemigos'],
  },
  {
    type: 'Social',
    icon: Users,
    desc: 'Negociacion, persuasion, investigacion.',
    when: 'Cuando la info o aliados son mas importantes que la violencia.',
    tips: ['Los NPCs tienen agendas propias', 'Fallar no debe bloquear la historia', 'Las consecuencias sociales pueden ser peores que las fisicas'],
  },
  {
    type: 'Exploracion',
    icon: Target,
    desc: 'Descubrir secretos, navegar peligros.',
    when: 'Cuando el misterio y descubrimiento son la recompensa.',
    tips: ['Recompensa la curiosidad', 'Peligros ambientales crean tension sin enemigos', 'Deja pistas claras hacia lo importante'],
  },
]

const stakes = [
  { level: 'Bajo', desc: 'Perder no tiene consecuencias graves. Tutorial, escenas de setup.', example: 'Torneo amistoso, negociacion por descuento.' },
  { level: 'Medio', desc: 'Hay algo real que perder: recursos, tiempo, reputacion.', example: 'Combate contra patrulla, perder pista importante.' },
  { level: 'Alto', desc: 'La vida de alguien o el exito de la mision estan en juego.', example: 'Rescate con tiempo limite, jefe de dungeon.' },
  { level: 'Critico', desc: 'Todo puede cambiar. Final de arco o campana.', example: 'Batalla final, decision que define el mundo.' },
]

const pacing = [
  { phase: 'Setup', desc: 'Presenta la situacion. Que ven? Quien esta? Cual es el peligro?', time: 'Breve' },
  { phase: 'Escalada', desc: 'La tension aumenta. Complicaciones, revelaciones, presion.', time: 'Principal' },
  { phase: 'Climax', desc: 'El momento decisivo. Todo se juega aca.', time: 'Intenso' },
  { phase: 'Resolucion', desc: 'Las consecuencias. Que cambio? Quien gano/perdio que?', time: 'Breve' },
]

const balanceTips = [
  {
    tip: 'Usa la Regla de 3',
    desc: 'Tres enemigos, tres obstaculos, tres rondas aproximadas. Simple y efectivo.',
  },
  {
    tip: 'Ajusta en Tiempo Real',
    desc: 'Si es muy facil, refuerzos llegan. Si es muy dificil, un aliado ayuda o hay escape.',
  },
  {
    tip: 'No Todo es Combate',
    desc: 'El enemigo puede rendirse, negociar, o huir. Varia las resoluciones.',
  },
  {
    tip: 'El Entorno Importa',
    desc: 'Terreno dificil, obstaculos, elementos interactivos hacen combates memorables.',
  },
]

const objectives = [
  { objective: 'Matar a todos', desc: 'Clasico pero puede volverse monotono. Usarlo cuando narrativamente tenga sentido.' },
  { objective: 'Sobrevivir X rondas', desc: 'Tension sin necesidad de ganar. Buenos para enemigos abrumadores.' },
  { objective: 'Proteger algo/alguien', desc: 'Divide la atencion del grupo. Decisiones tacticas interesantes.' },
  { objective: 'Llegar a un lugar', desc: 'Combate en movimiento. Dinamico y cinematico.' },
  { objective: 'Obtener el objeto', desc: 'El objetivo no es el enemigo sino lo que tiene. Permite robo creativo.' },
  { objective: 'Capturar vivo', desc: 'Mucho mas dificil que matar. Requiere planificacion.' },
]

export default function DisenarEncuentrosPage() {
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
          <span className="text-xs font-ui font-semibold text-parchment">12 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><Target className="h-8 w-8 text-shadow" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Disenar Encuentros
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Un buen encuentro no es solo un combate equilibrado. Es una situacion
          con tension, opciones interesantes, y consecuencias significativas.
          Aprender a disenarlos transforma tus sesiones.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tipos de Encuentros
        </h2>
        <div className="space-y-4">
          {encounterTypes.map((type) => (
            <ParchmentPanel key={type.type} className="p-6 border border-gold-dim">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gold-dim flex-shrink-0">
                  <type.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-xl text-ink mb-2">{type.type}</h3>
                  <p className="font-body text-ink mb-2">{type.desc}</p>
                  <p className="font-ui text-sm text-gold-dim mb-3">Cuando usar: {type.when}</p>
                  <ul className="font-body text-ink text-sm space-y-1">
                    {type.tips.map((tip, i) => (
                      <li key={i}>• {tip}</li>
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
          <AlertTriangle className="h-6 w-6" /> Niveles de Stakes
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">
            No todo encuentro debe ser vida o muerte. Varia la intensidad para que los momentos
            importantes realmente importen.
          </p>
          <div className="space-y-3">
            {stakes.map((s) => (
              <div key={s.level} className="p-3 bg-gold/5 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-ui font-bold px-2 py-0.5 rounded ${
                    s.level === 'Bajo' ? 'bg-emerald/20 text-emerald' :
                    s.level === 'Medio' ? 'bg-gold/20 text-gold-dim' :
                    s.level === 'Alto' ? 'bg-blood/30 text-blood' :
                    'bg-blood text-white'
                  }`}>{s.level}</span>
                </div>
                <p className="font-body text-ink text-sm">{s.desc}</p>
                <p className="font-ui text-xs text-ink mt-1"><strong>Ejemplo:</strong> {s.example}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Clock className="h-6 w-6" /> Pacing del Encuentro
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-4">
            {pacing.map((p, i) => (
              <div key={p.phase} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-shadow font-bold">{i + 1}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-heading text-ink">{p.phase}</h4>
                    <span className="text-xs font-ui text-gold-dim">{p.time}</span>
                  </div>
                  <p className="font-body text-ink text-sm">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Objetivos Alternativos
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {objectives.map((obj) => (
            <ParchmentPanel key={obj.objective} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{obj.objective}</h4>
              <p className="font-body text-ink text-sm">{obj.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Tips de Balance
        </h2>
        <div className="space-y-3">
          {balanceTips.map((item) => (
            <ParchmentPanel key={item.tip} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{item.tip}</h4>
              <p className="font-body text-ink text-sm">{item.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">El Encuentro Perfecto</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            Tiene <strong>algo en juego</strong> que importa a los jugadores.
            <br />
            Ofrece <strong>opciones interesantes</strong>, no solo "ataco".
            <br />
            Tiene <strong>consecuencias</strong> que afectan la historia.
            <br />
            Es <strong>memorable</strong> por el entorno, los NPCs, o la situacion.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Aplicar lo Aprendido
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Ya sabes disenar encuentros. Ahora entende como manejar el combate.
          </p>
          <Link href="/guias/combate" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Guia de Combate
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/crear-npcs" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Crear NPCs
          </Link>
          <Link href="/guias" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Ver Todas las Guias
          </Link>
        </div>
      </nav>
    </article>
  )
}
