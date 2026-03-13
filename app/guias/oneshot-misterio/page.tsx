import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Search, Users, FileQuestion, Eye, Clock, Lightbulb } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'One-Shot Misterio: Resolver un Caso en Una Sesion | RolHub',
  description: 'Guia para crear one-shots de misterio. Asesinato, pistas, sospechosos, y como cerrar el caso en una sesion.',
  keywords: [
    'misterio one-shot',
    'caso D&D',
    'one-shot detective RPG',
    'asesinato juegos de rol',
    'whodunit rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/oneshot-misterio',
  },
  openGraph: {
    title: 'One-Shot Misterio | RolHub',
    description: 'Resuelve el caso en una noche.',
    type: 'article',
  },
}

const mysteryStructure = [
  {
    phase: 'El Crimen',
    time: '10-15 min',
    desc: 'Algo terrible paso. Los PJs son llamados a investigar.',
    tip: 'Describe la escena del crimen con detalle. Las primeras pistas estan ahi.',
  },
  {
    phase: 'La Investigacion',
    time: '40-50 min',
    desc: 'Interrogar sospechosos, examinar evidencia, conectar puntos.',
    tip: 'Ten 3 pistas por conclusion importante.',
  },
  {
    phase: 'El Giro',
    time: '10-15 min',
    desc: 'Nueva informacion que cambia todo. La teoria inicial estaba mal.',
    tip: 'El giro debe ser sorprendente pero justo.',
  },
  {
    phase: 'La Confrontacion',
    time: '15-20 min',
    desc: 'Enfrentar al culpable con la evidencia.',
    tip: 'Deja que los jugadores expongan su teoria.',
  },
  {
    phase: 'La Resolucion',
    time: '5-10 min',
    desc: 'Que pasa con el culpable. Justicia o escape.',
    tip: 'El final puede ser abierto o cerrado segun el tono.',
  },
]

const suspectTemplate = {
  required: [
    { field: 'Nombre', desc: 'Memorable y pronunciable' },
    { field: 'Relacion', desc: 'Como conoce a la victima' },
    { field: 'Motivo', desc: 'Por que PODRIA haberlo hecho' },
    { field: 'Coartada', desc: 'Donde dice que estaba' },
    { field: 'Secreto', desc: 'Algo que oculta (culpable o no)' },
    { field: 'Pista que da', desc: 'Que informacion puede dar si le preguntan bien' },
  ],
}

const suspects = [
  {
    type: 'El Obvio',
    desc: 'Tiene motivo claro, sin coartada solida. Demasiado facil.',
    twist: 'Generalmente es inocente. Sus secretos son otra cosa.',
  },
  {
    type: 'El Inesperado',
    desc: 'Parece no tener conexion. Motivo oculto.',
    twist: 'Buen candidato para culpable real.',
  },
  {
    type: 'El Simpatico',
    desc: 'Cae bien a los jugadores. Colabora activamente.',
    twist: 'Si es el culpable, el impacto es mayor.',
  },
  {
    type: 'El Evasivo',
    desc: 'No quiere hablar. Parece sospechoso.',
    twist: 'Oculta algo, pero puede no ser el crimen.',
  },
]

const clueDesign = [
  {
    type: 'Pista Fisica',
    example: 'El cuchillo tiene un escudo de la guardia real grabado.',
    reveals: 'El asesino tiene conexion con la guardia.',
  },
  {
    type: 'Testimonio Contradictorio',
    example: 'El mayordomo dice que estaba solo, pero la sirvienta lo vio con alguien.',
    reveals: 'El mayordomo miente sobre su coartada.',
  },
  {
    type: 'Detalle Ambiental',
    example: 'La ventana esta cerrada desde adentro, pero hay barro afuera.',
    reveals: 'El asesino salio por otro lado.',
  },
  {
    type: 'Conocimiento Especializado',
    example: 'El veneno usado es raro, solo disponible en la botica del puerto.',
    reveals: 'El asesino conoce la botica o tiene contactos ahi.',
  },
]

const commonSetups = [
  {
    setup: 'Asesinato en Mansion Cerrada',
    hook: 'Un noble muere durante una cena. Nadie pudo salir ni entrar.',
    sospechosos: 'Los invitados, el servicio, la familia.',
    complicacion: 'Uno de los PJs tiene conexion con la victima.',
  },
  {
    setup: 'El Cuerpo en el Callejon',
    hook: 'Un comerciante aparece muerto. El guardia local necesita ayuda.',
    sospechosos: 'Rivales de negocios, deudores, amantes secretos.',
    complicacion: 'El comerciante tenia informacion peligrosa.',
  },
  {
    setup: 'Desaparicion Misteriosa',
    hook: 'Alguien importante desaparecio. Vivo o muerto?',
    sospechosos: 'Los que lo vieron ultimo, beneficiarios de su ausencia.',
    complicacion: 'La persona no queria ser encontrada.',
  },
  {
    setup: 'El Robo Imposible',
    hook: 'Algo valioso fue robado de un lugar "imposible de robar".',
    sospechosos: 'Los que tenian acceso, el que diseño la seguridad.',
    complicacion: 'El objeto robado no es lo que parece.',
  },
]

const pacingTips = [
  {
    problema: 'Los jugadores estan atascados',
    solucion: 'Un NPC trae nueva informacion. "Escuche algo que puede interesarles..."',
  },
  {
    problema: 'Adivinaron muy rapido',
    solucion: 'Agrega una capa. "Si, fue el, pero quien le ordeno?"',
  },
  {
    problema: 'Se dispersan investigando todo',
    solucion: 'El tiempo avanza. "Escuchan que la guardia viene a llevarse a todos los sospechosos."',
  },
  {
    problema: 'No interrogan a nadie',
    solucion: 'Un sospechoso se acerca a ellos. "Necesito contarles algo..."',
  },
]

const dmChecklist = [
  'Culpable definido y motivo claro',
  '3+ sospechosos con secretos propios',
  '5-7 pistas preparadas, 3 por conclusion',
  'Timeline de que paso realmente',
  'Respuestas a preguntas obvias preparadas',
  'Giro o revelacion sorpresa lista',
]

export default function OneshotMisterioPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-gold px-2 py-1 rounded">One-Shot</span>
          <span className="text-xs font-ui font-semibold text-parchment">14 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><Search className="h-8 w-8 text-shadow" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            One-Shot: Misterio
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Un one-shot de misterio es perfecto para una noche: hay un crimen,
          hay sospechosos, hay pistas, y al final de la sesion el caso
          se resuelve. Es autocontenido, intenso, y muy satisfactorio.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Regla del Misterio</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>Vos sabes quien lo hizo. Los jugadores lo descubren.</strong>
          <br /><br />
          Nunca improvises el culpable. Define todo antes de empezar.
          Las pistas solo funcionan si apuntan a algo real.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Clock className="h-6 w-6" /> Estructura del One-Shot
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-4">
            {mysteryStructure.map((phase, i) => (
              <div key={phase.phase} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-shadow font-bold text-sm">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-heading text-ink">{phase.phase}</h4>
                    <span className="font-mono text-xs text-gold bg-gold/10 px-2 py-1 rounded">{phase.time}</span>
                  </div>
                  <p className="font-body text-ink text-sm mb-1">{phase.desc}</p>
                  <p className="font-ui text-xs text-gold-dim">Tip: {phase.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> Disenar Sospechosos
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim mb-4">
          <h3 className="font-heading text-ink mb-3">Cada sospechoso necesita:</h3>
          <div className="grid md:grid-cols-2 gap-2">
            {suspectTemplate.required.map((item) => (
              <div key={item.field} className="p-2 bg-gold/5 rounded">
                <span className="font-heading text-ink text-sm">{item.field}:</span>
                <span className="font-body text-ink text-sm"> {item.desc}</span>
              </div>
            ))}
          </div>
        </ParchmentPanel>
        <div className="grid md:grid-cols-2 gap-4">
          {suspects.map((suspect) => (
            <ParchmentPanel key={suspect.type} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{suspect.type}</h4>
              <p className="font-body text-ink text-sm mb-2">{suspect.desc}</p>
              <p className="font-ui text-xs text-gold-dim italic">Twist: {suspect.twist}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <FileQuestion className="h-6 w-6" /> Disenar Pistas
        </h2>
        <div className="space-y-3">
          {clueDesign.map((clue) => (
            <ParchmentPanel key={clue.type} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{clue.type}</h4>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-gold/10 rounded">
                  <span className="font-ui text-xs text-gold-dim">Ejemplo</span>
                  <p className="font-body text-ink">{clue.example}</p>
                </div>
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Revela</span>
                  <p className="font-body text-ink">{clue.reveals}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Eye className="h-6 w-6" /> Escenarios Clasicos
        </h2>
        <div className="space-y-4">
          {commonSetups.map((setup) => (
            <ParchmentPanel key={setup.setup} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{setup.setup}</h3>
              <p className="font-body text-ink text-sm mb-2"><strong>Hook:</strong> {setup.hook}</p>
              <p className="font-body text-ink text-sm mb-2"><strong>Sospechosos:</strong> {setup.sospechosos}</p>
              <p className="font-ui text-xs text-gold-dim"><strong>Complicacion:</strong> {setup.complicacion}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Lightbulb className="h-6 w-6" /> Soluciones de Pacing
        </h2>
        <div className="space-y-3">
          {pacingTips.map((tip) => (
            <ParchmentPanel key={tip.problema} className="p-4 border border-gold-dim/50">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">Problema</span>
                  <p className="font-body text-ink text-sm">{tip.problema}</p>
                </div>
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Solucion</span>
                  <p className="font-body text-ink text-sm">{tip.solucion}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Checklist Pre-Sesion
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <ul className="font-body text-ink space-y-2">
            {dmChecklist.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-gold">□</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>Si la teoria de los jugadores es razonable y encaja, dejala ser correcta.</strong>
            <br /><br />
            El objetivo no es que adivinen TU solucion.
            Es que se sientan inteligentes al resolver el caso.
            Si llegaron a una conclusion logica, esa ES la respuesta.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Explorar Otros One-Shots
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            La supervivencia es otro formato intenso para one-shots.
          </p>
          <Link href="/guias/oneshot-supervivencia" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            One-Shot: Supervivencia
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/oneshot-heist" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: One-Shot Heist
          </Link>
          <Link href="/guias/oneshot-supervivencia" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Supervivencia <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
