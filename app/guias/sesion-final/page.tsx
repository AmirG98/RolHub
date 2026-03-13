import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Flag, Sparkles, Users, Star, Clock, Heart } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Sesion Final: Como Cerrar una Campana de Rol | RolHub',
  description: 'Guia para la sesion final de una campana. Climax satisfactorio, epilogos, y como cerrar arcos de personaje.',
  keywords: [
    'sesion final rol',
    'cerrar campana D&D',
    'final de campana RPG',
    'climax narrativo',
    'epilogo rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/sesion-final',
  },
  openGraph: {
    title: 'Sesion Final de Campana | RolHub',
    description: 'Termina tu campana con el cierre que merece.',
    type: 'article',
  },
}

const finalTypes = [
  {
    type: 'Victoria Total',
    desc: 'Los heroes ganan, el mal es derrotado, el mundo se salva.',
    tone: 'Epico, satisfactorio, heroico.',
    works: 'Cuando la campana fue sobre superar adversidad.',
  },
  {
    type: 'Victoria con Costo',
    desc: 'Ganaron, pero perdieron algo en el camino. Sacrificio y triunfo.',
    tone: 'Agridulce, emotivo, memorable.',
    works: 'Cuando queres dejar impacto emocional.',
  },
  {
    type: 'Final Abierto',
    desc: 'La amenaza inmediata se resuelve, pero el mundo sigue. Posibles secuelas.',
    tone: 'Esperanzador, con potencial.',
    works: 'Cuando queres dejar la puerta abierta.',
  },
  {
    type: 'Final Tragico',
    desc: 'No todo sale bien. Los personajes fallan o el costo es demasiado alto.',
    tone: 'Oscuro, impactante, memorable.',
    works: 'Solo si el grupo esta preparado emocionalmente.',
  },
]

const climaxStructure = [
  {
    phase: 'La Reunion',
    desc: 'Todos los hilos se juntan. Los personajes enfrentan su destino.',
    tip: 'Haz un callback a eventos de toda la campana.',
  },
  {
    phase: 'El Punto de No Retorno',
    desc: 'Una decision final que no se puede deshacer.',
    tip: 'Deja que los jugadores elijan como enfrentan el final.',
  },
  {
    phase: 'La Confrontacion',
    desc: 'El enfrentamiento con el antagonista principal o la amenaza central.',
    tip: 'Este combate/desafio debe sentirse epico y diferente.',
  },
  {
    phase: 'La Resolucion',
    desc: 'El polvo se asienta. Que queda despues de la batalla.',
    tip: 'Dale tiempo a este momento. No lo apures.',
  },
  {
    phase: 'El Epilogo',
    desc: 'Que pasa con cada personaje despues del final.',
    tip: 'Deja que cada jugador narre el futuro de su personaje.',
  },
]

const characterClosures = [
  {
    type: 'El Arco Completado',
    desc: 'El personaje logra lo que buscaba desde el inicio.',
    example: 'El vengador finalmente enfrenta al asesino de su familia.',
  },
  {
    type: 'El Cambio',
    desc: 'El personaje ya no quiere lo que queria al principio.',
    example: 'El mercenario que solo queria oro ahora lucha por algo mas.',
  },
  {
    type: 'El Sacrificio',
    desc: 'El personaje da algo importante por el grupo o la causa.',
    example: 'El mago usa todo su poder sabiendo que no sobrevivira.',
  },
  {
    type: 'El Nuevo Comienzo',
    desc: 'El personaje encuentra un nuevo proposito despues del final.',
    example: 'El guerrero se retira a ensenar a la proxima generacion.',
  },
]

const epilogueTechniques = [
  {
    technique: 'Narrador Omnisciente',
    desc: 'El DM narra que pasa con cada personaje en tercera persona.',
    pros: 'Control total del tono, cinematografico.',
    cons: 'Menos participacion de jugadores.',
  },
  {
    technique: 'Escenas Individuales',
    desc: 'Cada jugador tiene 2-3 minutos para narrar el futuro de su personaje.',
    pros: 'Agencia del jugador, muy personal.',
    cons: 'Puede variar mucho en calidad.',
  },
  {
    technique: 'Where Are They Now',
    desc: 'Flashforward a 5-10 años despues. Donde estan ahora.',
    pros: 'Cierre claro, satisfactorio.',
    cons: 'Puede sentirse desconectado.',
  },
  {
    technique: 'La Ultima Escena Juntos',
    desc: 'Una escena final con todo el grupo antes de separarse.',
    pros: 'Emotivo, colaborativo.',
    cons: 'Puede ser dificil de facilitar.',
  },
]

const preSessionChecklist = [
  'Revise todos los arcos de personaje pendientes',
  'Prepare el encuentro final (mas detallado que lo normal)',
  'Ten claro como cada NPC importante aparece o se menciona',
  'Prepare musica especial para momentos clave',
  'Deje tiempo extra para el epilogo (30+ min)',
  'Tenga pañuelos disponibles (en serio)',
]

const callbackIdeas = [
  {
    from: 'Sesion 1',
    callback: 'El NPC que les dio la primera mision aparece para verlos triunfar.',
  },
  {
    from: 'Primera muerte',
    callback: 'Mencion o vision del companero caido en el momento critico.',
  },
  {
    from: 'Artefacto olvidado',
    callback: 'Ese item random de sesion 3 resulta ser la clave.',
  },
  {
    from: 'Chiste interno',
    callback: 'El running gag de la mesa tiene una resolucion epica.',
  },
]

const commonMistakes = [
  {
    mistake: 'Apurar el epilogo',
    fix: 'Dedica al menos 30 minutos solo al cierre emocional.',
  },
  {
    mistake: 'Final completamente predecible',
    fix: 'Incluye al menos un giro o momento inesperado.',
  },
  {
    mistake: 'Ignorar arcos de personaje',
    fix: 'Cada PJ debe tener al menos un momento de cierre.',
  },
  {
    mistake: 'El DM habla todo el tiempo',
    fix: 'El final pertenece a los jugadores. Deja que narren.',
  },
]

export default function SesionFinalPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-emerald px-2 py-1 rounded">Sesiones</span>
          <span className="text-xs font-ui font-semibold text-parchment">14 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-emerald"><Flag className="h-8 w-8 text-white" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            La Sesion Final
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          La sesion final es el cierre de meses (o años) de historia compartida.
          Es tu oportunidad de dar un final memorable que los jugadores van a
          recordar por el resto de sus vidas. No la desperdicies.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Verdad sobre Finales</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>La gente no recuerda cada sesion. Recuerda como termino.</strong>
          <br /><br />
          Una campana mediocre con un final increible se recuerda como increible.
          Una campana increible con un final malo se recuerda como incompleta.
          El final importa mas de lo que pensas.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Star className="h-6 w-6" /> Tipos de Final
        </h2>
        <div className="space-y-4">
          {finalTypes.map((type) => (
            <ParchmentPanel key={type.type} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-2">{type.type}</h3>
              <p className="font-body text-ink text-sm mb-2">{type.desc}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-1 bg-gold/10 rounded">
                  <span className="font-ui text-gold-dim">Tono:</span>
                  <span className="font-body text-ink"> {type.tone}</span>
                </div>
                <div className="p-1 bg-emerald/10 rounded">
                  <span className="font-ui text-emerald">Funciona:</span>
                  <span className="font-body text-ink"> {type.works}</span>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Estructura del Climax
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-4">
            {climaxStructure.map((phase, i) => (
              <div key={phase.phase} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-shadow font-bold text-sm">{i + 1}</span>
                </div>
                <div>
                  <h4 className="font-heading text-ink">{phase.phase}</h4>
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
          <Users className="h-6 w-6" /> Cerrar Arcos de Personaje
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {characterClosures.map((closure) => (
            <ParchmentPanel key={closure.type} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{closure.type}</h3>
              <p className="font-body text-ink text-sm mb-2">{closure.desc}</p>
              <p className="font-ui text-xs text-gold-dim italic">Ej: {closure.example}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Heart className="h-6 w-6" /> Tecnicas de Epilogo
        </h2>
        <div className="space-y-4">
          {epilogueTechniques.map((tech) => (
            <ParchmentPanel key={tech.technique} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{tech.technique}</h3>
              <p className="font-body text-ink text-sm mb-2">{tech.desc}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-1 bg-emerald/10 rounded">
                  <span className="font-ui text-emerald">Pro:</span>
                  <span className="font-body text-ink"> {tech.pros}</span>
                </div>
                <div className="p-1 bg-blood/10 rounded">
                  <span className="font-ui text-blood">Con:</span>
                  <span className="font-body text-ink"> {tech.cons}</span>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Clock className="h-6 w-6" /> Callbacks a la Campana
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">
            Los callbacks a eventos anteriores hacen que el final se sienta conectado a todo lo que vino antes:
          </p>
          <div className="space-y-3">
            {callbackIdeas.map((idea) => (
              <div key={idea.from} className="p-3 bg-gold/5 rounded">
                <span className="font-ui text-xs text-gold-dim">{idea.from}:</span>
                <p className="font-body text-ink text-sm">{idea.callback}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Checklist Pre-Sesion Final
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <ul className="font-body text-ink space-y-2">
            {preSessionChecklist.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-gold">□</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Errores Comunes
        </h2>
        <div className="space-y-3">
          {commonMistakes.map((item, i) => (
            <ParchmentPanel key={i} className="p-4 border border-gold-dim/50">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">Error</span>
                  <p className="font-body text-ink text-sm">{item.mistake}</p>
                </div>
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Solucion</span>
                  <p className="font-body text-ink text-sm">{item.fix}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>El final no es tuyo. Es de ellos.</strong>
            <br /><br />
            Vos preparas el escenario, pero los jugadores son los que actuan.
            Deja espacio para que ellos den forma al cierre.
            Las mejores finales son las que los jugadores sienten que ganaron,
            no las que vos les diste.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Para historias mas cortas, las sesiones express son ideales.
          </p>
          <Link href="/guias/sesiones-cortas" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Sesiones Cortas
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/sesion-cero" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Sesion Cero
          </Link>
          <Link href="/guias/sesiones-cortas" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Sesiones Cortas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
