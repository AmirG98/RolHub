import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Users, MessageSquare, Heart, Eye, Sparkles } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Como Crear NPCs Memorables: Guia para DMs | RolHub',
  description: 'Aprende a crear personajes no jugadores que tus jugadores recordaran. Personalidad, motivacion, voz y secretos.',
  keywords: [
    'crear NPCs D&D',
    'personajes memorables rol',
    'NPC personalidad',
    'como hacer buenos NPCs',
    'game master NPCs'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/crear-npcs',
  },
  openGraph: {
    title: 'Como Crear NPCs Memorables | RolHub',
    description: 'La guia definitiva para crear personajes que tus jugadores recordaran.',
    type: 'article',
  },
}

const essentials = [
  {
    element: 'Quiere Algo',
    icon: Heart,
    desc: 'Todo NPC quiere algo, aunque sea simple. El tabernero quiere cerrar temprano. El rey quiere paz. El mendigo quiere comida.',
    tip: 'Si no sabes que quiere, preguntate: "Por que esta persona esta aca ahora mismo?"',
  },
  {
    element: 'Rasgo Memorable',
    icon: Eye,
    desc: 'Un detalle fisico, verbal o de comportamiento que lo distingue. No necesitas descripcion completa.',
    tip: 'Cicatriz en el ojo. Habla en tercera persona. Siempre esta comiendo algo.',
  },
  {
    element: 'Forma de Hablar',
    icon: MessageSquare,
    desc: 'No necesitas hacer voces. Un patron verbal o frase repetida es suficiente.',
    tip: '"Por los dioses..." / Habla muy lento. / Usa palabras rebuscadas.',
  },
  {
    element: 'Secreto',
    icon: Sparkles,
    desc: 'Algo que no dice abiertamente. Puede ser trivial o importante.',
    tip: 'El herrero odia a su hermano. La sacerdotisa duda de su fe. El guardia acepta sobornos.',
  },
]

const quickNPC = {
  title: 'NPC en 30 Segundos',
  steps: [
    'Nombre: Usa un generador o combina silabas al azar',
    'Apariencia: UN detalle que destaque',
    'Voz: Una caracteristica de como habla',
    'Quiere: Una cosa simple que necesita ahora',
    'Oculta: Una cosa que no dice',
  ],
  example: {
    name: 'Marta la Tuerta',
    appearance: 'Parche en el ojo izquierdo',
    voice: 'Habla en susurros',
    want: 'Que alguien le compre su pescado',
    secret: 'El pez fue robado del barco del baron',
  },
}

const archetypes = [
  { name: 'El Mentor', desc: 'Sabio, ayuda pero no resuelve. Da consejos crípticos.', example: 'Viejo mago, veterano retirado, sacerdote anciano.' },
  { name: 'El Obstaculo', desc: 'Bloquea el camino. No es villano, tiene sus razones.', example: 'Guardia que hace su trabajo, burócrata, madre protectora.' },
  { name: 'El Aliado Dudoso', desc: 'Ayuda pero no es confiable. Tiene agenda propia.', example: 'Ladron que necesita tu ayuda, mercader que te debe.' },
  { name: 'El Comic Relief', desc: 'Aligera momentos tensos. No es tonto, tiene profundidad.', example: 'Bardo exagerado, vendedor entusiasta, goblin torpe.' },
  { name: 'El Espejo', desc: 'Refleja algo del personaje jugador. Puede ser lo que sera o lo que fue.', example: 'Aventurero retirado, version joven del mentor, rival.' },
]

const commonMistakes = [
  {
    mistake: 'Todos los NPCs son amigables',
    fix: 'Algunos NPCs tienen problemas, estan ocupados, o simplemente no les caes bien.',
  },
  {
    mistake: 'Descripcion infinita',
    fix: 'Tres detalles maximo. Los jugadores no recordaran mas que eso.',
  },
  {
    mistake: 'NPC sin motivacion',
    fix: 'Si no quiere nada, no tiene razon de existir. Dale un objetivo aunque sea pequeno.',
  },
  {
    mistake: 'NPC que resuelve todo',
    fix: 'Los NPCs ayudan, no solucionan. La victoria es de los jugadores.',
  },
  {
    mistake: 'Olvidar NPCs anteriores',
    fix: 'Toma notas. Que los NPCs recuerden a los jugadores y sus acciones.',
  },
]

const voiceTips = [
  { technique: 'Velocidad', examples: ['Habla muy rapido (nervioso)', 'Habla muy lento (sabio, amenazante)'] },
  { technique: 'Volumen', examples: ['Susurra siempre (secreto)', 'Grita todo (sordo, entusiasta)'] },
  { technique: 'Frase Repetida', examples: ['"Si me permites decirlo..."', '"Por mi honor..."', '"Interesante, interesante..."'] },
  { technique: 'Acento Leve', examples: ['Pronuncia las R fuerte', 'Omite letras', 'Tono mas grave o agudo'] },
]

export default function CrearNPCsPage() {
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
          <div className="p-4 rounded-lg bg-gold"><Users className="h-8 w-8 text-shadow" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Crear NPCs Memorables
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Los mejores NPCs no son los que tienen 10 paginas de backstory.
          Son los que quieren algo, actuan de forma consistente, y tienen
          un detalle que los hace unicos.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Los 4 Elementos Esenciales
        </h2>
        <div className="space-y-4">
          {essentials.map((item) => (
            <ParchmentPanel key={item.element} className="p-6 border border-gold-dim">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gold-dim flex-shrink-0">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-xl text-ink mb-2">{item.element}</h3>
                  <p className="font-body text-ink mb-3">{item.desc}</p>
                  <p className="font-ui text-sm text-ink">
                    <Sparkles className="h-4 w-4 inline mr-1 text-gold-dim" />
                    <strong>Ejemplo:</strong> {item.tip}
                  </p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          {quickNPC.title}
        </h2>
        <ParchmentPanel className="p-6 border-2 border-gold">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-heading text-ink mb-3">Proceso</h3>
              <ol className="list-decimal list-inside font-body text-ink space-y-2">
                {quickNPC.steps.map((step, i) => (
                  <li key={i} className="text-sm">{step}</li>
                ))}
              </ol>
            </div>
            <div className="p-4 bg-gold/10 rounded">
              <h3 className="font-heading text-ink mb-3">Ejemplo: {quickNPC.example.name}</h3>
              <ul className="font-body text-ink text-sm space-y-1">
                <li><strong>Apariencia:</strong> {quickNPC.example.appearance}</li>
                <li><strong>Voz:</strong> {quickNPC.example.voice}</li>
                <li><strong>Quiere:</strong> {quickNPC.example.want}</li>
                <li><strong>Oculta:</strong> {quickNPC.example.secret}</li>
              </ul>
            </div>
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Arquetipos Utiles
        </h2>
        <div className="space-y-3">
          {archetypes.map((arch) => (
            <ParchmentPanel key={arch.name} className="p-4 border border-gold-dim/50">
              <h3 className="font-heading text-ink mb-1">{arch.name}</h3>
              <p className="font-body text-ink text-sm mb-2">{arch.desc}</p>
              <p className="font-ui text-xs text-gold-dim">Ejemplos: {arch.example}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <MessageSquare className="h-6 w-6" /> Tips de Voz
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">
            No necesitas ser actor de doblaje. Estas tecnicas simples hacen NPCs distinguibles:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {voiceTips.map((tip) => (
              <div key={tip.technique} className="p-3 bg-gold/5 rounded">
                <h4 className="font-heading text-ink text-sm mb-1">{tip.technique}</h4>
                <ul className="font-body text-ink text-sm">
                  {tip.examples.map((ex, i) => (
                    <li key={i}>• {ex}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
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

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Los NPCs son parte de encuentros. Aprende a disenarlos.
          </p>
          <Link href="/guias/disenar-encuentros" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Disenar Encuentros
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/improvisar" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Improvisar
          </Link>
          <Link href="/guias/disenar-encuentros" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Disenar Encuentros <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
