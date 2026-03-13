import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Sparkles, Users, Map, Star, Swords, Trophy } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Guia del Mundo Isekai: Fantasia Anime | RolHub',
  description: 'Todo lo que necesitas saber para jugar en un mundo isekai. Gremio de aventureros, rangos, dungeons y consejos para ser el protagonista.',
  keywords: [
    'isekai rol',
    'fantasia anime RPG',
    'gremio aventureros',
    'dungeons y mazmorras anime',
    'jugar estilo anime'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/mundo-isekai',
  },
  openGraph: {
    title: 'Guia del Mundo Isekai | RolHub',
    description: 'Fuiste transportado a otro mundo. Que vas a hacer?',
    type: 'article',
  },
}

const factions = [
  {
    name: 'Gremio de Aventureros',
    description: 'La organizacion que acepta misiones y rankea aventureros.',
    alignment: 'Neutral',
    playStyle: 'Misiones, progresion, camaraderia.',
  },
  {
    name: 'El Reino',
    description: 'La nobleza y la corona con sus intrigas politicas.',
    alignment: 'Variable',
    playStyle: 'Politica, eventos sociales, misiones de estado.',
  },
  {
    name: 'La Iglesia',
    description: 'Adoradores de la Diosa que tienen mas poder del que parece.',
    alignment: 'Bueno',
    playStyle: 'Magia sagrada, misterios divinos.',
  },
  {
    name: 'El Rey Demonio',
    description: 'La amenaza constante al mundo. Tiene generales y ejercitos.',
    alignment: 'Malvado',
    playStyle: 'El antagonista final. Siempre presente.',
  },
]

const ranks = [
  { rank: 'F', name: 'Novato', color: 'gray', desc: 'Recien registrado. Misiones de recoleccion y entrega.' },
  { rank: 'E', name: 'Aprendiz', color: 'brown', desc: 'Misiones de escolta basica y exterminacion de plagas.' },
  { rank: 'D', name: 'Regular', color: 'green', desc: 'Puede aceptar misiones de monstruos debiles.' },
  { rank: 'C', name: 'Veterano', color: 'blue', desc: 'Misiones de dungeon y monstruos medianos.' },
  { rank: 'B', name: 'Elite', color: 'purple', desc: 'Misiones de alto riesgo, jefes de dungeon.' },
  { rank: 'A', name: 'Campeon', color: 'gold', desc: 'Amenazas regionales, dragones menores.' },
  { rank: 'S', name: 'Heroe', color: 'red', desc: 'Calamidades nacionales. Solo un punado existe.' },
]

const locations = [
  { name: 'Ciudad Inicial', danger: 'Seguro', desc: 'Tu base de operaciones. Gremio, tiendas, posada.' },
  { name: 'Bosque de Principiantes', danger: 'Bajo', desc: 'Slimes y goblins debiles. Ideal para farmear.' },
  { name: 'Dungeon de Rango D', danger: 'Medio', desc: 'Tu primer dungeon real. Trampas y jefe final.' },
  { name: 'La Capital', danger: 'Bajo', desc: 'Ciudad enorme. Politica, comercio, arena de combate.' },
  { name: 'Territorio del Rey Demonio', danger: 'Extremo', desc: 'El endgame. Solo para rango S.' },
]

const tips = [
  {
    title: 'Sos el Protagonista',
    desc: 'En isekai, las cosas tienden a funcionar a tu favor. Tene confianza, toma riesgos, y hace poses dramaticas.',
  },
  {
    title: 'El Poder del Trabajo Duro',
    desc: 'O el cheat que te dio la diosa. Cualquiera de los dos funciona. El punto es que vas a ser mas fuerte.',
  },
  {
    title: 'Construi tu Party',
    desc: 'Ningun heroe esta solo. Busca companeros con habilidades complementarias. Y personalidades interesantes.',
  },
  {
    title: 'El Gremio es tu Hogar',
    desc: 'La recepcionista te va a ayudar. Los otros aventureros pueden ser rivales o amigos. El tablero de misiones es tu guia.',
  },
  {
    title: 'Momentos de Slice of Life',
    desc: 'No todo es combate. Disfruta la comida del otro mundo, los banos termales, los festivales.',
  },
]

const tropes = [
  { name: 'El Heroe Invocado', desc: 'Elegido por la diosa con poderes especiales.' },
  { name: 'Reencarnacion', desc: 'Moris y renaces en otro mundo con tus recuerdos.' },
  { name: 'Sistema de Stats', desc: 'Podes ver tus estadisticas como en un videojuego.' },
  { name: 'Habilidad Unica', desc: 'Tenes UN poder especial que nadie mas tiene.' },
  { name: 'Harem', desc: '...opcional pero clasico del genero.' },
]

export default function IsekaiPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-emerald px-2 py-1 rounded">Mundo</span>
          <span className="text-xs font-ui font-semibold text-parchment">10 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><Star className="h-8 w-8 text-shadow" /></div>
          <div>
            <h1 className="font-title text-3xl md:text-4xl text-gold-bright">Mundo Isekai</h1>
            <p className="font-ui text-parchment text-lg">Fantasia Anime con Sistema de Niveles</p>
          </div>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Moriste. O te invocaron. O simplemente apareciste aca. El punto es que ahora
          estas en un mundo de fantasia con sistema de niveles, gremio de aventureros,
          y probablemente un poder especial que te hace unico.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border border-gold-dim">
        <h2 className="font-heading text-lg text-ink mb-3">El Mundo en una Frase</h2>
        <p className="font-body text-ink text-lg italic">
          "Es como un RPG hecho realidad — con stats, niveles, dungeons y todo.
          Pero aca el respawn no existe y los NPCs tienen sentimientos."
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Tropos del Genero
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">
            Isekai tiene sus propias reglas. Conocerlas te ayuda a jugar el genero:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {tropes.map((t) => (
              <div key={t.name} className="p-3 bg-gold/5 rounded">
                <h4 className="font-heading text-ink text-sm">{t.name}</h4>
                <p className="font-body text-ink text-sm">{t.desc}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Trophy className="h-6 w-6" /> Sistema de Rangos
        </h2>
        <div className="space-y-2">
          {ranks.map((r) => (
            <ParchmentPanel key={r.rank} className="p-4 border border-gold-dim/50">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-heading text-lg font-bold ${
                  r.color === 'gold' ? 'bg-gold text-shadow' :
                  r.color === 'red' ? 'bg-blood text-white' :
                  r.color === 'purple' ? 'bg-purple-600 text-white' :
                  r.color === 'blue' ? 'bg-blue-600 text-white' :
                  r.color === 'green' ? 'bg-emerald text-white' :
                  r.color === 'brown' ? 'bg-amber-700 text-white' :
                  'bg-gray-400 text-white'
                }`}>
                  {r.rank}
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-ink">{r.name}</h3>
                  <p className="font-body text-ink text-sm">{r.desc}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> Facciones
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {factions.map((f) => (
            <ParchmentPanel key={f.name} className="p-5 border border-gold-dim">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-heading text-ink">{f.name}</h3>
                <span className={`text-xs font-ui px-2 py-0.5 rounded ${f.alignment === 'Bueno' ? 'bg-emerald/20 text-emerald' : f.alignment === 'Malvado' ? 'bg-blood/20 text-blood' : 'bg-gold/20 text-gold-dim'}`}>
                  {f.alignment}
                </span>
              </div>
              <p className="font-body text-ink text-sm mb-2">{f.description}</p>
              <p className="font-ui text-xs text-ink"><strong>Estilo:</strong> {f.playStyle}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Map className="h-6 w-6" /> Locaciones Clave
        </h2>
        <div className="space-y-3">
          {locations.map((loc) => (
            <ParchmentPanel key={loc.name} className="p-4 border border-gold-dim/50">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-heading text-ink">{loc.name}</h3>
                <span className={`text-xs font-ui px-2 py-0.5 rounded ${loc.danger === 'Seguro' || loc.danger === 'Bajo' ? 'bg-emerald/20 text-emerald' : loc.danger === 'Extremo' ? 'bg-blood/20 text-blood' : 'bg-gold/20 text-gold-dim'}`}>
                  {loc.danger}
                </span>
              </div>
              <p className="font-body text-ink text-sm">{loc.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Swords className="h-6 w-6" /> Consejos para Jugar
        </h2>
        <div className="space-y-3">
          {tips.map((tip) => (
            <ParchmentPanel key={tip.title} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{tip.title}</h4>
              <p className="font-body text-ink text-sm">{tip.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">Arquetipos Recomendados</h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">El Heroe Elegido</h3>
              <p className="font-body text-ink text-sm">Invocado por la diosa con una habilidad unica.</p>
            </div>
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">El Artesano</h3>
              <p className="font-body text-ink text-sm">Tu poder es crear cosas increibles. Pociones, armas, comida.</p>
            </div>
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">El Tamer</h3>
              <p className="font-body text-ink text-sm">Domesticas monstruos. Tu slime mascota es adorable y letal.</p>
            </div>
          </div>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">Comienza tu Nueva Vida</h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto">
            La diosa te dio una segunda oportunidad. El gremio te espera.
            Es hora de convertirte en leyenda.
          </p>
          <Link href="/onboarding" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Comenzar Aventura
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/mundo-zombies" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Apocalipsis Zombie
          </Link>
          <Link href="/guias/mundo-vikingos" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Saga Vikinga <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
