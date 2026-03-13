import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Mountain, Clock, AlertTriangle, Heart, Zap, Target } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'One-Shot Supervivencia: Recursos Limitados y Tension | RolHub',
  description: 'Guia para crear one-shots de supervivencia. Recursos escasos, amenazas constantes, y la lucha por sobrevivir.',
  keywords: [
    'supervivencia one-shot',
    'survival D&D',
    'one-shot recursos limitados',
    'escapar juegos de rol',
    'tension supervivencia RPG'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/oneshot-supervivencia',
  },
  openGraph: {
    title: 'One-Shot Supervivencia | RolHub',
    description: 'Sobrevivi la noche.',
    type: 'article',
  },
}

const survivalPillars = [
  {
    pillar: 'Recursos Limitados',
    desc: 'Comida, agua, municion, luz. Todo se gasta.',
    mechanic: 'Trackea cada recurso. Cada uso importa.',
    icon: Target,
  },
  {
    pillar: 'Amenaza Constante',
    desc: 'Algo los persigue, el ambiente es hostil, el tiempo corre.',
    mechanic: 'Nunca estan completamente a salvo.',
    icon: AlertTriangle,
  },
  {
    pillar: 'Decisiones Dificiles',
    desc: 'No hay opciones buenas. Solo menos malas.',
    mechanic: 'Cada eleccion tiene un costo.',
    icon: Zap,
  },
  {
    pillar: 'Tension Acumulativa',
    desc: 'Las cosas empeoran antes de mejorar.',
    mechanic: 'Cada acto es peor que el anterior.',
    icon: Clock,
  },
]

const survivalStructure = [
  {
    phase: 'El Desastre',
    time: '5-10 min',
    desc: 'Algo terrible pasa. Estan en problemas.',
    key: 'Establece inmediatamente que los recursos son limitados.',
  },
  {
    phase: 'La Evaluacion',
    time: '10-15 min',
    desc: 'Que tienen? Que necesitan? Donde estan?',
    key: 'Los jugadores hacen inventario y planean.',
  },
  {
    phase: 'El Primer Obstaculo',
    time: '20-25 min',
    desc: 'Algo se interpone. Gastan recursos para superarlo.',
    key: 'El costo debe sentirse. No hay victorias gratis.',
  },
  {
    phase: 'La Complicacion',
    time: '20-25 min',
    desc: 'Las cosas empeoran. Nueva amenaza o perdida.',
    key: 'Alguien o algo fuerza una decision dificil.',
  },
  {
    phase: 'El Climax',
    time: '15-20 min',
    desc: 'Todo lo que queda va a la ultima apuesta.',
    key: 'Todo el recurso restante se usa o pierde.',
  },
  {
    phase: 'La Salida',
    time: '5-10 min',
    desc: 'Escaparon... o no. Las consecuencias.',
    key: 'El final puede ser victoria, escape, o tragedia.',
  },
]

const resourceTypes = [
  {
    resource: 'Salud',
    track: 'HP, heridas, condiciones.',
    tension: 'Sin sanacion facil. Cada golpe importa.',
  },
  {
    resource: 'Suministros',
    track: 'Comida, agua, antorchas.',
    tension: 'Se agotan con el tiempo, no solo con uso.',
  },
  {
    resource: 'Equipo',
    track: 'Armas, herramientas, objetos utiles.',
    tension: 'Se rompen, se pierden, hay que elegir que llevar.',
  },
  {
    resource: 'Tiempo',
    track: 'Turnos, horas, dias.',
    tension: 'Algo avanza aunque ellos no hagan nada.',
  },
  {
    resource: 'Cordura/Moral',
    track: 'Estres, panico, confianza.',
    tension: 'El grupo se desgasta emocionalmente.',
  },
]

const scenarioIdeas = [
  {
    scenario: 'Atrapados en el Dungeon',
    setup: 'La entrada colapso. Tienen que encontrar otra salida.',
    amenaza: 'El dungeon tiene habitantes. El aire se acaba.',
    recursos: 'Antorchas, comida, HP.',
  },
  {
    scenario: 'Naufragos',
    setup: 'El barco se hundio. Estan en una isla hostil.',
    amenaza: 'Depredadores, clima, falta de agua.',
    recursos: 'Lo que pudieron rescatar del naufragio.',
  },
  {
    scenario: 'La Tormenta',
    setup: 'Una tormenta sobrenatural los atrapo.',
    amenaza: 'La tormenta destruye refugios. Criaturas cazan.',
    recursos: 'Refugio, calor, luz.',
  },
  {
    scenario: 'La Plaga',
    setup: 'Una enfermedad arrasa la region. Tienen que escapar.',
    amenaza: 'Infectados, cuarentenas, panico.',
    recursos: 'Salud, suministros medicos, confianza.',
  },
  {
    scenario: 'Detras de Lineas Enemigas',
    setup: 'Estan en territorio hostil. Tienen que volver.',
    amenaza: 'Patrullas enemigas, espias, terreno desconocido.',
    recursos: 'Municion, comida, sigilo.',
  },
]

const tensionMechanics = [
  {
    mechanic: 'El Reloj de Amenaza',
    desc: 'Una barra que avanza cada turno/escena. Cuando llena, algo malo pasa.',
    use: 'Visible para los jugadores. Genera presion constante.',
  },
  {
    mechanic: 'Tiradas de Desgaste',
    desc: 'Cada X turnos, los recursos bajan automaticamente.',
    use: 'El tiempo pasa factura aunque no hagan nada.',
  },
  {
    mechanic: 'Decisiones Binarias',
    desc: 'Salvar al companero O conservar los suministros.',
    use: 'Fuerza conflicto interno y discusion.',
  },
  {
    mechanic: 'Informacion Incompleta',
    desc: 'No saben cuanto falta para la salida.',
    use: 'No pueden optimizar. Tienen que apostar.',
  },
]

const dmTips = [
  'Ten un tracker de recursos visible para todos',
  'Nunca dejes que descansen completamente',
  'Las victorias deben costar algo',
  'Los NPCs pueden morir — demuestra las stakes',
  'El ambiente es tan enemigo como los monstruos',
  'Deja que tomen malas decisiones',
]

const playerTips = [
  'Comunica tus recursos al grupo',
  'No acumules — los recursos son para usar',
  'Acepta que no podes salvar todo',
  'Prioriza la supervivencia del grupo sobre la individual',
  'Las decisiones dificiles definen al personaje',
]

export default function OneshotSupervivenciaPage() {
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
          <div className="p-4 rounded-lg bg-blood"><Mountain className="h-8 w-8 text-white" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            One-Shot: Supervivencia
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          En un one-shot de supervivencia, el objetivo no es derrotar al malo.
          Es salir con vida. Los recursos se agotan, las amenazas no paran,
          y cada decision puede ser la diferencia entre vivir y morir.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-blood">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Regla de la Supervivencia</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>Todo tiene un costo. Nada es gratis.</strong>
          <br /><br />
          Cada victoria gasta recursos. Cada descanso arriesga tiempo.
          Cada decision sacrifica algo. Los jugadores siempre estan eligiendo
          que perder, no que ganar.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Pilares de la Supervivencia
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {survivalPillars.map((pillar) => (
            <ParchmentPanel key={pillar.pillar} className="p-5 border border-gold-dim">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blood flex-shrink-0">
                  <pillar.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-ink mb-1">{pillar.pillar}</h3>
                  <p className="font-body text-ink text-sm mb-1">{pillar.desc}</p>
                  <p className="font-ui text-xs text-gold-dim">Mecanica: {pillar.mechanic}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Clock className="h-6 w-6" /> Estructura del One-Shot
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-4">
            {survivalStructure.map((phase, i) => (
              <div key={phase.phase} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blood flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-white font-bold text-sm">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-heading text-ink">{phase.phase}</h4>
                    <span className="font-mono text-xs text-gold bg-gold/10 px-2 py-1 rounded">{phase.time}</span>
                  </div>
                  <p className="font-body text-ink text-sm mb-1">{phase.desc}</p>
                  <p className="font-ui text-xs text-gold-dim">Clave: {phase.key}</p>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Heart className="h-6 w-6" /> Tipos de Recursos
        </h2>
        <div className="space-y-3">
          {resourceTypes.map((res) => (
            <ParchmentPanel key={res.resource} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{res.resource}</h4>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-gold/10 rounded">
                  <span className="font-ui text-xs text-gold-dim">Trackear</span>
                  <p className="font-body text-ink">{res.track}</p>
                </div>
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">Tension</span>
                  <p className="font-body text-ink">{res.tension}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Mountain className="h-6 w-6" /> Escenarios de Supervivencia
        </h2>
        <div className="space-y-4">
          {scenarioIdeas.map((scenario) => (
            <ParchmentPanel key={scenario.scenario} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{scenario.scenario}</h3>
              <p className="font-body text-ink text-sm mb-1"><strong>Setup:</strong> {scenario.setup}</p>
              <p className="font-body text-ink text-sm mb-1"><strong>Amenaza:</strong> {scenario.amenaza}</p>
              <p className="font-ui text-xs text-gold-dim"><strong>Recursos clave:</strong> {scenario.recursos}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6" /> Mecanicas de Tension
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {tensionMechanics.map((mech) => (
            <ParchmentPanel key={mech.mechanic} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{mech.mechanic}</h4>
              <p className="font-body text-ink text-sm mb-2">{mech.desc}</p>
              <p className="font-ui text-xs text-gold-dim">Uso: {mech.use}</p>
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
                  <li key={i}>• {tip}</li>
                ))}
              </ul>
            </ParchmentPanel>
          </div>
          <div>
            <h2 className="font-heading text-xl text-gold-bright mb-4">Tips para Jugadores</h2>
            <ParchmentPanel className="p-5 border border-gold-dim">
              <ul className="font-body text-ink text-sm space-y-2">
                {playerTips.map((tip, i) => (
                  <li key={i}>• {tip}</li>
                ))}
              </ul>
            </ParchmentPanel>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>El objetivo no es que todos sobrevivan. Es que la lucha valga la pena.</strong>
            <br /><br />
            Una supervivencia donde todo sale bien no es supervivencia.
            Las perdidas, los sacrificios, las decisiones imposibles...
            eso es lo que hace que sobrevivir signifique algo.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Explorar Otros One-Shots
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            El festival es el opuesto: ligero, divertido, sin presion.
          </p>
          <Link href="/guias/oneshot-festival" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            One-Shot: Festival
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/oneshot-misterio" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: One-Shot Misterio
          </Link>
          <Link href="/guias/oneshot-festival" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Festival <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
