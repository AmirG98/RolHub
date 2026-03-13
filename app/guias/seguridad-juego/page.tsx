import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Shield, AlertTriangle, Heart, MessageCircle, X, Eye } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Seguridad en el Juego: Lineas, Velos y Carta X | RolHub',
  description: 'Como crear un espacio seguro para jugar rol. Herramientas de seguridad, sesion cero, y como manejar temas sensibles.',
  keywords: [
    'seguridad juegos de rol',
    'carta X RPG',
    'lineas y velos',
    'sesion cero D&D',
    'temas sensibles rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/seguridad-juego',
  },
  openGraph: {
    title: 'Seguridad en el Juego | RolHub',
    description: 'Herramientas para jugar de forma segura y comoda.',
    type: 'article',
  },
}

const whyMatters = [
  'El rol involucra imaginacion y emociones — pueden surgir temas dificiles',
  'No todos tienen los mismos limites o experiencias pasadas',
  'Un jugador incomodo no se divierte y arruina la experiencia para todos',
  'Las mejores mesas son aquellas donde todos se sienten seguros para expresarse',
]

const safetyTools = [
  {
    tool: 'Lineas',
    icon: X,
    desc: 'Temas que NUNCA aparecen en la mesa. Punto. Sin excepciones.',
    example: '"Nada de violencia contra niños" = nunca pasa en el juego.',
    howTo: 'Antes de la campana, cada jugador dice sus lineas. Son absolutas.',
  },
  {
    tool: 'Velos',
    icon: Eye,
    desc: 'Temas que pueden existir pero no se describen en detalle.',
    example: '"El romance puede pasar, pero cortamos a negro" = existe pero no roleamos la escena.',
    howTo: 'Los velos permiten que el mundo se sienta real sin entrar en detalles incomodos.',
  },
  {
    tool: 'Carta X',
    icon: AlertTriangle,
    desc: 'Una forma de decir "paren" en cualquier momento, sin explicar.',
    example: 'Alguien levanta la mano o dice "X" y la escena se detiene inmediatamente.',
    howTo: 'No se pregunta por que. No se discute. Se cambia de escena y se sigue.',
  },
  {
    tool: 'Sesion Cero',
    icon: MessageCircle,
    desc: 'Una sesion antes de jugar para establecer expectativas y limites.',
    example: 'Discutir tono del juego, lineas/velos, y como manejar conflictos.',
    howTo: 'Todos participan. Todos tienen voz. Las decisiones son del grupo.',
  },
]

const sessionZeroTopics = [
  { topic: 'Tono del juego', questions: ['Es serio o comico?', 'Hay horror? Romance?', 'Nivel de violencia esperado?'] },
  { topic: 'Limites de contenido', questions: ['Hay temas que alguien quiere evitar?', 'Que lineas establecemos?', 'Que velos?'] },
  { topic: 'Expectativas', questions: ['Cuanto combate vs roleplay?', 'Historia lineal o sandbox?', 'PvP permitido?'] },
  { topic: 'Logistica', questions: ['Cuando jugamos?', 'Que pasa si alguien falta?', 'Como nos comunicamos entre sesiones?'] },
]

const commonTriggers = [
  'Violencia grafica o tortura',
  'Abuso de cualquier tipo',
  'Contenido sexual explicito',
  'Fobias especificas (arañas, espacios cerrados, etc)',
  'Perdida de seres queridos',
  'Enfermedad mental tratada irresponsablemente',
  'Escenarios de impotencia absoluta',
]

const howToRespond = [
  {
    situation: 'Alguien usa la Carta X',
    response: 'Parar inmediatamente. "Entendido, vamos a otra cosa." Cambiar de escena sin preguntas.',
  },
  {
    situation: 'Un tema incomoda a alguien',
    response: 'Tomar nota para el futuro. Disculparse brevemente y continuar con algo diferente.',
  },
  {
    situation: 'No se establecieron limites antes',
    response: 'Nunca es tarde. Parar y tener la conversacion ahora.',
  },
  {
    situation: 'Alguien ignora los limites',
    response: 'Intervencion directa. "Ese tema esta fuera de los limites que establecimos."',
  },
]

const dmResponsibilities = [
  'Conocer las lineas y velos de todos los jugadores',
  'Recordar las herramientas de seguridad al inicio de cada sesion',
  'No presionar a nadie a explicar sus limites',
  'Intervenir si un jugador cruza los limites de otro',
  'Modelar el uso de herramientas de seguridad (usarlas vos tambien)',
]

export default function SeguridadJuegoPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-stone px-2 py-1 rounded">Comunidad</span>
          <span className="text-xs font-ui font-semibold text-parchment">10 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-stone"><Shield className="h-8 w-8 text-parchment" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Seguridad en el Juego
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          El rol es para divertirse. Pero la imaginacion puede llevarnos a lugares
          dificiles. Esta guia te da herramientas para que todos en la mesa
          se sientan seguros y comodos.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-blood">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">Por Que Importa</h2>
        <ul className="font-body text-ink space-y-2">
          {whyMatters.map((point, i) => (
            <li key={i} className="flex items-start gap-2">
              <Heart className="h-4 w-4 text-blood flex-shrink-0 mt-1" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Herramientas de Seguridad
        </h2>
        <div className="space-y-4">
          {safetyTools.map((tool) => (
            <ParchmentPanel key={tool.tool} className="p-6 border border-gold-dim">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gold-dim flex-shrink-0">
                  <tool.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-xl text-ink mb-2">{tool.tool}</h3>
                  <p className="font-body text-ink mb-2">{tool.desc}</p>
                  <div className="p-3 bg-gold/10 rounded mb-2">
                    <p className="font-ui text-sm text-ink"><strong>Ejemplo:</strong> {tool.example}</p>
                  </div>
                  <p className="font-ui text-xs text-gold-dim">Como funciona: {tool.howTo}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <MessageCircle className="h-6 w-6" /> Que Cubrir en Sesion Cero
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {sessionZeroTopics.map((item) => (
            <ParchmentPanel key={item.topic} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-2">{item.topic}</h4>
              <ul className="font-body text-ink text-sm space-y-1">
                {item.questions.map((q, i) => (
                  <li key={i}>• {q}</li>
                ))}
              </ul>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" /> Temas Comunmente Sensibles
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">
            Estos temas suelen requerir atencion especial. Preguntá antes de incluirlos:
          </p>
          <div className="grid md:grid-cols-2 gap-2">
            {commonTriggers.map((trigger, i) => (
              <div key={i} className="p-2 bg-blood/10 rounded text-sm font-body text-ink">
                {trigger}
              </div>
            ))}
          </div>
          <p className="font-ui text-xs text-ink mt-4">
            Esta lista no es exhaustiva. Siempre preguntá a tu grupo especificamente.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Como Responder
        </h2>
        <div className="space-y-3">
          {howToRespond.map((item, i) => (
            <ParchmentPanel key={i} className="p-4 border border-gold-dim/50">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">Situacion</span>
                  <p className="font-body text-ink text-sm">{item.situation}</p>
                </div>
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Respuesta</span>
                  <p className="font-body text-ink text-sm">{item.response}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Shield className="h-6 w-6" /> Responsabilidades del DM
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <ul className="font-body text-ink space-y-2">
            {dmResponsibilities.map((resp, i) => (
              <li key={i} className="p-2 bg-gold/5 rounded">• {resp}</li>
            ))}
          </ul>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>Nadie tiene que justificar sus limites.</strong>
            <br /><br />
            Si alguien dice que algo lo incomoda, eso es suficiente.
            No necesitas saber por que. Solo necesitas respetar el limite.
            La seguridad emocional de las personas reales siempre viene
            antes que cualquier historia ficticia.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Mas Preguntas?
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Consulta las preguntas frecuentes sobre RolHub.
          </p>
          <Link href="/guias/faq" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Preguntas Frecuentes
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/etiqueta-mesa" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Etiqueta de Mesa
          </Link>
          <Link href="/guias/faq" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: FAQ <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
