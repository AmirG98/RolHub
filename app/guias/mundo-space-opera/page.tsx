import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Rocket, Users, Map, Sparkles, Zap, Star } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Guia del Mundo Frontera Estelar: Space Opera | RolHub',
  description: 'Todo lo que necesitas saber para jugar en Frontera Estelar. La Corriente, facciones, planetas y consejos para vivir tu propia aventura galactica.',
  keywords: [
    'Frontera Estelar rol',
    'space opera RPG',
    'jugar space opera',
    'La Corriente juego',
    'contrabandistas galaxia RPG'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/mundo-space-opera',
  },
  openGraph: {
    title: 'Guia del Mundo Frontera Estelar | RolHub',
    description: 'Que la Corriente te acompane en tu aventura.',
    type: 'article',
  },
}

const factions = [
  {
    name: 'Coalición Libre',
    description: 'Luchadores por la libertad contra el Dominio Estelar.',
    alignment: 'Bueno',
    playStyle: 'Misiones de espionaje, rescates atrevidos, batallas contra todo pronostico.',
  },
  {
    name: 'Dominio Estelar',
    description: 'Imperio totalitario que controla la galaxia con mano de hierro.',
    alignment: 'Malvado',
    playStyle: 'Antagonistas principales. Legiones acorazadas, cruceros de guerra, opresion.',
  },
  {
    name: 'Gremio de Cazarrecompensas',
    description: 'Mercenarios profesionales que trabajan por creditos.',
    alignment: 'Neutral',
    playStyle: 'Rastrear objetivos, capturar fugitivos, moral gris.',
  },
  {
    name: 'Contrabandistas',
    description: 'Independientes que evaden la ley del Dominio en naves rapidas.',
    alignment: 'Neutral',
    playStyle: 'Rutas secretas, tratos dudosos, siempre un paso adelante.',
  },
  {
    name: 'Resto Vael',
    description: 'Ultimos guardianes de la Corriente, ocultos en las sombras.',
    alignment: 'Bueno',
    playStyle: 'Misterio, sabiduria, poderes de la Corriente, evitar al Dominio.',
  },
]

const locations = [
  { name: 'Karshaar', danger: 'Medio', desc: 'Planeta desertico en el Borde Exterior. Dos soles, mucha arena, mas peligro.' },
  { name: 'Puerto Zenna', danger: 'Alto', desc: 'Puerto espacial de mala reputacion. Refugio de contrabandistas, fugitivos y tratos que nadie quiere presenciar.' },
  { name: 'Kryos', danger: 'Alto', desc: 'Planeta helado. Base secreta de la Coalición y criaturas peligrosas.' },
  { name: 'Mirval', danger: 'Medio', desc: 'Pantano donde se oculta un maestro Vael. Fuerte en la Corriente.' },
  { name: 'Nexus Prime', danger: 'Bajo', desc: 'Capital del Dominio Estelar. Ciudad-planeta con miles de niveles.' },
  { name: 'Estación Eclipse', danger: 'Extremo', desc: 'Estacion espacial del Dominio capaz de destruir planetas.' },
]

const theForce = [
  { aspect: 'Telequinesis', desc: 'Mover objetos con la mente. Desde empujar enemigos hasta levantar naves.' },
  { aspect: 'Sentidos Mejorados', desc: 'Percibir peligros, leer emociones, presentir el futuro.' },
  { aspect: 'Trucos Mentales', desc: 'Sembrar una idea, borrar una sospecha. Influenciar mentes debiles.' },
  { aspect: 'Visiones', desc: 'Vislumbres del futuro o del pasado. No siempre claras.' },
  { aspect: 'La Sombra de la Corriente', desc: 'Poder rapido pero corruptor. La ira y el miedo son el camino de los Umbra.' },
]

const tips = [
  {
    title: 'Es Space Fantasy, no Sci-Fi',
    desc: 'La Corriente es magia. Las hojas de plasma son espadas. No te preocupes por la fisica realista.',
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
    title: 'Los Autómatas Importan',
    desc: 'Un automata leal puede ser el mejor companero de aventuras. No son accesorios: pueden ser heroes tambien.',
  },
  {
    title: 'El Conflicto Interno',
    desc: 'La lucha entre la luz de la Corriente y su sombra puede estar dentro de tu personaje.',
  },
]

export default function SpaceOperaPage() {
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
            <h1 className="font-title text-3xl md:text-4xl text-gold-bright">Frontera Estelar</h1>
            <p className="font-ui text-parchment text-lg">Space opera de contrabandistas, imperios y poderes misticos</p>
          </div>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          La galaxia esta en guerra. El Dominio Estelar gobierna con mano de hierro mientras
          la Coalición Libre lucha por la libertad. Sos un aventurero en esta era oscura:
          contrabandista, cazarrecompensas, o alguien sensible a la Corriente.
          Tu destino puede cambiar el curso de la historia.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border border-gold-dim">
        <h2 className="font-heading text-lg text-ink mb-3">El Mundo en una Frase</h2>
        <p className="font-body text-ink text-lg italic">
          "En los confines de una galaxia en guerra, heroes improbables se enfrentan
          a un imperio de oscuridad, armados con esperanza, amistad y la Corriente."
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6" /> La Corriente
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">
            La Corriente es un campo de energia mistica que conecta toda la vida en la galaxia.
            Algunos pueden manipularla — los Vael para el bien, los Umbra para el mal.
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
              <p className="font-body text-ink text-sm">Piloto astuto con nave rapida y problemas con el Dominio.</p>
            </div>
            <div className="text-center">
              <Star className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">Sensible a la Corriente</h3>
              <p className="font-body text-ink text-sm">Poderes que no comprendes. El legado Vael vive en vos.</p>
            </div>
            <div className="text-center">
              <Zap className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">Cazarrecompensas</h3>
              <p className="font-body text-ink text-sm">Armadura sellada, rastreo experto, trabajas por creditos.</p>
            </div>
          </div>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">Que la Corriente Te Acompane</h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto">
            La galaxia necesita heroes. El Dominio cree que ha ganado,
            pero mientras haya esperanza, la Coalición sigue viva.
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
