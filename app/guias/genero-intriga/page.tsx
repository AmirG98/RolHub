import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Crown, Users, Eye, MessageCircle, Map, Swords, Sparkles } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Intriga Politica en Rol: Facciones, Secretos y Traiciones | RolHub',
  description: 'Guia para crear intriga politica en juegos de rol. Facciones, secretos, manipulacion, y como manejar tramas complejas.',
  keywords: [
    'intriga politica RPG',
    'facciones juegos de rol',
    'traiciones D&D',
    'politica en rol',
    'secretos y conspiraciones'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/genero-intriga',
  },
  openGraph: {
    title: 'Intriga Politica en Rol | RolHub',
    description: 'Facciones, secretos y poder en tus partidas.',
    type: 'article',
  },
}

const intrigueElements = [
  {
    element: 'Facciones',
    icon: Users,
    desc: 'Grupos con agendas propias que compiten por poder, recursos, o ideales.',
    tip: 'Cada faccion debe tener algo que las otras quieren.',
  },
  {
    element: 'Secretos',
    icon: Eye,
    desc: 'Informacion oculta que puede cambiar el equilibrio de poder.',
    tip: 'Todo el mundo tiene algo que ocultar.',
  },
  {
    element: 'Alianzas',
    icon: MessageCircle,
    desc: 'Acuerdos temporales o permanentes entre partes.',
    tip: 'Las alianzas deben ser fragiles para ser interesantes.',
  },
  {
    element: 'Traiciones',
    icon: Swords,
    desc: 'Cuando alguien rompe su palabra por beneficio propio.',
    tip: 'Las traiciones deben sentirse justificadas desde el punto de vista del traidor.',
  },
]

const factionDesign = [
  { aspect: 'Objetivo', desc: 'Que quieren? Poder, riqueza, cambio social, preservar status quo.' },
  { aspect: 'Metodos', desc: 'Como lo buscan? Diplomacia, violencia, manipulacion, comercio.' },
  { aspect: 'Recursos', desc: 'Que tienen? Dinero, ejercitos, informacion, influencia.' },
  { aspect: 'Debilidad', desc: 'Que los puede destruir? Lider vulnerable, secreto comprometedor, dependencia.' },
  { aspect: 'Relaciones', desc: 'Como ven a las otras facciones? Aliados, enemigos, indiferentes.' },
]

const playerRoles = [
  {
    role: 'Agentes',
    desc: 'Los jugadores trabajan para una faccion y ejecutan sus planes.',
    dynamics: 'Clara lealtad, misiones directas, tension si la faccion hace algo cuestionable.',
  },
  {
    role: 'Independientes',
    desc: 'Los jugadores navegan entre facciones, vendiendo sus servicios.',
    dynamics: 'Mas libertad, mas opciones, riesgo de hacer enemigos.',
  },
  {
    role: 'Lideres',
    desc: 'Los jugadores SON la faccion o lideran una.',
    dynamics: 'Maximo control, maxima responsabilidad, decisiones con peso.',
  },
  {
    role: 'Peones',
    desc: 'Los jugadores son manipulados por fuerzas mayores.',
    dynamics: 'Misterio sobre quien tira los hilos, satisfaccion al descubrirlo.',
  },
]

const plotTechniques = [
  {
    technique: 'La Red de Mentiras',
    desc: 'Nadie dice toda la verdad. Cada NPC tiene su version de los hechos.',
    example: 'El conde dice que el duque lo robo. El duque dice que el conde quema aldeas. Ambos mienten parcialmente.',
  },
  {
    technique: 'El Tercer Jugador',
    desc: 'Cuando dos facciones pelean, siempre hay una tercera que se beneficia.',
    example: 'El gremio de mercaderes financia ambos lados de la guerra civil.',
  },
  {
    technique: 'El Pasado que Vuelve',
    desc: 'Decisiones anteriores de los jugadores afectan la politica actual.',
    example: 'El NPC que salvaron ahora es consejero del rey. O el que mataron tenia hermanos.',
  },
  {
    technique: 'El Reloj',
    desc: 'Las facciones actuan aunque los jugadores no hagan nada.',
    example: 'Si no intervienen, el golpe de estado pasa igual en 3 dias.',
  },
]

const playerTips = [
  'Toma notas sobre quien dijo que y cuando',
  'Pregunta siempre: "Que gana esta persona con esto?"',
  'Construi relaciones antes de necesitarlas',
  'La informacion es moneda. No la regales gratis.',
  'Ten un plan de escape siempre',
  'Promete menos de lo que podes dar',
]

const dmTips = [
  'Ten una linea de tiempo de lo que hacen las facciones',
  'Cada NPC importante tiene su propia agenda',
  'Deja que los jugadores fallen. Las consecuencias son interesantes.',
  'No todo tiene que conectar. Algunas cosas son coincidencia.',
  'Mantene un registro de promesas hechas y deudas pendientes',
  'La intriga necesita tiempo. No apures las revelaciones.',
]

export default function GeneroIntrigaPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-stone px-2 py-1 rounded">Genero</span>
          <span className="text-xs font-ui font-semibold text-parchment">15 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-stone"><Crown className="h-8 w-8 text-gold" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Genero: Intriga
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          La intriga politica es el ajedrez del rol. Facciones compitiendo,
          secretos que pueden destruir reinos, alianzas fragiles, y traiciones
          que cambian todo. Es complejo, pero increiblemente satisfactorio.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Regla de Oro de la Intriga</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>Todos tienen algo que quieren, algo que temen, y algo que ocultan.</strong>
          <br /><br />
          Cuando entiendes eso de cada NPC importante, la intriga se escribe sola.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Elementos de la Intriga
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {intrigueElements.map((elem) => (
            <ParchmentPanel key={elem.element} className="p-5 border border-gold-dim">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-stone flex-shrink-0">
                  <elem.icon className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-heading text-ink mb-1">{elem.element}</h3>
                  <p className="font-body text-ink text-sm mb-2">{elem.desc}</p>
                  <p className="font-ui text-xs text-gold-dim">Tip: {elem.tip}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Map className="h-6 w-6" /> Disenar Facciones
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">
            Cada faccion necesita estos elementos para ser interesante:
          </p>
          <div className="space-y-3">
            {factionDesign.map((f) => (
              <div key={f.aspect} className="p-3 bg-gold/5 rounded">
                <h4 className="font-heading text-ink text-sm mb-1">{f.aspect}</h4>
                <p className="font-body text-ink text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> Roles de los Jugadores
        </h2>
        <div className="space-y-4">
          {playerRoles.map((role) => (
            <ParchmentPanel key={role.role} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-2">{role.role}</h3>
              <p className="font-body text-ink text-sm mb-2">{role.desc}</p>
              <p className="font-ui text-xs text-gold-dim">Dinamica: {role.dynamics}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Tecnicas de Trama
        </h2>
        <div className="space-y-4">
          {plotTechniques.map((tech) => (
            <ParchmentPanel key={tech.technique} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{tech.technique}</h3>
              <p className="font-body text-ink text-sm mb-2">{tech.desc}</p>
              <div className="p-2 bg-gold/10 rounded">
                <p className="font-body text-ink text-sm italic">Ejemplo: {tech.example}</p>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-heading text-xl text-gold-bright mb-4">Tips para Jugadores</h2>
            <ParchmentPanel className="p-5 border border-gold-dim">
              <ul className="font-body text-ink text-sm space-y-2">
                {playerTips.map((tip, i) => (
                  <li key={i}>• {tip}</li>
                ))}
              </ul>
            </ParchmentPanel>
          </div>
          <div>
            <h2 className="font-heading text-xl text-gold-bright mb-4">Tips para DMs</h2>
            <ParchmentPanel className="p-5 border border-gold-dim">
              <ul className="font-body text-ink text-sm space-y-2">
                {dmTips.map((tip, i) => (
                  <li key={i}>• {tip}</li>
                ))}
              </ul>
            </ParchmentPanel>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">El Arte de la Intriga</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>La mejor intriga hace que los jugadores no sepan en quien confiar.</strong>
            <br /><br />
            Pero cuando finalmente descubren la verdad, deben poder mirar atras
            y ver todas las pistas que estaban ahi desde el principio.
            Sorprendente pero inevitable.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Aprendé a estructurar diferentes tipos de sesiones.
          </p>
          <Link href="/guias/primera-sesion" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Primera Sesion
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/genero-romance" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Romance
          </Link>
          <Link href="/guias" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Ver Todas las Guias
          </Link>
        </div>
      </nav>
    </article>
  )
}
