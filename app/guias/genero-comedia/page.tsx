import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Smile, Sparkles, AlertTriangle, Clock, Users, Zap } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Como Jugar Comedia en Rol: Humor sin Romper la Inmersion | RolHub',
  description: 'Guia para incorporar humor en juegos de rol. Timing comico, absurdo, situaciones graciosas, y como no arruinar el juego.',
  keywords: [
    'comedia juegos de rol',
    'humor RPG',
    'partidas comicas D&D',
    'chistes en rol',
    'rol comico'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/genero-comedia',
  },
  openGraph: {
    title: 'Genero Comedia en Rol | RolHub',
    description: 'Humor efectivo en tus partidas de rol.',
    type: 'article',
  },
}

const comedyTypes = [
  {
    type: 'Comedia de Situacion',
    desc: 'El humor viene de circunstancias absurdas o enredos.',
    example: 'El grupo tiene que infiltrarse en una boda... pero uno de ellos es el novio que huyo.',
    works: 'Funciona porque los personajes reaccionan seriamente a lo absurdo.',
  },
  {
    type: 'Comedia de Personaje',
    desc: 'El humor viene de personalidades exageradas o peculiares.',
    example: 'El barbaro que es poeta romantico. El mago que tiene fobia a la magia.',
    works: 'Funciona porque el personaje es consistente en su absurdez.',
  },
  {
    type: 'Slapstick',
    desc: 'Humor fisico, caidas, accidentes.',
    example: 'Cada vez que el picaro intenta ser sigiloso, algo ruidoso pasa.',
    works: 'Funciona en moderacion. Demasiado puede volverse cansador.',
  },
  {
    type: 'Humor Referencial',
    desc: 'Referencias a cultura pop, chistes internos del grupo.',
    example: 'El NPC que claramente es una parodia de un personaje famoso.',
    works: 'Funciona si todos entienden la referencia.',
  },
]

const timingTips = [
  {
    tip: 'El Setup Serio',
    desc: 'El chiste es mas gracioso si viene despues de tension seria.',
    icon: Clock,
  },
  {
    tip: 'La Pausa',
    desc: 'Deja un momento de silencio despues del setup. El punchline necesita espacio.',
    icon: Zap,
  },
  {
    tip: 'El Callback',
    desc: 'Referenciar un chiste anterior en un momento inesperado.',
    icon: Sparkles,
  },
  {
    tip: 'El Running Gag',
    desc: 'Un chiste que se repite, cada vez con una variacion.',
    icon: Users,
  },
]

const dosAndDonts = [
  {
    do: 'Deja que el humor surja naturalmente',
    dont: 'Fuerces chistes en cada momento',
  },
  {
    do: 'Mantene consistencia en el tono',
    dont: 'Saltes de drama serio a payasada y viceversa',
  },
  {
    do: 'Usa el humor para aliviar tension',
    dont: 'Arruines momentos importantes con chistes',
  },
  {
    do: 'Incluye a todos en la broma',
    dont: 'Hagas chistes a costa de otros jugadores',
  },
  {
    do: 'Acepta cuando un chiste no funciona',
    dont: 'Insistas en explicar por que era gracioso',
  },
]

const balanceTips = [
  {
    title: 'Las Consecuencias Son Reales',
    desc: 'Aunque el tono sea comico, las acciones tienen consecuencias. El goblin gracioso puede igual matarte.',
  },
  {
    title: 'Los NPCs Se Toman en Serio',
    desc: 'Los personajes del mundo reaccionan seriamente. El humor viene de esa brecha.',
  },
  {
    title: 'Momentos de Sinceridad',
    desc: 'Los mejores shows de comedia tienen momentos emotivos. El contraste los hace mas impactantes.',
  },
  {
    title: 'El Personaje vs El Jugador',
    desc: 'El personaje puede no saber que es gracioso. Eso lo hace mas comico.',
  },
]

const characterTips = [
  { concept: 'El Rasgo Exagerado', desc: 'Un aspecto de la personalidad llevado al extremo. El tacaño que cuenta monedas en combate.' },
  { concept: 'El Pez Fuera del Agua', desc: 'Alguien completamente fuera de lugar. El noble en un dungeon sucio.' },
  { concept: 'La Contradiccion', desc: 'Dos rasgos que no deberian ir juntos. El asesino que es terapeuta.' },
  { concept: 'La Obsesion', desc: 'Algo que el personaje persigue irracionalmente. El que colecciona puertas.' },
]

const warnings = [
  'No todos disfrutan el mismo humor - lee la sala',
  'Evita chistes que humillen a otros jugadores',
  'El humor ofensivo puede arruinar la mesa',
  'Si alguien no se rie, no insistas',
  'La comedia no excusa mal comportamiento',
]

export default function GeneroComediaPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-gold px-2 py-1 rounded">Genero</span>
          <span className="text-xs font-ui font-semibold text-parchment">10 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><Smile className="h-8 w-8 text-shadow" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Genero: Comedia
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          La comedia en rol es un arte delicado. Demasiado y nada importa.
          Muy poco y la sesion es un funeral. El balance perfecto hace que
          los momentos graciosos sean memorables sin arruinar la inmersion.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Regla de Oro de la Comedia</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>Lo gracioso viene de tomarse las cosas en serio.</strong>
          <br /><br />
          Los personajes actuan como si su mundo fuera real, aunque sea absurdo.
          Es la brecha entre la seriedad y lo ridiculo lo que crea el humor.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tipos de Comedia
        </h2>
        <div className="space-y-4">
          {comedyTypes.map((type) => (
            <ParchmentPanel key={type.type} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-2">{type.type}</h3>
              <p className="font-body text-ink text-sm mb-2">{type.desc}</p>
              <div className="p-2 bg-gold/10 rounded mb-2">
                <p className="font-body text-ink text-sm italic">Ejemplo: {type.example}</p>
              </div>
              <p className="font-ui text-xs text-gold-dim">{type.works}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Timing Comico
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {timingTips.map((tip) => (
            <ParchmentPanel key={tip.tip} className="p-5 border border-gold-dim">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gold flex-shrink-0">
                  <tip.icon className="h-5 w-5 text-shadow" />
                </div>
                <div>
                  <h3 className="font-heading text-ink mb-1">{tip.tip}</h3>
                  <p className="font-body text-ink text-sm">{tip.desc}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Crear Personajes Comicos
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {characterTips.map((tip) => (
            <ParchmentPanel key={tip.concept} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{tip.concept}</h4>
              <p className="font-body text-ink text-sm">{tip.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Balance Comedia-Drama
        </h2>
        <div className="space-y-3">
          {balanceTips.map((tip) => (
            <ParchmentPanel key={tip.title} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{tip.title}</h4>
              <p className="font-body text-ink text-sm">{tip.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Que Hacer y Que Evitar
        </h2>
        <div className="space-y-3">
          {dosAndDonts.map((item, i) => (
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
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" /> Advertencias
        </h2>
        <ParchmentPanel className="p-6 border border-blood">
          <ul className="font-body text-ink space-y-2">
            {warnings.map((warning, i) => (
              <li key={i} className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-blood flex-shrink-0 mt-1" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>La comedia es colaborativa.</strong>
            <br /><br />
            Los mejores momentos comicos son los que surgen naturalmente
            cuando todos estan en la misma frecuencia. No podes forzar
            que algo sea gracioso.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Explorar Otros Generos
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            El romance es otro genero que requiere sensibilidad.
          </p>
          <Link href="/guias/genero-romance" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Genero: Romance
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/genero-misterio" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Misterio
          </Link>
          <Link href="/guias/genero-romance" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Romance <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
