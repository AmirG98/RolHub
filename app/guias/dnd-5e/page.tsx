import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Swords, Dices, Shield, Brain, Heart, Zap, Eye, MessageSquare, CheckCircle, AlertTriangle, Star, Target } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'D&D 5e Simplificado: Guia del Sistema Clasico | RolHub',
  description: 'Aprende D&D 5e simplificado para RolHub. El d20, modificadores, ventaja/desventaja y criticos. El sistema de rol mas popular del mundo.',
  keywords: [
    'D&D 5e tutorial',
    'como jugar D&D',
    'sistema d20',
    'dungeons dragons español',
    'tiradas d20 explicadas',
    'D&D para principiantes'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/dnd-5e',
  },
  openGraph: {
    title: 'D&D 5e Simplificado | RolHub',
    description: 'El sistema de rol mas popular del mundo, simplificado para RolHub.',
    type: 'article',
    publishedTime: '2024-01-15',
    authors: ['RolHub'],
  },
}

const abilityScores = [
  {
    abbr: 'FUE',
    name: 'Fuerza',
    icon: Swords,
    description: 'Potencia fisica bruta, capacidad atletica.',
    uses: ['Ataques cuerpo a cuerpo', 'Derribar puertas', 'Escalar', 'Cargar peso'],
  },
  {
    abbr: 'DES',
    name: 'Destreza',
    icon: Zap,
    description: 'Agilidad, reflejos, equilibrio, precision.',
    uses: ['Ataques a distancia', 'Sigilo', 'Acrobacias', 'Abrir cerraduras'],
  },
  {
    abbr: 'CON',
    name: 'Constitucion',
    icon: Shield,
    description: 'Salud, resistencia, vitalidad.',
    uses: ['Puntos de vida', 'Resistir veneno', 'Aguantar frio/calor', 'Marcha forzada'],
  },
  {
    abbr: 'INT',
    name: 'Inteligencia',
    icon: Brain,
    description: 'Razonamiento, memoria, conocimiento.',
    uses: ['Recordar informacion', 'Investigar', 'Detectar ilusiones', 'Magia arcana'],
  },
  {
    abbr: 'SAB',
    name: 'Sabiduria',
    icon: Eye,
    description: 'Percepcion, intuicion, sentido comun.',
    uses: ['Percibir peligros', 'Detectar mentiras', 'Rastrear', 'Magia divina'],
  },
  {
    abbr: 'CAR',
    name: 'Carisma',
    icon: MessageSquare,
    description: 'Presencia, fuerza de personalidad, liderazgo.',
    uses: ['Persuadir', 'Engañar', 'Intimidar', 'Actuar'],
  },
]

const dcExamples = [
  { dc: 5, difficulty: 'Muy Facil', example: 'Recordar un hecho conocido' },
  { dc: 10, difficulty: 'Facil', example: 'Escalar una cuerda con nudos' },
  { dc: 15, difficulty: 'Moderado', example: 'Forzar una cerradura tipica' },
  { dc: 20, difficulty: 'Dificil', example: 'Nadar contra una corriente fuerte' },
  { dc: 25, difficulty: 'Muy Dificil', example: 'Escalar un muro resbaladizo' },
  { dc: 30, difficulty: 'Casi Imposible', example: 'Saltar un abismo de 10 metros' },
]

export default function DnD5ePage() {
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
            Moderado
          </span>
          <span className="text-xs font-ui font-semibold text-parchment">
            15 min lectura
          </span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold">
            <Swords className="h-8 w-8 text-shadow" />
          </div>
          <div>
            <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
              D&D 5e Simplificado
            </h1>
            <p className="font-ui text-parchment text-lg">El Clasico — d20 + Modificador</p>
          </div>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          El sistema de rol mas jugado del mundo, simplificado para RolHub.
          Tira un dado de 20 caras, suma tu modificador, y supera la dificultad.
          Criticos en 20 natural, pifias en 1. El clasico que nunca falla.
        </p>
      </header>

      {/* Quick Facts */}
      <ParchmentPanel className="p-6 mb-12 border border-gold-dim">
        <h2 className="font-heading text-lg text-ink mb-4">Datos Rapidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="font-heading text-2xl text-ink">d20</p>
            <p className="font-ui text-sm text-ink">Dado principal</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl text-ink">6</p>
            <p className="font-ui text-sm text-ink">Estadisticas</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl text-ink">20</p>
            <p className="font-ui text-sm text-ink">= Critico</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl text-ink">1</p>
            <p className="font-ui text-sm text-ink">= Pifia</p>
          </div>
        </div>
      </ParchmentPanel>

      {/* The Core Mechanic */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-3">
          <Dices className="h-6 w-6" />
          La Mecanica Central
        </h2>

        <div className="font-body text-parchment space-y-6 text-lg leading-relaxed">
          <p>
            En D&D 5e, cuando intentas hacer algo con riesgo de fallo, haces
            una <strong className="text-gold-bright">tirada de habilidad</strong>:
          </p>

          <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
            <h3 className="font-heading text-xl text-ink mb-4 text-center">La Formula</h3>
            <p className="font-heading text-3xl text-ink text-center mb-4">
              d20 + Modificador ≥ CD
            </p>
            <div className="text-center">
              <p className="font-body text-ink">
                <strong>d20</strong> = dado de 20 caras
                <br />
                <strong>Modificador</strong> = tu bonus de la estadistica relevante
                <br />
                <strong>CD</strong> = Clase de Dificultad (lo que tenes que igualar o superar)
              </p>
            </div>
          </ParchmentPanel>

          <p>
            Ejemplo: Queres trepar un muro. El DM dice "Tira Atletismo (Fuerza), CD 15."
            Tiras el d20, sale 12. Tu modificador de Fuerza es +3.
            Total: <strong>12 + 3 = 15</strong>. Justo lo que necesitabas. Exito!
          </p>
        </div>
      </section>

      {/* The 6 Ability Scores */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Las 6 Estadisticas
        </h2>

        <div className="font-body text-parchment space-y-6 text-lg leading-relaxed">
          <p>
            Tu personaje tiene 6 estadisticas base. Cada una va de 1 a 20,
            pero lo que importa es el <strong className="text-gold-bright">modificador</strong>,
            que se calcula asi: (Estadistica - 10) / 2 redondeado hacia abajo.
          </p>

          <ParchmentPanel className="p-4 border border-gold-dim mb-6">
            <h3 className="font-heading text-ink mb-3">Tabla de Modificadores</h3>
            <div className="flex flex-wrap gap-3 text-center">
              <span className="font-mono text-ink text-sm bg-parchment-dark px-2 py-1 rounded">8-9: -1</span>
              <span className="font-mono text-ink text-sm bg-parchment-dark px-2 py-1 rounded">10-11: +0</span>
              <span className="font-mono text-ink text-sm bg-parchment-dark px-2 py-1 rounded">12-13: +1</span>
              <span className="font-mono text-ink text-sm bg-parchment-dark px-2 py-1 rounded">14-15: +2</span>
              <span className="font-mono text-ink text-sm bg-parchment-dark px-2 py-1 rounded">16-17: +3</span>
              <span className="font-mono text-ink text-sm bg-parchment-dark px-2 py-1 rounded">18-19: +4</span>
              <span className="font-mono text-ink text-sm bg-parchment-dark px-2 py-1 rounded">20: +5</span>
            </div>
          </ParchmentPanel>

          <div className="grid md:grid-cols-2 gap-4">
            {abilityScores.map((ability) => (
              <ParchmentPanel key={ability.abbr} className="p-4 border border-gold-dim">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gold-dim">
                    <ability.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="font-heading text-lg text-ink">{ability.name}</span>
                    <span className="font-mono text-sm text-ink ml-2">({ability.abbr})</span>
                  </div>
                </div>
                <p className="font-body text-ink text-base mb-2">{ability.description}</p>
                <div className="flex flex-wrap gap-1">
                  {ability.uses.map((use, i) => (
                    <span key={i} className="text-xs font-ui text-ink bg-parchment-dark/50 px-2 py-1 rounded">
                      {use}
                    </span>
                  ))}
                </div>
              </ParchmentPanel>
            ))}
          </div>
        </div>
      </section>

      {/* Difficulty Classes */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-3">
          <Target className="h-6 w-6" />
          Clases de Dificultad (CD)
        </h2>

        <div className="font-body text-parchment space-y-6 text-lg leading-relaxed">
          <p>
            La CD es el numero que tenes que igualar o superar. El DM la determina
            segun que tan dificil es lo que intentas.
          </p>

          <ParchmentPanel className="p-4 border border-gold-dim overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="border-b-2 border-gold-dim">
                  <th className="text-left py-2 font-heading text-ink">CD</th>
                  <th className="text-left py-2 font-heading text-ink">Dificultad</th>
                  <th className="text-left py-2 font-heading text-ink">Ejemplo</th>
                </tr>
              </thead>
              <tbody className="font-body text-ink">
                {dcExamples.map((row) => (
                  <tr key={row.dc} className="border-b border-gold-dim/40">
                    <td className="py-2 font-mono font-bold">{row.dc}</td>
                    <td className="py-2">{row.difficulty}</td>
                    <td className="py-2 text-sm">{row.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ParchmentPanel>
        </div>
      </section>

      {/* Natural 20 and Natural 1 */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-3">
          <Star className="h-6 w-6" />
          Criticos y Pifias
        </h2>

        <div className="font-body text-parchment space-y-6 text-lg leading-relaxed">
          <p>
            Los resultados extremos del d20 tienen significado especial:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <ParchmentPanel className="p-6 border-2 border-emerald">
              <h3 className="font-heading text-xl text-emerald mb-3 flex items-center gap-2">
                <Star className="h-5 w-5" /> 20 Natural
              </h3>
              <p className="font-body text-ink mb-3">
                Cuando el dado muestra 20 (antes de sumar modificadores), es un
                <strong> critico</strong>.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-ink text-base">
                  <span className="text-emerald font-bold">+</span>
                  <span><strong>En combate:</strong> doble daño</span>
                </li>
                <li className="flex items-start gap-2 text-ink text-base">
                  <span className="text-emerald font-bold">+</span>
                  <span><strong>En habilidades:</strong> exito automatico con estilo</span>
                </li>
                <li className="flex items-start gap-2 text-ink text-base">
                  <span className="text-emerald font-bold">+</span>
                  <span>Momento epico garantizado</span>
                </li>
              </ul>
            </ParchmentPanel>

            <ParchmentPanel className="p-6 border-2 border-blood">
              <h3 className="font-heading text-xl text-blood mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> 1 Natural
              </h3>
              <p className="font-body text-ink mb-3">
                Cuando el dado muestra 1, es una <strong>pifia</strong>.
                Las cosas salen espectacularmente mal.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-ink text-base">
                  <span className="text-blood font-bold">-</span>
                  <span><strong>En combate:</strong> fallo automatico</span>
                </li>
                <li className="flex items-start gap-2 text-ink text-base">
                  <span className="text-blood font-bold">-</span>
                  <span><strong>En habilidades:</strong> fallo vergonzoso</span>
                </li>
                <li className="flex items-start gap-2 text-ink text-base">
                  <span className="text-blood font-bold">-</span>
                  <span>Momento comico o desastroso</span>
                </li>
              </ul>
            </ParchmentPanel>
          </div>

          <ParchmentPanel className="p-5 border border-gold-dim">
            <p className="font-body text-ink">
              <strong>Nota:</strong> En RolHub, las pifias siempre son interesantes,
              no frustrantes. No vas a morirte por tirar un 1, pero si vas a
              crear momentos memorables.
            </p>
          </ParchmentPanel>
        </div>
      </section>

      {/* Advantage & Disadvantage */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Ventaja y Desventaja
        </h2>

        <div className="font-body text-parchment space-y-6 text-lg leading-relaxed">
          <p>
            D&D 5e tiene un sistema elegante para representar circunstancias favorables
            o desfavorables:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <ParchmentPanel className="p-5 border border-emerald">
              <h3 className="font-heading text-emerald mb-3">Ventaja</h3>
              <p className="font-body text-ink mb-3">
                Tiras <strong>2d20</strong> y te quedas con el <strong>mas alto</strong>.
              </p>
              <p className="font-ui text-ink text-sm">
                Ejemplos: atacar desde sigilo, ayuda de un aliado, posicion alta.
              </p>
            </ParchmentPanel>

            <ParchmentPanel className="p-5 border border-blood">
              <h3 className="font-heading text-blood mb-3">Desventaja</h3>
              <p className="font-body text-ink mb-3">
                Tiras <strong>2d20</strong> y te quedas con el <strong>mas bajo</strong>.
              </p>
              <p className="font-ui text-ink text-sm">
                Ejemplos: atacar cegado, terreno dificil, efectos de estado.
              </p>
            </ParchmentPanel>
          </div>

          <p>
            Si tenes ventaja Y desventaja al mismo tiempo, se cancelan.
            Simple y elegante.
          </p>
        </div>
      </section>

      {/* Combat Basics */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Combate Basico
        </h2>

        <div className="font-body text-parchment space-y-6 text-lg leading-relaxed">
          <p>
            El combate en D&D 5e es por turnos. En tu turno podes:
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <ParchmentPanel className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-2">Movimiento</h3>
              <p className="font-body text-ink text-base">
                Moverte hasta tu velocidad (generalmente 9 metros).
                Podes dividirlo antes y despues de tu accion.
              </p>
            </ParchmentPanel>

            <ParchmentPanel className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-2">Accion</h3>
              <p className="font-body text-ink text-base">
                Atacar, lanzar un hechizo, usar un objeto,
                ayudar a otro, esconderte, etc.
              </p>
            </ParchmentPanel>

            <ParchmentPanel className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-2">Accion Bonus</h3>
              <p className="font-body text-ink text-base">
                Acciones rapidas especiales que te dan
                ciertas habilidades o hechizos.
              </p>
            </ParchmentPanel>
          </div>

          <ParchmentPanel className="p-5 border border-gold-dim">
            <h3 className="font-heading text-ink mb-3">Para atacar:</h3>
            <ol className="space-y-2">
              <li className="flex gap-3 text-ink">
                <span className="font-heading text-gold-dim">1.</span>
                <span>Tiras d20 + modificador de ataque</span>
              </li>
              <li className="flex gap-3 text-ink">
                <span className="font-heading text-gold-dim">2.</span>
                <span>Si igualas o superas la Clase de Armadura (CA) del enemigo, pegas</span>
              </li>
              <li className="flex gap-3 text-ink">
                <span className="font-heading text-gold-dim">3.</span>
                <span>Tiras el dado de daño de tu arma + modificador</span>
              </li>
            </ol>
          </ParchmentPanel>
        </div>
      </section>

      {/* Tips */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Consejos para D&D 5e
        </h2>

        <div className="space-y-4">
          {[
            {
              title: 'Conoce tus bonus',
              desc: 'Tene a mano tus modificadores de cada estadistica. Acelera el juego un monton.',
            },
            {
              title: 'Los criticos son para celebrar',
              desc: 'Cuando saques un 20, disfrutalo. Describe algo epico. Es TU momento.',
            },
            {
              title: 'Las pifias son para reir',
              desc: 'Un 1 no tiene que ser frustrante. Tomatelo con humor. Los mejores momentos salen de pifias.',
            },
            {
              title: 'Usa el entorno',
              desc: 'Busca formas de ganar Ventaja: emboscadas, terreno alto, distracciones. La tactica importa.',
            },
            {
              title: 'No solo ataques',
              desc: 'Podes ayudar aliados, esconderte, usar objetos. A veces la mejor accion no es pegar.',
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
          Para Quien es D&D 5e
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
                  <span>Queres el sistema mas popular y documentado</span>
                </li>
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-emerald font-bold">+</span>
                  <span>Te gustan los criticos y la emocion del d20</span>
                </li>
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-emerald font-bold">+</span>
                  <span>Queres variedad de opciones tacticas</span>
                </li>
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-emerald font-bold">+</span>
                  <span>Ya conoces D&D de otras fuentes</span>
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
                  <span>No queres recordar 6 estadisticas</span>
                </li>
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-blood font-bold">-</span>
                  <span>Preferis sistemas mas simples</span>
                </li>
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-blood font-bold">-</span>
                  <span>Te frustra la aleatoriedad alta del d20</span>
                </li>
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-blood font-bold">-</span>
                  <span>Queres narrativa pura sin numeros</span>
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
            Listo para Tirar el d20?
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Criticos epicos, pifias memorables, y la emocion del sistema
            de rol mas jugado del mundo. El d20 te espera.
          </p>
          <Link
            href="/onboarding"
            className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold"
          >
            Jugar con D&D 5e
          </Link>
        </ParchmentPanel>
      </section>

      {/* Navigation */}
      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link
            href="/guias/year-zero"
            className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior: Year Zero
          </Link>
          <Link
            href="/guias/sistemas-reglas"
            className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold"
          >
            Ver Todos los Sistemas
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
            "headline": "D&D 5e Simplificado: Guia del Sistema Clasico",
            "description": "Aprende D&D 5e simplificado para RolHub. El d20, modificadores, ventaja/desventaja y criticos.",
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
              "@id": "https://rol-hub.com/guias/dnd-5e"
            }
          })
        }}
      />
    </article>
  )
}
