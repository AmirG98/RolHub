import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Pencil, CheckCircle, XCircle, Sparkles, MessageSquare, Eye, Swords } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Como Escribir Buenas Acciones en Rol: Guia Completa | RolHub',
  description: 'Aprende a escribir acciones que generan mejores narraciones. Tips para describir combate, dialogo, exploracion y mas.',
  keywords: [
    'como escribir acciones rol',
    'describir acciones D&D',
    'mejorar narracion rol',
    'tips roleplay',
    'acciones descriptivas'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/escribir-acciones',
  },
  openGraph: {
    title: 'Como Escribir Buenas Acciones en Rol | RolHub',
    description: 'Mejora tus descripciones y obtene mejores narraciones del DM.',
    type: 'article',
    publishedTime: '2024-01-15',
    authors: ['RolHub'],
  },
}

const examples = [
  {
    category: 'Combate',
    icon: Swords,
    bad: 'Ataco al orco.',
    good: 'Rujo de furia y cargo hacia el orco, levantando mi hacha en un arco descendente hacia su hombro.',
    better: 'Aprovechando que el orco esta distraido con mi companero, me deslizo por su costado ciego y clavo mi daga en el hueco de su armadura, justo debajo del brazo.',
    why: 'El DM puede narrar mejor cuando sabe COMO atacas, no solo QUE atacas.',
  },
  {
    category: 'Dialogo',
    icon: MessageSquare,
    bad: 'Convenzo al guardia.',
    good: 'Le digo al guardia: "Escucha, los dos sabemos que esto es una perdida de tiempo. Dejame pasar y olvidemos que esto paso."',
    better: 'Me acerco al guardia con una sonrisa confiada, saco discretamente una moneda de oro y la hago girar entre mis dedos mientras digo: "Que tal si hacemos un trato que nos beneficie a ambos?"',
    why: 'Decir exactamente que dices le da al DM material para responder como el NPC.',
  },
  {
    category: 'Exploracion',
    icon: Eye,
    bad: 'Reviso la habitacion.',
    good: 'Examino las paredes buscando mecanismos ocultos, pasando mi mano por las piedras.',
    better: 'Me arrodillo junto a la puerta y examino el polvo del suelo, buscando huellas recientes. Luego levanto la vista hacia el techo, buscando cualquier irregularidad en las piedras.',
    why: 'Ser especifico sobre donde y como buscas puede revelar cosas que "revisar" general no encontraria.',
  },
  {
    category: 'Sigilo',
    icon: Eye,
    bad: 'Me escondo.',
    good: 'Me pego contra la pared en la sombra detras de la columna, conteniendo la respiracion.',
    better: 'Espero a que el guardia mire hacia otro lado, luego me muevo silenciosamente de columna en columna, usando las sombras del candelabro parpadeante como cobertura.',
    why: 'Describir tu metodo de ocultamiento ayuda al DM a determinar que tan efectivo es.',
  },
]

const techniques = [
  {
    title: 'Usa los cinco sentidos',
    description: 'No solo describas lo que haces — incluye lo que ves, escuchas, hueles, tocas.',
    example: 'Abro lentamente la puerta, sintiendo la madera humeda bajo mis dedos. El olor a podredumbre me golpea inmediatamente.',
  },
  {
    title: 'Incluye emocion',
    description: 'Tu personaje tiene sentimientos. Muestralos.',
    example: 'Con el corazon latiendome en los oidos, levanto mi espada con manos temblorosas y enfrento al dragon.',
  },
  {
    title: 'Menciona tu motivacion',
    description: 'Por que tu personaje hace esto? Eso informa al DM.',
    example: 'Recordando la promesa que le hice a mi padre moribundo, me lanzo hacia el villano sin importarme el peligro.',
  },
  {
    title: 'Usa el entorno',
    description: 'Interactua con los objetos y el espacio que el DM describio.',
    example: 'Agarro la silla que mencionaste y la lanzo hacia el guardia mientras mi companero escapa por la ventana.',
  },
  {
    title: 'Se especifico pero no dictador',
    description: 'Describe tu intento, no el resultado. Deja que el DM determine si funciona.',
    example: 'BIEN: "Intento saltar sobre la mesa y taclear al arquero" vs MAL: "Salto sobre la mesa, lo tackleo y le quito el arco"',
  },
  {
    title: 'Habla en primera persona',
    description: 'Es mas inmersivo decir "hago" que "mi personaje hace".',
    example: 'BIEN: "Miro al rey directo a los ojos y digo..." vs MENOS: "Mi personaje mira al rey..."',
  },
]

const commonMistakes = [
  {
    mistake: 'Ser demasiado vago',
    problem: '"Hago algo" no le da nada al DM para trabajar.',
    fix: 'Se especifico. Que haces exactamente? Como? Donde?',
  },
  {
    mistake: 'Dictar resultados',
    problem: '"Lo mato" asume el exito. Eso lo decide el DM/dados.',
    fix: 'Describe tu intento: "Intento cortarle el cuello con mi espada".',
  },
  {
    mistake: 'Ignorar el contexto',
    problem: 'Hacer cosas que no tienen sentido en la situacion actual.',
    fix: 'Presta atencion a la narracion y actua coherentemente.',
  },
  {
    mistake: 'Acciones imposibles',
    problem: '"Vuelo hacia el castillo" cuando tu personaje no vuela.',
    fix: 'Respeta las capacidades de tu personaje.',
  },
  {
    mistake: 'Solo mecanicas',
    problem: '"Uso mi habilidad de Persuasion" sin contexto narrativo.',
    fix: 'Describe QUE dices o haces, no solo que habilidad usas.',
  },
]

export default function EscribirAccionesPage() {
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
            10 min lectura
          </span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold">
            <Pencil className="h-8 w-8 text-shadow" />
          </div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Como Escribir Buenas Acciones
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          La calidad de la narracion que recibis depende directamente de la
          calidad de las acciones que escribis. Mejor input = mejor output.
          Aca te ensenamos como hacerlo.
        </p>
      </header>

      {/* The Golden Rule */}
      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h2 className="font-heading text-xl text-ink mb-3 text-center">La Regla de Oro</h2>
          <p className="font-body text-ink text-lg text-center leading-relaxed">
            <strong>Describe el COMO, no solo el QUE.</strong>
            <br /><br />
            "Ataco" es que. "Giro mi espada en un arco ascendente hacia su cuello" es como.
            El segundo le da al DM material para narrar algo epico.
          </p>
        </ParchmentPanel>
      </section>

      {/* Examples by Category */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Ejemplos por Categoria
        </h2>

        <div className="space-y-6">
          {examples.map((ex) => (
            <ParchmentPanel key={ex.category} className="p-6 border border-gold-dim">
              <div className="flex items-center gap-3 mb-4">
                <ex.icon className="h-6 w-6 text-gold-dim" />
                <h3 className="font-heading text-xl text-ink">{ex.category}</h3>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-blood/10 rounded-lg border-l-4 border-blood">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="h-4 w-4 text-blood" />
                    <span className="font-heading text-blood text-sm">Basico</span>
                  </div>
                  <p className="font-body text-ink italic">"{ex.bad}"</p>
                </div>

                <div className="p-3 bg-gold/10 rounded-lg border-l-4 border-gold-dim">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-gold-dim" />
                    <span className="font-heading text-gold-dim text-sm">Bueno</span>
                  </div>
                  <p className="font-body text-ink italic">"{ex.good}"</p>
                </div>

                <div className="p-3 bg-emerald/10 rounded-lg border-l-4 border-emerald">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-emerald" />
                    <span className="font-heading text-emerald text-sm">Excelente</span>
                  </div>
                  <p className="font-body text-ink italic">"{ex.better}"</p>
                </div>

                <p className="font-body text-ink text-sm mt-2">
                  <strong>Por que funciona:</strong> {ex.why}
                </p>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      {/* Techniques */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tecnicas para Mejorar
        </h2>

        <div className="space-y-4">
          {techniques.map((tech) => (
            <ParchmentPanel key={tech.title} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{tech.title}</h3>
              <p className="font-body text-ink mb-3">{tech.description}</p>
              <div className="p-3 bg-gold/10 rounded-lg">
                <span className="font-ui text-sm text-gold-dim">Ejemplo:</span>
                <p className="font-body text-ink italic">{tech.example}</p>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      {/* Common Mistakes */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Errores Comunes
        </h2>

        <div className="space-y-4">
          {commonMistakes.map((err) => (
            <ParchmentPanel key={err.mistake} className="p-5 border border-gold-dim">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-blood mt-0.5" />
                <div>
                  <h3 className="font-heading text-ink mb-1">{err.mistake}</h3>
                  <p className="font-body text-ink text-sm mb-2">
                    <strong>Problema:</strong> {err.problem}
                  </p>
                  <p className="font-body text-ink text-sm">
                    <strong className="text-emerald">Solucion:</strong> {err.fix}
                  </p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      {/* Quick Reference */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Checklist Rapido
        </h2>

        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">Antes de enviar tu accion, preguntate:</p>
          <div className="space-y-2">
            {[
              'Describo COMO hago la accion, no solo que?',
              'Incluyo algun detalle sensorial o emocional?',
              'Respeto las capacidades de mi personaje?',
              'Describo un intento, no un resultado garantizado?',
              'Tiene sentido en el contexto actual de la historia?',
              'Uso el entorno que el DM describio?',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gold-dim rounded" />
                <span className="font-body text-ink">{item}</span>
              </div>
            ))}
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
            La mejor forma de mejorar es escribiendo. Empeza una partida
            y aplica estas tecnicas.
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
            href="/guias"
            className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui"
          >
            <ArrowLeft className="h-4 w-4" />
            Todas las Guias
          </Link>
          <Link
            href="/guias/roleplay-101"
            className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold"
          >
            Siguiente: Roleplay 101
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
            "headline": "Como Escribir Buenas Acciones en Rol",
            "description": "Aprende a escribir acciones que generan mejores narraciones.",
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
              "@id": "https://rol-hub.com/guias/escribir-acciones"
            }
          })
        }}
      />
    </article>
  )
}
