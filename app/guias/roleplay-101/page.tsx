import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Theater, MessageSquare, Heart, User, Lightbulb, Volume2 } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Roleplay 101: Como Meterte en el Personaje | RolHub',
  description: 'Aprende a hacer roleplay efectivo. Como actuar como tu personaje, hablar en primera persona, y crear momentos memorables.',
  keywords: [
    'como hacer roleplay',
    'actuar personaje rol',
    'roleplay para principiantes',
    'hablar en personaje',
    'tips roleplay D&D'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/roleplay-101',
  },
  openGraph: {
    title: 'Roleplay 101: Metete en el Personaje | RolHub',
    description: 'La guia definitiva para hacer roleplay como un pro.',
    type: 'article',
    publishedTime: '2024-01-15',
    authors: ['RolHub'],
  },
}

const basics = [
  {
    title: 'Primera Persona',
    icon: User,
    description: 'Habla como tu personaje, no sobre tu personaje.',
    bad: 'Mi personaje le dice al guardia que lo deje pasar.',
    good: 'Le digo al guardia: "Dejame pasar, tengo asuntos urgentes con el rey."',
  },
  {
    title: 'Pensar Como el Personaje',
    icon: Lightbulb,
    description: 'Preguntate: que haria EL, no que harias VOS.',
    bad: 'Se que el villano esta detras de la puerta, asi que preparo un ataque.',
    good: 'Mi personaje sospecha algo, asi que entra con cautela.',
  },
  {
    title: 'Expresar Emociones',
    icon: Heart,
    description: 'Tu personaje siente cosas. Muestralas.',
    bad: 'Ataco al orco.',
    good: 'Con lagrimas de furia por la muerte de mi companero, me lanzo contra el orco.',
  },
  {
    title: 'Tener una Voz',
    icon: Volume2,
    description: 'Una forma de hablar distintiva hace memorable al personaje.',
    example: 'Un barbaro podria hablar en frases cortas. Un noble, de forma rebuscada.',
  },
]

const levelUp = [
  {
    level: 'Nivel 1: Basico',
    description: 'Describes acciones en tercera persona, tomas decisiones racionales.',
    example: '"Mi personaje ataca al goblin."',
  },
  {
    level: 'Nivel 2: Primera Persona',
    description: 'Hablas como el personaje, describes tus acciones directamente.',
    example: '"Levanto mi espada y cargo contra el goblin."',
  },
  {
    level: 'Nivel 3: Con Emocion',
    description: 'Incluyes los sentimientos y motivaciones del personaje.',
    example: '"Con el corazon acelerado, levanto mi espada y cargo contra el goblin que amenazo a mi familia."',
  },
  {
    level: 'Nivel 4: Dialogo Directo',
    description: 'Hablas directamente con los NPCs como tu personaje.',
    example: '"¡Por mi familia!" grito mientras cargo contra el goblin.',
  },
  {
    level: 'Nivel 5: Inmersion Total',
    description: 'Adoptas manierismos, acento, forma de pensar del personaje.',
    example: 'Te expresas consistentemente como el personaje, incluyendo sus debilidades y contradicciones.',
  },
]

const techniques = [
  {
    title: 'El Monologlo Interno',
    description: 'Comparte brevemente lo que tu personaje esta pensando.',
    example: '"Mientras espero que el guardia responda, pienso en como me escabullire si dice que no."',
    when: 'Util para escenas de tension o decision.',
  },
  {
    title: 'Reacciones Fisicas',
    description: 'Describe como reacciona el cuerpo de tu personaje.',
    example: '"Siento un escalofrio recorrer mi espalda cuando el nigromante entra a la habitacion."',
    when: 'Para agregar inmersion sin necesidad de dialogo.',
  },
  {
    title: 'Llamar a tu Trasfondo',
    description: 'Referencia el pasado de tu personaje cuando sea relevante.',
    example: '"Esto me recuerda al incendio que destruyo mi aldea. Aprieto los punos y avanzo."',
    when: 'Para dar profundidad y conectar con la historia.',
  },
  {
    title: 'Preguntas en Personaje',
    description: 'Haz preguntas como tu personaje, no como jugador.',
    example: '"Buen hombre, podrias indicarme donde queda la taberna mas cercana?" vs "Hay una taberna?"',
    when: 'En cualquier interaccion con NPCs.',
  },
  {
    title: 'Fallos con Estilo',
    description: 'Roleplay las consecuencias de tus fallos.',
    example: 'Si fallas una tirada de sigilo: "Maldigo por lo bajo cuando mi pie pisa una rama seca."',
    when: 'Despues de tiradas fallidas.',
  },
]

const characterSheet = [
  {
    question: 'Como habla tu personaje?',
    examples: ['Formal y educado', 'Sarcastico', 'Pocas palabras', 'Usando refranes', 'Con acento regional'],
  },
  {
    question: 'Cual es su gesto o tic nervioso?',
    examples: ['Se toca la cicatriz', 'Juega con una moneda', 'Se muerde el labio', 'Mira hacia las salidas'],
  },
  {
    question: 'Que lo hace enojar?',
    examples: ['La injusticia', 'Que lo subestimen', 'Las mentiras', 'Los cobardes'],
  },
  {
    question: 'Que lo hace feliz?',
    examples: ['Una buena pelea', 'Ayudar a otros', 'El oro', 'El conocimiento'],
  },
  {
    question: 'Cual es su mayor miedo?',
    examples: ['Morir solo', 'Fallarle a alguien', 'El fuego', 'Volver a su pasado'],
  },
]

export default function Roleplay101Page() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link
          href="/guias"
          className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Guias
        </Link>
      </nav>

      {/* Hero */}
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-gold-dim px-2 py-1 rounded">
            Intermedio
          </span>
          <span className="text-xs font-ui font-semibold text-parchment">
            12 min lectura
          </span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold">
            <Theater className="h-8 w-8 text-shadow" />
          </div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Roleplay 101
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Roleplay es el arte de actuar como tu personaje. No se trata de ser
          actor profesional — se trata de pensar, hablar y sentir como alguien
          que no sos vos. Esta guia te ensena como.
        </p>
      </header>

      {/* What is Roleplay */}
      <section className="mb-12">
        <ParchmentPanel className="p-6 border border-gold-dim">
          <h2 className="font-heading text-xl text-ink mb-3">Que es el Roleplay?</h2>
          <p className="font-body text-ink leading-relaxed">
            Roleplay (RP) significa "interpretar un rol". En juegos de rol,
            significa <strong>actuar como tu personaje lo haria</strong>, no como
            vos lo harias. Implica tomar decisiones basadas en su personalidad,
            hablar con su voz, y sentir sus emociones.
          </p>
        </ParchmentPanel>
      </section>

      {/* The Basics */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Los Fundamentos
        </h2>

        <div className="space-y-4">
          {basics.map((basic) => (
            <ParchmentPanel key={basic.title} className="p-5 border border-gold-dim">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-gold-dim flex-shrink-0">
                  <basic.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-ink mb-2">{basic.title}</h3>
                  <p className="font-body text-ink mb-3">{basic.description}</p>

                  {basic.bad && (
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-2 bg-blood/10 rounded border-l-4 border-blood">
                        <span className="font-ui text-xs text-blood">Evita</span>
                        <p className="font-body text-ink text-sm italic">"{basic.bad}"</p>
                      </div>
                      <div className="p-2 bg-emerald/10 rounded border-l-4 border-emerald">
                        <span className="font-ui text-xs text-emerald">Mejor</span>
                        <p className="font-body text-ink text-sm italic">"{basic.good}"</p>
                      </div>
                    </div>
                  )}

                  {basic.example && (
                    <p className="font-body text-ink text-sm italic mt-2">
                      Ejemplo: {basic.example}
                    </p>
                  )}
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      {/* Roleplay Levels */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Niveles de Roleplay
        </h2>

        <p className="font-body text-parchment mb-6 text-lg">
          No tenes que empezar siendo un actor. El roleplay se construye gradualmente.
        </p>

        <div className="space-y-3">
          {levelUp.map((level, i) => (
            <ParchmentPanel key={level.level} className="p-4 border border-gold-dim/50">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-shadow font-bold">{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-heading text-ink">{level.level}</h3>
                  <p className="font-body text-ink text-sm mb-2">{level.description}</p>
                  <p className="font-body text-ink text-sm italic bg-gold/10 p-2 rounded">
                    "{level.example}"
                  </p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      {/* Techniques */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tecnicas Avanzadas
        </h2>

        <div className="space-y-4">
          {techniques.map((tech) => (
            <ParchmentPanel key={tech.title} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{tech.title}</h3>
              <p className="font-body text-ink mb-2">{tech.description}</p>
              <div className="p-3 bg-gold/10 rounded mb-2">
                <p className="font-body text-ink italic text-sm">"{tech.example}"</p>
              </div>
              <p className="font-ui text-sm text-ink">
                <strong>Cuando usar:</strong> {tech.when}
              </p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      {/* Character Worksheet */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Conoce a tu Personaje
        </h2>

        <p className="font-body text-parchment mb-6 text-lg">
          Para hacer buen roleplay, necesitas conocer a tu personaje.
          Responde estas preguntas antes de jugar:
        </p>

        <div className="space-y-4">
          {characterSheet.map((item) => (
            <ParchmentPanel key={item.question} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-3">{item.question}</h3>
              <div className="flex flex-wrap gap-2">
                {item.examples.map((ex) => (
                  <span key={ex} className="text-sm font-ui text-ink bg-parchment-dark/50 px-3 py-1 rounded">
                    {ex}
                  </span>
                ))}
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      {/* Don't Worry */}
      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h2 className="font-heading text-xl text-ink mb-4 text-center">
            No Te Preocupes por Ser "Perfecto"
          </h2>
          <div className="font-body text-ink space-y-3 leading-relaxed">
            <p>
              El roleplay no tiene que ser actuacion de Shakespeare.
              <strong> No tenes que hacer voces ni actuar dramaticamente.</strong>
            </p>
            <p>
              Simplemente pensar "que haria mi personaje aca?" antes de actuar
              ya es roleplay. Decir "mi personaje se enoja" cuenta.
              No hay forma incorrecta de hacerlo.
            </p>
            <p>
              Lo importante es <strong>divertirte</strong> y
              <strong> darle vida a tu personaje</strong>, a tu manera.
            </p>
          </div>
        </ParchmentPanel>
      </section>

      {/* CTA */}
      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Hora de Practicar
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            La mejor forma de aprender roleplay es haciendolo.
            Empeza simple y anda agregando capas con el tiempo.
          </p>
          <Link
            href="/onboarding"
            className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold"
          >
            Empezar a Jugar
          </Link>
        </ParchmentPanel>
      </section>

      {/* Navigation */}
      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link
            href="/guias/escribir-acciones"
            className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior: Escribir Acciones
          </Link>
          <Link
            href="/guias/tension-dramatica"
            className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold"
          >
            Siguiente: Tension Dramatica
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Roleplay 101: Como Meterte en el Personaje",
            "description": "Aprende a hacer roleplay efectivo en juegos de rol.",
            "author": {
              "@type": "Organization",
              "name": "RolHub"
            },
            "publisher": {
              "@type": "Organization",
              "name": "RolHub",
              "url": "https://rol-hub.com"
            },
            "datePublished": "2024-01-15",
            "dateModified": new Date().toISOString().split('T')[0],
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://rol-hub.com/guias/roleplay-101"
            }
          })
        }}
      />
    </article>
  )
}
