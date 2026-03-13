import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Dice6, Zap, CheckCircle, AlertTriangle, XCircle, Target, Shield, Eye, MessageSquare, HelpCircle, Sparkles } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Powered by the Apocalypse (PbtA): Guia Completa | RolHub',
  description: 'Aprende el sistema PbtA con dados 2d6. Exitos, exitos parciales y fallos dramaticos. El equilibrio perfecto entre narrativa y mecanicas.',
  keywords: [
    'PbtA tutorial',
    'Powered by the Apocalypse',
    'sistema 2d6',
    'movimientos PbtA',
    'rol narrativo dados',
    'apocalypse world sistema'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/pbta',
  },
  openGraph: {
    title: 'Powered by the Apocalypse (PbtA) | RolHub',
    description: 'El sistema de 2d6 que revoluciono el rol narrativo.',
    type: 'article',
    publishedTime: '2024-01-15',
    authors: ['RolHub'],
  },
}

const moves = [
  {
    id: 'act_under_pressure',
    name: 'Actuar Bajo Presion',
    icon: Zap,
    stat: 'Frio',
    trigger: 'Cuando actuas a pesar del peligro o la presion...',
    description: 'El movimiento universal para situaciones tensas donde el tiempo apremia.',
    examples: [
      'Desactivar una bomba mientras te disparan',
      'Escapar de un edificio en llamas',
      'Mantener la calma ante una amenaza',
    ],
  },
  {
    id: 'engage_in_combat',
    name: 'Entrar en Combate',
    icon: Target,
    stat: 'Duro',
    trigger: 'Cuando atacas a un enemigo en combate cercano...',
    description: 'Violencia directa. Siempre hay consecuencias.',
    examples: [
      'Atacar con espada o hacha',
      'Embestir a un enemigo',
      'Pelear a punos',
    ],
  },
  {
    id: 'read_situation',
    name: 'Leer la Situacion',
    icon: Eye,
    stat: 'Agudo',
    trigger: 'Cuando examinas una situacion buscando informacion...',
    description: 'Percebes detalles que otros pasan por alto.',
    examples: [
      'Buscar una trampa en una habitacion',
      'Identificar al lider de un grupo',
      'Notar una salida de emergencia',
    ],
  },
  {
    id: 'manipulate',
    name: 'Manipular',
    icon: MessageSquare,
    stat: 'Calido',
    trigger: 'Cuando intentas convencer a alguien de hacer algo...',
    description: 'Persuasion, seduccion, engano. Todo lo social.',
    examples: [
      'Convencer a un guardia de dejarte pasar',
      'Negociar un mejor precio',
      'Mentirle a alguien sobre tus intenciones',
    ],
  },
  {
    id: 'help_or_hinder',
    name: 'Ayudar o Estorbar',
    icon: Shield,
    stat: 'Vinculos',
    trigger: 'Cuando ayudas o dificultas la accion de otro...',
    description: 'Cooperacion o sabotaje. Afecta las tiradas de otros.',
    examples: [
      'Cubrir a un aliado mientras hackea',
      'Distraer a un guardia para que otro pase',
      'Interferir con los planes de un rival',
    ],
  },
  {
    id: 'use_weird',
    name: 'Abrir la Mente',
    icon: Sparkles,
    stat: 'Raro',
    trigger: 'Cuando intentas conectar con lo sobrenatural...',
    description: 'Magia, psiquismo, percepcion extrasensorial.',
    examples: [
      'Leer el aura de alguien',
      'Tener una vision profetica',
      'Sentir presencias sobrenaturales',
    ],
  },
]

const resultExamples = [
  {
    result: '10+',
    name: 'Exito Total',
    color: 'emerald',
    description: 'Logras exactamente lo que querias sin complicaciones.',
    example: 'Intentas convencer al guardia de dejarte pasar. Con 10+, el guardia asiente y se hace a un lado. "Adelante, pero sea rapido." Pasas sin problemas.',
  },
  {
    result: '7-9',
    name: 'Exito Parcial',
    color: 'gold',
    description: 'Lo logras, pero hay una complicacion, costo o eleccion dificil.',
    example: 'Intentas convencer al guardia. Con 7-9, el guardia dice: "Esta bien, pero voy a necesitar ver tu identificacion... o algo que valga la pena para olvidar que te vi." Eliges: dar tus datos o sobornar.',
  },
  {
    result: '6-',
    name: 'Fallo',
    color: 'blood',
    description: 'Las cosas salen mal. El DM hace un movimiento duro.',
    example: 'Intentas convencer al guardia. Con 6-, el guardia entrecierra los ojos. "Espera... yo te conozco. Vos sos el de los carteles de busqueda." Saca su radio. La situacion empeora drasticamente.',
  },
]

export default function PbtAPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link
          href="/guias/sistemas-reglas"
          className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Sistemas de Reglas
        </Link>
      </nav>

      {/* Hero */}
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-gold-dim px-2 py-1 rounded">
            Facil
          </span>
          <span className="text-xs font-ui font-semibold text-parchment">
            10 min lectura
          </span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold">
            <Dice6 className="h-8 w-8 text-shadow" />
          </div>
          <div>
            <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
              Powered by the Apocalypse
            </h1>
            <p className="font-ui text-parchment text-lg">Narrativa + Dados 2d6</p>
          </div>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          El sistema que revoluciono el rol narrativo. Solo dos dados de seis caras,
          tres posibles resultados, y acciones claras llamadas "movimientos".
          Simple de aprender, infinitamente dramatico.
        </p>
      </header>

      {/* Quick Facts */}
      <ParchmentPanel className="p-6 mb-12 border border-gold-dim">
        <h2 className="font-heading text-lg text-ink mb-4">Datos Rapidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="font-heading text-2xl text-ink">2d6</p>
            <p className="font-ui text-sm text-ink">Dados usados</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl text-ink">3</p>
            <p className="font-ui text-sm text-ink">Resultados posibles</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl text-ink">6</p>
            <p className="font-ui text-sm text-ink">Movimientos basicos</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl text-ink">-1 a +3</p>
            <p className="font-ui text-sm text-ink">Rango de stats</p>
          </div>
        </div>
      </ParchmentPanel>

      {/* The Core Mechanic */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-3">
          <Dice6 className="h-6 w-6" />
          La Mecanica Central
        </h2>

        <div className="font-body text-parchment space-y-6 text-lg leading-relaxed">
          <p>
            Todo en PbtA funciona igual: cuando tu personaje intenta algo riesgoso
            o interesante, haces un <strong className="text-gold-bright">movimiento</strong>.
          </p>

          <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
            <h3 className="font-heading text-xl text-ink mb-4 text-center">La Formula</h3>
            <p className="font-heading text-3xl text-ink text-center mb-4">
              2d6 + stat
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-emerald/20 border border-emerald">
                <p className="font-heading text-emerald text-xl">10+</p>
                <p className="font-ui text-ink text-sm">Exito Total</p>
              </div>
              <div className="p-3 rounded-lg bg-gold/20 border border-gold-dim">
                <p className="font-heading text-gold-dim text-xl">7-9</p>
                <p className="font-ui text-ink text-sm">Exito Parcial</p>
              </div>
              <div className="p-3 rounded-lg bg-blood/20 border border-blood">
                <p className="font-heading text-blood text-xl">6-</p>
                <p className="font-ui text-ink text-sm">Fallo</p>
              </div>
            </div>
          </ParchmentPanel>

          <p>
            Tus stats van de <strong>-1</strong> (malo) a <strong>+3</strong> (excepcional).
            La mayoria de personajes tienen una stat en +2, un par en +1, y alguna en 0 o -1.
          </p>
        </div>
      </section>

      {/* The Three Results */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Los Tres Resultados
        </h2>

        <div className="font-body text-parchment space-y-6 text-lg leading-relaxed">
          <p>
            Lo que hace especial a PbtA es el resultado <strong className="text-gold-bright">7-9</strong>.
            No es exito ni fallo — es <em>exito con complicacion</em>. Y eso crea el drama.
          </p>

          <div className="space-y-6">
            {resultExamples.map((result) => (
              <ParchmentPanel
                key={result.result}
                className={`p-6 border-2 border-${result.color}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`font-heading text-2xl text-${result.color}`}>
                    {result.result}
                  </span>
                  <span className={`font-heading text-lg text-${result.color}`}>
                    {result.name}
                  </span>
                </div>
                <p className="font-body text-ink mb-4">{result.description}</p>
                <div className="p-4 bg-shadow/5 rounded-lg border border-gold-dim/30">
                  <p className="font-ui text-sm text-ink italic">{result.example}</p>
                </div>
              </ParchmentPanel>
            ))}
          </div>

          <ParchmentPanel className="p-5 border border-gold-dim mt-8">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-gold-dim mt-1" />
              <div>
                <p className="font-heading text-ink mb-1">El Secreto del 7-9</p>
                <p className="font-body text-ink">
                  La mayoria de tus tiradas van a dar 7-9. Eso es intencional.
                  El juego esta diseñado para que constantemente tengas que elegir
                  entre malas opciones. Eso genera historias memorables.
                </p>
              </div>
            </div>
          </ParchmentPanel>
        </div>
      </section>

      {/* The Basic Moves */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Los 6 Movimientos Basicos
        </h2>

        <div className="font-body text-parchment space-y-4 text-lg leading-relaxed mb-6">
          <p>
            Estos son los movimientos que cualquier personaje puede hacer.
            Cada uno se activa con un <strong className="text-gold-bright">trigger</strong> especifico
            — cuando la ficcion coincide con el trigger, haces la tirada.
          </p>
        </div>

        <div className="space-y-4">
          {moves.map((move) => (
            <ParchmentPanel key={move.id} className="p-5 border border-gold-dim">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gold-dim flex-shrink-0">
                  <move.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-heading text-lg text-ink">{move.name}</h3>
                    <span className="text-xs font-ui font-bold text-white bg-stone px-2 py-1 rounded">
                      +{move.stat}
                    </span>
                  </div>
                  <p className="font-body text-ink italic mb-2">{move.trigger}</p>
                  <p className="font-body text-ink text-base mb-3">{move.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {move.examples.map((ex, i) => (
                      <span key={i} className="text-xs font-ui text-ink bg-parchment-dark/50 px-2 py-1 rounded">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      {/* How to Play */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Como Jugar
        </h2>

        <div className="font-body text-parchment space-y-6 text-lg leading-relaxed">
          <div className="space-y-4">
            <ParchmentPanel className="p-5 border border-gold-dim">
              <div className="flex gap-4">
                <span className="font-heading text-2xl text-gold-bright">1</span>
                <div>
                  <h3 className="font-heading text-lg text-ink mb-1">Describe tu accion</h3>
                  <p className="font-body text-ink">
                    "Intento escabullirme por detras del guardia sin que me vea"
                  </p>
                </div>
              </div>
            </ParchmentPanel>

            <ParchmentPanel className="p-5 border border-gold-dim">
              <div className="flex gap-4">
                <span className="font-heading text-2xl text-gold-bright">2</span>
                <div>
                  <h3 className="font-heading text-lg text-ink mb-1">El DM identifica el movimiento</h3>
                  <p className="font-body text-ink">
                    "Eso es Actuar Bajo Presion. Tira 2d6 + Frio."
                  </p>
                </div>
              </div>
            </ParchmentPanel>

            <ParchmentPanel className="p-5 border border-gold-dim">
              <div className="flex gap-4">
                <span className="font-heading text-2xl text-gold-bright">3</span>
                <div>
                  <h3 className="font-heading text-lg text-ink mb-1">Tiras los dados</h3>
                  <p className="font-body text-ink">
                    2d6 = 5 + 3 = 8, mas tu Frio de +1 = <strong>9 total</strong>
                  </p>
                </div>
              </div>
            </ParchmentPanel>

            <ParchmentPanel className="p-5 border border-gold-dim">
              <div className="flex gap-4">
                <span className="font-heading text-2xl text-gold-bright">4</span>
                <div>
                  <h3 className="font-heading text-lg text-ink mb-1">El DM narra el resultado</h3>
                  <p className="font-body text-ink">
                    "Con 9, lo logras pero... elegi: el guardia escucha algo y empieza a sospechar,
                    O pasas pero dejas caer algo importante."
                  </p>
                </div>
              </div>
            </ParchmentPanel>
          </div>
        </div>
      </section>

      {/* Pro Tips */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Consejos para PbtA
        </h2>

        <div className="space-y-4">
          {[
            {
              title: 'La ficcion primero, los dados despues',
              desc: 'Primero describe que haces en la historia. Si eso activa un movimiento, entonces tiras. Nunca al reves.',
            },
            {
              title: 'Los movimientos tienen triggers especificos',
              desc: 'No podes "tirar para Leer la Situacion" porque queres. Tenes que estar examinando activamente algo en la ficcion.',
            },
            {
              title: 'El 7-9 es tu amigo',
              desc: 'Parece un "casi fallo" pero es donde el juego brilla. Acepta las complicaciones — crean las mejores historias.',
            },
            {
              title: 'Aprovecha tus stats altos',
              desc: 'Busca formas de resolver problemas usando los movimientos donde tenes mejor stat. Un +3 cambia todo.',
            },
            {
              title: 'Falla hacia adelante',
              desc: 'Un 6- no significa "no pasa nada". Significa que las cosas empeoran de manera interesante. Eso es bueno para la historia.',
            },
          ].map((tip) => (
            <ParchmentPanel key={tip.title} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{tip.title}</h4>
              <p className="font-body text-ink text-base">{tip.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      {/* Who is it for */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Para Quien es PbtA
        </h2>

        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-heading text-emerald mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" /> Ideal Si...
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-emerald font-bold">+</span>
                  <span>Queres dados pero sin complejidad</span>
                </li>
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-emerald font-bold">+</span>
                  <span>Te gusta el drama y las decisiones dificiles</span>
                </li>
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-emerald font-bold">+</span>
                  <span>Disfrutas cuando las cosas salen "casi bien"</span>
                </li>
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-emerald font-bold">+</span>
                  <span>Preferis acciones cinematograficas</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading text-blood mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Quizas No Si...
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-blood font-bold">-</span>
                  <span>Queres control total sobre los resultados</span>
                </li>
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-blood font-bold">-</span>
                  <span>Te frustra fallar a pesar de planear bien</span>
                </li>
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-blood font-bold">-</span>
                  <span>Preferis tactica detallada sobre narrativa</span>
                </li>
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-blood font-bold">-</span>
                  <span>Queres muchas stats y opciones de build</span>
                </li>
              </ul>
            </div>
          </div>
        </ParchmentPanel>
      </section>

      {/* CTA */}
      <section className="mt-16">
        <ParchmentPanel variant="ornate" className="p-8 text-center border-2 border-gold">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Listo para Probar PbtA?
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Dos dados, tres resultados, infinitas historias.
            Elegí PbtA en el onboarding y empeza a jugar.
          </p>
          <Link
            href="/onboarding"
            className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold"
          >
            Jugar con PbtA
          </Link>
        </ParchmentPanel>
      </section>

      {/* Navigation */}
      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link
            href="/guias/story-mode"
            className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior: Story Mode
          </Link>
          <Link
            href="/guias/year-zero"
            className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold"
          >
            Siguiente: Year Zero Engine
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Powered by the Apocalypse (PbtA): Guia Completa",
            "description": "Aprende el sistema PbtA con dados 2d6. Exitos, exitos parciales y fallos dramaticos.",
            "author": {
              "@type": "Organization",
              "name": "RolHub"
            },
            "publisher": {
              "@type": "Organization",
              "name": "RolHub",
              "url": "https://rol-hub.com"
            },
            "datePublished": "2024-01-15",
            "dateModified": new Date().toISOString().split('T')[0],
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://rol-hub.com/guias/pbta"
            }
          })
        }}
      />
    </article>
  )
}
