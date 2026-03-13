import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Eye, Users, Map, Sparkles, Brain, BookOpen } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Guia de Horrores Cosmicos: Lovecraft | RolHub',
  description: 'Todo lo que necesitas saber para jugar horror cosmico. Cordura, Grandes Antiguos, investigacion y consejos para sobrevivir a lo incomprensible.',
  keywords: [
    'Lovecraft rol',
    'horror cosmico RPG',
    'Cthulhu juego',
    'investigadores Arkham',
    'cordura sanity juego'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/mundo-lovecraft',
  },
  openGraph: {
    title: 'Guia de Horrores Cosmicos | RolHub',
    description: 'Hay cosas que la humanidad no debe saber.',
    type: 'article',
  },
}

const factions = [
  {
    name: 'Universidad Miskatonic',
    description: 'Academia que guarda libros prohibidos y conocimiento peligroso.',
    alignment: 'Neutral Bueno',
    playStyle: 'Investigacion, acceso a tomos antiguos, aliados academicos.',
  },
  {
    name: 'Culto de Cthulhu',
    description: 'Adoradores del que duerme en R\'lyeh. Quieren despertar a su dios.',
    alignment: 'Malvado',
    playStyle: 'Antagonistas principales. Rituales, sacrificios, fanatismo.',
  },
  {
    name: 'Orden de la Estrella de Plata',
    description: 'Cazadores de lo sobrenatural. Protegen a la humanidad en secreto.',
    alignment: 'Bueno',
    playStyle: 'Aliados potenciales, recursos contra lo oculto.',
  },
  {
    name: 'Los Profundos',
    description: 'Hibridos pez-humano que habitan en costas oscuras.',
    alignment: 'Malvado',
    playStyle: 'Horror corporal, ciudades sumergidas, corrupcion genetica.',
  },
]

const locations = [
  { name: 'Arkham', danger: 'Medio', desc: 'Ciudad aparentemente normal con secretos oscuros bajo la superficie.' },
  { name: 'Biblioteca Miskatonic', danger: 'Alto', desc: 'Contiene el Necronomicon y otros tomos malditos. Leerlos cuesta cordura.' },
  { name: 'Innsmouth', danger: 'Muy Alto', desc: 'Pueblo costero donde los humanos se transforman en criaturas marinas.' },
  { name: 'Cementerio de Arkham', danger: 'Alto', desc: 'Donde los muertos no siempre descansan en paz.' },
  { name: 'Dimension de los Suenos', danger: 'Extremo', desc: 'Plano onirico donde habitan pesadillas vivas.' },
  { name: 'R\'lyeh', danger: 'Letal', desc: 'Ciudad sumergida donde duerme Cthulhu. Verla significa locura.' },
]

const greatOnes = [
  { name: 'Cthulhu', domain: 'Suenos, Locura', desc: 'Duerme en R\'lyeh. Cuando despierte, el mundo terminara.' },
  { name: 'Nyarlathotep', domain: 'Caos, Engano', desc: 'El Caos Reptante. Tiene mil formas y disfruta atormentando mortales.' },
  { name: 'Yog-Sothoth', domain: 'Tiempo, Espacio', desc: 'La Llave y la Puerta. Existe en todas partes y tiempos a la vez.' },
  { name: 'Azathoth', domain: 'Destruccion', desc: 'El Caos Nuclear. Dios ciego e idiota en el centro del universo.' },
]

const sanityRules = [
  { trigger: 'Ver algo perturbador', loss: '1-4 puntos', example: 'Cadaver mutilado, simbolo arcano.' },
  { trigger: 'Encuentro sobrenatural', loss: '1-6 puntos', example: 'Fantasma, criatura menor.' },
  { trigger: 'Testimonio de ritual', loss: '1-8 puntos', example: 'Sacrificio humano, invocacion.' },
  { trigger: 'Ver criatura mayor', loss: '1-10 puntos', example: 'Profundo, Shoggoth.' },
  { trigger: 'Leer libro prohibido', loss: '2-6 puntos', example: 'Necronomicon (pero ganas conocimiento).' },
  { trigger: 'Gran Antiguo', loss: '3-30 puntos', example: 'Cthulhu, Nyarlathotep. Posible locura permanente.' },
]

const tips = [
  {
    title: 'No Es Juego de Combate',
    desc: 'Huir es victoria. Pelear contra lo incomprensible es suicidio. La investigacion es tu arma.',
  },
  {
    title: 'La Cordura es Recurso',
    desc: 'Cada verdad que descubris te acerca a la locura. Gestiona tu cordura como gestionarias HP.',
  },
  {
    title: 'El Horror es Gradual',
    desc: 'Lo mas terrorico no se muestra de inmediato. La tension crece lentamente hasta el climax.',
  },
  {
    title: 'El Conocimiento Tiene Precio',
    desc: 'Podes aprender hechizos y secretos, pero cada uno te cuesta parte de tu humanidad.',
  },
  {
    title: 'Los Finales Son Agridulces',
    desc: 'No esperes final feliz. Contener la amenaza ya es victoria. Sobrevivir es un bonus.',
  },
]

export default function LovecraftPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-stone px-2 py-1 rounded">Mundo</span>
          <span className="text-xs font-ui font-semibold text-parchment">15 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-stone"><Eye className="h-8 w-8 text-parchment" /></div>
          <div>
            <h1 className="font-title text-3xl md:text-4xl text-gold-bright">Horrores Cosmicos</h1>
            <p className="font-ui text-parchment text-lg">Horror Lovecraftiano</p>
          </div>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Anos 1920. Bajo la superficie de la realidad cotidiana, horrores ancestrales duermen.
          Dioses de otros planos esperan su momento. Sos un investigador que descubrio demasiado.
          Cada verdad erosiona tu cordura. La humanidad es insignificante. El conocimiento te consume.
          La locura es una bendicion comparada con conocer la verdad del cosmos.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border border-gold-dim">
        <h2 className="font-heading text-lg text-ink mb-3">El Mundo en una Frase</h2>
        <p className="font-body text-ink text-lg italic">
          "La emocion mas antigua de la humanidad es el miedo,
          y el miedo mas antiguo es el miedo a lo desconocido."
          <span className="block text-sm mt-2 not-italic">- H.P. Lovecraft</span>
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Brain className="h-6 w-6" /> Sistema de Cordura
        </h2>
        <ParchmentPanel className="p-6 border-2 border-blood">
          <p className="font-body text-ink mb-4">
            Tu cordura (Sanity) es un recurso que se erosiona al enfrentar lo sobrenatural.
            Cuando llega a cero, tu personaje queda permanentemente loco.
          </p>
          <div className="space-y-2">
            {sanityRules.map((rule) => (
              <div key={rule.trigger} className="grid grid-cols-3 gap-2 p-2 bg-gold/5 rounded text-sm">
                <span className="font-heading text-ink">{rule.trigger}</span>
                <span className="font-ui text-blood font-bold">-{rule.loss}</span>
                <span className="font-body text-ink italic">{rule.example}</span>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Eye className="h-6 w-6" /> Los Grandes Antiguos
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {greatOnes.map((g) => (
            <ParchmentPanel key={g.name} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-1">{g.name}</h3>
              <p className="font-ui text-xs text-blood mb-2">{g.domain}</p>
              <p className="font-body text-ink text-sm">{g.desc}</p>
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
                <span className={`text-xs font-ui px-2 py-0.5 rounded ${f.alignment.includes('Bueno') ? 'bg-emerald/20 text-emerald' : f.alignment === 'Malvado' ? 'bg-blood/20 text-blood' : 'bg-gold/20 text-gold-dim'}`}>
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
                <span className={`text-xs font-ui px-2 py-0.5 rounded ${loc.danger === 'Medio' ? 'bg-gold/20 text-gold-dim' : 'bg-blood/20 text-blood'}`}>
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
              <BookOpen className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">El Profesor</h3>
              <p className="font-body text-ink text-sm">Tu intelecto es tu arma. Traducis lenguas muertas y libros prohibidos.</p>
            </div>
            <div className="text-center">
              <Eye className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">El Detective</h3>
              <p className="font-body text-ink text-sm">Seguiste el caso equivocado. Tu instinto te mantiene vivo.</p>
            </div>
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">El Ocultista</h3>
              <p className="font-body text-ink text-sm">Practicas rituales antiguos. La magia tiene un precio terrible.</p>
            </div>
          </div>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">Atrévete a Investigar</h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto">
            Algunos misterios es mejor dejarlos sin resolver.
            Pero ya sabes demasiado. No hay vuelta atras.
          </p>
          <Link href="/onboarding" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Comenzar Investigacion
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/mundo-cyberpunk" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Cyberpunk
          </Link>
          <Link href="/guias" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Ver Todas las Guias
          </Link>
        </div>
      </nav>
    </article>
  )
}
