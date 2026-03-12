import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, User, Sword, BookOpen, Sparkles, Heart, Shield } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Como Crear tu Personaje de Rol | Guia Completa',
  description: 'Guia paso a paso para crear un personaje memorable en juegos de rol. Elige raza, clase, trasfondo y dale vida a tu alter ego. Consejos para principiantes.',
  keywords: ['crear personaje rol', 'como hacer personaje D&D', 'personaje RPG', 'ficha de personaje', 'clase y raza rol'],
  alternates: {
    canonical: 'https://rolhub.com/guias/crear-personaje',
  },
  openGraph: {
    title: 'Como Crear tu Personaje de Rol | RolHub',
    description: 'Guia completa para crear un personaje memorable en juegos de rol.',
    type: 'article',
    publishedTime: '2024-01-15',
    authors: ['RolHub'],
  },
}

const archetypes = [
  {
    name: 'El Guerrero',
    icon: Sword,
    description: 'Fuerte, valiente, directo. Resuelve problemas con accion.',
    examples: 'Aragorn, Conan, Brienne de Tarth',
    playstyle: 'Ideal si te gusta la accion y proteger a otros.',
  },
  {
    name: 'El Explorador',
    icon: BookOpen,
    description: 'Agil, curioso, astuto. Encuentra caminos donde otros no ven.',
    examples: 'Legolas, Lara Croft, Han Solo',
    playstyle: 'Ideal si prefieres sigilo, exploracion y resolver puzzles.',
  },
  {
    name: 'El Mistico',
    icon: Sparkles,
    description: 'Sabio, poderoso, enigmatico. Manipula fuerzas mas alla de lo mundano.',
    examples: 'Gandalf, Doctor Strange, Yennefer',
    playstyle: 'Ideal si te atrae la magia y el conocimiento arcano.',
  },
]

export default function CrearPersonajePage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link
          href="/guias"
          className="inline-flex items-center gap-2 text-gold hover:text-gold-bright transition-colors font-ui"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Guias
        </Link>
      </nav>

      {/* Hero */}
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui text-emerald bg-emerald/20 px-2 py-0.5 rounded">
            Principiante
          </span>
          <span className="text-xs font-ui text-parchment/50">
            10 min lectura
          </span>
        </div>
        <h1 className="font-title text-3xl md:text-4xl text-gold mb-4">
          Como Crear tu Personaje
        </h1>
        <p className="font-body text-xl text-parchment/80 leading-relaxed">
          Tu personaje es tu avatar en el mundo de fantasia. Esta guia te ayudara
          a crear uno memorable que disfrutes interpretar.
        </p>
      </header>

      {/* Content */}
      <div className="prose prose-invert prose-gold max-w-none">

        {/* Section 1: Conceptos Basicos */}
        <section className="mb-16">
          <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-3">
            <User className="h-6 w-6" />
            Lo Basico: Quien es tu Personaje
          </h2>

          <div className="font-body text-parchment/90 space-y-4 text-lg leading-relaxed">
            <p>
              Antes de pensar en estadisticas o habilidades, responde estas preguntas simples:
            </p>

            <div className="grid gap-4 my-8">
              <ParchmentPanel className="p-5">
                <h3 className="font-heading text-lg text-gold mb-2">Que tipo de heroe quieres ser?</h3>
                <p className="font-body text-parchment/80 text-base">
                  Un guerrero honorable? Un picaro encantador? Un mago misterioso?
                  Piensa en personajes de peliculas o libros que te gusten.
                </p>
              </ParchmentPanel>

              <ParchmentPanel className="p-5">
                <h3 className="font-heading text-lg text-gold mb-2">Cual es su motivacion?</h3>
                <p className="font-body text-parchment/80 text-base">
                  Por que se aventura? Busca venganza? Quiere proteger a alguien?
                  Necesita dinero? Simplemente busca emociones?
                </p>
              </ParchmentPanel>

              <ParchmentPanel className="p-5">
                <h3 className="font-heading text-lg text-gold mb-2">Cual es su debilidad?</h3>
                <p className="font-body text-parchment/80 text-base">
                  Los personajes perfectos son aburridos. Es impulsivo? Demasiado confiado?
                  Tiene un secreto vergonzoso? Las debilidades crean drama.
                </p>
              </ParchmentPanel>
            </div>

            <ParchmentPanel variant="ornate" className="p-6 my-8">
              <p className="font-body text-parchment/90 italic text-center">
                &ldquo;No necesitas una historia elaborada de 10 paginas.
                Tres frases son suficientes para empezar. El personaje
                se desarrollara naturalmente mientras juegas.&rdquo;
              </p>
            </ParchmentPanel>
          </div>
        </section>

        {/* Section 2: Arquetipos */}
        <section className="mb-16">
          <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-3">
            <Shield className="h-6 w-6" />
            Los Tres Arquetipos Clasicos
          </h2>

          <div className="font-body text-parchment/90 space-y-4 text-lg leading-relaxed">
            <p>
              En RolHub simplificamos la creacion ofreciendote tres arquetipos por mundo.
              Cada uno representa un estilo de juego diferente:
            </p>

            <div className="grid gap-6 my-8">
              {archetypes.map((arch) => (
                <ParchmentPanel key={arch.name} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-gold/10 text-gold">
                      <arch.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-xl text-gold mb-2">{arch.name}</h3>
                      <p className="font-body text-parchment/90 mb-3">{arch.description}</p>
                      <p className="font-body text-parchment/60 text-sm mb-2">
                        <strong className="text-parchment/80">Ejemplos:</strong> {arch.examples}
                      </p>
                      <p className="font-body text-emerald/80 text-sm">
                        {arch.playstyle}
                      </p>
                    </div>
                  </div>
                </ParchmentPanel>
              ))}
            </div>

            <p>
              Estos arquetipos se adaptan a cada mundo. Un &ldquo;Guerrero&rdquo; en fantasia medieval
              es un caballero con espada. En el apocalipsis zombie, es un superviviente
              experto en combate cuerpo a cuerpo.
            </p>
          </div>
        </section>

        {/* Section 3: El Nombre */}
        <section className="mb-16">
          <h2 className="font-heading text-2xl text-gold mb-6">
            El Nombre Perfecto
          </h2>

          <div className="font-body text-parchment/90 space-y-4 text-lg leading-relaxed">
            <p>
              El nombre es lo primero que otros conocen de tu personaje. Algunos consejos:
            </p>

            <div className="grid md:grid-cols-2 gap-4 my-6">
              <ParchmentPanel className="p-4">
                <h4 className="font-heading text-gold mb-2">Si</h4>
                <ul className="font-body text-parchment/80 text-base space-y-1">
                  <li>• Facil de pronunciar y recordar</li>
                  <li>• Acorde al mundo (Thorin en fantasia, no en zombies)</li>
                  <li>• Puede tener un apodo</li>
                </ul>
              </ParchmentPanel>
              <ParchmentPanel className="p-4">
                <h4 className="font-heading text-gold mb-2">Evita</h4>
                <ul className="font-body text-parchment/80 text-base space-y-1">
                  <li>• Nombres de personajes famosos exactos</li>
                  <li>• Nombres ridiculos (a menos que sea intencional)</li>
                  <li>• Nombres imposibles de decir en voz alta</li>
                </ul>
              </ParchmentPanel>
            </div>

            <p>
              En RolHub, te sugerimos nombres apropiados para cada mundo,
              pero siempre puedes escribir el tuyo propio.
            </p>
          </div>
        </section>

        {/* Section 4: Trasfondo */}
        <section className="mb-16">
          <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-3">
            <BookOpen className="h-6 w-6" />
            El Trasfondo: De Donde Vienes
          </h2>

          <div className="font-body text-parchment/90 space-y-4 text-lg leading-relaxed">
            <p>
              El trasfondo explica que hacia tu personaje antes de la aventura.
              No necesita ser largo. Responde:
            </p>

            <ol className="space-y-4 list-none pl-0 my-6">
              <li className="flex gap-4">
                <span className="font-heading text-gold text-xl">1.</span>
                <div>
                  <strong className="text-parchment">Donde creciste?</strong>
                  <p className="text-parchment/70 mt-1">
                    Una ciudad grande, un pueblo pequeno, nomada, huerfano de las calles...
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-heading text-gold text-xl">2.</span>
                <div>
                  <strong className="text-parchment">Que hacias para vivir?</strong>
                  <p className="text-parchment/70 mt-1">
                    Soldado, comerciante, ladron, estudiante, granjero, noble aburrido...
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-heading text-gold text-xl">3.</span>
                <div>
                  <strong className="text-parchment">Que te hizo partir?</strong>
                  <p className="text-parchment/70 mt-1">
                    Un evento que te saco de tu vida normal: tragedia, oportunidad, huida, llamado...
                  </p>
                </div>
              </li>
            </ol>

            <ParchmentPanel className="p-5 my-8">
              <h4 className="font-heading text-gold mb-3">Ejemplo Rapido</h4>
              <p className="font-body text-parchment/80 italic">
                &ldquo;Aldric era herrero en un pueblo fronterizo. Cuando orcos atacaron
                y mataron a su familia, juro venganza. Ahora viaja buscando al lider
                de la horda responsable.&rdquo;
              </p>
              <p className="font-body text-parchment/60 text-sm mt-3">
                Solo 3 frases, pero ya tenemos motivacion, conflicto y direccion.
              </p>
            </ParchmentPanel>
          </div>
        </section>

        {/* Section 5: Relaciones */}
        <section className="mb-16">
          <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-3">
            <Heart className="h-6 w-6" />
            Relaciones y Conexiones
          </h2>

          <div className="font-body text-parchment/90 space-y-4 text-lg leading-relaxed">
            <p>
              Los personajes no existen en un vacio. Piensa en al menos una persona
              importante en su vida:
            </p>

            <ul className="space-y-3 my-6">
              <li className="flex items-start gap-3">
                <span className="text-gold">•</span>
                <span><strong className="text-parchment">Un aliado:</strong> Alguien que te ayudaria si lo necesitaras.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold">•</span>
                <span><strong className="text-parchment">Un enemigo:</strong> Alguien que te quiere ver fracasar.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold">•</span>
                <span><strong className="text-parchment">Un misterio:</strong> Alguien de tu pasado cuyo destino desconoces.</span>
              </li>
            </ul>

            <p>
              El DM puede usar estas conexiones para crear momentos dramaticos.
              Imagina encontrarte a tu viejo mentor convertido en villano,
              o descubrir que tu hermano desaparecido esta vivo.
            </p>
          </div>
        </section>

        {/* Section 6: En RolHub */}
        <section className="mb-16">
          <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-3">
            <Sparkles className="h-6 w-6" />
            Creacion en RolHub (2 minutos)
          </h2>

          <div className="font-body text-parchment/90 space-y-4 text-lg leading-relaxed">
            <p>
              Hemos simplificado el proceso para que puedas empezar a jugar rapido:
            </p>

            <ol className="space-y-4 list-none pl-0 my-6">
              <li className="flex gap-4">
                <span className="font-heading text-gold text-xl">1.</span>
                <div>
                  <strong className="text-parchment">Elige un arquetipo</strong>
                  <p className="text-parchment/70 mt-1">
                    Selecciona uno de los 3 arquetipos disponibles para tu mundo.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-heading text-gold text-xl">2.</span>
                <div>
                  <strong className="text-parchment">Personaliza el nombre</strong>
                  <p className="text-parchment/70 mt-1">
                    Usa el nombre sugerido o escribe el tuyo.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-heading text-gold text-xl">3.</span>
                <div>
                  <strong className="text-parchment">Lee el trasfondo</strong>
                  <p className="text-parchment/70 mt-1">
                    Cada arquetipo tiene un trasfondo predefinido que puedes usar tal cual.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-heading text-gold text-xl">4.</span>
                <div>
                  <strong className="text-parchment">Empieza a jugar</strong>
                  <p className="text-parchment/70 mt-1">
                    El sistema genera tus estadisticas automaticamente. No hay nada mas que hacer.
                  </p>
                </div>
              </li>
            </ol>

            <ParchmentPanel variant="ornate" className="p-6 my-8">
              <p className="font-body text-parchment/90 text-center">
                Tip: Tu personaje evolucionara mientras juegas. No te preocupes
                si al principio no tienes todo claro. Las mejores historias
                se descubren en el camino.
              </p>
            </ParchmentPanel>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16">
          <ParchmentPanel variant="ornate" className="p-8 text-center">
            <h2 className="font-heading text-2xl text-gold mb-4">
              Crea tu Primer Personaje
            </h2>
            <p className="font-body text-parchment/80 mb-6 max-w-xl mx-auto">
              Elige un mundo, selecciona tu arquetipo, y empieza tu aventura.
              En 2 minutos estaras jugando.
            </p>
            <Link
              href="/onboarding"
              className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors"
            >
              Empezar Ahora
            </Link>
          </ParchmentPanel>
        </section>

      </div>

      {/* Navigation */}
      <nav className="border-t border-gold/20 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link
            href="/guias/como-jugar"
            className="flex items-center gap-2 text-parchment/60 hover:text-gold transition-colors font-ui"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior: Como Jugar en RolHub
          </Link>
          <Link
            href="/guias/mejores-mundos"
            className="flex items-center gap-2 text-gold hover:text-gold-bright transition-colors font-ui"
          >
            Siguiente: Los Mejores Mundos para Empezar
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
            "headline": "Como Crear tu Personaje de Rol: Guia Completa",
            "description": "Guia paso a paso para crear un personaje memorable en juegos de rol.",
            "author": {
              "@type": "Organization",
              "name": "RolHub"
            },
            "publisher": {
              "@type": "Organization",
              "name": "RolHub",
              "url": "https://rolhub.com"
            },
            "datePublished": "2024-01-15",
            "dateModified": "2024-01-15",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://rolhub.com/guias/crear-personaje"
            }
          })
        }}
      />
    </article>
  )
}
