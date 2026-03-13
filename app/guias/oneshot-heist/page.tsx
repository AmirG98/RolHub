import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Key, Users, Clock, AlertTriangle, Zap, Map } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'One-Shot Heist: Como Hacer un Robo en Rol | RolHub',
  description: 'Guia para crear one-shots de robo. Planificacion, ejecucion, complicaciones, y como hacer que el heist sea epico.',
  keywords: [
    'heist one-shot',
    'robo D&D',
    'one-shot robo RPG',
    'atraco juegos de rol',
    'oceans eleven rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/oneshot-heist',
  },
  openGraph: {
    title: 'One-Shot Heist | RolHub',
    description: 'Planifica el robo perfecto.',
    type: 'article',
  },
}

const heistPhases = [
  {
    phase: 'El Contacto',
    time: '10-15 min',
    desc: 'Alguien los contrata. Presentan el objetivo y la recompensa.',
    key: 'El contratista debe ser memorable y tener agenda propia.',
  },
  {
    phase: 'La Informacion',
    time: '15-20 min',
    desc: 'Reconocimiento del lugar. Planos, guardias, rutas.',
    key: 'Da 3 datos utiles y 1 que parece util pero no lo es.',
  },
  {
    phase: 'El Plan',
    time: '10-15 min',
    desc: 'Los jugadores deciden como lo van a hacer.',
    key: 'No los apures, pero ten un timer visible.',
  },
  {
    phase: 'La Ejecucion',
    time: '30-40 min',
    desc: 'El robo en si. Las cosas salen bien... hasta que no.',
    key: 'Al menos una complicacion inesperada debe ocurrir.',
  },
  {
    phase: 'La Escape',
    time: '15-20 min',
    desc: 'Salir del lugar con el botin. La persecucion.',
    key: 'El escape es tan importante como el robo.',
  },
]

const heistRoles = [
  {
    role: 'El Cerebro',
    desc: 'Planifica, coordina, tiene el plan B.',
    moment: 'Cuando algo sale mal, es su momento de improvisar.',
  },
  {
    role: 'El Infiltrado',
    desc: 'Entra primero, desactiva seguridad, abre puertas.',
    moment: 'La primera parte del heist depende de el.',
  },
  {
    role: 'El Musculo',
    desc: 'Cuando las cosas se ponen feas, entra en accion.',
    moment: 'La complicacion es su oportunidad de brillar.',
  },
  {
    role: 'El Cara',
    desc: 'Distrae, manipula, habla con los guardias.',
    moment: 'Las interacciones sociales son su terreno.',
  },
  {
    role: 'El Especialista',
    desc: 'Tiene la habilidad unica que el heist necesita.',
    moment: 'La boveda, el sistema magico, el guardian. Su especialidad.',
  },
]

const complications = [
  {
    complication: 'El Plan B del Objetivo',
    desc: 'El objetivo tiene su propia seguridad que no sabian.',
    trigger: 'Cuando el plan va demasiado bien.',
  },
  {
    complication: 'El Traidor Interno',
    desc: 'Alguien del equipo o el contacto tiene otra agenda.',
    trigger: 'Mitad del heist, cuando ya no pueden retroceder.',
  },
  {
    complication: 'La Carrera contra el Tiempo',
    desc: 'Algo acelera el timeline. Tienen menos tiempo.',
    trigger: 'Cuando estan deliberando demasiado.',
  },
  {
    complication: 'El Testigo Inesperado',
    desc: 'Alguien los ve que no deberia estar ahi.',
    trigger: 'Despues de un exito critico, para balancear.',
  },
  {
    complication: 'El Objetivo se Mueve',
    desc: 'Lo que venian a robar cambia de ubicacion.',
    trigger: 'Cuando ya estan adentro.',
  },
]

const objectiveTypes = [
  {
    type: 'El Artefacto',
    desc: 'Objeto magico o valioso en una boveda.',
    security: 'Trampas, guardias, sistemas magicos.',
  },
  {
    type: 'La Informacion',
    desc: 'Documentos, memorias, secretos.',
    security: 'Encriptacion, archiveros paranoicos.',
  },
  {
    type: 'La Persona',
    desc: 'Rescatar (o secuestrar) a alguien.',
    security: 'Guardaespaldas, la persona misma.',
  },
  {
    type: 'El Dinero',
    desc: 'Boveda de banco, tesoro de gremio.',
    security: 'Clasica: guardias, cerraduras, alarmas.',
  },
]

const flashbackMechanic = {
  title: 'Mecanica de Flashback',
  desc: 'Cuando algo sale mal, un jugador puede decir "Pero yo habia previsto esto..."',
  rules: [
    'El jugador describe que hizo en el pasado para prepararse',
    'Hace una tirada para ver si la preparacion funciona',
    'Exito = el problema se resuelve o se mitiga',
    'Fallo = la preparacion existe pero no ayuda tanto',
    'Maximo 2-3 flashbacks por heist',
  ],
  example: '"Pero yo habia sobornado al guardia del turno nocturno." Tirada de Carisma. Exito: el guardia mira para otro lado.',
}

const dmTips = [
  'Ten un plano del lugar preparado, aunque sea simple',
  'Los guardias tienen rutinas. Descubrirlas es parte del juego.',
  'Deja que el plan de los jugadores funcione... mayormente',
  'Las complicaciones deben ser solucionables, no game over',
  'El escape es el segundo acto, no un epilogo',
  'Si nadie tiene un rol claro, asignalo basado en sus personajes',
]

const movieInspiration = [
  { movie: 'Ocean\'s Eleven', take: 'Cada miembro tiene un rol unico. El plan es elaborado.' },
  { movie: 'Heat', take: 'Profesionales serios. Las cosas van mal. La salida es caotica.' },
  { movie: 'The Italian Job', take: 'El escape es la mitad del heist. Vehiculos, persecucion.' },
  { movie: 'Inside Man', take: 'No todo es lo que parece. El objetivo real esta oculto.' },
]

export default function OneshotHeistPage() {
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
          <span className="text-xs font-ui font-semibold text-parchment">15 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><Key className="h-8 w-8 text-shadow" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            One-Shot: Heist
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          El heist es el one-shot perfecto: objetivo claro, roles definidos,
          tension constante, y un climax inevitable. Es como una pelicula
          de atracos, pero son tus jugadores los que hacen el plan.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Regla de Oro del Heist</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>Ningun plan sobrevive el contacto con la realidad.</strong>
          <br /><br />
          El heist no es sobre ejecutar un plan perfecto.
          Es sobre como el equipo improvisa cuando todo se va al carajo.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Clock className="h-6 w-6" /> Fases del Heist
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-4">
            {heistPhases.map((phase, i) => (
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
                  <p className="font-ui text-xs text-gold-dim">Clave: {phase.key}</p>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> Roles del Equipo
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {heistRoles.map((role) => (
            <ParchmentPanel key={role.role} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{role.role}</h3>
              <p className="font-body text-ink text-sm mb-2">{role.desc}</p>
              <p className="font-ui text-xs text-gold-dim">Su momento: {role.moment}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Map className="h-6 w-6" /> Tipos de Objetivo
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {objectiveTypes.map((obj) => (
            <ParchmentPanel key={obj.type} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{obj.type}</h4>
              <p className="font-body text-ink text-sm mb-1">{obj.desc}</p>
              <p className="font-ui text-xs text-gold-dim">Seguridad: {obj.security}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" /> Complicaciones
        </h2>
        <div className="space-y-3">
          {complications.map((comp) => (
            <ParchmentPanel key={comp.complication} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{comp.complication}</h4>
              <p className="font-body text-ink text-sm mb-1">{comp.desc}</p>
              <p className="font-ui text-xs text-blood">Trigger: {comp.trigger}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6" /> {flashbackMechanic.title}
        </h2>
        <ParchmentPanel className="p-6 border-2 border-gold">
          <p className="font-body text-ink mb-4">{flashbackMechanic.desc}</p>
          <ul className="font-body text-ink text-sm space-y-2 mb-4">
            {flashbackMechanic.rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-gold font-bold">{i + 1}.</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
          <div className="p-3 bg-gold/10 rounded">
            <p className="font-body text-ink text-sm italic">{flashbackMechanic.example}</p>
          </div>
        </ParchmentPanel>
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
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Inspiracion de Peliculas
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {movieInspiration.map((movie) => (
            <ParchmentPanel key={movie.movie} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{movie.movie}</h4>
              <p className="font-body text-ink text-sm">{movie.take}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>El heist es un puzzle donde los jugadores son las piezas.</strong>
            <br /><br />
            Tu trabajo es darles las herramientas, el objetivo, y los obstaculos.
            El plan es de ellos. La improvisacion cuando falla, tambien.
            Vos solo administras el caos.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Explorar Otros One-Shots
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            El misterio es otro formato perfecto para one-shots.
          </p>
          <Link href="/guias/oneshot-misterio" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            One-Shot: Misterio
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/sesiones-cortas" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Sesiones Cortas
          </Link>
          <Link href="/guias/oneshot-misterio" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: One-Shot Misterio <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
