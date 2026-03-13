import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Cpu, Users, Map, Sparkles, Zap, Shield } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Guia de Cyberpunk: Neon y Cromo | RolHub',
  description: 'Todo lo que necesitas saber para jugar en Night City. Implantes, megacorporaciones, netrunners y consejos para sobrevivir en el futuro oscuro.',
  keywords: [
    'Cyberpunk rol',
    'Night City RPG',
    'netrunner hacker rol',
    'implantes ciberneticos juego',
    'futuro distopico RPG'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/mundo-cyberpunk',
  },
  openGraph: {
    title: 'Guia de Cyberpunk | RolHub',
    description: 'Alta tecnologia, baja vida. Bienvenido a Night City.',
    type: 'article',
  },
}

const factions = [
  {
    name: 'Arasaka Corp',
    description: 'Megacorporacion japonesa con poder absoluto. Ejercitos privados, influencia global.',
    alignment: 'Malvado',
    playStyle: 'Antagonistas principales. Recursos infinitos, enemigos letales.',
  },
  {
    name: 'Los Fijadores',
    description: 'Intermediarios entre criminales y clientes. Consiguen trabajos y contactos.',
    alignment: 'Neutral',
    playStyle: 'Fuentes de trabajo, aliados utiles, informacion valiosa.',
  },
  {
    name: 'Netwatch',
    description: 'Policia del ciberespacio. Cazan hackers y controlan la Red.',
    alignment: 'Neutral',
    playStyle: 'Pueden ser aliados o enemigos segun tus acciones.',
  },
  {
    name: 'Nomads',
    description: 'Familias que viven en vehiculos fuera de la ciudad. Libres y leales.',
    alignment: 'Bueno',
    playStyle: 'Comunidad, lealtad, escape del sistema corporativo.',
  },
  {
    name: 'Trauma Team',
    description: 'Paramedicos armados que solo responden a clientes premium.',
    alignment: 'Neutral',
    playStyle: 'Recursos de emergencia si podes pagarlos.',
  },
]

const locations = [
  { name: 'Downtown Night City', danger: 'Medio', desc: 'Centro con rascacielos y neones. Corporaciones y lujo.' },
  { name: 'Los Bajos Fondos', danger: 'Alto', desc: 'Barrios pobres donde la ley no existe. Tu territorio.' },
  { name: 'La Red (Cyberspace)', danger: 'Muy Alto', desc: 'Internet neural. Peligrosa pero lucrativa para hackers.' },
  { name: 'Club Afterlife', danger: 'Bajo', desc: 'Bar de mercenarios. Donde se hacen los tratos.' },
  { name: 'Torre Arasaka', danger: 'Extremo', desc: 'Fortaleza corporativa. Seguridad maxima.' },
  { name: 'Ripperdoc', danger: 'Bajo', desc: 'Clinica clandestina de implantes. Tu doctor favorito.' },
]

const implants = [
  { name: 'Optica Kiroshi', desc: 'Ojos ciberneticos con zoom, vision nocturna, escaneo.' },
  { name: 'Reflejos de Sandevistan', desc: 'Procesador que te permite moverte en camara lenta.' },
  { name: 'Mantis Blades', desc: 'Cuchillas que salen de tus antebrazos.' },
  { name: 'Cyberdeck', desc: 'Computadora neural para hackear sistemas y mentes.' },
  { name: 'Subdermal Armor', desc: 'Blindaje bajo la piel. Te vuelve mas dificil de matar.' },
]

const tips = [
  {
    title: 'El Cuerpo es Modificable',
    desc: 'Podes mejorarte con implantes, pero cada mejora te aleja un poco mas de tu humanidad.',
  },
  {
    title: 'El Dinero es Poder',
    desc: 'Los eddies (creditos) compran todo: implantes, informacion, seguridad, hasta mas vida.',
  },
  {
    title: 'Nadie es Confiable',
    desc: 'Las corporaciones mienten. Los fixers tienen agendas. Tus aliados pueden venderte.',
  },
  {
    title: 'La Informacion Vale Mas',
    desc: 'Un datashard con los secretos correctos vale mas que cualquier arma.',
  },
  {
    title: 'Estilo Sobre Sustancia',
    desc: 'En Night City, como te ves importa. La imagen es parte de tu poder.',
  },
]

const cyberpsychosis = {
  title: 'Cyberpsicosis',
  desc: 'Demasiados implantes erosionan tu humanidad. Cuando la perdés completamente, te volves una maquina de matar sin control. Equilibra el poder con tu cordura.',
}

export default function CyberpunkPage() {
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
          <div className="p-4 rounded-lg bg-blood"><Cpu className="h-8 w-8 text-white" /></div>
          <div>
            <h1 className="font-title text-3xl md:text-4xl text-gold-bright">Neon y Cromo</h1>
            <p className="font-ui text-parchment text-lg">Alta Tecnologia, Baja Vida</p>
          </div>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          2077. Las megacorporaciones controlan todo. Tu cuerpo es tu primera mejora.
          Vivis en Night City, una metropolis donde los ricos estan en torres de cristal
          y vos estas en las calles de neon. Hackers, mercenarios y gente desesperada
          intentan sobrevivir. El dinero lo compra todo, incluso mas vida.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border border-gold-dim">
        <h2 className="font-heading text-lg text-ink mb-3">El Mundo en una Frase</h2>
        <p className="font-body text-ink text-lg italic">
          "En Night City podes ser quien quieras, mientras puedas pagarlo.
          Tu cuerpo es tu canvas. Tu chrome es tu poder. Tu reputacion es todo."
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Cpu className="h-6 w-6" /> Implantes Ciberneticos
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">
            Mejorar tu cuerpo con tecnologia es la norma. Ojos que ven en la oscuridad,
            brazos mas fuertes que el acero, cerebros conectados a la Red.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {implants.map((i) => (
              <div key={i.name} className="p-3 bg-gold/5 rounded">
                <h4 className="font-heading text-ink text-sm">{i.name}</h4>
                <p className="font-body text-ink text-sm">{i.desc}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel className="p-6 border-2 border-blood">
          <div className="flex items-start gap-4">
            <Shield className="h-8 w-8 text-blood flex-shrink-0" />
            <div>
              <h3 className="font-heading text-ink text-xl mb-2">{cyberpsychosis.title}</h3>
              <p className="font-body text-ink">{cyberpsychosis.desc}</p>
            </div>
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
          <Map className="h-6 w-6" /> Zonas de Night City
        </h2>
        <div className="space-y-3">
          {locations.map((loc) => (
            <ParchmentPanel key={loc.name} className="p-4 border border-gold-dim/50">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-heading text-ink">{loc.name}</h3>
                <span className={`text-xs font-ui px-2 py-0.5 rounded ${loc.danger === 'Bajo' ? 'bg-emerald/20 text-emerald' : loc.danger === 'Extremo' || loc.danger === 'Muy Alto' ? 'bg-blood/20 text-blood' : 'bg-gold/20 text-gold-dim'}`}>
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
              <Zap className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">Solo (Mercenario)</h3>
              <p className="font-body text-ink text-sm">Guerrero cibernetico. Reflejos mejorados y armas letales.</p>
            </div>
            <div className="text-center">
              <Cpu className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">Netrunner</h3>
              <p className="font-body text-ink text-sm">Hacker que ataca desde el ciberespacio. Tu mente es tu arma.</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-gold-dim mx-auto mb-2" />
              <h3 className="font-heading text-ink">Fixer</h3>
              <p className="font-body text-ink text-sm">Conoces gente. Conseguis cosas. Tu red de contactos es poder.</p>
            </div>
          </div>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">Conviertete en Leyenda</h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto">
            En Night City, nadie recuerda a los que juegan seguro.
            Solo los que se arriesgan todo se convierten en leyendas.
          </p>
          <Link href="/onboarding" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Comenzar Aventura
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/mundo-star-wars" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Star Wars
          </Link>
          <Link href="/guias/mundo-lovecraft" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Horrores Cosmicos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
