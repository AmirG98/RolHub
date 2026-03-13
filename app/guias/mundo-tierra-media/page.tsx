import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Sword, Shield, Users, Map, Sparkles, Crown } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Guia del Mundo Tierra Media: Fantasia Epica | RolHub',
  description: 'Todo lo que necesitas saber para jugar en Tierra Media. Facciones, razas, locaciones y consejos para sumergirte en la fantasia epica.',
  keywords: [
    'Tierra Media rol',
    'fantasia epica RPG',
    'jugar estilo Tolkien',
    'elfos enanos hobbits',
    'mundo fantasia rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/mundo-tierra-media',
  },
  openGraph: {
    title: 'Guia del Mundo Tierra Media | RolHub',
    description: 'Explora un mundo de magia antigua y heroismo.',
    type: 'article',
  },
}

const factions = [
  {
    name: 'Los Pueblos Libres',
    description: 'Alianza de humanos, elfos, enanos y hobbits que defienden la libertad.',
    alignment: 'Bueno',
    playStyle: 'Heroes clasicos luchando contra el mal.',
  },
  {
    name: 'Los Reinos de los Hombres',
    description: 'Gondor, Rohan y otros reinos en decadencia pero con honor.',
    alignment: 'Bueno',
    playStyle: 'Politica, intriga y batallas epicas.',
  },
  {
    name: 'Los Istari',
    description: 'Magos enviados para guiar sin dominar.',
    alignment: 'Neutral Bueno',
    playStyle: 'Consejo, misterio y magia sutil.',
  },
  {
    name: 'Las Fuerzas de la Sombra',
    description: 'Orcos, trolls y sirvientes del mal.',
    alignment: 'Malvado',
    playStyle: 'Antagonistas, no jugables.',
  },
]

const locations = [
  { name: 'La Comarca', danger: 'Seguro', desc: 'Tierra pacifica de hobbits. Ideal para empezar.' },
  { name: 'Rivendel', danger: 'Seguro', desc: 'Refugio elfico. Sabiduria y sanacion.' },
  { name: 'Moria', danger: 'Alto', desc: 'Minas de enanos abandonadas. Tesoros y horrores.' },
  { name: 'Bosque Negro', danger: 'Medio', desc: 'Bosque corrompido. Arannas y elfos silvanos.' },
  { name: 'Rohan', danger: 'Medio', desc: 'Llanuras de caballos. Guerreros y honor.' },
  { name: 'Mordor', danger: 'Extremo', desc: 'Tierra del enemigo. Solo para los valientes.' },
]

const tips = [
  {
    title: 'El Bien vs el Mal',
    desc: 'Tierra Media tiene una moralidad clara. Los heroes son heroes, los villanos son villanos. No busques zonas grises.',
  },
  {
    title: 'Magia Sutil',
    desc: 'La magia aca es rara y misteriosa, no fireballs cada turno. Un elfo que brilla en la oscuridad ya es magico.',
  },
  {
    title: 'Los Pequenos Actos',
    desc: 'Los hobbits salvaron el mundo. No subestimes las acciones pequenas con grandes consecuencias.',
  },
  {
    title: 'Melancolia y Esperanza',
    desc: 'El mundo esta decayendo, pero la esperanza persiste. El tono es agridulce, no puro optimismo.',
  },
  {
    title: 'Viajes Epicos',
    desc: 'Los viajes importan tanto como el destino. Describe el paisaje, los campamentos, los encuentros en el camino.',
  },
]

export default function TierraMediaPage() {
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
          <div className="p-4 rounded-lg bg-gold"><Sword className="h-8 w-8 text-shadow" /></div>
          <div>
            <h1 className="font-title text-3xl md:text-4xl text-gold-bright">Tierra Media</h1>
            <p className="font-ui text-parchment text-lg">Fantasia Epica estilo Tolkien</p>
          </div>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Un mundo de magia antigua, pueblos nobles y la lucha eterna contra la oscuridad.
          La Tierra Media es el escenario de fantasia por excelencia, donde pequenos actos
          de valentía pueden cambiar el destino de naciones enteras.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border border-gold-dim">
        <h2 className="font-heading text-lg text-ink mb-3">El Mundo en una Frase</h2>
        <p className="font-body text-ink text-lg italic">
          "Es una era de magia decadente, donde los grandes poderes del pasado se desvanecen
          lentamente y los heroes deben levantarse contra la sombra creciente."
        </p>
      </ParchmentPanel>

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
                <span className={`text-xs font-ui px-2 py-0.5 rounded ${loc.danger === 'Seguro' ? 'bg-emerald/20 text-emerald' : loc.danger === 'Alto' || loc.danger === 'Extremo' ? 'bg-blood/20 text-blood' : 'bg-gold/20 text-gold-dim'}`}>
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
              <Crown className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">El Dunedain</h3>
              <p className="font-body text-ink text-sm">Montaraz del norte, heredero de reyes perdidos.</p>
            </div>
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">El Elfo Errante</h3>
              <p className="font-body text-ink text-sm">Inmortal que recuerda eras olvidadas.</p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">El Hobbit Inesperado</h3>
              <p className="font-body text-ink text-sm">Pequeno pero valiente, destinado a grandes cosas.</p>
            </div>
          </div>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">Explora la Tierra Media</h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto">
            La sombra crece en el este. Los pueblos libres necesitan heroes.
            Tu saga esta por comenzar.
          </p>
          <Link href="/onboarding" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Comenzar Aventura
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Todas las Guias
          </Link>
          <Link href="/guias/mundo-zombies" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Apocalipsis Zombie <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
