import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Skull, AlertTriangle, Users, Map, Sparkles, Package } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Guia del Apocalipsis Zombie: Supervivencia | RolHub',
  description: 'Todo lo que necesitas saber para sobrevivir en el apocalipsis zombie. Facciones, zonas, recursos y consejos para no morir.',
  keywords: [
    'apocalipsis zombie rol',
    'supervivencia zombie RPG',
    'jugar The Walking Dead',
    'rol post apocaliptico',
    'zombie survival game'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/mundo-zombies',
  },
  openGraph: {
    title: 'Guia del Apocalipsis Zombie | RolHub',
    description: 'Sobrevivi al fin del mundo. Si podes.',
    type: 'article',
  },
}

const factions = [
  {
    name: 'Supervivientes Civiles',
    description: 'Grupos de personas comunes tratando de sobrevivir dia a dia.',
    alignment: 'Variable',
    playStyle: 'Drama humano, decisiones morales dificiles.',
  },
  {
    name: 'Comunidades Fortificadas',
    description: 'Asentamientos organizados con reglas y jerarquia.',
    alignment: 'Neutral',
    playStyle: 'Politica interna, defensa, recursos escasos.',
  },
  {
    name: 'Saqueadores',
    description: 'Grupos hostiles que toman lo que necesitan por la fuerza.',
    alignment: 'Hostil',
    playStyle: 'Antagonistas principales, amenaza constante.',
  },
  {
    name: 'Los Militares',
    description: 'Restos del ejercito con sus propias agendas.',
    alignment: 'Ambiguo',
    playStyle: 'Autoridad cuestionable, recursos valiosos.',
  },
]

const zones = [
  { name: 'Zona Segura', danger: 'Bajo', desc: 'Asentamientos fortificados. Escasos recursos pero relativa seguridad.' },
  { name: 'Suburbios', danger: 'Medio', desc: 'Casas abandonadas con suministros. Zombies errantes.' },
  { name: 'Centro Urbano', danger: 'Alto', desc: 'Hordas densas pero depositos de recursos invaluables.' },
  { name: 'Hospital/Farmacia', danger: 'Muy Alto', desc: 'Medicinas desesperadamente necesarias. Siempre hay zombies.' },
  { name: 'Base Militar', danger: 'Extremo', desc: 'Armas y vehiculos. Probablemente una trampa mortal.' },
  { name: 'El Campo', danger: 'Variable', desc: 'Menos zombies pero sin suministros. Otros supervivientes.' },
]

const resources = [
  { name: 'Comida', icon: '🍖', importance: 'Critico', note: 'Sin comida, mueres. Asi de simple.' },
  { name: 'Agua', icon: '💧', importance: 'Critico', note: 'Mas importante que la comida. 3 dias maximo.' },
  { name: 'Medicinas', icon: '💊', importance: 'Alto', note: 'Una infeccion normal puede matarte.' },
  { name: 'Municion', icon: '🔫', importance: 'Alto', note: 'Los disparos atraen zombies. Usala sabiamente.' },
  { name: 'Combustible', icon: '⛽', importance: 'Medio', note: 'Movilidad = supervivencia.' },
  { name: 'Herramientas', icon: '🔧', importance: 'Medio', note: 'Reparar, construir, sobrevivir.' },
]

const tips = [
  {
    title: 'La Gente es Mas Peligrosa',
    desc: 'Los zombies son predecibles. Los humanos desesperados no. Nunca confies ciegamente.',
  },
  {
    title: 'El Ruido Mata',
    desc: 'Cada disparo, cada grito, atrae mas zombies. El silencio es tu mejor arma.',
  },
  {
    title: 'Recursos Limitados',
    desc: 'No hay tiendas, no hay fabricas. Cada bala, cada venda, es irremplazable. Raciona.',
  },
  {
    title: 'No Hay Heroes',
    desc: 'Olvidate del heroismo de pelicula. Sobrevivir a veces significa dejar atras a otros.',
  },
  {
    title: 'Plan de Escape',
    desc: 'Siempre tene una salida. Siempre. Las situaciones se pudren rapido.',
  },
]

const zombieTypes = [
  { name: 'Caminantes', desc: 'Lentos pero numerosos. Peligrosos en grupo.', threat: 'Bajo' },
  { name: 'Frescos', desc: 'Recien convertidos. Mas rapidos y agresivos.', threat: 'Medio' },
  { name: 'Horda', desc: 'Cientos o miles juntos. Huir es la unica opcion.', threat: 'Extremo' },
]

export default function ZombiesPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-blood px-2 py-1 rounded">Mundo</span>
          <span className="text-xs font-ui font-semibold text-parchment">12 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-blood"><Skull className="h-8 w-8 text-white" /></div>
          <div>
            <h1 className="font-title text-3xl md:text-4xl text-gold-bright">Apocalipsis Zombie</h1>
            <p className="font-ui text-parchment text-lg">Supervivencia Post-Apocaliptica</p>
          </div>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          El mundo que conocias termino. La civilizacion colapso. Los muertos caminan.
          Ahora solo importa una cosa: sobrevivir un dia mas. Y otro. Y otro.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border border-gold-dim">
        <h2 className="font-heading text-lg text-ink mb-3">El Mundo en una Frase</h2>
        <p className="font-body text-ink text-lg italic">
          "No son los zombies los que te van a matar. Son las decisiones imposibles,
          los recursos que se acaban, y la gente que haria cualquier cosa por sobrevivir."
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Skull className="h-6 w-6" /> Tipos de Zombies
        </h2>
        <div className="space-y-3">
          {zombieTypes.map((z) => (
            <ParchmentPanel key={z.name} className="p-4 border border-gold-dim/50">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-heading text-ink">{z.name}</h3>
                <span className={`text-xs font-ui px-2 py-0.5 rounded ${z.threat === 'Bajo' ? 'bg-emerald/20 text-emerald' : z.threat === 'Extremo' ? 'bg-blood/20 text-blood' : 'bg-gold/20 text-gold-dim'}`}>
                  Amenaza: {z.threat}
                </span>
              </div>
              <p className="font-body text-ink text-sm">{z.desc}</p>
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
                <span className={`text-xs font-ui px-2 py-0.5 rounded ${f.alignment === 'Hostil' ? 'bg-blood/20 text-blood' : f.alignment === 'Variable' || f.alignment === 'Ambiguo' ? 'bg-gold/20 text-gold-dim' : 'bg-emerald/20 text-emerald'}`}>
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
          <Map className="h-6 w-6" /> Zonas de Peligro
        </h2>
        <div className="space-y-3">
          {zones.map((zone) => (
            <ParchmentPanel key={zone.name} className="p-4 border border-gold-dim/50">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-heading text-ink">{zone.name}</h3>
                <span className={`text-xs font-ui px-2 py-0.5 rounded ${zone.danger === 'Bajo' ? 'bg-emerald/20 text-emerald' : zone.danger === 'Alto' || zone.danger === 'Muy Alto' || zone.danger === 'Extremo' ? 'bg-blood/20 text-blood' : 'bg-gold/20 text-gold-dim'}`}>
                  Peligro: {zone.danger}
                </span>
              </div>
              <p className="font-body text-ink text-sm">{zone.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Package className="h-6 w-6" /> Recursos Clave
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="grid md:grid-cols-2 gap-4">
            {resources.map((r) => (
              <div key={r.name} className="flex items-start gap-3 p-3 bg-gold/5 rounded">
                <span className="text-2xl">{r.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading text-ink">{r.name}</h4>
                    <span className={`text-xs font-ui px-2 py-0.5 rounded ${r.importance === 'Critico' ? 'bg-blood/20 text-blood' : r.importance === 'Alto' ? 'bg-gold/20 text-gold-dim' : 'bg-emerald/20 text-emerald'}`}>
                      {r.importance}
                    </span>
                  </div>
                  <p className="font-body text-ink text-sm">{r.note}</p>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" /> Consejos de Supervivencia
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
              <h3 className="font-heading text-ink">El Medico</h3>
              <p className="font-body text-ink text-sm">Conocimiento medico invaluable. El grupo te necesita vivo.</p>
            </div>
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">El Cazador</h3>
              <p className="font-body text-ink text-sm">Sabe rastrear, cazar, y moverse sin ser detectado.</p>
            </div>
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">El Mecanico</h3>
              <p className="font-body text-ink text-sm">Repara vehiculos, generadores, y armas improvisadas.</p>
            </div>
          </div>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">Sobrevivi al Apocalipsis</h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto">
            Afuera esta lleno de monstruos. Algunos caminan. Otros hablan.
            Vos decidis en cual te convertis.
          </p>
          <Link href="/onboarding" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Comenzar Supervivencia
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/mundo-tierra-media" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Tierra Media
          </Link>
          <Link href="/guias/mundo-isekai" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Mundo Isekai <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
