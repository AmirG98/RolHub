import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Swords, Shield, Zap, Target, Clock, Skull } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Guia de Combate: Mecanicas y Tacticas | RolHub',
  description: 'Domina el combate en juegos de rol. Acciones, reacciones, posicionamiento, y como describir tus ataques de forma epica.',
  keywords: [
    'combate juegos de rol',
    'mecanicas combate D&D',
    'tacticas RPG',
    'describir ataques rol',
    'iniciativa combate'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/combate',
  },
  openGraph: {
    title: 'Guia de Combate | RolHub',
    description: 'Todo sobre combate en juegos de rol narrativo.',
    type: 'article',
  },
}

const combatPhases = [
  {
    phase: 'Iniciativa',
    desc: 'Se determina quien actua primero. Puede ser una tirada o narrativo.',
    tip: 'Mantene tu turno preparado. Mientras otros actuan, planea el tuyo.',
  },
  {
    phase: 'Turnos',
    desc: 'Cada participante tiene una accion (o varias). El combate avanza ronda por ronda.',
    tip: 'Tu turno no tiene que ser atacar. Ayudar, esconderte, o huir son opciones validas.',
  },
  {
    phase: 'Resolución',
    desc: 'Se tiran dados, se aplica daño, se actualizan condiciones.',
    tip: 'Describe lo que intentas, no solo la mecanica. "Ataco" vs "Intento cortarle las piernas".',
  },
  {
    phase: 'Consecuencias',
    desc: 'El combate termina cuando un bando cae, huye, o se rinde.',
    tip: 'Rendirse o negociar a mitad de combate es una opcion. No siempre hay que pelear hasta el final.',
  },
]

const actionTypes = [
  {
    type: 'Ataque',
    icon: Swords,
    desc: 'Intentar dañar a un enemigo con arma o magia.',
    examples: ['Corte con espada', 'Disparo con arco', 'Lanzar hechizo ofensivo'],
  },
  {
    type: 'Defensa',
    icon: Shield,
    desc: 'Protegerte a vos o a otros.',
    examples: ['Esquivar', 'Bloquear con escudo', 'Interponerte para proteger a un aliado'],
  },
  {
    type: 'Movimiento',
    icon: Zap,
    desc: 'Cambiar de posicion en el campo de batalla.',
    examples: ['Flanquear al enemigo', 'Buscar cobertura', 'Acercarte al arquero enemigo'],
  },
  {
    type: 'Apoyo',
    icon: Target,
    desc: 'Ayudar a tus aliados de formas no-combativas.',
    examples: ['Curar', 'Dar ventaja en el proximo ataque', 'Distraer al enemigo'],
  },
]

const descriptions = [
  {
    bad: 'Ataco con mi espada.',
    good: 'Rujo mientras cargo hacia el orco, buscando un hueco en su armadura con un tajo ascendente.',
    why: 'La descripcion agrega inmersion y hace el combate memorable.',
  },
  {
    bad: 'Uso curacion.',
    good: 'Coloco mis manos sobre la herida de Kira, murmurando una oracion mientras luz dorada cierra el corte.',
    why: 'Incluso las acciones de apoyo pueden ser cinematicas.',
  },
  {
    bad: 'Me escondo.',
    good: 'Me deslizo detras de los barriles de vino, conteniendo la respiracion mientras los guardias pasan.',
    why: 'El contexto hace que la accion tenga peso narrativo.',
  },
]

const tactics = [
  {
    tactic: 'Posicionamiento',
    desc: 'Donde estas importa. Flanquear da ventaja. Terreno alto da mejor vision. Cobertura reduce daño.',
  },
  {
    tactic: 'Foco de Fuego',
    desc: 'Concentrar ataques en un enemigo es mas efectivo que repartir daño entre varios.',
  },
  {
    tactic: 'Control del Campo',
    desc: 'Usar el entorno: cerrar puertas, volcar mesas, crear obstaculos. El mapa es un arma.',
  },
  {
    tactic: 'Accion en Equipo',
    desc: 'Coordina con tu grupo. "Yo lo distraigo, vos atacas por atras" funciona mejor que atacar individualmente.',
  },
  {
    tactic: 'Saber Retirarse',
    desc: 'Si el combate va mal, huir es tactico. Mejor reagruparse que morir por orgullo.',
  },
]

const commonMistakes = [
  {
    mistake: 'Atacar siempre lo mas cercano',
    fix: 'Evalua prioridades. El mago enemigo puede ser mas peligroso que el guerrero.',
  },
  {
    mistake: 'Ignorar el entorno',
    fix: 'Pregunta que hay alrededor. Candelabros, pozos, escaleras — todo es util.',
  },
  {
    mistake: 'Olvidar acciones no-combativas',
    fix: 'Intimidar, negociar, o crear distracciones pueden cambiar un combate.',
  },
  {
    mistake: 'No comunicar con el equipo',
    fix: 'Avisa tus planes. "Voy a cargar" le da info a tus compañeros.',
  },
]

export default function CombatePage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-blood px-2 py-1 rounded">Mecanicas</span>
          <span className="text-xs font-ui font-semibold text-parchment">10 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-blood"><Swords className="h-8 w-8 text-white" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Guia de Combate
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          El combate en rol no es solo tirar dados y restar HP.
          Es un momento de tension donde las decisiones importan, el trabajo
          en equipo brilla, y las descripciones epicas hacen la diferencia.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Clock className="h-6 w-6" /> Flujo del Combate
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-4">
            {combatPhases.map((phase, i) => (
              <div key={phase.phase} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blood flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-white font-bold">{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-heading text-ink mb-1">{phase.phase}</h3>
                  <p className="font-body text-ink text-sm mb-2">{phase.desc}</p>
                  <p className="font-ui text-xs text-gold-dim">Tip: {phase.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tipos de Acciones
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {actionTypes.map((action) => (
            <ParchmentPanel key={action.type} className="p-5 border border-gold-dim">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gold-dim flex-shrink-0">
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-ink mb-1">{action.type}</h3>
                  <p className="font-body text-ink text-sm mb-2">{action.desc}</p>
                  <ul className="font-ui text-xs text-ink">
                    {action.examples.map((ex, i) => (
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
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Describir tus Acciones
        </h2>
        <ParchmentPanel className="p-6 border-2 border-gold">
          <p className="font-body text-ink mb-4">
            La diferencia entre un combate aburrido y uno memorable esta en como describis.
            No es obligatorio, pero hace el juego mucho mejor.
          </p>
          <div className="space-y-4">
            {descriptions.map((d, i) => (
              <div key={i} className="grid md:grid-cols-2 gap-3">
                <div className="p-3 bg-blood/10 rounded border-l-4 border-blood">
                  <span className="font-ui text-xs text-blood">Basico</span>
                  <p className="font-body text-ink text-sm italic">"{d.bad}"</p>
                </div>
                <div className="p-3 bg-emerald/10 rounded border-l-4 border-emerald">
                  <span className="font-ui text-xs text-emerald">Descriptivo</span>
                  <p className="font-body text-ink text-sm italic">"{d.good}"</p>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Target className="h-6 w-6" /> Tacticas Basicas
        </h2>
        <div className="space-y-3">
          {tactics.map((t) => (
            <ParchmentPanel key={t.tactic} className="p-4 border border-gold-dim/50">
              <h3 className="font-heading text-ink mb-1">{t.tactic}</h3>
              <p className="font-body text-ink text-sm">{t.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Skull className="h-6 w-6" /> Errores Comunes
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
            <strong>El combate es un momento dramatico, no un juego de numeros.</strong>
            <br /><br />
            Las batallas mas memorables no son las que ganaste facilmente,
            sino las que te hicieron sudar, pensar, y trabajar en equipo.
            Disfruta la tension.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            El combate no es la unica forma de resolver problemas.
          </p>
          <Link href="/guias/exploracion" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Guia de Exploracion
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/disenar-encuentros" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Disenar Encuentros
          </Link>
          <Link href="/guias/exploracion" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Exploracion <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
