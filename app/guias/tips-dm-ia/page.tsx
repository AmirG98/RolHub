import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Sparkles, MessageCircle, Target, Lightbulb, AlertTriangle, Zap } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Tips para Jugar con DM de IA: Sacarle el Maximo | RolHub',
  description: 'Trucos avanzados para obtener mejores respuestas del DM de IA. Como comunicarte, que esperar, y como mejorar tu experiencia.',
  keywords: [
    'DM IA tips',
    'rol con inteligencia artificial',
    'RolHub trucos',
    'jugar rol con IA',
    'mejorar respuestas IA'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/tips-dm-ia',
  },
  openGraph: {
    title: 'Tips DM con IA | RolHub',
    description: 'Saca el maximo del DM autonomo.',
    type: 'article',
  },
}

const communicationTips = [
  {
    tip: 'Se Especifico',
    bad: '"Voy a la taberna"',
    good: '"Entro a la taberna buscando al informante que mencionaron. Me siento en una esquina oscura y observo."',
    why: 'Mas detalle = respuesta mas rica.',
  },
  {
    tip: 'Declara Intenciones',
    bad: '"Hablo con el guardia"',
    good: '"Intento convencer al guardia de que me deje pasar usando mi titulo de noble"',
    why: 'El DM sabe que queres lograr.',
  },
  {
    tip: 'Describe Emociones',
    bad: '"Ataco al orco"',
    good: '"Con rabia por la muerte de mi companero, cargo contra el orco lider"',
    why: 'Agrega contexto emocional a la narrativa.',
  },
  {
    tip: 'Haz Preguntas Especificas',
    bad: '"Que hay aca?"',
    good: '"Busco trampas en el piso. Hay alguna marca sospechosa?"',
    why: 'Direcciona la respuesta a lo que te importa.',
  },
]

const actionFormats = [
  {
    format: 'Accion + Objetivo + Metodo',
    example: '"Intento abrir la cerradura usando mis ganzuas"',
    result: 'El DM sabe que, para que, y como.',
  },
  {
    format: 'Dialogo Directo',
    example: '"Le digo al mercader: \'Escucha, se que tenes informacion. Pongo 50 monedas en la mesa.\'"',
    result: 'Inmersion total. El DM responde en personaje.',
  },
  {
    format: 'Descripcion de Movimiento',
    example: '"Me muevo silenciosamente por el pasillo, pegado a la pared izquierda, hacia la puerta del fondo"',
    result: 'El DM puede narrar el ambiente mientras te moves.',
  },
  {
    format: 'Uso de Habilidad',
    example: '"Uso mi conocimiento de historia para recordar si esta familia tuvo conflictos con la corona"',
    result: 'Activa el sistema de reglas apropiado.',
  },
]

const expectations = [
  {
    expectation: 'El DM Recuerda',
    reality: 'La IA mantiene contexto de la sesion y campana.',
    tip: 'Aun asi, podes recordarle detalles importantes si es necesario.',
  },
  {
    expectation: 'Consistencia del Mundo',
    reality: 'El sistema mantiene world state y relaciones.',
    tip: 'Si algo parece inconsistente, senalalo.',
  },
  {
    expectation: 'Respuestas Largas',
    reality: 'La IA balancea descripcion y jugabilidad.',
    tip: 'Si queres mas detalle, pedi explicitamente.',
  },
  {
    expectation: 'Dificultad Justa',
    reality: 'El sistema adapta segun el motor de reglas.',
    tip: 'Podes pedir ajuste de dificultad en cualquier momento.',
  },
]

const advancedTechniques = [
  {
    technique: 'El Flashback',
    how: '"Recordemos: cuando mi personaje era joven, que paso con su familia?"',
    benefit: 'Expande el backstory colaborativamente.',
  },
  {
    technique: 'La Pregunta Abierta',
    how: '"Que rumores se escuchan en la ciudad sobre la desaparicion?"',
    benefit: 'Deja que el DM genere contenido nuevo.',
  },
  {
    technique: 'El "What If"',
    how: '"Si decido traicionar al gremio, que consecuencias podria tener?"',
    benefit: 'Explora posibilidades antes de actuar.',
  },
  {
    technique: 'La Pausa Narrativa',
    how: '"Antes de entrar al castillo, describime como se ve desde afuera en esta noche de tormenta"',
    benefit: 'Pedi momentos cinematograficos.',
  },
]

const commonMistakes = [
  {
    mistake: 'Acciones vagas',
    fix: 'Siempre especifica que, como, y para que.',
  },
  {
    mistake: 'Esperar que el DM lea tu mente',
    fix: 'Declara tus intenciones explicitamente.',
  },
  {
    mistake: 'No usar el sistema de reglas',
    fix: 'Menciona habilidades, items, y recursos que tenes.',
  },
  {
    mistake: 'Ignorar las consecuencias',
    fix: 'Reacciona a lo que pasa, no solo actues.',
  },
]

const moodRequests = [
  { mood: 'Mas Descripcion', how: '"Describime el lugar con mas detalle"' },
  { mood: 'Mas Accion', how: '"Saltemos al combate"' },
  { mood: 'Mas Dialogo', how: '"Quiero hablar con este NPC"' },
  { mood: 'Mas Misterio', how: '"Que pistas hay que no estoy viendo?"' },
  { mood: 'Subir Tension', how: '"Quiero que esto se sienta mas peligroso"' },
  { mood: 'Momento de Calma', how: '"Mi personaje descansa y reflexiona"' },
]

const feedbackLoop = [
  'Si una respuesta no te gusta, podes pedir que reintente',
  'Podes corregir detalles ("No, mi personaje no haria eso")',
  'Podes pedir ajustes de tono ("Menos comico, mas serio")',
  'El feedback mejora la experiencia en tiempo real',
]

export default function TipsDmIaPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-gold-bright px-2 py-1 rounded">RolHub</span>
          <span className="text-xs font-ui font-semibold text-parchment">10 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><Sparkles className="h-8 w-8 text-shadow" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Tips para el DM de IA
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          El DM de IA de RolHub es poderoso, pero como cualquier herramienta,
          funciona mejor cuando sabes como usarla. Estos tips te ayudan a
          obtener mejores respuestas y una experiencia mas inmersiva.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Regla de Oro</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>Cuanto mas des, mas recibis.</strong>
          <br /><br />
          La IA responde a lo que le das. Acciones detalladas producen
          respuestas detalladas. Comandos vagos producen respuestas genericas.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <MessageCircle className="h-6 w-6" /> Como Comunicarte
        </h2>
        <div className="space-y-4">
          {communicationTips.map((tip) => (
            <ParchmentPanel key={tip.tip} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{tip.tip}</h3>
              <div className="grid md:grid-cols-2 gap-2 mb-2">
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">Evita:</span>
                  <p className="font-mono text-ink text-sm">"{tip.bad}"</p>
                </div>
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Mejor:</span>
                  <p className="font-mono text-ink text-sm">"{tip.good}"</p>
                </div>
              </div>
              <p className="font-ui text-xs text-gold-dim">Por que: {tip.why}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Target className="h-6 w-6" /> Formatos de Accion
        </h2>
        <div className="space-y-3">
          {actionFormats.map((format) => (
            <ParchmentPanel key={format.format} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{format.format}</h4>
              <p className="font-mono text-ink text-sm bg-gold/10 p-2 rounded mb-2">"{format.example}"</p>
              <p className="font-ui text-xs text-gold-dim">Resultado: {format.result}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Lightbulb className="h-6 w-6" /> Que Esperar
        </h2>
        <div className="space-y-3">
          {expectations.map((exp) => (
            <ParchmentPanel key={exp.expectation} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{exp.expectation}</h4>
              <p className="font-body text-ink text-sm mb-1">{exp.reality}</p>
              <p className="font-ui text-xs text-gold-dim">Tip: {exp.tip}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6" /> Tecnicas Avanzadas
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {advancedTechniques.map((tech) => (
            <ParchmentPanel key={tech.technique} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{tech.technique}</h4>
              <p className="font-mono text-ink text-xs bg-gold/10 p-2 rounded mb-2">"{tech.how}"</p>
              <p className="font-ui text-xs text-gold-dim">{tech.benefit}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Pedir Cambios de Mood
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="grid md:grid-cols-2 gap-3">
            {moodRequests.map((mood) => (
              <div key={mood.mood} className="p-2 bg-gold/5 rounded">
                <span className="font-heading text-ink text-sm">{mood.mood}</span>
                <p className="font-mono text-ink text-xs">{mood.how}</p>
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
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          El Loop de Feedback
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <ul className="font-body text-ink space-y-2">
            {feedbackLoop.map((item, i) => (
              <li key={i} className="p-2 bg-gold/5 rounded">• {item}</li>
            ))}
          </ul>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>El DM de IA es tu companero de juego, no un adversario.</strong>
            <br /><br />
            Esta ahi para crear una historia increible con vos.
            Cuanto mas colabores, mejor sera la experiencia.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Personaliza tu partida para que sea exactamente lo que queres.
          </p>
          <Link href="/guias/personalizar-partida" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Personalizar Partida
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/jugadores-dificiles" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Jugadores Dificiles
          </Link>
          <Link href="/guias/personalizar-partida" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Personalizar <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
