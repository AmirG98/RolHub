import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Users, Sparkles, BookOpen, Dice6, MessageCircle, Heart } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Que es un Juego de Rol (RPG): Guia Definitiva 2024 | RolHub',
  description: 'Aprende que es un juego de rol, como se juega, y por que millones lo disfrutan. Guia completa para principiantes con ejemplos, tipos de RPG y como empezar hoy gratis.',
  keywords: [
    'que es un juego de rol',
    'juego de rol significado',
    'RPG que es',
    'como jugar rol',
    'juegos de rol para principiantes',
    'dungeons and dragons que es',
    'rol de mesa',
    'juego de rol online',
    'RPG en español',
    'aprender a jugar rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/que-es-rol',
  },
  openGraph: {
    title: 'Que es un Juego de Rol: La Guia Definitiva para Principiantes',
    description: 'Descubre el mundo de los juegos de rol. Aprende que son, como funcionan y empieza a jugar hoy mismo gratis.',
    type: 'article',
    publishedTime: '2024-01-15',
    modifiedTime: new Date().toISOString(),
    authors: ['RolHub'],
    section: 'Guias',
    tags: ['juego de rol', 'RPG', 'principiantes', 'tutorial'],
    url: 'https://rol-hub.com/guias/que-es-rol',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Que es un Juego de Rol: Guia Completa',
    description: 'Aprende que es un RPG y como empezar a jugar hoy mismo.',
  },
}

// FAQ data for schema and display
const faqs = [
  {
    question: 'Que es un juego de rol?',
    answer: 'Un juego de rol (RPG) es una actividad donde los participantes crean personajes ficticios y viven aventuras en mundos imaginarios. Un Director de Juego narra la historia mientras los jugadores toman decisiones que afectan el desarrollo de la trama.'
  },
  {
    question: 'Necesito experiencia previa para jugar rol?',
    answer: 'No, no necesitas experiencia previa. Los juegos de rol modernos y plataformas como RolHub estan disenados para principiantes. Solo necesitas imaginacion y ganas de divertirte.'
  },
  {
    question: 'Cuanto tiempo dura una partida de rol?',
    answer: 'Depende del formato. Un one-shot (aventura corta) dura entre 1-3 horas. Una campana puede extenderse por meses con sesiones semanales de 2-4 horas. En RolHub puedes jugar sesiones de 30-60 minutos.'
  },
  {
    question: 'Puedo jugar rol solo, sin grupo?',
    answer: 'Si, existen opciones para jugar en solitario. RolHub ofrece un Director de Juego con IA que te permite vivir aventuras completas sin necesidad de reunir un grupo de amigos.'
  },
  {
    question: 'Cual es la diferencia entre juego de rol de mesa y videojuegos RPG?',
    answer: 'En un juego de rol de mesa no hay limitaciones tecnicas: puedes intentar cualquier accion que imagines. Los videojuegos RPG tienen opciones predefinidas, mientras que en rol de mesa la historia se adapta a tus decisiones en tiempo real.'
  },
]

const sections = [
  {
    id: 'definicion',
    title: 'Que es un Juego de Rol: Definicion Simple',
    icon: BookOpen,
  },
  {
    id: 'como-funciona',
    title: 'Como Funciona una Partida de Rol',
    icon: Dice6,
  },
  {
    id: 'elementos',
    title: 'Elementos Clave de los Juegos de Rol',
    icon: Users,
  },
  {
    id: 'beneficios',
    title: 'Beneficios de Jugar Rol',
    icon: Heart,
  },
  {
    id: 'mitos',
    title: 'Mitos sobre los Juegos de Rol',
    icon: MessageCircle,
  },
  {
    id: 'empezar',
    title: 'Como Empezar a Jugar Rol Hoy',
    icon: Sparkles,
  },
]

export default function QueEsRolPage() {
  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://rol-hub.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Guias de Rol",
        "item": "https://rol-hub.com/guias"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Que es un Juego de Rol",
        "item": "https://rol-hub.com/guias/que-es-rol"
      }
    ]
  }

  // Article schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Que es un Juego de Rol: La Guia Definitiva para Principiantes",
    "description": "Aprende que es un juego de rol, como se juega, y por que millones lo disfrutan. Guia completa para principiantes.",
    "image": "https://rol-hub.com/og-que-es-rol.png",
    "author": {
      "@type": "Organization",
      "name": "RolHub",
      "url": "https://rol-hub.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "RolHub",
      "url": "https://rol-hub.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rol-hub.com/logo.png"
      }
    },
    "datePublished": "2024-01-15",
    "dateModified": new Date().toISOString().split('T')[0],
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://rol-hub.com/guias/que-es-rol"
    },
    "articleSection": "Guias",
    "keywords": "juego de rol, RPG, que es rol, como jugar rol, principiantes, dungeons and dragons",
    "wordCount": 2500,
    "inLanguage": "es"
  }

  // FAQ schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Breadcrumb Navigation */}
      <nav className="mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm font-ui text-parchment/60">
          <li><Link href="/" className="hover:text-gold">Inicio</Link></li>
          <li>/</li>
          <li><Link href="/guias" className="hover:text-gold">Guias</Link></li>
          <li>/</li>
          <li className="text-gold">Que es un Juego de Rol</li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui text-emerald bg-emerald/20 px-2 py-0.5 rounded">
            Principiante
          </span>
          <span className="text-xs font-ui text-parchment/50">
            8 min lectura
          </span>
          <span className="text-xs font-ui text-parchment/50">
            Actualizado 2024
          </span>
        </div>
        <h1 className="font-title text-3xl md:text-4xl text-gold mb-4">
          Que es un Juego de Rol (RPG): Guia Completa para Principiantes
        </h1>
        <p className="font-body text-xl text-parchment/80 leading-relaxed">
          Los <strong>juegos de rol</strong> (RPG) te permiten vivir aventuras donde <em>tu</em> decides que hacer.
          No hay guion fijo: cada decision cambia el rumbo de la historia.
          En esta guia aprenderas todo lo necesario para empezar a jugar hoy mismo.
        </p>
      </header>

      {/* Table of Contents */}
      <ParchmentPanel className="p-6 mb-12">
        <h2 className="font-heading text-lg text-gold-dim mb-4">Contenido de esta guia</h2>
        <nav aria-label="Tabla de contenidos">
          <ul className="grid md:grid-cols-2 gap-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="flex items-center gap-2 text-ink/80 hover:text-gold-dim transition-colors font-ui text-sm"
                >
                  <section.icon className="h-4 w-4 text-gold-dim/80" />
                  {section.title}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#faq"
                className="flex items-center gap-2 text-ink/80 hover:text-gold-dim transition-colors font-ui text-sm"
              >
                <MessageCircle className="h-4 w-4 text-gold-dim/80" />
                Preguntas Frecuentes
              </a>
            </li>
          </ul>
        </nav>
      </ParchmentPanel>

      {/* Content */}
      <div className="prose prose-invert prose-gold max-w-none">

        {/* Section 1: Definition */}
        <section id="definicion" className="mb-16 scroll-mt-20">
          <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-3">
            <BookOpen className="h-6 w-6" />
            Que es un Juego de Rol: Definicion Simple
          </h2>

          <div className="font-body text-parchment/90 space-y-4 text-lg leading-relaxed">
            <p>
              Un <strong className="text-gold">juego de rol</strong> (tambien conocido como <strong>RPG</strong> por sus siglas en ingles,
              <em> Role-Playing Game</em>) es una actividad donde los participantes crean personajes ficticios
              y viven aventuras en mundos imaginarios guiados por un <strong>Director de Juego</strong> (DM o Game Master).
            </p>

            <p>
              Piensalo como una combinacion de <em>teatro improvisado</em>, <em>narracion de historias</em>
              y <em>juegos de mesa</em>. A diferencia de los videojuegos, en un juego de rol de mesa
              no hay limitaciones tecnicas: puedes intentar cualquier accion que imagines.
            </p>

            <ParchmentPanel variant="ornate" className="p-6 my-8">
              <p className="font-body text-parchment/90 italic text-center">
                &ldquo;En el rol, tu imaginacion es el unico limite.
                Puedes ser un guerrero que salva reinos, un detective que resuelve misterios,
                o un superviviente en un apocalipsis zombie.&rdquo;
              </p>
            </ParchmentPanel>

            <h3 className="font-heading text-xl text-parchment mb-3">Tipos de juegos de rol</h3>
            <ul className="space-y-2">
              <li><strong className="text-gold">Rol de mesa:</strong> El formato tradicional con dados, fichas de personaje y un grupo reunido (presencial u online).</li>
              <li><strong className="text-gold">Rol en vivo (LARP):</strong> Los participantes interpretan fisicamente a sus personajes, como teatro interactivo.</li>
              <li><strong className="text-gold">Rol con IA:</strong> Plataformas como RolHub donde una inteligencia artificial actua como Director de Juego.</li>
            </ul>
          </div>
        </section>

        {/* Section 2: How it Works */}
        <section id="como-funciona" className="mb-16 scroll-mt-20">
          <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-3">
            <Dice6 className="h-6 w-6" />
            Como Funciona una Partida de Rol
          </h2>

          <div className="font-body text-parchment/90 space-y-4 text-lg leading-relaxed">
            <p>
              Una <strong>partida de rol</strong> tiene dos roles principales que interactuan para crear la historia:
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <ParchmentPanel className="p-6">
                <h3 className="font-heading text-lg text-gold-dim mb-3">El Director de Juego (DM)</h3>
                <p className="font-body text-ink/80 text-base">
                  Narra la historia, controla a los personajes no jugadores (NPCs),
                  describe el mundo y arbitra las reglas. En <Link href="/onboarding" className="text-gold-dim hover:text-shadow underline">RolHub</Link>, este rol lo cumple nuestra IA.
                </p>
              </ParchmentPanel>

              <ParchmentPanel className="p-6">
                <h3 className="font-heading text-lg text-gold-dim mb-3">Los Jugadores</h3>
                <p className="font-body text-ink/80 text-base">
                  Cada jugador controla un personaje protagonista.
                  Toman decisiones, interactuan con el mundo y determinan el rumbo de la aventura.
                </p>
              </ParchmentPanel>
            </div>

            <h3 className="font-heading text-xl text-parchment mb-4">El ciclo basico de juego:</h3>

            <ol className="space-y-4 list-none pl-0">
              <li className="flex gap-4">
                <span className="font-heading text-gold text-xl flex-shrink-0">1.</span>
                <div>
                  <strong className="text-parchment">El DM describe la escena:</strong>
                  <p className="text-parchment/70 mt-1">
                    &ldquo;Estan frente a una taberna en ruinas. La puerta chirria con el viento.
                    Escuchan voces adentro.&rdquo;
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-heading text-gold text-xl flex-shrink-0">2.</span>
                <div>
                  <strong className="text-parchment">El jugador decide su accion:</strong>
                  <p className="text-parchment/70 mt-1">
                    &ldquo;Quiero acercarme sigilosamente a la ventana para espiar quienes estan adentro.&rdquo;
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-heading text-gold text-xl flex-shrink-0">3.</span>
                <div>
                  <strong className="text-parchment">Se resuelve la accion:</strong>
                  <p className="text-parchment/70 mt-1">
                    Dependiendo del sistema, se puede usar dados para determinar el exito,
                    o el DM narra el resultado basado en la situacion.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-heading text-gold text-xl flex-shrink-0">4.</span>
                <div>
                  <strong className="text-parchment">La historia avanza:</strong>
                  <p className="text-parchment/70 mt-1">
                    El DM describe las consecuencias y el ciclo se repite, creando una narrativa emergente.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* Section 3: Key Elements */}
        <section id="elementos" className="mb-16 scroll-mt-20">
          <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-3">
            <Users className="h-6 w-6" />
            Elementos Clave de los Juegos de Rol
          </h2>

          <div className="font-body text-parchment/90 space-y-6 text-lg leading-relaxed">

            <div>
              <h3 className="font-heading text-xl text-parchment mb-3">1. Tu Personaje</h3>
              <p>
                Creas un <strong>personaje</strong> con nombre, historia, habilidades y personalidad.
                Es tu avatar en el mundo de ficcion. Puedes ser un mago misterioso, un guerrero honorable,
                un picaro encantador, o cualquier concepto que imagines. Aprende mas en nuestra
                <Link href="/guias/crear-personaje" className="text-gold hover:text-gold-bright"> guia de creacion de personajes</Link>.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-xl text-parchment mb-3">2. El Mundo o Ambientacion</h3>
              <p>
                La historia ocurre en un universo con sus propias reglas. Puede ser fantasia medieval,
                ciencia ficcion, horror, o cualquier escenario. En RolHub ofrecemos varios
                <Link href="/guias/mejores-mundos" className="text-gold hover:text-gold-bright"> mundos pre-construidos</Link> como
                fantasia epica, apocalipsis zombie, isekai anime y vikingos.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-xl text-parchment mb-3">3. Las Reglas y Mecanicas</h3>
              <p>
                Algunos juegos usan <strong>dados</strong> y estadisticas para resolver acciones inciertas.
                Otros prefieren un enfoque puramente narrativo. Sistemas populares incluyen
                Dungeons & Dragons 5e, Powered by the Apocalypse, y Year Zero Engine.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-xl text-parchment mb-3">4. La Improvisacion Colaborativa</h3>
              <p>
                No hay guion predefinido. La historia emerge de las decisiones de los jugadores
                y las respuestas del Director de Juego. Cada partida es unica e irrepetible.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Benefits */}
        <section id="beneficios" className="mb-16 scroll-mt-20">
          <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-3">
            <Heart className="h-6 w-6" />
            Beneficios de Jugar Rol
          </h2>

          <div className="font-body text-parchment/90 space-y-4 text-lg leading-relaxed">
            <p>
              Millones de personas en todo el mundo disfrutan de los juegos de rol.
              Estos son algunos de los beneficios comprobados:
            </p>

            <div className="grid gap-4 my-8">
              {[
                {
                  title: 'Creatividad sin limites',
                  desc: 'A diferencia de los videojuegos, puedes intentar cualquier accion que imagines. No hay botones predefinidos ni opciones limitadas.',
                },
                {
                  title: 'Historias memorables',
                  desc: 'Viviras aventuras que recordaras por anos: momentos epicos, giros inesperados, y victorias ganadas con esfuerzo.',
                },
                {
                  title: 'Conexion social',
                  desc: 'Es una actividad grupal que fortalece amistades. Construir historias juntos crea vinculos unicos.',
                },
                {
                  title: 'Desarrollo de habilidades',
                  desc: 'Mejora la empatia (al ponerte en la piel de tu personaje), la improvisacion, y la resolucion creativa de problemas.',
                },
                {
                  title: 'Escapismo saludable',
                  desc: 'Una pausa del estres cotidiano donde puedes ser alguien mas en un mundo diferente.',
                },
              ].map((item) => (
                <ParchmentPanel key={item.title} className="p-4">
                  <h4 className="font-heading text-gold-dim mb-1">{item.title}</h4>
                  <p className="font-body text-ink/70 text-base">{item.desc}</p>
                </ParchmentPanel>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Myths */}
        <section id="mitos" className="mb-16 scroll-mt-20">
          <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-3">
            <MessageCircle className="h-6 w-6" />
            Mitos sobre los Juegos de Rol
          </h2>

          <div className="font-body text-parchment/90 space-y-6 text-lg leading-relaxed">

            <div className="border-l-2 border-blood pl-4">
              <p className="text-blood font-heading">&ldquo;Los juegos de rol son solo para nerds&rdquo;</p>
              <p className="text-parchment/70 mt-2">
                <strong>Falso.</strong> Hoy juegan rol personas de todas las edades y profesiones.
                Celebridades como Vin Diesel, Joe Manganiello y Henry Cavill son fans declarados de D&D.
                El estigma del pasado ha desaparecido.
              </p>
            </div>

            <div className="border-l-2 border-blood pl-4">
              <p className="text-blood font-heading">&ldquo;Necesitas muchas horas libres&rdquo;</p>
              <p className="text-parchment/70 mt-2">
                <strong>No necesariamente.</strong> Existen formatos cortos llamados &ldquo;one-shots&rdquo; de 1-2 horas.
                En <Link href="/onboarding" className="text-gold hover:text-gold-bright">RolHub</Link> puedes jugar sesiones de 30-60 minutos a tu ritmo.
              </p>
            </div>

            <div className="border-l-2 border-blood pl-4">
              <p className="text-blood font-heading">&ldquo;Es complicado aprender&rdquo;</p>
              <p className="text-parchment/70 mt-2">
                <strong>Depende del sistema.</strong> Algunos juegos tienen reglas extensas,
                pero otros como el Story Mode de RolHub no requieren aprender mecanicas.
                Solo describes lo que quieres hacer.
              </p>
            </div>

            <div className="border-l-2 border-blood pl-4">
              <p className="text-blood font-heading">&ldquo;Necesitas un grupo de amigos que jueguen&rdquo;</p>
              <p className="text-parchment/70 mt-2">
                <strong>Ya no.</strong> Puedes jugar en solitario con un DM con IA como RolHub,
                o encontrar grupos online en comunidades como Discord, Reddit, o Roll20.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Getting Started */}
        <section id="empezar" className="mb-16 scroll-mt-20">
          <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-3">
            <Sparkles className="h-6 w-6" />
            Como Empezar a Jugar Rol Hoy
          </h2>

          <div className="font-body text-parchment/90 space-y-4 text-lg leading-relaxed">
            <p>
              La mejor forma de entender el <strong>juego de rol</strong> es jugando.
              No necesitas leer manuales extensos ni preparar nada especial.
            </p>

            <p>
              Con <strong>RolHub</strong>, nuestra IA actua como Director de Juego profesional.
              Solo tienes que elegir un mundo, crear tu personaje en 2 minutos,
              y la aventura comienza inmediatamente. El sistema te guia si es tu primera vez.
            </p>

            <h3 className="font-heading text-xl text-parchment mb-4">Proximos pasos recomendados:</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/guias/como-jugar" className="text-gold hover:text-gold-bright">
                  → Como Jugar en RolHub: Tutorial Paso a Paso
                </Link>
              </li>
              <li>
                <Link href="/guias/crear-personaje" className="text-gold hover:text-gold-bright">
                  → Como Crear tu Primer Personaje
                </Link>
              </li>
              <li>
                <Link href="/guias/mejores-mundos" className="text-gold hover:text-gold-bright">
                  → Los Mejores Mundos para Principiantes
                </Link>
              </li>
            </ul>

            <ParchmentPanel variant="ornate" className="p-8 my-8 text-center">
              <h3 className="font-heading text-xl text-gold mb-4">
                Listo para tu primera aventura de rol?
              </h3>
              <p className="font-body text-parchment/80 mb-6">
                No necesitas experiencia previa. En 3 clics estaras viviendo tu propia historia.
              </p>
              <Link
                href="/onboarding"
                className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors"
              >
                Empezar a Jugar Gratis
              </Link>
            </ParchmentPanel>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-16 scroll-mt-20">
          <h2 className="font-heading text-2xl text-gold mb-6">
            Preguntas Frecuentes sobre Juegos de Rol
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <ParchmentPanel key={index} className="p-5">
                <h3 className="font-heading text-lg text-gold-dim mb-2">{faq.question}</h3>
                <p className="font-body text-ink/80">{faq.answer}</p>
              </ParchmentPanel>
            ))}
          </div>
        </section>

      </div>

      {/* Related Articles */}
      <section className="mb-12">
        <h2 className="font-heading text-xl text-gold mb-6">Articulos Relacionados</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/guias/como-jugar">
            <ParchmentPanel className="p-4 hover:border-gold/50 transition-all h-full">
              <h3 className="font-heading text-ink mb-2">Como Jugar en RolHub</h3>
              <p className="font-body text-ink/60 text-sm">Tutorial paso a paso para tu primera partida</p>
            </ParchmentPanel>
          </Link>
          <Link href="/guias/crear-personaje">
            <ParchmentPanel className="p-4 hover:border-gold/50 transition-all h-full">
              <h3 className="font-heading text-ink mb-2">Crear tu Personaje</h3>
              <p className="font-body text-ink/60 text-sm">Guia completa de creacion de personajes</p>
            </ParchmentPanel>
          </Link>
          <Link href="/guias/mejores-mundos">
            <ParchmentPanel className="p-4 hover:border-gold/50 transition-all h-full">
              <h3 className="font-heading text-ink mb-2">Mejores Mundos</h3>
              <p className="font-body text-ink/60 text-sm">Encuentra la ambientacion perfecta para ti</p>
            </ParchmentPanel>
          </Link>
        </div>
      </section>

      {/* Navigation */}
      <nav className="border-t border-gold/20 pt-8 mt-12" aria-label="Navegacion de articulos">
        <div className="flex justify-between items-center">
          <Link
            href="/guias"
            className="flex items-center gap-2 text-parchment/60 hover:text-gold transition-colors font-ui"
          >
            <ArrowLeft className="h-4 w-4" />
            Todas las guias
          </Link>
          <Link
            href="/guias/como-jugar"
            className="flex items-center gap-2 text-gold hover:text-gold-bright transition-colors font-ui"
          >
            Siguiente: Como Jugar en RolHub
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Schema.org Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </article>
  )
}
