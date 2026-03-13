import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Wand2, Sparkles, MessageSquare, Lightbulb, Zap } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Como Improvisar como DM: Tecnicas de Improvisacion | RolHub',
  description: 'Aprende a improvisar cuando los jugadores hacen lo inesperado. Tecnicas "Yes, and...", reaccionar en el momento y crear contenido al vuelo.',
  keywords: [
    'improvisar DM',
    'improvisacion juegos de rol',
    'yes and tecnica',
    'DM improvisar contenido',
    'reaccionar jugadores'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/improvisar',
  },
  openGraph: {
    title: 'Como Improvisar como DM | RolHub',
    description: 'Tecnicas para cuando los jugadores hacen lo inesperado.',
    type: 'article',
  },
}

const techniques = [
  {
    name: '"Si, y..."',
    desc: 'Acepta la idea del jugador y agrega algo. No bloquees.',
    bad: 'Jugador: "Salto por la ventana." DM: "No podes, esta trabada."',
    good: 'Jugador: "Salto por la ventana." DM: "Si, y al caer ves guardias patrullando abajo."',
  },
  {
    name: '"Si, pero..."',
    desc: 'Acepta con complicacion. La idea funciona pero hay un costo.',
    bad: 'Jugador: "Convenzo al guardia." DM: "No, es incorruptible."',
    good: 'Jugador: "Convenzo al guardia." DM: "Si, pero te pide un favor a cambio..."',
  },
  {
    name: 'Devuelve la Pregunta',
    desc: 'Cuando no sepas algo, preguntale al jugador.',
    example: 'Jugador: "Hay una taberna cerca?" DM: "Si, y vos la conoces. Como se llama?"',
  },
  {
    name: 'Falla Hacia Adelante',
    desc: 'Un fallo no detiene la historia. Agrega complicacion pero sigue avanzando.',
    example: 'Fallaste el sigilo? Los guardias te ven, pero tambien ves algo que no debias...',
  },
]

const quickCreation = [
  {
    category: 'NPC en 10 segundos',
    steps: ['Elige un rasgo fisico obvio', 'Dale una voz o manierismo', 'Decide que quiere'],
    example: 'Hombre calvo, habla susurrando, quiere que te vayas de su tienda.',
  },
  {
    category: 'Locacion Instantanea',
    steps: ['Un detalle visual fuerte', 'Un sonido ambiente', 'Un elemento interactivo'],
    example: 'Taberna oscura, musica de laud desafinado, mesa de cartas en la esquina.',
  },
  {
    category: 'Encuentro Sorpresa',
    steps: ['Quien/que aparece', 'Que quiere', 'Por que es problema'],
    example: 'Mercader perseguido por ladrones. Pide ayuda. Los ladrones trabajan para el baron.',
  },
]

const emergencies = [
  {
    situation: 'Los jugadores van donde no prepare',
    solution: 'Usa tu preparacion de otra parte. Ese dungeon puede estar en cualquier lado.',
  },
  {
    situation: 'Mataron al NPC importante',
    solution: 'Tenia un gemelo. O un asociado. O dejo una carta. La info sobrevive.',
  },
  {
    situation: 'Resolvieron el puzzle muy rapido',
    solution: 'Celebra su inteligencia. La siguiente escena puede ser mas compleja.',
  },
  {
    situation: 'Estan aburridos',
    solution: 'Algo explota. Alguien entra corriendo. Cambio de escena dramatico.',
  },
  {
    situation: 'No se que responder',
    solution: '"Excelente pregunta. Dejame pensarlo..." y corta a otra escena.',
  },
]

const practiceExercises = [
  {
    name: 'Word Association',
    desc: 'Jugador dice una palabra, vos describis lo primero que se te ocurre.',
    duration: '5 min',
  },
  {
    name: 'Descripcion Rapida',
    desc: 'Timer de 30 segundos. Describe una taberna, una mazmorra, un NPC.',
    duration: '10 min',
  },
  {
    name: 'Si, y... encadenado',
    desc: 'Cada persona agrega algo a la historia con "si, y..."',
    duration: '10 min',
  },
]

export default function ImprovisarPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-gold-dim px-2 py-1 rounded">Game Master</span>
          <span className="text-xs font-ui font-semibold text-parchment">12 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><Wand2 className="h-8 w-8 text-shadow" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Como Improvisar
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Ningun plan sobrevive el contacto con los jugadores. Y eso esta bien.
          Improvisar no es inventar de la nada — es conectar ideas rapidamente
          y convertir lo inesperado en oportunidad.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">El Secreto de la Improvisacion</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>No tenes que inventar todo. Solo tenes que conectar cosas que ya existen.</strong>
          <br /><br />
          Tu cerebro ya tiene cientos de historias, peliculas y libros.
          Improvisar es acceder a ese archivo y recombinar.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <MessageSquare className="h-6 w-6" /> Tecnicas Fundamentales
        </h2>
        <div className="space-y-4">
          {techniques.map((tech) => (
            <ParchmentPanel key={tech.name} className="p-6 border border-gold-dim">
              <h3 className="font-heading text-xl text-ink mb-2">{tech.name}</h3>
              <p className="font-body text-ink mb-3">{tech.desc}</p>
              {tech.bad && tech.good && (
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-2 bg-blood/10 rounded border-l-4 border-blood">
                    <span className="font-ui text-xs text-blood">Evita</span>
                    <p className="font-body text-ink text-sm italic">"{tech.bad}"</p>
                  </div>
                  <div className="p-2 bg-emerald/10 rounded border-l-4 border-emerald">
                    <span className="font-ui text-xs text-emerald">Mejor</span>
                    <p className="font-body text-ink text-sm italic">"{tech.good}"</p>
                  </div>
                </div>
              )}
              {tech.example && (
                <div className="p-3 bg-gold/10 rounded mt-3">
                  <span className="font-ui text-sm text-gold-dim">Ejemplo:</span>
                  <p className="font-body text-ink italic">{tech.example}</p>
                </div>
              )}
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6" /> Creacion Instantanea
        </h2>
        <div className="space-y-4">
          {quickCreation.map((item) => (
            <ParchmentPanel key={item.category} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-3">{item.category}</h3>
              <ol className="list-decimal list-inside font-body text-ink text-sm mb-3 space-y-1">
                {item.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              <div className="p-2 bg-gold/10 rounded">
                <span className="font-ui text-xs text-gold-dim">Resultado:</span>
                <p className="font-body text-ink text-sm italic">{item.example}</p>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Lightbulb className="h-6 w-6" /> Emergencias Comunes
        </h2>
        <div className="space-y-3">
          {emergencies.map((item, i) => (
            <ParchmentPanel key={i} className="p-4 border border-gold-dim/50">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <span className="font-ui text-xs text-blood">Situacion</span>
                  <p className="font-body text-ink text-sm">{item.situation}</p>
                </div>
                <div>
                  <span className="font-ui text-xs text-emerald">Solucion</span>
                  <p className="font-body text-ink text-sm">{item.solution}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Ejercicios de Practica
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">
            La improvisacion es un musculo. Se entrena con practica.
          </p>
          <div className="space-y-3">
            {practiceExercises.map((ex) => (
              <div key={ex.name} className="p-3 bg-gold/5 rounded">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-heading text-ink">{ex.name}</h4>
                  <span className="text-xs font-ui text-gold-dim">{ex.duration}</span>
                </div>
                <p className="font-body text-ink text-sm">{ex.desc}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">El Truco Final</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>Nadie sabe tu plan.</strong>
            <br /><br />
            Si improvisas algo y funciona, los jugadores piensan que estaba planeado.
            Si tu plan original falla, nadie lo sabe. Solo vos.
            Deja de preocuparte por "hacerlo bien" y empeza a jugar.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Improvisar NPCs es una de las habilidades mas utiles.
          </p>
          <Link href="/guias/crear-npcs" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Crear NPCs Memorables
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/ser-buen-dm" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Ser Buen DM
          </Link>
          <Link href="/guias/crear-npcs" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Crear NPCs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
