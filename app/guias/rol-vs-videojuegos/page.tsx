import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Gamepad2, Users, Sparkles, Brain, Infinity, MessageCircle } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Rol de Mesa vs Videojuegos RPG: Diferencias Clave | RolHub',
  description: 'Comparativa entre juegos de rol de mesa y videojuegos RPG. Que hace unico al rol de mesa frente a Skyrim, Baldur\'s Gate o Final Fantasy.',
  keywords: [
    'rol vs videojuegos',
    'D&D vs Skyrim',
    'diferencias rol mesa',
    'TTRPG vs CRPG',
    'rol narrativo'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/rol-vs-videojuegos',
  },
  openGraph: {
    title: 'Rol de Mesa vs Videojuegos RPG | RolHub',
    description: 'Que hace unico al rol de mesa frente a los videojuegos.',
    type: 'article',
  },
}

const keyDifferences = [
  {
    aspect: 'Libertad de Accion',
    videogame: 'Opciones predefinidas por el diseñador. 3-4 respuestas de dialogo.',
    tabletop: 'Podes hacer literalmente lo que se te ocurra. El DM adapta.',
    example: 'En Skyrim no podes negociar con el dragon. En mesa, podes intentar.',
  },
  {
    aspect: 'Consecuencias',
    videogame: 'Ramas narrativas programadas. El juego sabe que vas a hacer.',
    tabletop: 'Consecuencias emergentes. Ni el DM sabe que va a pasar.',
    example: 'Matar al NPC mercader tiene consecuencias que el DM improvisa.',
  },
  {
    aspect: 'Combate',
    videogame: 'Mecanicas exactas. El daño es calculado al milisegundo.',
    tabletop: 'Los dados introducen caos. El heroe puede fallar, el villano puede caer.',
    example: 'Un critico puede cambiar toda la historia. Eso no pasa en scripted battles.',
  },
  {
    aspect: 'Personalizacion',
    videogame: 'Builds optimizadas, min-maxing, metas definidas.',
    tabletop: 'Tu personaje puede ser mecanicamente suboptimo pero narrativamente perfecto.',
    example: 'Podes jugar un mago que odia la magia. El sistema lo soporta.',
  },
  {
    aspect: 'Social',
    videogame: 'Single player o multiplayer anonimo. NPCs con dialogos fijos.',
    tabletop: 'Experiencia compartida con amigos. NPCs que evolucionan.',
    example: 'El tabernero recuerda que le salvaste la vida hace 3 sesiones.',
  },
  {
    aspect: 'Fallo',
    videogame: 'Game over, reload, intentar de nuevo.',
    tabletop: 'El fallo es parte de la historia. No hay "perder".',
    example: 'Fallaste la mision? Ahora la historia va por otro camino.',
  },
]

const whatYouKeep = [
  {
    from: 'Explorar mundos fantasticos',
    in_tabletop: 'El mundo existe en la imaginacion colectiva. Mas vasto que cualquier mapa.',
  },
  {
    from: 'Subir de nivel y conseguir loot',
    in_tabletop: 'La progresion existe. Los objetos magicos son igual de satisfactorios.',
  },
  {
    from: 'Derrotar enemigos epicos',
    in_tabletop: 'Los combates son emocionantes. Y podes perder de verdad.',
  },
  {
    from: 'Tomar decisiones que importan',
    in_tabletop: 'Las decisiones importan MAS. No hay opcion "correcta" predefinida.',
  },
  {
    from: 'Crear tu propio personaje',
    in_tabletop: 'Personalizacion total. No estas limitado a opciones de menu.',
  },
]

const whatYouGain = [
  {
    gain: 'Creatividad ilimitada',
    desc: 'Si podes imaginarlo, podes intentarlo. No hay boundaries del engine.',
    icon: '✨',
  },
  {
    gain: 'Impacto real en la historia',
    desc: 'Tus decisiones cambian el mundo de forma permanente.',
    icon: '🌍',
  },
  {
    gain: 'Conexion social genuina',
    desc: 'Jugas CON personas, no contra ellas o junto a ellas.',
    icon: '👥',
  },
  {
    gain: 'Historias unicas',
    desc: 'Tu campaña nunca existio antes y nunca se repetira.',
    icon: '📖',
  },
  {
    gain: 'Roleplay profundo',
    desc: 'Podes SER tu personaje, no solo controlarlo.',
    icon: '🎭',
  },
  {
    gain: 'El DM esta de tu lado',
    desc: 'A diferencia del juego, el DM quiere que tengas una buena historia.',
    icon: '🤝',
  },
]

const commonMisconceptions = [
  {
    misconception: 'Hay que actuar con voces',
    reality: 'Podes describir acciones en tercera persona. "Mi personaje dice que..."',
  },
  {
    misconception: 'Necesitas saber todas las reglas',
    reality: 'El DM (o la IA) maneja las reglas. Vos solo decis que queres hacer.',
  },
  {
    misconception: 'Las sesiones duran 6 horas',
    reality: 'Podes jugar en 30 minutos, 1 hora, lo que te sirva.',
  },
  {
    misconception: 'Hay que dibujar mapas y usar miniaturas',
    reality: 'Todo puede ser teatro de la mente. Ningun accesorio es obligatorio.',
  },
  {
    misconception: 'Solo existe D&D',
    reality: 'Hay cientos de sistemas. Algunos no usan dados. Algunos no tienen combate.',
  },
]

const videogameTranslations = [
  {
    videogame_term: 'Quicksave/Quickload',
    tabletop: 'No existe. Las consecuencias son permanentes (y eso es bueno).',
  },
  {
    videogame_term: 'Guia/Walkthrough',
    tabletop: 'No existe. No hay solucion "correcta" que googlear.',
  },
  {
    videogame_term: 'Meta/Build optima',
    tabletop: 'Existe pero importa menos. La historia > la optimizacion.',
  },
  {
    videogame_term: 'Grindear',
    tabletop: 'No necesario. La progresion viene de la narrativa, no de repetir.',
  },
  {
    videogame_term: 'NPC quest giver',
    tabletop: 'Los NPCs tienen vidas propias. Pueden negarse, mentir, cambiar de opinion.',
  },
  {
    videogame_term: 'Main quest / Side quest',
    tabletop: 'Todo es main quest si decidis que lo es.',
  },
]

const famousGamesComparison = [
  {
    game: 'Skyrim',
    similarity: 'Exploracion, libertad, muchas builds.',
    difference: 'En mesa los dragones pueden ser razonados. Los NPCs recuerdan.',
  },
  {
    game: 'Baldur\'s Gate 3',
    similarity: 'El mas cercano. Literalmente basado en D&D.',
    difference: 'En mesa no hay "opciones grises". Podes hacer cualquier cosa.',
  },
  {
    game: 'Final Fantasy',
    similarity: 'Historias epicas, combate por turnos, party.',
    difference: 'En mesa VOS escribis la historia, no la seguis.',
  },
  {
    game: 'Dark Souls',
    similarity: 'Dificultad, riesgo, satisfaccion del logro.',
    difference: 'En mesa el "fallo" no es game over, es nuevo plot.',
  },
  {
    game: 'Mass Effect',
    similarity: 'Decisiones con consecuencias, relaciones con NPCs.',
    difference: 'En mesa no hay 3 finales. Hay infinitos.',
  },
]

export default function RolVsVideojuegosPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-emerald px-2 py-1 rounded">Comparativas</span>
          <span className="text-xs font-ui font-semibold text-parchment">10 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-emerald"><Gamepad2 className="h-8 w-8 text-white" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Rol de Mesa vs Videojuegos
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Si jugaste Skyrim, Baldur's Gate, o cualquier RPG, ya sabes mas de
          rol de lo que pensas. Esta guia traduce tu experiencia gamer al
          mundo del rol de mesa.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Diferencia Fundamental</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>En un videojuego, exploras el contenido que alguien creo.</strong>
          <br />
          <strong>En rol de mesa, creas el contenido mientras lo exploras.</strong>
          <br /><br />
          No hay limites de engine. No hay opciones predefinidas.
          Solo tu imaginacion y las reglas del mundo.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Brain className="h-6 w-6" /> Diferencias Clave
        </h2>
        <div className="space-y-4">
          {keyDifferences.map((diff) => (
            <ParchmentPanel key={diff.aspect} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-3">{diff.aspect}</h3>
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div className="p-3 bg-stone/30 rounded">
                  <span className="font-ui text-xs text-gold-dim block mb-1">Videojuego</span>
                  <p className="font-body text-ink text-sm">{diff.videogame}</p>
                </div>
                <div className="p-3 bg-gold/10 rounded">
                  <span className="font-ui text-xs text-gold block mb-1">Rol de Mesa</span>
                  <p className="font-body text-ink text-sm">{diff.tabletop}</p>
                </div>
              </div>
              <p className="font-ui text-xs text-gold-dim italic">Ejemplo: {diff.example}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Lo Que Conservas
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">Todo lo que te gusta de los RPGs sigue aca:</p>
          <div className="space-y-3">
            {whatYouKeep.map((item) => (
              <div key={item.from} className="p-3 bg-gold/5 rounded">
                <span className="font-heading text-ink text-sm">{item.from}</span>
                <p className="font-body text-ink text-sm text-gold-dim">{item.in_tabletop}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Infinity className="h-6 w-6" /> Lo Que Ganas
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {whatYouGain.map((item) => (
            <ParchmentPanel key={item.gain} className="p-4 border border-gold-dim/50">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h4 className="font-heading text-ink mb-1">{item.gain}</h4>
                  <p className="font-body text-ink text-sm">{item.desc}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <MessageCircle className="h-6 w-6" /> Misconceptions Comunes
        </h2>
        <div className="space-y-3">
          {commonMisconceptions.map((item) => (
            <ParchmentPanel key={item.misconception} className="p-4 border border-gold-dim/50">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">Mito</span>
                  <p className="font-body text-ink text-sm">{item.misconception}</p>
                </div>
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Realidad</span>
                  <p className="font-body text-ink text-sm">{item.reality}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Gamepad2 className="h-6 w-6" /> Traduccion de Conceptos
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {videogameTranslations.map((item) => (
              <div key={item.videogame_term} className="p-3 bg-gold/5 rounded flex flex-col md:flex-row md:items-center gap-2">
                <span className="font-heading text-ink text-sm w-40 shrink-0">{item.videogame_term}</span>
                <span className="text-gold-dim hidden md:block">→</span>
                <span className="font-body text-ink text-sm">{item.tabletop}</span>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> Si Te Gusto X, Te Va a Gustar Rol Porque...
        </h2>
        <div className="space-y-4">
          {famousGamesComparison.map((game) => (
            <ParchmentPanel key={game.game} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-2">{game.game}</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <span className="font-ui text-xs text-emerald">Similar:</span>
                  <p className="font-body text-ink text-sm">{game.similarity}</p>
                </div>
                <div>
                  <span className="font-ui text-xs text-gold">Mejor en mesa:</span>
                  <p className="font-body text-ink text-sm">{game.difference}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">El Mejor Consejo</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>No intentes "ganar" el rol como un videojuego.</strong>
            <br /><br />
            No hay achievements, no hay 100% completion, no hay leaderboard.
            <br />
            El objetivo es tener una experiencia memorable con otras personas
            (o con vos mismo y la IA).
            <br /><br />
            Si la historia fue interesante, ganaste.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Ver Sistemas de Reglas
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Compara los diferentes motores de juego disponibles.
          </p>
          <Link href="/guias/tabla-sistemas" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Tabla de Sistemas
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/arquetipos-apoyo" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Apoyo
          </Link>
          <Link href="/guias/tabla-sistemas" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Tabla de Sistemas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
