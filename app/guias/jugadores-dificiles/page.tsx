import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, UserX, MessageCircle, Shield, AlertTriangle, Heart, Users } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Jugadores Dificiles: Manejar Conflictos en la Mesa | RolHub',
  description: 'Como manejar jugadores problematicos en rol. Conflictos, comportamientos disruptivos, y cuando es hora de hablar.',
  keywords: [
    'jugadores dificiles D&D',
    'conflictos mesa rol',
    'jugadores problematicos RPG',
    'manejar mesa rol',
    'resolucion conflictos rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/jugadores-dificiles',
  },
  openGraph: {
    title: 'Jugadores Dificiles | RolHub',
    description: 'Estrategias para mantener la mesa sana.',
    type: 'article',
  },
}

const playerTypes = [
  {
    type: 'El Protagonista',
    behavior: 'Quiere que todo gire en torno a su personaje. Interrumpe a otros.',
    cause: 'Inseguridad, necesidad de atencion, no entender que es colaborativo.',
    solution: 'Turnos estructurados, spotlight activo a otros, conversacion privada.',
  },
  {
    type: 'El Ausente',
    behavior: 'En el celular, no presta atencion, no recuerda que paso.',
    cause: 'Aburrimiento, ansiedad, no le interesa el juego.',
    solution: 'Preguntale que le interesa, ajusta el juego, considera si quiere estar.',
  },
  {
    type: 'El Rules Lawyer',
    behavior: 'Discute cada decision, cita reglas constantemente.',
    cause: 'Miedo a la injusticia, necesidad de control.',
    solution: '"Lo vemos despues de la sesion", regla de oro del DM, hazlo aliado.',
  },
  {
    type: 'El Edgy',
    behavior: 'Personaje antisocial, traiciona al grupo, hace cosas "porque mi personaje lo haria".',
    cause: 'Quiere ser diferente, no entiende el contrato social.',
    solution: 'Los personajes deben tener razon para cooperar. Sesion cero clara.',
  },
  {
    type: 'El Pasivo',
    behavior: 'No toma decisiones, sigue al grupo, nunca propone nada.',
    cause: 'Timidez, miedo a equivocarse, abrumado.',
    solution: 'Preguntale directamente, dale victorias faciles, espacios seguros.',
  },
  {
    type: 'El Metagamer',
    behavior: 'Usa conocimiento de jugador que su personaje no tiene.',
    cause: 'Quiere ganar, no separa jugador de personaje.',
    solution: 'Sorprende con cambios, recompensa el juego en personaje.',
  },
]

const conversationSteps = [
  {
    step: 'Reconoce el Problema',
    desc: 'Asegurate de que es un patron, no un mal dia.',
    tip: 'Espera a que pase 2-3 veces antes de actuar.',
  },
  {
    step: 'Habla en Privado',
    desc: 'Nunca confrontes en publico. Mensaje o llamada aparte.',
    tip: 'No durante o justo despues de sesion. Dale tiempo.',
  },
  {
    step: 'Usa "Yo" No "Vos"',
    desc: '"Me siento frustrado cuando..." no "Vos siempre..."',
    tip: 'Evita que se ponga a la defensiva.',
  },
  {
    step: 'Escucha',
    desc: 'Puede haber algo que no sabes. Dale espacio para hablar.',
    tip: 'A veces el problema es otro y el comportamiento es sintoma.',
  },
  {
    step: 'Busca Solucion Juntos',
    desc: 'No impongas. Pregunta que cree que podria funcionar.',
    tip: 'El compromiso es mas efectivo que el mandato.',
  },
  {
    step: 'Seguimiento',
    desc: 'Chequea despues de unas sesiones si mejoro.',
    tip: 'Reconoce el esfuerzo si lo hay.',
  },
]

const preventionStrategies = [
  {
    strategy: 'Sesion Cero Clara',
    how: 'Establece expectativas, tono, y reglas de mesa antes de empezar.',
    prevents: 'El 80% de los problemas.',
  },
  {
    strategy: 'Check-ins Regulares',
    how: '5 minutos al final de cada sesion: "Todo bien? Algo que ajustar?"',
    prevents: 'Problemas que crecen en silencio.',
  },
  {
    strategy: 'Contrato Social Explicito',
    how: '"Todos cooperamos, nadie es mas importante, nos comunicamos".',
    prevents: 'Malentendidos sobre que tipo de juego es.',
  },
  {
    strategy: 'Herramientas de Seguridad',
    how: 'Carta X, lineas y velos, palabra de seguridad.',
    prevents: 'Situaciones que cruzan limites.',
  },
]

const escalationLevels = [
  {
    level: '1. Redireccion Suave',
    when: 'Primera vez, puede ser accidental.',
    how: '"Hey, dejemos que [otro jugador] termine su turno."',
  },
  {
    level: '2. Conversacion Privada',
    when: 'Patron que se repite.',
    how: 'Mensaje o llamada aparte, no confrontacional.',
  },
  {
    level: '3. Advertencia Clara',
    when: 'No mejora despues de hablar.',
    how: '"Si esto sigue, vamos a tener que reconsiderar tu lugar en la mesa."',
  },
  {
    level: '4. Pausa o Remocion',
    when: 'El comportamiento afecta a todos y no cambia.',
    how: '"Creo que esta mesa no es el lugar adecuado para vos."',
  },
]

const selfReflection = [
  'El problema es real o es mi percepcion?',
  'Estoy siendo justo con todos los jugadores?',
  'Le di espacio para mejorar?',
  'El juego que estoy corriendo es el que quieren jugar?',
  'Estoy comunicando mis expectativas claramente?',
]

const healthyTableSigns = [
  'Todos tienen momentos de protagonismo',
  'Los conflictos se resuelven hablando',
  'La gente llega con ganas de jugar',
  'Se rien juntos (no de alguien)',
  'Las criticas son constructivas',
  'Respetan los limites de los demas',
]

const finalReminder = {
  title: 'No Es Tu Responsabilidad Arreglar Personas',
  content: 'Tu rol es facilitar un juego, no ser terapeuta. Si alguien no quiere cambiar, no podes obligarlo. A veces la mejor solucion es que esa persona no este en la mesa. Eso no es un fracaso.',
}

export default function JugadoresDificilesPage() {
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
          <span className="text-xs font-ui font-semibold text-parchment">15 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-blood"><UserX className="h-8 w-8 text-white" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Jugadores Dificiles
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Los conflictos en la mesa son inevitables. Lo que importa es
          como los manejas. Esta guia te ayuda a identificar problemas,
          tener conversaciones dificiles, y mantener la mesa sana.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-blood">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Regla de Oro</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>No existe el "jugador problema". Existen comportamientos que afectan a la mesa.</strong>
          <br /><br />
          Separa a la persona de sus acciones. Aborda el comportamiento,
          no ataques a la persona. La mayoria de las veces, no saben que
          estan causando un problema.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> Tipos de Comportamiento
        </h2>
        <div className="space-y-4">
          {playerTypes.map((type) => (
            <ParchmentPanel key={type.type} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{type.type}</h3>
              <p className="font-body text-ink text-sm mb-2"><strong>Comportamiento:</strong> {type.behavior}</p>
              <p className="font-body text-ink text-sm mb-2"><strong>Posible causa:</strong> {type.cause}</p>
              <div className="p-2 bg-emerald/10 rounded">
                <span className="font-ui text-xs text-emerald">Estrategia:</span>
                <p className="font-body text-ink text-sm">{type.solution}</p>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <MessageCircle className="h-6 w-6" /> Como Tener la Conversacion
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-4">
            {conversationSteps.map((step, i) => (
              <div key={step.step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-shadow font-bold text-sm">{i + 1}</span>
                </div>
                <div>
                  <h4 className="font-heading text-ink">{step.step}</h4>
                  <p className="font-body text-ink text-sm mb-1">{step.desc}</p>
                  <p className="font-ui text-xs text-gold-dim">Tip: {step.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Shield className="h-6 w-6" /> Prevencion
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {preventionStrategies.map((strategy) => (
            <ParchmentPanel key={strategy.strategy} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{strategy.strategy}</h4>
              <p className="font-body text-ink text-sm mb-1">{strategy.how}</p>
              <p className="font-ui text-xs text-gold-dim">Previene: {strategy.prevents}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" /> Niveles de Escalada
        </h2>
        <div className="space-y-3">
          {escalationLevels.map((level) => (
            <ParchmentPanel key={level.level} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{level.level}</h4>
              <p className="font-body text-ink text-sm mb-1"><strong>Cuando:</strong> {level.when}</p>
              <p className="font-body text-ink text-sm"><strong>Como:</strong> {level.how}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Heart className="h-6 w-6" /> Autoreflexion
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-3">
            Antes de actuar, preguntate:
          </p>
          <ul className="font-body text-ink space-y-2">
            {selfReflection.map((question, i) => (
              <li key={i} className="p-2 bg-gold/5 rounded">• {question}</li>
            ))}
          </ul>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Senales de una Mesa Sana
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <ul className="font-body text-ink space-y-2">
            {healthyTableSigns.map((sign, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald">✓</span>
                <span>{sign}</span>
              </li>
            ))}
          </ul>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel className="p-6 border-2 border-blood">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">{finalReminder.title}</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            {finalReminder.content}
          </p>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>La diversión de todos importa, incluyendo la tuya.</strong>
            <br /><br />
            Si ser DM se vuelve una carga por un jugador,
            no vale la pena. El rol es para pasarla bien.
            Protege eso.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Aprende a sacar el maximo de RolHub con la IA.
          </p>
          <Link href="/guias/tips-dm-ia" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Tips DM con IA
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/musica-ambientacion" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Musica
          </Link>
          <Link href="/guias/tips-dm-ia" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Tips DM IA <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
