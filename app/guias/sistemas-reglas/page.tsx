import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Dice1, Dice6, BookOpen, Swords, Skull, Sparkles } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Sistemas de Reglas para Juegos de Rol: Guia Completa | RolHub',
  description: 'Aprende las diferencias entre Story Mode, Powered by the Apocalypse, Year Zero Engine y D&D 5e. Cual sistema de reglas elegir segun tu estilo de juego.',
  keywords: [
    'sistemas de reglas rol',
    'PbtA explicado',
    'Year Zero Engine',
    'D&D 5e reglas',
    'Story Mode rol',
    'motores de juego RPG',
    'como funcionan los dados en rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/sistemas-reglas',
  },
  openGraph: {
    title: 'Sistemas de Reglas para Juegos de Rol | RolHub',
    description: 'Guia completa de los 4 sistemas de reglas disponibles en RolHub.',
    type: 'article',
    publishedTime: '2024-01-15',
    authors: ['RolHub'],
  },
}

const systems = [
  {
    id: 'story-mode',
    name: 'Story Mode',
    subtitle: 'Narrativa Pura',
    icon: BookOpen,
    dice: 'Sin dados (opcionales)',
    difficulty: 'Muy Facil',
    idealFor: 'Principiantes absolutos',
    summary: 'El DM evalua las acciones por coherencia narrativa. No hay mecanicas de dados obligatorias. El fallo siempre avanza la historia de forma interesante.',
    pros: [
      'Sin reglas que aprender',
      'Flujo narrativo ininterrumpido',
      'Perfecto para primera vez',
      'El fallo nunca bloquea el progreso'
    ],
    cons: [
      'Menos emocion del azar',
      'Puede sentirse "sin stakes"'
    ],
    color: 'emerald'
  },
  {
    id: 'pbta',
    name: 'Powered by the Apocalypse',
    subtitle: 'Narrativa + Dados',
    icon: Dice6,
    dice: '2d6 + stat',
    difficulty: 'Facil',
    idealFor: 'Quienes quieren dados simples',
    summary: 'Sistema elegante de 2d6. 10+ exito total, 7-9 exito con complicacion, 6- fallo dramatico. Cada resultado impulsa la historia.',
    pros: [
      'Solo 2 dados para todo',
      'Resultados 7-9 crean drama',
      'Movimientos claros y especificos',
      'Muy cinematografico'
    ],
    cons: [
      'Stats limitados (-1 a +3)',
      'Menos granularidad tactica'
    ],
    color: 'gold'
  },
  {
    id: 'year-zero',
    name: 'Year Zero Engine',
    subtitle: 'Supervivencia Brutal',
    icon: Skull,
    dice: 'Pool de d6',
    difficulty: 'Moderada',
    idealFor: 'Fans de supervivencia y tension',
    summary: 'Tiras un pool de d6 y contas los 6s. Podes "empujar" tiradas fallidas pero sufris consecuencias. Recursos escasos y mundo hostil.',
    pros: [
      'Empujar dados es adictivo',
      'Gestion de recursos dramatica',
      'Tension constante',
      'Consecuencias reales'
    ],
    cons: [
      'Puede ser muy punitivo',
      'Requiere trackear recursos'
    ],
    color: 'blood'
  },
  {
    id: 'dnd-5e',
    name: 'D&D 5e Simplificado',
    subtitle: 'El Clasico',
    icon: Swords,
    dice: 'd20 + mod',
    difficulty: 'Moderada',
    idealFor: 'Fans de fantasia heroica',
    summary: 'd20 + modificador contra Clase de Dificultad. 20 natural es critico, 1 natural es pifia. El sistema de rol mas popular del mundo, simplificado.',
    pros: [
      'Muy conocido y documentado',
      'Satisfaccion del d20',
      'Criticos memorables',
      'Gran rango de resultados'
    ],
    cons: [
      '6 stats para recordar',
      'Mas complejo que otros'
    ],
    color: 'gold'
  }
]

export default function SistemasReglasPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link
          href="/guias"
          className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Guias
        </Link>
      </nav>

      {/* Hero */}
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-gold-dim px-2 py-1 rounded">
            Intermedio
          </span>
          <span className="text-xs font-ui font-semibold text-parchment">
            12 min lectura
          </span>
        </div>
        <h1 className="font-title text-3xl md:text-4xl text-gold-bright mb-4">
          Sistemas de Reglas Explicados
        </h1>
        <p className="font-body text-xl text-parchment leading-relaxed">
          En RolHub ofrecemos 4 sistemas de reglas diferentes. Cada uno cambia
          como se resuelven las acciones y que tipo de experiencia tendras.
          Aqui te explicamos cada uno para que elijas el mejor para vos.
        </p>
      </header>

      {/* Quick Comparison Table */}
      <ParchmentPanel className="p-6 mb-12 overflow-x-auto border border-gold-dim">
        <h2 className="font-heading text-lg text-ink mb-4">Comparacion Rapida</h2>
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b-2 border-gold-dim">
              <th className="text-left py-2 font-heading text-ink font-bold">Sistema</th>
              <th className="text-left py-2 font-heading text-ink font-bold">Dados</th>
              <th className="text-left py-2 font-heading text-ink font-bold">Dificultad</th>
              <th className="text-left py-2 font-heading text-ink font-bold">Ideal Para</th>
            </tr>
          </thead>
          <tbody className="font-body text-ink">
            {systems.map((system) => (
              <tr key={system.id} className="border-b border-gold-dim/40">
                <td className="py-3 flex items-center gap-2 font-semibold">
                  <system.icon className="h-4 w-4 text-gold-dim" />
                  {system.name}
                </td>
                <td className="py-3">{system.dice}</td>
                <td className="py-3">{system.difficulty}</td>
                <td className="py-3 text-sm">{system.idealFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ParchmentPanel>

      {/* Systems Detail */}
      <div className="space-y-16">
        {systems.map((system, index) => (
          <section key={system.id} id={system.id}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-lg bg-gold">
                <system.icon className="h-8 w-8 text-shadow" />
              </div>
              <div>
                <h2 className="font-heading text-2xl text-gold-bright">{system.name}</h2>
                <p className="font-ui text-parchment">{system.subtitle}</p>
              </div>
            </div>

            <div className="font-body text-parchment space-y-4 text-lg leading-relaxed">
              <p>{system.summary}</p>

              <div className="flex flex-wrap gap-4 my-6">
                <div className="flex items-center gap-2 text-sm">
                  <Dice1 className="h-4 w-4 text-gold-bright" />
                  <span className="font-ui text-parchment font-semibold">{system.dice}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-gold-bright" />
                  <span className="font-ui text-parchment font-semibold">{system.difficulty}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <ParchmentPanel className="p-4 border border-emerald">
                  <h4 className="font-heading text-emerald mb-3 font-bold">Ventajas</h4>
                  <ul className="space-y-2">
                    {system.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink">
                        <span className="text-emerald mt-1 font-bold">+</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </ParchmentPanel>

                <ParchmentPanel className="p-4 border border-blood">
                  <h4 className="font-heading text-blood mb-3 font-bold">Consideraciones</h4>
                  <ul className="space-y-2">
                    {system.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink">
                        <span className="text-blood mt-1 font-bold">-</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </ParchmentPanel>
              </div>

              <div className="mt-6">
                <Link
                  href={`/guias/${system.id}`}
                  className="inline-flex items-center gap-2 text-gold-bright hover:text-gold font-heading transition-colors"
                >
                  Leer guia completa de {system.name}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {index < systems.length - 1 && (
              <hr className="border-gold/30 mt-12" />
            )}
          </section>
        ))}
      </div>

      {/* How to Choose */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Como Elegir tu Sistema
        </h2>

        <div className="font-body text-parchment space-y-4 text-lg leading-relaxed">
          <ParchmentPanel className="p-6 border border-gold-dim">
            <h3 className="font-heading text-lg text-ink mb-4">Guia de Decision Rapida</h3>

            <div className="space-y-4 text-ink">
              <div className="flex items-start gap-3">
                <span className="text-gold-bright font-bold">→</span>
                <p><strong>Primera vez jugando rol:</strong> Empeza con <strong>Story Mode</strong>. Sin reglas, pura historia.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-gold-bright font-bold">→</span>
                <p><strong>Queres dados pero simples:</strong> <strong>PbtA</strong> tiene solo 3 resultados posibles (exito/parcial/fallo).</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-gold-bright font-bold">→</span>
                <p><strong>Te gusta la tension y supervivencia:</strong> <strong>Year Zero</strong> es brutal y adictivo.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-gold-bright font-bold">→</span>
                <p><strong>Queres el clasico de clasicos:</strong> <strong>D&D 5e</strong> es el mas popular por algo.</p>
              </div>
            </div>
          </ParchmentPanel>

          <p className="mt-8">
            No te preocupes por elegir "mal" - podes cambiar de sistema en cualquier momento
            al crear una nueva campana. Cada mundo de RolHub funciona con cualquier sistema.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16">
        <ParchmentPanel variant="ornate" className="p-8 text-center border-2 border-gold">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Listo para Probar?
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            El mejor sistema es el que probas. Elegí uno y empeza tu aventura.
            Siempre podes cambiar despues.
          </p>
          <Link
            href="/onboarding"
            className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold"
          >
            Elegir Sistema y Jugar
          </Link>
        </ParchmentPanel>
      </section>

      {/* Navigation */}
      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link
            href="/guias"
            className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui"
          >
            <ArrowLeft className="h-4 w-4" />
            Todas las Guias
          </Link>
          <Link
            href="/guias/story-mode"
            className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold"
          >
            Siguiente: Guia de Story Mode
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
            "headline": "Sistemas de Reglas para Juegos de Rol: Guia Completa",
            "description": "Guia completa de los 4 sistemas de reglas disponibles en RolHub.",
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
              "@id": "https://rol-hub.com/guias/sistemas-reglas"
            }
          })
        }}
      />
    </article>
  )
}
