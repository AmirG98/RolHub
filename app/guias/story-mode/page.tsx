import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, BookOpen, MessageSquare, Lightbulb, CheckCircle, XCircle, Sparkles, Users, Swords, Compass } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Story Mode: Guia Completa del Sistema Narrativo Puro | RolHub',
  description: 'Aprende a jugar con Story Mode, el sistema sin dados perfecto para principiantes. Como funciona la resolucion narrativa y cuando usarlo.',
  keywords: [
    'story mode rol',
    'sistema narrativo RPG',
    'rol sin dados',
    'juego de rol para principiantes',
    'narrativa pura rol',
    'DM resolucion narrativa'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/story-mode',
  },
  openGraph: {
    title: 'Story Mode: Sistema Narrativo Puro | RolHub',
    description: 'El sistema perfecto para principiantes. Sin dados, pura historia.',
    type: 'article',
    publishedTime: '2024-01-15',
    authors: ['RolHub'],
  },
}

const stats = [
  {
    name: 'Combate',
    icon: Swords,
    description: 'Tu capacidad para la violencia fisica y tactica militar.',
    examples: [
      'Atacar con armas o a mano limpia',
      'Esquivar ataques enemigos',
      'Planear una emboscada',
      'Intimidar con amenaza fisica',
    ],
  },
  {
    name: 'Exploracion',
    icon: Compass,
    description: 'Tu habilidad para moverte por el mundo y descubrir secretos.',
    examples: [
      'Encontrar caminos ocultos',
      'Detectar trampas o peligros',
      'Rastrear huellas',
      'Escalar, nadar, sigilo',
    ],
  },
  {
    name: 'Social',
    icon: Users,
    description: 'Tu capacidad para influir en otros personajes.',
    examples: [
      'Convencer o persuadir',
      'Detectar mentiras',
      'Negociar acuerdos',
      'Inspirar o manipular',
    ],
  },
]

const resolutionExamples = [
  {
    action: '"Salto el abismo para escapar de los orcos"',
    heroWithHighExploration: 'Con tu agilidad de explorador, cruzas el abismo con un salto limpio. Los orcos grunen frustrados desde el otro lado.',
    heroWithLowExploration: 'Saltas con todas tus fuerzas... pero tu pie resbala en el borde. Logras aferrarte con los dedos, colgando sobre el vacio mientras los orcos se acercan.',
    note: 'En Story Mode, el "fallo" no es "no lo logras". Es "lo logras pero algo interesante pasa".',
  },
  {
    action: '"Intento convencer al guardia de que me deje pasar"',
    heroWithHighSocial: 'El guardia duda, pero tu carisma lo convence. "Esta bien, pero que sea rapido," gruñe mientras se hace a un lado.',
    heroWithLowSocial: 'El guardia arquea una ceja, claramente no convencido. "Mira, no voy a dejarte pasar... pero mi compañero en la puerta sur siempre esta distraido. No te dije nada."',
    note: 'Incluso cuando "fallas", siempre hay un camino adelante. La historia nunca se bloquea.',
  },
]

export default function StoryModePage() {
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
          <span className="text-xs font-ui font-bold text-white bg-emerald px-2 py-1 rounded">
            Principiante
          </span>
          <span className="text-xs font-ui font-semibold text-parchment">
            8 min lectura
          </span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold">
            <BookOpen className="h-8 w-8 text-shadow" />
          </div>
          <div>
            <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
              Story Mode
            </h1>
            <p className="font-ui text-parchment text-lg">Narrativa Pura — Sin Dados</p>
          </div>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          El sistema mas simple y accesible. No hay dados, no hay reglas complejas.
          Solo vos, tu personaje, y la historia que se desarrolla. El DM evalua
          tus acciones por coherencia narrativa y tus estadisticas.
        </p>
      </header>

      {/* Quick Facts */}
      <ParchmentPanel className="p-6 mb-12 border border-gold-dim">
        <h2 className="font-heading text-lg text-ink mb-4">Datos Rapidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="font-heading text-2xl text-ink">0</p>
            <p className="font-ui text-sm text-ink">Dados necesarios</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl text-ink">3</p>
            <p className="font-ui text-sm text-ink">Estadisticas</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl text-ink">∞</p>
            <p className="font-ui text-sm text-ink">Posibilidades</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl text-ink">5 min</p>
            <p className="font-ui text-sm text-ink">Tiempo de aprendizaje</p>
          </div>
        </div>
      </ParchmentPanel>

      {/* How It Works */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-3">
          <MessageSquare className="h-6 w-6" />
          Como Funciona
        </h2>

        <div className="font-body text-parchment space-y-6 text-lg leading-relaxed">
          <p>
            Story Mode es el sistema mas cercano a la improvisacion teatral.
            No hay tiradas de dados que determinen el resultado — el DM evalua
            cada accion basandose en tres factores:
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <ParchmentPanel className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-2">1. Coherencia</h3>
              <p className="font-body text-ink text-base">
                Tiene sentido que tu personaje pueda hacer esto dada la situacion?
              </p>
            </ParchmentPanel>

            <ParchmentPanel className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-2">2. Estadisticas</h3>
              <p className="font-body text-ink text-base">
                Tus stats de Combate, Exploracion y Social influyen en que tan bien lo haces.
              </p>
            </ParchmentPanel>

            <ParchmentPanel className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-2">3. Narrativa</h3>
              <p className="font-body text-ink text-base">
                Que resultado hace la historia mas interesante en este momento?
              </p>
            </ParchmentPanel>
          </div>

          <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold mt-8">
            <h3 className="font-heading text-lg text-ink mb-3 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-gold-dim" />
              La Regla de Oro
            </h3>
            <p className="font-body text-ink text-lg">
              En Story Mode, <strong>el fallo nunca bloquea el progreso</strong>.
              Si intentas algo y "fallas", el resultado siempre avanza la historia
              de una forma interesante. Quizas no lograste lo que querias, pero
              descubriste algo nuevo o la situacion cambio de manera inesperada.
            </p>
          </ParchmentPanel>
        </div>
      </section>

      {/* The 3 Stats */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Las 3 Estadisticas
        </h2>

        <div className="font-body text-parchment space-y-6 text-lg leading-relaxed">
          <p>
            Tu personaje tiene solo 3 estadisticas. Cada una representa un aspecto
            diferente de sus capacidades. Cuando actuas, el DM considera cual stat
            es mas relevante.
          </p>

          <div className="space-y-6">
            {stats.map((stat) => (
              <ParchmentPanel key={stat.name} className="p-6 border border-gold-dim">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-gold-dim">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl text-ink">{stat.name}</h3>
                    <p className="font-body text-ink">{stat.description}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  {stat.examples.map((example, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-ink font-bold">•</span>
                      <span className="font-body text-ink text-base">{example}</span>
                    </div>
                  ))}
                </div>
              </ParchmentPanel>
            ))}
          </div>

          <p className="mt-6">
            Tus stats van de <strong className="text-gold-bright">1 a 5</strong>.
            Un 1 significa que sos malo en eso. Un 5 significa que sos excepcional.
            La mayoria de los personajes tienen una stat alta, una media y una baja.
          </p>
        </div>
      </section>

      {/* Resolution Examples */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Ejemplos de Resolucion
        </h2>

        <div className="font-body text-parchment space-y-8 text-lg leading-relaxed">
          <p>
            Veamos como el DM resuelve acciones segun tus stats. El mismo intento
            puede tener resultados muy diferentes segun las capacidades de tu personaje.
          </p>

          {resolutionExamples.map((example, index) => (
            <ParchmentPanel key={index} className="p-6 border border-gold-dim">
              <p className="font-heading text-lg text-ink mb-4">
                Tu accion: {example.action}
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-emerald/10 rounded-lg border border-emerald">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-emerald" />
                    <span className="font-heading text-emerald text-sm">Stat Alta</span>
                  </div>
                  <p className="font-body text-ink text-base">{example.heroWithHighExploration || example.heroWithHighSocial}</p>
                </div>

                <div className="p-4 bg-gold/10 rounded-lg border border-gold-dim">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-gold-dim" />
                    <span className="font-heading text-gold-dim text-sm">Stat Baja</span>
                  </div>
                  <p className="font-body text-ink text-base">{example.heroWithLowExploration || example.heroWithLowSocial}</p>
                </div>
              </div>

              <p className="font-body text-ink text-base italic border-l-2 border-gold pl-4">
                {example.note}
              </p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      {/* When to Use Dice (Optional) */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Dados Opcionales
        </h2>

        <div className="font-body text-parchment space-y-4 text-lg leading-relaxed">
          <p>
            Aunque Story Mode no requiere dados, a veces podes pedirle al DM que
            tire un dado para agregar incertidumbre. Esto es completamente opcional
            y se usa en situaciones donde vos mismo queres que el azar decida.
          </p>

          <ParchmentPanel className="p-6 border border-gold-dim">
            <h3 className="font-heading text-lg text-ink mb-4">Cuando Pedir Dados</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-heading text-emerald mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Buenas Razones
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-ink text-base">
                    <span className="font-bold">•</span>
                    <span>El resultado es 50/50 y queres emocion</span>
                  </li>
                  <li className="flex items-start gap-2 text-ink text-base">
                    <span className="font-bold">•</span>
                    <span>Te divierte la incertidumbre en este momento</span>
                  </li>
                  <li className="flex items-start gap-2 text-ink text-base">
                    <span className="font-bold">•</span>
                    <span>Queres que "el destino" decida algo importante</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-heading text-blood mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" /> No Hace Falta
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-ink text-base">
                    <span className="font-bold">•</span>
                    <span>Tu personaje claramente puede hacerlo</span>
                  </li>
                  <li className="flex items-start gap-2 text-ink text-base">
                    <span className="font-bold">•</span>
                    <span>El resultado ya es obvio por la narrativa</span>
                  </li>
                  <li className="flex items-start gap-2 text-ink text-base">
                    <span className="font-bold">•</span>
                    <span>Solo queres avanzar la historia</span>
                  </li>
                </ul>
              </div>
            </div>
          </ParchmentPanel>
        </div>
      </section>

      {/* Tips */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Consejos para Story Mode
        </h2>

        <div className="space-y-4">
          {[
            {
              title: 'Describe tus acciones con detalle',
              desc: 'En vez de "ataco al orco", di "me lanzo hacia el orco, girando mi espada en un arco ascendente hacia su cuello". Mas detalle = narracion mas interesante.',
            },
            {
              title: 'Usa tus fortalezas creativamente',
              desc: 'Si tenes Combate bajo pero Social alto, quizas puedas intimidar al enemigo o convencerlo de rendirse en vez de pelear.',
            },
            {
              title: 'Acepta las complicaciones',
              desc: 'Cuando algo sale mal, no te frustres. Las complicaciones crean las mejores historias. Un heroe que siempre gana es aburrido.',
            },
            {
              title: 'Pregunta por el entorno',
              desc: 'Podes preguntarle al DM que hay en la escena. "Hay algo que pueda usar como arma improvisada?" La respuesta puede darte opciones creativas.',
            },
            {
              title: 'Roleplay sobre optimizacion',
              desc: 'No busques "la mejor jugada". Busca "lo que haria mi personaje". A veces eso significa tomar decisiones suboptimas pero interesantes.',
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
          Para Quien es Story Mode
        </h2>

        <div className="font-body text-parchment space-y-4 text-lg leading-relaxed">
          <ParchmentPanel className="p-6 border border-gold-dim">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-heading text-emerald mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" /> Ideal Si...
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-ink">
                    <span className="text-emerald font-bold">+</span>
                    <span>Nunca jugaste rol antes</span>
                  </li>
                  <li className="flex items-start gap-2 text-ink">
                    <span className="text-emerald font-bold">+</span>
                    <span>Queres enfocarte 100% en la historia</span>
                  </li>
                  <li className="flex items-start gap-2 text-ink">
                    <span className="text-emerald font-bold">+</span>
                    <span>No te gustan las matematicas en juegos</span>
                  </li>
                  <li className="flex items-start gap-2 text-ink">
                    <span className="text-emerald font-bold">+</span>
                    <span>Preferis el drama a la tactica</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-heading text-blood mb-3 flex items-center gap-2">
                  <XCircle className="h-5 w-5" /> Quizas No Si...
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-ink">
                    <span className="text-blood font-bold">-</span>
                    <span>Te encanta tirar dados</span>
                  </li>
                  <li className="flex items-start gap-2 text-ink">
                    <span className="text-blood font-bold">-</span>
                    <span>Queres reglas claras para todo</span>
                  </li>
                  <li className="flex items-start gap-2 text-ink">
                    <span className="text-blood font-bold">-</span>
                    <span>Necesitas que el azar determine resultados</span>
                  </li>
                  <li className="flex items-start gap-2 text-ink">
                    <span className="text-blood font-bold">-</span>
                    <span>Te gusta optimizar builds y stats</span>
                  </li>
                </ul>
              </div>
            </div>
          </ParchmentPanel>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16">
        <ParchmentPanel variant="ornate" className="p-8 text-center border-2 border-gold">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Listo para Probar Story Mode?
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Es el sistema perfecto para tu primera partida. Sin reglas que memorizar,
            sin dados que aprender. Solo vos y la historia.
          </p>
          <Link
            href="/onboarding"
            className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold"
          >
            Empezar con Story Mode
          </Link>
        </ParchmentPanel>
      </section>

      {/* Navigation */}
      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link
            href="/guias/sistemas-reglas"
            className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui"
          >
            <ArrowLeft className="h-4 w-4" />
            Todos los Sistemas
          </Link>
          <Link
            href="/guias/pbta"
            className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold"
          >
            Siguiente: Powered by the Apocalypse
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
            "headline": "Story Mode: Guia Completa del Sistema Narrativo Puro",
            "description": "Aprende a jugar con Story Mode, el sistema sin dados perfecto para principiantes.",
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
              "@id": "https://rol-hub.com/guias/story-mode"
            }
          })
        }}
      />
    </article>
  )
}
