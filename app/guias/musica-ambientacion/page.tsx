import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Music, Volume2, Headphones, Sparkles, Clock, List } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Musica y Ambientacion en Rol: Crear Atmosfera | RolHub',
  description: 'Como usar musica y efectos de sonido en juegos de rol. Playlists, mood, y tecnicas para crear atmosfera inmersiva.',
  keywords: [
    'musica D&D',
    'ambientacion rol',
    'playlist RPG',
    'atmosfera juegos de rol',
    'efectos sonido rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/musica-ambientacion',
  },
  openGraph: {
    title: 'Musica y Ambientacion en Rol | RolHub',
    description: 'Transforma tus sesiones con audio.',
    type: 'article',
  },
}

const musicMoods = [
  {
    mood: 'Exploracion',
    desc: 'Para viajar, explorar dungeons, o momentos de calma.',
    characteristics: ['Instrumental', 'Sin letra', 'Ritmo lento a medio', 'Ambiental'],
    examples: ['Skyrim OST', 'Lord of the Rings OST (piezas calmas)', 'Ambient fantasy playlists'],
  },
  {
    mood: 'Combate',
    desc: 'Para peleas y momentos de accion.',
    characteristics: ['Ritmo rapido', 'Percusion fuerte', 'Tension alta', 'Dinamico'],
    examples: ['Two Steps from Hell', 'Dark Souls OST', 'Epic battle playlists'],
  },
  {
    mood: 'Misterio/Horror',
    desc: 'Para tension, investigacion, o momentos oscuros.',
    characteristics: ['Disonante', 'Silencios', 'Sonidos extranios', 'Inquietante'],
    examples: ['Darkest Dungeon OST', 'Silent Hill OST', 'Dark ambient'],
  },
  {
    mood: 'Taverna/Social',
    desc: 'Para roleplay en ciudades, fiestas, o descanso.',
    characteristics: ['Alegre', 'Folk medieval', 'Puede tener letra', 'Animado'],
    examples: ['Bardcore covers', 'The Witcher tavern music', 'Medieval folk playlists'],
  },
  {
    mood: 'Epico/Climax',
    desc: 'Para momentos importantes, revelaciones, o finales.',
    characteristics: ['Orquestal', 'Coros', 'Grandilocuente', 'Emotivo'],
    examples: ['Hans Zimmer', 'Howard Shore', 'Epic orchestral playlists'],
  },
]

const playlistStructure = [
  {
    category: 'Playlist Core',
    playlists: ['Exploracion general', 'Combate estandar', 'Taverna/Social'],
    usage: 'Cubren el 80% de tu sesion.',
  },
  {
    category: 'Playlist Especializadas',
    playlists: ['Boss fight', 'Horror/Misterio', 'Momento emotivo', 'Victoria'],
    usage: 'Para momentos especificos planificados.',
  },
  {
    category: 'Playlist de Locacion',
    playlists: ['Bosque', 'Ciudad', 'Dungeon', 'Mar', 'Desierto'],
    usage: 'Agregan flavor a cada ambiente.',
  },
]

const sfxCategories = [
  {
    category: 'Ambiente',
    sounds: ['Lluvia', 'Viento', 'Fogata', 'Taberna llena', 'Bosque de noche'],
    tip: 'Ponelos en loop suave bajo la musica.',
  },
  {
    category: 'Momentos',
    sounds: ['Trueno', 'Explosion', 'Campana', 'Grito', 'Puerta que cruje'],
    tip: 'Usarlos en momentos especificos para impacto.',
  },
  {
    category: 'Combate',
    sounds: ['Espadas', 'Magia', 'Rugidos', 'Flechas', 'Escudo'],
    tip: 'Opcional. No sobrecargues.',
  },
]

const technicalTips = [
  {
    tip: 'Volumen',
    detail: 'La musica debe ser fondo, no protagonista. 20-30% del volumen de tu voz.',
  },
  {
    tip: 'Transiciones',
    detail: 'Cambia musica entre escenas, no durante. Fade out, no corte brusco.',
  },
  {
    tip: 'Preparacion',
    detail: 'Ten las playlists ordenadas antes de la sesion. No busques en vivo.',
  },
  {
    tip: 'Latencia',
    detail: 'Si jugas online, considera el delay. Avisa cuando cambias musica.',
  },
  {
    tip: 'Auriculares',
    detail: 'Si usas SFX, usa auriculares para no crear feedback.',
  },
]

const tools = [
  {
    tool: 'Spotify',
    pros: 'Muchas playlists ya hechas, facil de usar.',
    cons: 'Ads en version gratis, no siempre tiene lo que necesitas.',
    best: 'Si ya lo usas y no queres complicarte.',
  },
  {
    tool: 'YouTube',
    pros: 'Videos de "2 hours of fantasy music", gratis.',
    cons: 'Ads, no siempre facil de controlar.',
    best: 'Playlists largas pre-mezcladas.',
  },
  {
    tool: 'Tabletop Audio',
    pros: 'Hecho para RPG, soundboards, gratis.',
    cons: 'Biblioteca limitada.',
    best: 'SFX y ambientes especificos.',
  },
  {
    tool: 'Syrinscape',
    pros: 'Profesional, soundscapes dinamicos.',
    cons: 'Pago, curva de aprendizaje.',
    best: 'Si queres maxima produccion.',
  },
]

const dosDonts = [
  {
    do: 'Ten musica lista antes de empezar',
    dont: 'Busques musica durante la sesion',
  },
  {
    do: 'Usa musica sin letra (o en idioma desconocido)',
    dont: 'Pongas canciones que distraigan',
  },
  {
    do: 'Cambia la musica para senalar cambios de escena',
    dont: 'Dejes la misma cancion todo el combate',
  },
  {
    do: 'Pregunta a los jugadores si les molesta',
    dont: 'Asumas que a todos les gusta',
  },
  {
    do: 'Usa el silencio como herramienta',
    dont: 'Sientas que siempre tiene que haber musica',
  },
]

const momentTechniques = [
  {
    moment: 'El Villano Aparece',
    technique: 'Corta toda la musica. Silencio. Luego su tema.',
  },
  {
    moment: 'Revelacion Importante',
    technique: 'Baja el volumen gradualmente mientras hablas.',
  },
  {
    moment: 'Victoria Epica',
    technique: 'Subi el volumen y cambia a tema triunfante.',
  },
  {
    moment: 'Momento Emotivo',
    technique: 'Piano solo o cuerdas. Muy bajo.',
  },
  {
    moment: 'Tension Creciente',
    technique: 'Musica de fondo que va subiendo de intensidad.',
  },
]

export default function MusicaAmbientacionPage() {
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
          <span className="text-xs font-ui font-semibold text-parchment">12 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-stone"><Music className="h-8 w-8 text-gold" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Musica y Ambientacion
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          La musica correcta puede transformar una sesion de "buena" a "inolvidable".
          Pero mal usada, distrae y rompe la inmersion. Esta guia te ayuda
          a usar el audio como herramienta, no como ruido de fondo.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Regla de Oro del Audio</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>La musica es un condimento, no el plato principal.</strong>
          <br /><br />
          Si los jugadores notan la musica mas que la narrativa,
          esta demasiado fuerte o es la musica equivocada.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Headphones className="h-6 w-6" /> Moods Musicales
        </h2>
        <div className="space-y-4">
          {musicMoods.map((mood) => (
            <ParchmentPanel key={mood.mood} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{mood.mood}</h3>
              <p className="font-body text-ink text-sm mb-2">{mood.desc}</p>
              <div className="grid md:grid-cols-2 gap-2 text-xs mb-2">
                <div className="p-2 bg-gold/10 rounded">
                  <span className="font-ui text-gold-dim">Caracteristicas:</span>
                  <ul className="font-body text-ink">
                    {mood.characteristics.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-emerald">Ejemplos:</span>
                  <ul className="font-body text-ink">
                    {mood.examples.map((e, i) => (
                      <li key={i}>• {e}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <List className="h-6 w-6" /> Estructura de Playlists
        </h2>
        <div className="space-y-4">
          {playlistStructure.map((cat) => (
            <ParchmentPanel key={cat.category} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{cat.category}</h3>
              <ul className="font-body text-ink text-sm mb-2">
                {cat.playlists.map((p, i) => (
                  <li key={i}>• {p}</li>
                ))}
              </ul>
              <p className="font-ui text-xs text-gold-dim">Uso: {cat.usage}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Volume2 className="h-6 w-6" /> Efectos de Sonido
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {sfxCategories.map((cat) => (
            <ParchmentPanel key={cat.category} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{cat.category}</h4>
              <ul className="font-body text-ink text-xs mb-2">
                {cat.sounds.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
              <p className="font-ui text-xs text-gold-dim">{cat.tip}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Tecnicas por Momento
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {momentTechniques.map((tech) => (
              <div key={tech.moment} className="p-3 bg-gold/5 rounded">
                <h4 className="font-heading text-ink text-sm">{tech.moment}</h4>
                <p className="font-body text-ink text-sm">{tech.technique}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Clock className="h-6 w-6" /> Herramientas
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <ParchmentPanel key={tool.tool} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{tool.tool}</h4>
              <div className="text-xs mb-2">
                <span className="font-ui text-emerald">Pros: </span>
                <span className="font-body text-ink">{tool.pros}</span>
              </div>
              <div className="text-xs mb-2">
                <span className="font-ui text-blood">Cons: </span>
                <span className="font-body text-ink">{tool.cons}</span>
              </div>
              <p className="font-ui text-xs text-gold-dim">Mejor para: {tool.best}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tips Tecnicos
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {technicalTips.map((tip) => (
              <div key={tip.tip} className="p-3 bg-gold/5 rounded">
                <h4 className="font-heading text-ink text-sm">{tip.tip}</h4>
                <p className="font-body text-ink text-sm">{tip.detail}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Que Hacer y Que Evitar
        </h2>
        <div className="space-y-3">
          {dosDonts.map((item, i) => (
            <ParchmentPanel key={i} className="p-4 border border-gold-dim/50">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Hace</span>
                  <p className="font-body text-ink text-sm">{item.do}</p>
                </div>
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">Evita</span>
                  <p className="font-body text-ink text-sm">{item.dont}</p>
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
            <strong>El silencio tambien es una herramienta.</strong>
            <br /><br />
            A veces el momento mas poderoso es cuando la musica se detiene.
            No llenes cada segundo con sonido.
            Deja que el silencio cree tension.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Los jugadores dificiles son otro desafio para el DM.
          </p>
          <Link href="/guias/jugadores-dificiles" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Jugadores Dificiles
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/puzzles-acertijos" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Puzzles
          </Link>
          <Link href="/guias/jugadores-dificiles" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Jugadores Dificiles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
