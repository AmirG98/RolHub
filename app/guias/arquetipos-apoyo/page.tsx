import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Shield, Heart, Music, Sparkles, Users, MessageCircle } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Arquetipos de Apoyo: Sanadores, Bardos y Lideres | RolHub',
  description: 'Variantes del rol de apoyo en juegos de rol. Desde el clerigo hasta el bardo, todas las formas de potenciar al grupo.',
  keywords: [
    'apoyo D&D',
    'arquetipos sanador',
    'variantes healer RPG',
    'bardo clerigo',
    'support rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/arquetipos-apoyo',
  },
  openGraph: {
    title: 'Arquetipos de Apoyo | RolHub',
    description: 'Todas las formas de potenciar al grupo.',
    type: 'article',
  },
}

const archetypes = [
  {
    name: 'El Sanador',
    focus: 'Curar heridas, remover condiciones, preservar vidas.',
    source: 'Fe, naturaleza, magia arcana.',
    motivation: 'Vocacion, compasion, deber.',
    weakness: 'No puede salvar a todos. Como lidia con el fracaso?',
    examples: ['Samwise', 'Mercy', 'Panacea'],
  },
  {
    name: 'El Bardo',
    focus: 'Inspirar, bufear, control social.',
    source: 'Arte, musica, palabras.',
    motivation: 'Historias, fama, conexion.',
    weakness: 'Las palabras tienen poder. Que pasa cuando fallan?',
    examples: ['Dandelion', 'Jack Sparrow', 'The Doctor'],
  },
  {
    name: 'El Lider',
    focus: 'Coordinar, planificar, tomar decisiones.',
    source: 'Carisma, experiencia, autoridad.',
    motivation: 'Responsabilidad, vision, proteccion del grupo.',
    weakness: 'Las decisiones tienen consecuencias. Puede cargar con todas?',
    examples: ['Aragorn', 'Captain Picard', 'Commander Shepard'],
  },
  {
    name: 'El Buffer',
    focus: 'Potenciar a los aliados, mejorar sus capacidades.',
    source: 'Magia, alquimia, tecnologia.',
    motivation: 'Ver brillar a otros, optimizacion.',
    weakness: 'Depende de que otros actuen. Que hace solo?',
    examples: ['Lucio', 'Sona', 'Alfred (Batman)'],
  },
  {
    name: 'El Controlador',
    focus: 'Debufear enemigos, control de masas.',
    source: 'Magia, psionicos, tecnologia.',
    motivation: 'Tactico, preventivo, protector.',
    weakness: 'El control no es absoluto. Que pasa cuando falla?',
    examples: ['Professor X', 'Scarlet Witch', 'Aang'],
  },
  {
    name: 'El Mentor',
    focus: 'Guiar, ensenar, preparar a otros.',
    source: 'Experiencia, sabiduria, conexiones.',
    motivation: 'Legado, redencion, proteccion.',
    weakness: 'Los estudiantes superan al maestro. Esta listo?',
    examples: ['Gandalf', 'Obi-Wan', 'Iroh'],
  },
]

const supportMindset = [
  {
    mindset: 'El Multiplicador',
    desc: 'Mi trabajo es hacer que todos sean mejores.',
    playstyle: 'Buffs, heals, enablers.',
  },
  {
    mindset: 'El Estabilizador',
    desc: 'Mi trabajo es que nada salga mal.',
    playstyle: 'Control, prevencion, contingencias.',
  },
  {
    mindset: 'El Catalizador',
    desc: 'Mi trabajo es crear oportunidades.',
    playstyle: 'Setups, distracciones, informacion.',
  },
  {
    mindset: 'El Ancla',
    desc: 'Mi trabajo es mantener al grupo unido.',
    playstyle: 'Mediacion, moral, liderazgo.',
  },
]

const commonMisconceptions = [
  {
    myth: 'El apoyo es aburrido',
    reality: 'El apoyo ve todo el campo de batalla y toma decisiones criticas.',
  },
  {
    myth: 'El apoyo no hace dano',
    reality: 'Muchos apoyos tienen opciones ofensivas poderosas.',
  },
  {
    myth: 'El apoyo solo cura',
    reality: 'Buffs, control, y utilidad son igual de importantes.',
  },
  {
    myth: 'El apoyo es secundario',
    reality: 'Sin apoyo, los damage dealers mueren rapido.',
  },
]

const teamDynamics = [
  {
    dynamic: 'Con el Tanque',
    interaction: 'Mantenerlo vivo, darle sustain.',
    tip: 'Comunica cuando estas fuera de recursos.',
  },
  {
    dynamic: 'Con el DPS',
    interaction: 'Potenciar su dano, protegerlo.',
    tip: 'Prioriza segun la situacion.',
  },
  {
    dynamic: 'Con el Controlador',
    interaction: 'Complementar el control, seguir sus setups.',
    tip: 'Coordinen quien controla que.',
  },
  {
    dynamic: 'Fuera de Combate',
    interaction: 'Ser el pegamento social del grupo.',
    tip: 'El apoyo suele ser el mediador.',
  },
]

const backstoryHooks = [
  {
    hook: 'El Juramento',
    prompt: 'A quien o que juraste proteger?',
  },
  {
    hook: 'El que No Pude Salvar',
    prompt: 'Quien murio bajo tu cuidado? Como te afecto?',
  },
  {
    hook: 'La Causa',
    prompt: 'Que crees que vale mas que tu propia vida?',
  },
  {
    hook: 'El Don',
    prompt: 'Como descubriste tu habilidad para ayudar?',
  },
]

const developmentArcs = [
  'De seguidor a lider',
  'De auto-sacrificio a auto-cuidado',
  'De servir a otros a descubrir que quiere',
  'De incapaz de dejar ir a aceptar la perdida',
  'De oculto a reconocido',
  'De indispensable a ensenar a otros',
]

const commonTraps = [
  {
    trap: 'El martir',
    issue: 'Se sacrifica por todos, no tiene necesidades propias.',
    fix: 'El personaje tiene que querer cosas para si mismo.',
  },
  {
    trap: 'El invisible',
    issue: 'Nunca toma protagonismo, siempre en segundo plano.',
    fix: 'El apoyo merece sus propios momentos.',
  },
  {
    trap: 'El dispensador de cura',
    issue: 'Solo existe para curar, sin personalidad.',
    fix: 'Sanador no es personalidad. Es una habilidad.',
  },
]

export default function ArquetiposApoyoPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-gold px-2 py-1 rounded">Arquetipos</span>
          <span className="text-xs font-ui font-semibold text-parchment">12 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><Shield className="h-8 w-8 text-shadow" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Arquetipos: Apoyo
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          El apoyo no es "el que cura". Es el que hace que el grupo funcione.
          Sanadores, bardos, lideres, buffers: todos comparten el poder de
          hacer que otros brillen. Y eso es su propia forma de heroismo.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Pregunta Central</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>Por que elegis ayudar a otros en vez de brillar vos?</strong>
          <br /><br />
          La respuesta define al apoyo. Vocacion, deuda, incapacidad de actuar solo,
          amor por ver a otros triunfar... cada motivacion crea un personaje diferente.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> Arquetipos Clasicos
        </h2>
        <div className="space-y-4">
          {archetypes.map((arch) => (
            <ParchmentPanel key={arch.name} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-2">{arch.name}</h3>
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="font-body text-ink text-sm"><strong>Foco:</strong> {arch.focus}</p>
                  <p className="font-body text-ink text-sm"><strong>Fuente:</strong> {arch.source}</p>
                </div>
                <div>
                  <p className="font-body text-ink text-sm"><strong>Motivacion:</strong> {arch.motivation}</p>
                </div>
              </div>
              <div className="p-2 bg-gold/10 rounded mb-2">
                <span className="font-ui text-xs text-gold-dim">Debilidad narrativa:</span>
                <p className="font-body text-ink text-sm">{arch.weakness}</p>
              </div>
              <p className="font-ui text-xs text-gold-dim">Ejemplos: {arch.examples.join(', ')}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Mentalidades de Apoyo
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {supportMindset.map((mind) => (
            <ParchmentPanel key={mind.mindset} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{mind.mindset}</h4>
              <p className="font-body text-ink text-sm italic mb-1">"{mind.desc}"</p>
              <p className="font-ui text-xs text-gold-dim">Playstyle: {mind.playstyle}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <MessageCircle className="h-6 w-6" /> Mitos vs Realidad
        </h2>
        <div className="space-y-3">
          {commonMisconceptions.map((item) => (
            <ParchmentPanel key={item.myth} className="p-4 border border-gold-dim/50">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">Mito</span>
                  <p className="font-body text-ink text-sm">{item.myth}</p>
                </div>
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Realidad</span>
                  <p className="font-body text-ink text-sm">{item.reality}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> Dinamicas de Equipo
        </h2>
        <div className="space-y-3">
          {teamDynamics.map((dyn) => (
            <ParchmentPanel key={dyn.dynamic} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{dyn.dynamic}</h4>
              <p className="font-body text-ink text-sm mb-1">{dyn.interaction}</p>
              <p className="font-ui text-xs text-gold-dim">Tip: {dyn.tip}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Heart className="h-6 w-6" /> Hooks de Backstory
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {backstoryHooks.map((hook) => (
              <div key={hook.hook} className="p-3 bg-gold/5 rounded">
                <h4 className="font-heading text-ink text-sm">{hook.hook}</h4>
                <p className="font-body text-ink text-sm italic">"{hook.prompt}"</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Trampas Comunes
        </h2>
        <div className="space-y-3">
          {commonTraps.map((trap, i) => (
            <ParchmentPanel key={i} className="p-4 border border-gold-dim/50">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">{trap.trap}</span>
                  <p className="font-body text-ink text-sm">{trap.issue}</p>
                </div>
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Solucion</span>
                  <p className="font-body text-ink text-sm">{trap.fix}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Music className="h-6 w-6" /> Arcos de Desarrollo
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="grid md:grid-cols-2 gap-2">
            {developmentArcs.map((arc, i) => (
              <div key={i} className="p-2 bg-gold/5 rounded">
                <span className="font-body text-ink text-sm">{arc}</span>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>El apoyo mas interesante tiene sus propios suenos.</strong>
            <br /><br />
            Ayudar a otros es lo que hace, no lo que es.
            Dale deseos, miedos, y ambiciones propias.
            El heroe de soporte sigue siendo un heroe.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Compara el rol de mesa con los videojuegos RPG.
          </p>
          <Link href="/guias/rol-vs-videojuegos" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Rol vs Videojuegos
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/arquetipos-picaro" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Picaro
          </Link>
          <Link href="/guias/rol-vs-videojuegos" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Rol vs Videojuegos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
