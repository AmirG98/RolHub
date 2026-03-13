import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Heart, Users, MessageCircle, Shield, Sparkles, AlertTriangle } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Romance en Juegos de Rol: Relaciones con Consentimiento | RolHub',
  description: 'Como incorporar romance en juegos de rol de forma sana. Consentimiento, limites, fade to black, y relaciones significativas.',
  keywords: [
    'romance juegos de rol',
    'relaciones RPG',
    'romance D&D',
    'roleplay romantico',
    'consentimiento rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/genero-romance',
  },
  openGraph: {
    title: 'Romance en Rol | RolHub',
    description: 'Relaciones romanticas saludables en tus partidas.',
    type: 'article',
  },
}

const consentRules = [
  {
    rule: 'Pregunta Antes',
    desc: 'Antes de que tu personaje inicie romance con otro PJ, habla con el jugador fuera de partida.',
    example: '"Hey, estaria interesante si nuestros personajes desarrollan algo. Te copa la idea?"',
  },
  {
    rule: 'Limites Claros',
    desc: 'Establece que nivel de detalle es comodo para ambos. Desde "nada de romance" hasta "todo menos explicito".',
    example: '"Me parece bien el flirteo y tension, pero las escenas intimas las hacemos fade to black."',
  },
  {
    rule: 'Palabra de Seguridad',
    desc: 'Una forma de decir "esto se fue de tema" sin romper la escena.',
    example: 'Levantar una mano, decir "pausa", o usar la Carta X.',
  },
  {
    rule: 'Respeta el No',
    desc: 'Si alguien dice que no le interesa, eso es todo. No insistas.',
    example: 'Ni en personaje ni fuera. El consentimiento aplica siempre.',
  },
]

const romanceTypes = [
  {
    type: 'Tension No Resuelta',
    desc: 'Atraccion que nunca se concreta. Miradas, momentos cargados, casi-besos.',
    pros: 'Muy dramatico, funciona bien en grupos.',
    cons: 'Puede frustrarse si dura demasiado.',
  },
  {
    type: 'Romance Establecido',
    desc: 'Los personajes ya estan juntos desde el inicio.',
    pros: 'Dinamica clara, momentos de team.',
    cons: 'Puede eclipsar otras relaciones.',
  },
  {
    type: 'Enemies to Lovers',
    desc: 'De rivales a amantes. El clasico.',
    pros: 'Arco muy satisfactorio.',
    cons: 'Necesita tiempo y desarrollo.',
  },
  {
    type: 'Romance Tragico',
    desc: 'Amor que no puede ser por circunstancias.',
    pros: 'Muy emotivo, buen material dramatico.',
    cons: 'Puede ser agotador emocionalmente.',
  },
]

const fadeToBlack = {
  title: 'Fade to Black',
  desc: 'Cuando la escena se vuelve intima, cortamos a negro y asumimos que paso lo que tenia que pasar.',
  why: 'Permite que el romance exista sin hacer incomodos a otros jugadores o cruzar limites.',
  example: '"Los personajes se miran intensamente y cierran la puerta. [Fade to black.] A la mañana siguiente..."',
}

const buildingRomance = [
  { phase: 'Interes Inicial', desc: 'Algo llama la atencion. Una mirada, un gesto, una habilidad.', tip: 'Describi que es lo que tu personaje nota.' },
  { phase: 'Momentos Compartidos', desc: 'Tiempo juntos, conversaciones, experiencias.', tip: 'Busca escenas a solas o semi-privadas.' },
  { phase: 'Vulnerabilidad', desc: 'Compartir algo personal. Bajar las defensas.', tip: 'Esto crea intimidad emocional.' },
  { phase: 'Declaracion', desc: 'Expresar los sentimientos de alguna forma.', tip: 'Puede ser explicito o implicito.' },
  { phase: 'Desafio', desc: 'Algo amenaza la relacion. Conflicto externo o interno.', tip: 'El drama hace el romance mas significativo.' },
]

const withNPCs = [
  'Los NPCs pueden ser intereses amorosos, pero el DM debe manejarlo con cuidado',
  'No uses NPCs para manipular emocionalmente a jugadores',
  'Si un PJ busca romance con NPC, pregunta que tipo de historia quieren',
  'Matar al interes amoroso por drama es cliché - usalo con cuidado',
  'El NPC debe tener personalidad propia, no ser solo "la pareja de"',
]

const commonMistakes = [
  {
    mistake: 'Forzar romance en otros',
    fix: 'El consentimiento del jugador es obligatorio, siempre.',
  },
  {
    mistake: 'Monopolizar el tiempo de juego',
    fix: 'Las escenas romanticas deben ser breves o entre sesiones.',
  },
  {
    mistake: 'Confundir personaje con jugador',
    fix: 'Lo que sienten los personajes no refleja sentimientos reales.',
  },
  {
    mistake: 'Explicitar demasiado',
    fix: 'Fade to black. Nadie necesita escuchar detalles.',
  },
]

export default function GeneroRomancePage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-blood px-2 py-1 rounded">Genero</span>
          <span className="text-xs font-ui font-semibold text-parchment">12 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-blood"><Heart className="h-8 w-8 text-white" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Genero: Romance
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          El romance puede agregar profundidad emocional a tus partidas,
          pero requiere mas cuidado que cualquier otro genero.
          El consentimiento y la comunicacion son fundamentales.
        </p>
      </header>

      <section className="mb-12">
        <ParchmentPanel className="p-6 border-2 border-blood">
          <h2 className="font-heading text-xl text-ink mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blood" />
            Regla #1: Consentimiento
          </h2>
          <p className="font-body text-ink text-lg leading-relaxed">
            <strong>El romance en rol SIEMPRE requiere consentimiento explicito de todos los jugadores involucrados.</strong>
            <br /><br />
            Lo que pasa entre personajes es ficcion, pero los jugadores son personas reales
            con sentimientos reales. Respeta sus limites absolutamente.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <MessageCircle className="h-6 w-6" /> Reglas de Consentimiento
        </h2>
        <div className="space-y-4">
          {consentRules.map((rule) => (
            <ParchmentPanel key={rule.rule} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-2">{rule.rule}</h3>
              <p className="font-body text-ink text-sm mb-2">{rule.desc}</p>
              <div className="p-2 bg-gold/10 rounded">
                <p className="font-body text-ink text-sm italic">Ejemplo: {rule.example}</p>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <ParchmentPanel className="p-6 border-2 border-gold">
          <h2 className="font-heading text-xl text-ink mb-3">{fadeToBlack.title}</h2>
          <p className="font-body text-ink mb-3">{fadeToBlack.desc}</p>
          <p className="font-ui text-sm text-gold-dim mb-3">{fadeToBlack.why}</p>
          <div className="p-3 bg-gold/10 rounded">
            <p className="font-body text-ink text-sm italic">{fadeToBlack.example}</p>
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tipos de Romance
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {romanceTypes.map((type) => (
            <ParchmentPanel key={type.type} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{type.type}</h3>
              <p className="font-body text-ink text-sm mb-2">{type.desc}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-1 bg-emerald/10 rounded">
                  <span className="font-ui text-emerald">Pro:</span>
                  <span className="font-body text-ink"> {type.pros}</span>
                </div>
                <div className="p-1 bg-blood/10 rounded">
                  <span className="font-ui text-blood">Con:</span>
                  <span className="font-body text-ink"> {type.cons}</span>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Construir el Romance
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {buildingRomance.map((phase, i) => (
              <div key={phase.phase} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blood flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-white font-bold text-sm">{i + 1}</span>
                </div>
                <div>
                  <h4 className="font-heading text-ink text-sm">{phase.phase}</h4>
                  <p className="font-body text-ink text-sm">{phase.desc}</p>
                  <p className="font-ui text-xs text-gold-dim">Tip: {phase.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> Romance con NPCs
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <ul className="font-body text-ink space-y-2">
            {withNPCs.map((point, i) => (
              <li key={i} className="p-2 bg-gold/5 rounded">• {point}</li>
            ))}
          </ul>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" /> Errores Comunes
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
            <strong>El romance es para enriquecer la historia, no para incomodar a nadie.</strong>
            <br /><br />
            Si se hace bien, agrega profundidad emocional y momentos memorables.
            Si se hace mal, arruina amistades y mesas.
            Comunicate siempre.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Explorar Otros Generos
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            La intriga politica es otro genero de relaciones complejas.
          </p>
          <Link href="/guias/genero-intriga" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Genero: Intriga
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/genero-comedia" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Comedia
          </Link>
          <Link href="/guias/genero-intriga" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Intriga <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
