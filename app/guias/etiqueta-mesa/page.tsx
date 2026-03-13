import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Users, Clock, MessageCircle, Heart, AlertTriangle, Sparkles } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Etiqueta de Mesa: Normas Sociales del Rol | RolHub',
  description: 'Las reglas no escritas de los juegos de rol. Puntualidad, atencion, respeto, y como ser un buen compañero de mesa.',
  keywords: [
    'etiqueta mesa rol',
    'normas juegos de rol',
    'ser buen jugador D&D',
    'reglas sociales RPG',
    'comportamiento mesa rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/etiqueta-mesa',
  },
  openGraph: {
    title: 'Etiqueta de Mesa | RolHub',
    description: 'Las reglas no escritas que hacen el juego mejor.',
    type: 'article',
  },
}

const basicRules = [
  {
    rule: 'Se Puntual',
    icon: Clock,
    desc: 'El tiempo de todos vale. Si llegas tarde, avisá con anticipacion.',
    tip: 'Estar 5 minutos antes es estar a tiempo.',
  },
  {
    rule: 'Presta Atencion',
    icon: MessageCircle,
    desc: 'Cuando no es tu turno, escucha. No al celular, no a otras conversaciones.',
    tip: 'Tu atencion valida el esfuerzo de los demas.',
  },
  {
    rule: 'Respeta el Turno',
    icon: Users,
    desc: 'Deja que otros hablen. No interrumpas. Todos merecen su momento.',
    tip: 'El spotlight se comparte. Nadie quiere ver un show de una sola persona.',
  },
  {
    rule: 'Ven Preparado',
    icon: Sparkles,
    desc: 'Conoce a tu personaje. Sabe que hace tu clase. Trae lo necesario.',
    tip: 'Leer tu hoja de personaje entre sesiones ahorra tiempo a todos.',
  },
]

const dosAndDonts = [
  {
    do: 'Colabora con el grupo',
    dont: 'Hagas todo solo',
    why: 'Es un juego de equipo. Los heroes solitarios aburren.',
  },
  {
    do: 'Apoya las ideas de otros',
    dont: 'Digas "no" a todo',
    why: 'El "si, y..." hace mejores historias que el "no, pero...".',
  },
  {
    do: 'Acepta los resultados de los dados',
    dont: 'Discutas tiradas constantemente',
    why: 'Los fallos crean drama. Abrazalos.',
  },
  {
    do: 'Separa jugador de personaje',
    dont: 'Tomes ataques a tu PJ como personales',
    why: 'Tu personaje puede estar en conflicto sin que vos lo estes.',
  },
  {
    do: 'Da credito al DM y jugadores',
    dont: 'Minimices el esfuerzo de otros',
    why: 'Reconocer buenos momentos motiva a todos.',
  },
  {
    do: 'Comunica problemas',
    dont: 'Guardes resentimientos',
    why: 'Un problema hablado se resuelve. Uno callado crece.',
  },
]

const phoneRules = [
  'Silenciá notificaciones antes de empezar',
  'Si necesitas atender algo, avisa y alejate',
  'Usar el celu para tirar dados o ver tu ficha esta bien',
  'Scrollear redes mientras otros actuan no esta bien',
  'Una urgencia real siempre tiene prioridad — pero que sea real',
]

const respectTopics = [
  {
    topic: 'Respeto al DM',
    points: [
      'Preparar una sesion lleva horas. Agradecelo.',
      'Las reglas del DM son las que valen en esa mesa.',
      'Si no te gusta algo, hablalo en privado despues, no en medio del juego.',
    ],
  },
  {
    topic: 'Respeto a Jugadores',
    points: [
      'No hables sobre otro PJ sin que el jugador este presente.',
      'Dejá que cada uno interprete a su personaje.',
      'Celebra los exitos de otros, no solo los tuyos.',
    ],
  },
  {
    topic: 'Respeto al Juego',
    points: [
      'No hagas trampa. Nunca.',
      'Acepta las consecuencias de tus decisiones.',
      'No uses conocimiento out-of-game para ventaja in-game.',
    ],
  },
]

const afterSession = [
  'Agradece al DM y a los jugadores por la sesion',
  'Ofrece ayuda para ordenar si juegan presencial',
  'Comparte momentos favoritos de la sesion',
  'Si tenes feedback constructivo, dalo en privado',
  'Confirma tu disponibilidad para la proxima sesion',
]

export default function EtiquetaMesaPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-stone px-2 py-1 rounded">Comunidad</span>
          <span className="text-xs font-ui font-semibold text-parchment">8 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-stone"><Users className="h-8 w-8 text-parchment" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Etiqueta de Mesa
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Las reglas del juego estan en los libros. Las reglas de la mesa
          estan en la convivencia. Esta guia cubre las normas no escritas
          que hacen que el juego sea divertido para todos.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Regla de Oro</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>Recordá que hay personas reales detras de los personajes.</strong>
          <br /><br />
          Tratá a todos como te gustaria ser tratado. Simple pero fundamental.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Reglas Basicas
        </h2>
        <div className="space-y-4">
          {basicRules.map((rule) => (
            <ParchmentPanel key={rule.rule} className="p-5 border border-gold-dim">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gold-dim flex-shrink-0">
                  <rule.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-lg text-ink mb-1">{rule.rule}</h3>
                  <p className="font-body text-ink text-sm mb-2">{rule.desc}</p>
                  <p className="font-ui text-xs text-gold-dim">
                    <Sparkles className="h-3 w-3 inline mr-1" /> {rule.tip}
                  </p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Que Hacer y Que Evitar
        </h2>
        <div className="space-y-3">
          {dosAndDonts.map((item, i) => (
            <ParchmentPanel key={i} className="p-4 border border-gold-dim/50">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Hace</span>
                  <p className="font-body text-ink text-sm">{item.do}</p>
                </div>
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">Evita</span>
                  <p className="font-body text-ink text-sm">{item.dont}</p>
                </div>
                <div className="p-2">
                  <span className="font-ui text-xs text-ink">Por que</span>
                  <p className="font-body text-ink text-sm">{item.why}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" /> El Tema del Celular
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">
            Los celulares son la mayor fuente de distraccion en mesa. Reglas simples:
          </p>
          <ul className="font-body text-ink space-y-2">
            {phoneRules.map((rule, i) => (
              <li key={i} className="p-2 bg-gold/5 rounded">• {rule}</li>
            ))}
          </ul>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Heart className="h-6 w-6" /> Respeto en Todas las Formas
        </h2>
        <div className="space-y-4">
          {respectTopics.map((topic) => (
            <ParchmentPanel key={topic.topic} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-3">{topic.topic}</h3>
              <ul className="font-body text-ink text-sm space-y-1">
                {topic.points.map((point, i) => (
                  <li key={i}>• {point}</li>
                ))}
              </ul>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Despues de la Sesion
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <ul className="font-body text-ink space-y-2">
            {afterSession.map((item, i) => (
              <li key={i} className="p-2 bg-gold/5 rounded">• {item}</li>
            ))}
          </ul>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>El rol es un hobby social. Si no hay respeto, no hay juego.</strong>
            <br /><br />
            Una mesa donde todos se sienten bienvenidos, escuchados y valorados
            es una mesa donde se crean las mejores historias.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            El respeto incluye seguridad emocional.
          </p>
          <Link href="/guias/seguridad-juego" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Seguridad en el Juego
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/relaciones-pjs" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Relaciones PJs
          </Link>
          <Link href="/guias/seguridad-juego" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Seguridad <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
