import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Rocket, Users, Map, Sparkles, Zap, Star } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Guia de Star Wars: La Galaxia Muy Lejana | RolHub',
  description: 'Todo lo que necesitas saber para jugar en Star Wars. La Fuerza, facciones, planetas y consejos para vivir tu propia aventura galactica.',
  keywords: [
    'Star Wars rol',
    'jugar Star Wars RPG',
    'La Fuerza juego',
    'Jedi Sith rol',
    'galaxia muy lejana RPG'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/mundo-star-wars',
  },
  openGraph: {
    title: 'Guia de Star Wars | RolHub',
    description: 'Que la Fuerza te acompane en tu aventura.',
    type: 'article',
  },
}

const factions = [
  {
    name: 'Alianza Rebelde',
    description: 'Luchadores por la libertad contra el Imperio Galactico.',
    alignment: 'Bueno',
    playStyle: 'Misiones de espionaje, rescates atrevidos, batallas contra todo pronostico.',
  },
  {
    name: 'Imperio Galactico',
    description: 'Gobierno totalitario que controla la galaxia con mano de hierro.',
    alignment: 'Malvado',
    playStyle: 'Antagonistas principales. Stormtroopers, Star Destroyers, opresion.',
  },
  {
    name: 'Gremio de Cazarrecompensas',
    description: 'Mercenarios profesionales que trabajan por creditos.',
    alignment: 'Neutral',
    playStyle: 'Rastrear objetivos, capturar fugitivos, moral gris.',
  },
  {
    name: 'Contrabandistas',
    description: 'Independientes que evaden la ley imperial en naves rapidas.',
    alignment: 'Neutral',
    playStyle: 'Rutas secretas, tratos dudosos, siempre un paso adelante.',
  },
  {
    name: 'Resto Jedi',
    description: 'Ultimos guardianes de la Fuerza, ocultos en las sombras.',
    alignment: 'Bueno',
    playStyle: 'Misterio, sabiduria, poderes de la Fuerza, evitar el Imperio.',
  },
]

const locations = [
  { name: 'Tatooine', danger: 'Medio', desc: 'Planeta desertico en el Borde Exterior. Dos soles, mucha arena, mas peligro.' },
  { name: 'Mos Eisley', danger: 'Alto', desc: 'Puerto espacial de mala reputacion. "Nunca encontraras un lugar mas lleno de escoria y vileza."' },
  { name: 'Hoth', danger: 'Alto', desc: 'Planeta helado. Base rebelde secreta y criaturas peligrosas.' },
  { name: 'Dagobah', danger: 'Medio', desc: 'Pantano donde se oculta un maestro Jedi. Fuerte en la Fuerza.' },
  { name: 'Coruscant', danger: 'Bajo', desc: 'Capital imperial. Ciudad-planeta con miles de niveles.' },
  { name: 'Estrella de la Muerte', danger: 'Extremo', desc: 'Estacion espacial imperial capaz de destruir planetas.' },
]

const theForce = [
  { aspect: 'Telequinesis', desc: 'Mover objetos con la mente. Desde empujar enemigos hasta levantar naves.' },
  { aspect: 'Sentidos Mejorados', desc: 'Percibir peligros, leer emociones, presentir el futuro.' },
  { aspect: 'Trucos Mentales', desc: '"Estos no son los droides que buscas." Influenciar mentes debiles.' },
  { aspect: 'Visiones', desc: 'Vislumbres del futuro o del pasado. No siempre claras.' },
  { aspect: 'Lado Oscuro', desc: 'Poder rapido pero corruptor. La ira y el miedo son el camino.' },
]

const tips = [
  {
    title: 'Es Space Fantasy, no Sci-Fi',
    desc: 'La Fuerza es magia. Los sables de luz son espadas. No te preocupes por la fisica realista.',
  },
  {
    title: 'La Esperanza Siempre Existe',
    desc: 'Aunque todo parezca perdido, los heroes pueden cambiar el destino de la galaxia.',
  },
  {
    title: 'Planetas Variados',
    desc: 'Cada planeta es unico: desierto, hielo, jungla, ciudad. Aprovecha la variedad.',
  },
  {
    title: 'Los Droides Importan',
    desc: 'R2-D2 y C-3PO no son accesorios. Los droides pueden ser heroes tambien.',
  },
  {
    title: 'El Conflicto Interno',
    desc: 'La lucha entre Lado Luminoso y Oscuro puede estar dentro de tu personaje.',
  },
]

export default function StarWarsPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-gold-dim px-2 py-1 rounded">Mundo</span>
          <span className="text-xs font-ui font-semibold text-parchment">12 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><Rocket className="h-8 w-8 text-shadow" /></div>
          <div>
            <h1 className="font-title text-3xl md:text-4xl text-gold-bright">Guerra de las Galaxias</h1>
            <p className="font-ui text-parchment text-lg">Una Galaxia Muy, Muy Lejana</p>
          </div>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          La galaxia esta en guerra. El Imperio domina con mano de hierro mientras la Rebelion
          lucha por la libertad. Sos un aventurero en esta era oscura: contrabandista, cazarrecompensas,
          o alguien sensible a la Fuerza. Tu destino puede cambiar el curso de la historia.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border border-gold-dim">
        <h2 className="font-heading text-lg text-ink mb-3">El Mundo en una Frase</h2>
        <p className="font-body text-ink text-lg italic">
          "Hace mucho tiempo, en una galaxia muy, muy lejana... heroes improbables
          se enfrentan a un imperio de oscuridad, armados con esperanza, amistad y la Fuerza."
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6" /> La Fuerza
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">
            La Fuerza es un campo de energia que conecta toda la vida en la galaxia.
            Algunos pueden manipularla — los Jedi para el bien, los Sith para el mal.
          </p>
          <div className="space-y-3">
            {theForce.map((f) => (
              <div key={f.aspect} className="p-3 bg-gold/5 rounded">
                <h4 className="font-heading text-ink text-sm">{f.aspect}</h4>
                <p className="font-body text-ink text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
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
                <span className={`text-xs font-ui px-2 py-0.5 rounded ${loc.danger === 'Bajo' ? 'bg-emerald/20 text-emerald' : loc.danger === 'Extremo' ? 'bg-blood/20 text-blood' : 'bg-gold/20 text-gold-dim'}`}>
                  Peligro: {loc.danger}
                </span>
              </div>
              <p className="font-body text-ink text-sm">{loc.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Consejos para Jugar
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
              <Rocket className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">El Contrabandista</h3>
              <p className="font-body text-ink text-sm">Piloto astuto con nave rapida y problemas con el Imperio.</p>
            </div>
            <div className="text-center">
              <Star className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">Sensible a la Fuerza</h3>
              <p className="font-body text-ink text-sm">Poderes que no comprendes. El legado Jedi vive en vos.</p>
            </div>
            <div className="text-center">
              <Zap className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">Cazarrecompensas</h3>
              <p className="font-body text-ink text-sm">Armadura mandaloriana, rastreo experto, trabajas por creditos.</p>
            </div>
          </div>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">Que la Fuerza Te Acompane</h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto">
            La galaxia necesita heroes. El Imperio cree que ha ganado,
            pero mientras haya esperanza, la Rebelion sigue viva.
          </p>
          <Link href="/onboarding" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Comenzar Aventura
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/mundo-vikingos" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Saga Vikinga
          </Link>
          <Link href="/guias/mundo-cyberpunk" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Cyberpunk <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
