import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Anchor, Users, Map, Sparkles, Sword, Skull } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Guia de la Saga Vikinga: Mitologia Nordica | RolHub',
  description: 'Todo lo que necesitas saber para jugar como vikingo. Dioses, clanes, honor y gloria en la era de los nordicos.',
  keywords: [
    'vikingos rol',
    'mitologia nordica RPG',
    'jugar como vikingo',
    'Odin Thor Loki rol',
    'era vikinga juego'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/mundo-vikingos',
  },
  openGraph: {
    title: 'Guia de la Saga Vikinga | RolHub',
    description: 'Gloria, honor y un lugar en el Valhalla.',
    type: 'article',
  },
}

const factions = [
  {
    name: 'Los Clanes del Norte',
    description: 'Jarls y sus guerreros. Cada clan tiene sus propias tradiciones y rivalidades.',
    alignment: 'Variable',
    playStyle: 'Politica de clanes, honor, venganzas.',
  },
  {
    name: 'Los Hijos de Odin',
    description: 'Guerreros devotos al Padre de Todo. Berserkers y guerreros sagrados.',
    alignment: 'Neutral',
    playStyle: 'Combate, profecia, sabiduria de batalla.',
  },
  {
    name: 'Los Seguidores de Freya',
    description: 'Videntes, curanderos y quienes honran a la diosa del amor y la guerra.',
    alignment: 'Bueno',
    playStyle: 'Magia seidr, curacion, profecia.',
  },
  {
    name: 'Los Sin Clan',
    description: 'Exiliados, forajidos y quienes perdieron su honor.',
    alignment: 'Variable',
    playStyle: 'Supervivencia, redencion, venganza.',
  },
]

const gods = [
  { name: 'Odin', domain: 'Sabiduria, Guerra, Muerte', desc: 'El Padre de Todo. Sacrifico un ojo por conocimiento.' },
  { name: 'Thor', domain: 'Trueno, Proteccion, Fuerza', desc: 'El protector de Midgard. Su martillo es legendario.' },
  { name: 'Freya', domain: 'Amor, Magia, Fertilidad', desc: 'Diosa de la belleza y la magia seidr.' },
  { name: 'Loki', domain: 'Engano, Caos, Cambio', desc: 'El embaucador. Nunca es de fiar.' },
  { name: 'Tyr', domain: 'Justicia, Honor, Ley', desc: 'El dios manco que sacrifico su mano por los demas.' },
  { name: 'Hel', domain: 'Muerte, Inframundo', desc: 'Gobierna a los muertos que no van al Valhalla.' },
]

const locations = [
  { name: 'El Gran Salon', danger: 'Seguro', desc: 'El corazon del clan. Festines, alianzas, decisiones.' },
  { name: 'El Bosque Sagrado', danger: 'Medio', desc: 'Donde habitan los espiritus. Los videntes vienen aca.' },
  { name: 'La Costa', danger: 'Bajo', desc: 'Donde esperan los drakkar. El inicio de cada raid.' },
  { name: 'Tierras del Sur', danger: 'Alto', desc: 'Monasteries ricos pero defendidos. Gloria y botin.' },
  { name: 'El Mar Helado', danger: 'Muy Alto', desc: 'Tormentas, monstruos marinos, y tierras desconocidas.' },
  { name: 'Hel', danger: 'Extremo', desc: 'El reino de los muertos. Solo en visiones o muerte.' },
]

const values = [
  {
    title: 'Honor (Drengskapr)',
    desc: 'Tu palabra es sagrada. Romperla te convierte en niding — alguien sin honor.',
  },
  {
    title: 'Gloria en Batalla',
    desc: 'Morir con espada en mano te lleva al Valhalla. Morir enfermo, al frio reino de Hel.',
  },
  {
    title: 'Familia y Clan',
    desc: 'La sangre es todo. Vengar a tu familia es obligacion, no eleccion.',
  },
  {
    title: 'El Destino (Wyrd)',
    desc: 'Las Nornas tejen el destino de todos. Podes enfrentarlo con valor o cobardamente.',
  },
  {
    title: 'Hospitalidad',
    desc: 'Un invitado es sagrado. Pero si abusa de tu hospitalidad, todo se vale.',
  },
]

const tips = [
  {
    title: 'El Destino es Real',
    desc: 'Los personajes creen en las profecias. Si una vidente te dice algo, es probable que pase — de alguna forma.',
  },
  {
    title: 'La Violencia es Normal',
    desc: 'Los vikingos no son pacifistas. Las disputas se resuelven con duelos, no con abogados.',
  },
  {
    title: 'Los Dioses Intervienen',
    desc: 'Odin puede aparecer como un viajero misterioso. Thor protege a los suyos. Loki complica todo.',
  },
  {
    title: 'Sagas y Poesia',
    desc: 'La fama es inmortalidad. Un acto heroico bien cantado te hace vivir para siempre.',
  },
  {
    title: 'Inviernos Duros',
    desc: 'El frio mata. La comida escasea. El invierno es un enemigo tan real como cualquier otro.',
  },
]

export default function VikingosPage() {
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
          <span className="text-xs font-ui font-semibold text-parchment">12 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><Anchor className="h-8 w-8 text-shadow" /></div>
          <div>
            <h1 className="font-title text-3xl md:text-4xl text-gold-bright">Saga Vikinga</h1>
            <p className="font-ui text-parchment text-lg">Mitologia Nordica y Era Vikinga</p>
          </div>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          En las tierras del norte, donde el invierno es largo y los dioses caminan entre mortales,
          la gloria se gana con sangre y el honor es mas valioso que el oro.
          Aca, morir bien es la unica forma de vivir para siempre.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border border-gold-dim">
        <h2 className="font-heading text-lg text-ink mb-3">El Mundo en una Frase</h2>
        <p className="font-body text-ink text-lg italic">
          "Los dioses observan. Las Nornas tejen. Tu destino esta escrito,
          pero como lo enfrentas define quien sos."
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Los Dioses
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {gods.map((g) => (
            <ParchmentPanel key={g.name} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-1">{g.name}</h3>
              <p className="font-ui text-xs text-gold-dim mb-2">{g.domain}</p>
              <p className="font-body text-ink text-sm">{g.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sword className="h-6 w-6" /> Valores Vikingos
        </h2>
        <div className="space-y-3">
          {values.map((v) => (
            <ParchmentPanel key={v.title} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{v.title}</h4>
              <p className="font-body text-ink text-sm">{v.desc}</p>
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
                <span className={`text-xs font-ui px-2 py-0.5 rounded ${f.alignment === 'Bueno' ? 'bg-emerald/20 text-emerald' : 'bg-gold/20 text-gold-dim'}`}>
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
                <span className={`text-xs font-ui px-2 py-0.5 rounded ${loc.danger === 'Seguro' || loc.danger === 'Bajo' ? 'bg-emerald/20 text-emerald' : loc.danger === 'Alto' || loc.danger === 'Muy Alto' || loc.danger === 'Extremo' ? 'bg-blood/20 text-blood' : 'bg-gold/20 text-gold-dim'}`}>
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
          <Skull className="h-6 w-6" /> Consejos para Jugar
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
              <Sword className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">El Berserker</h3>
              <p className="font-body text-ink text-sm">Guerrero sagrado de Odin. Furia imparable en batalla.</p>
            </div>
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">La Volva</h3>
              <p className="font-body text-ink text-sm">Vidente y hechicera. Ve el destino y practica seidr.</p>
            </div>
            <div className="text-center">
              <Anchor className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">El Explorador</h3>
              <p className="font-body text-ink text-sm">Navegante y descubridor. Busca nuevas tierras y gloria.</p>
            </div>
          </div>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">Forja tu Saga</h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto">
            Los skaldas cantaran tus hazanas. Las Nornas ya tejieron tu destino.
            Solo queda enfrentarlo con honor.
          </p>
          <Link href="/onboarding" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Comenzar Saga
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/mundo-isekai" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Mundo Isekai
          </Link>
          <Link href="/guias" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Ver Todas las Guias
          </Link>
        </div>
      </nav>
    </article>
  )
}
