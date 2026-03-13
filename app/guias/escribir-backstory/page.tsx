import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, BookOpen, Heart, Users, Target, AlertTriangle, Sparkles } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Como Escribir un Backstory Memorable | RolHub',
  description: 'Crea la historia de tu personaje. Consejos para escribir backstories que sean jugables, interesantes y conecten con la campana.',
  keywords: [
    'backstory personaje D&D',
    'historia de personaje RPG',
    'crear backstory rol',
    'trasfondo personaje',
    'como escribir backstory'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/escribir-backstory',
  },
  openGraph: {
    title: 'Como Escribir un Backstory | RolHub',
    description: 'Tu personaje tiene una historia. Aprendé a contarla.',
    type: 'article',
  },
}

const essentialElements = [
  {
    element: 'Origen',
    icon: BookOpen,
    desc: 'De donde venis? Pueblo, ciudad, bosque, otro plano?',
    questions: ['Donde creciste?', 'Como era tu vida cotidiana?', 'Que te diferenciaba de otros ahi?'],
  },
  {
    element: 'Motivacion',
    icon: Target,
    desc: 'Que te impulsa? Por que estas en esta aventura?',
    questions: ['Que buscas?', 'Que dejaste atras?', 'Que no podes ignorar?'],
  },
  {
    element: 'Relaciones',
    icon: Users,
    desc: 'Quien importa en tu vida? Familia, mentores, rivales?',
    questions: ['Quien te enseño lo que sabes?', 'A quien extrañas?', 'Quien te traiciono?'],
  },
  {
    element: 'Herida',
    icon: Heart,
    desc: 'Que evento te marco? Trauma, perdida, fracaso?',
    questions: ['Que cambio tu vida?', 'De que huyes?', 'Que no podes perdonar?'],
  },
]

const lengthGuide = [
  { length: '1 parrafo', pros: 'Flexible, facil de adaptar. El DM tiene espacio para sorprenderte.', cons: 'Puede sentirse superficial.', best: 'One-shots, jugadores nuevos.' },
  { length: '1 pagina', pros: 'Balance ideal. Suficiente detalle, espacio para crecer.', cons: 'Requiere edicion.', best: 'Campaña estandar.' },
  { length: '2+ paginas', pros: 'Rico en detalle, muy personal.', cons: 'Puede abrumar al DM. Dificil de integrar.', best: 'Campaña larga con DM que lo pide.' },
]

const hooks = [
  {
    hook: 'El Objetivo Personal',
    desc: 'Algo que tu personaje quiere lograr mas alla de la mision del grupo.',
    example: 'Encontrar a mi hermano desaparecido.',
  },
  {
    hook: 'El Enemigo',
    desc: 'Alguien de tu pasado que puede aparecer.',
    example: 'El mercader que vendio a mi familia como esclavos.',
  },
  {
    hook: 'El Secreto',
    desc: 'Algo que ocultas, incluso del grupo.',
    example: 'Trabaje para el gremio de asesinos.',
  },
  {
    hook: 'La Deuda',
    desc: 'Algo que debes y debe ser pagado.',
    example: 'Le debo mi vida a un dragon.',
  },
  {
    hook: 'El Objeto',
    desc: 'Una posesion con significado especial.',
    example: 'La espada de mi padre muerto.',
  },
]

const commonMistakes = [
  {
    mistake: 'El Solitario Edgy',
    problem: 'Mis padres murieron, no confio en nadie, trabajo solo.',
    fix: 'Dale una razon para estar en un GRUPO. Por que viaja con estos extraños?',
  },
  {
    mistake: 'El Backstory Cerrado',
    problem: 'Ya mate a mi enemigo y resolvi todos mis problemas.',
    fix: 'Deja hilos sueltos. El DM los usara para crear contenido.',
  },
  {
    mistake: 'El Novela de 10 Paginas',
    problem: 'Historia tan detallada que no deja espacio para el juego.',
    fix: 'El backstory es el INICIO, no toda la historia.',
  },
  {
    mistake: 'El Superman',
    problem: 'Ya era el mejor espadachin del reino a los 15.',
    fix: 'Nivel 1 significa que recien empezas. Tu gloria esta por venir.',
  },
]

const template = {
  intro: 'Usa este formato como guia:',
  sections: [
    { title: 'Origen (2-3 oraciones)', example: 'Creci en un pueblo pesquero del sur. Mi padre era carpintero, mi madre curandera. La vida era simple hasta que...' },
    { title: 'Evento Clave (2-3 oraciones)', example: '...una plaga arrasó el pueblo. Perdi a mis padres y fui el unico sobreviviente. Los rumores dicen que alguien libero la plaga a proposito.' },
    { title: 'El Camino (1-2 oraciones)', example: 'Desde entonces viajo buscando respuestas. Aprendi a luchar para sobrevivir.' },
    { title: 'Gancho (1 oracion)', example: 'Algun dia encontrare a los responsables.' },
  ],
}

export default function EscribirBackstoryPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-gold-dim px-2 py-1 rounded">Personaje</span>
          <span className="text-xs font-ui font-semibold text-parchment">12 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><BookOpen className="h-8 w-8 text-shadow" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Escribir un Backstory
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Un buen backstory no es una novela — es un trampolín.
          Es el pasado que informa el presente y crea posibilidades para el futuro.
          Tu personaje tiene una historia. Vamos a contarla.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Regla de Oro</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>Tu backstory existe para JUGAR, no para LEER.</strong>
          <br /><br />
          Si no afecta como juegas o no puede usarse en la mesa, probablemente sobra.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Elementos Esenciales
        </h2>
        <div className="space-y-4">
          {essentialElements.map((item) => (
            <ParchmentPanel key={item.element} className="p-6 border border-gold-dim">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gold-dim flex-shrink-0">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-xl text-ink mb-2">{item.element}</h3>
                  <p className="font-body text-ink mb-3">{item.desc}</p>
                  <div className="p-3 bg-gold/10 rounded">
                    <p className="font-ui text-sm text-ink font-bold mb-1">Preguntas guia:</p>
                    <ul className="font-body text-ink text-sm">
                      {item.questions.map((q, i) => (
                        <li key={i}>• {q}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Cuanto Escribir?
        </h2>
        <div className="space-y-3">
          {lengthGuide.map((l) => (
            <ParchmentPanel key={l.length} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-2">{l.length}</h4>
              <div className="grid md:grid-cols-3 gap-2 text-sm">
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Pro</span>
                  <p className="font-body text-ink">{l.pros}</p>
                </div>
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">Contra</span>
                  <p className="font-body text-ink">{l.cons}</p>
                </div>
                <div className="p-2 bg-gold/10 rounded">
                  <span className="font-ui text-xs text-gold-dim">Ideal para</span>
                  <p className="font-body text-ink">{l.best}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Ganchos para el DM
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">
            Incluir estos elementos le da al DM material para crear contenido:
          </p>
          <div className="space-y-3">
            {hooks.map((h) => (
              <div key={h.hook} className="p-3 bg-gold/5 rounded">
                <h4 className="font-heading text-ink text-sm mb-1">{h.hook}</h4>
                <p className="font-body text-ink text-sm mb-1">{h.desc}</p>
                <p className="font-ui text-xs text-gold-dim italic">Ejemplo: "{h.example}"</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" /> Errores Comunes
        </h2>
        <div className="space-y-3">
          {commonMistakes.map((item, i) => (
            <ParchmentPanel key={i} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-2">{item.mistake}</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">Problema</span>
                  <p className="font-body text-ink text-sm">{item.problem}</p>
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
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Plantilla Rapida
        </h2>
        <ParchmentPanel className="p-6 border-2 border-gold">
          <p className="font-body text-ink mb-4">{template.intro}</p>
          <div className="space-y-4">
            {template.sections.map((s, i) => (
              <div key={i} className="p-3 bg-gold/5 rounded">
                <h4 className="font-heading text-ink text-sm mb-2">{s.title}</h4>
                <p className="font-body text-ink text-sm italic">"{s.example}"</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>Tu personaje empieza la aventura, no la termina.</strong>
            <br /><br />
            El backstory explica de donde venis. Lo que sos ahora y lo que seras
            se decide en la mesa, con los dados en la mano y tus compañeros al lado.
            Deja espacio para crecer.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Tu personaje va a cambiar durante la campana. Entende como.
          </p>
          <Link href="/guias/arcos-personaje" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Arcos de Personaje
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/entender-dados" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Entender Dados
          </Link>
          <Link href="/guias/arcos-personaje" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Arcos de Personaje <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
