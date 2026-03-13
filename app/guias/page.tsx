import { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Users, Sparkles, Sword, Map, Dice6, Home, Pencil, Theater, Flame, Zap, MessageSquare, Brain, AlertTriangle, Skull, Star, Anchor } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Guias de Rol para Principiantes: Aprende a Jugar RPG Gratis | RolHub',
  description: 'Tutoriales completos para aprender juegos de rol desde cero. Que es un RPG, como crear personajes, mejores mundos de fantasia. Empieza a jugar hoy gratis.',
  keywords: [
    'guia juegos de rol',
    'tutorial RPG principiantes',
    'como jugar rol',
    'aprender a jugar D&D',
    'crear personaje rol',
    'juegos de mesa narrativos',
    'rol online gratis',
    'dungeons and dragons tutorial',
    'guia rol en español'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias',
  },
  openGraph: {
    title: 'Guias de Rol para Principiantes | RolHub',
    description: 'Aprende a jugar juegos de rol desde cero con nuestros tutoriales gratuitos.',
    type: 'website',
    url: 'https://rol-hub.com/guias',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guias de Rol para Principiantes',
    description: 'Tutoriales gratuitos para aprender a jugar RPG desde cero.',
  },
}

const beginnerGuides = [
  {
    slug: 'que-es-rol',
    title: 'Que es el Juego de Rol',
    description: 'Descubre que son los juegos de rol, como funcionan y por que millones de personas los disfrutan.',
    icon: BookOpen,
    readTime: '8 min',
    level: 'Principiante',
  },
  {
    slug: 'como-jugar',
    title: 'Como Jugar en RolHub',
    description: 'Tutorial paso a paso para empezar tu primera aventura en la plataforma.',
    icon: Sparkles,
    readTime: '5 min',
    level: 'Principiante',
  },
  {
    slug: 'crear-personaje',
    title: 'Como Crear tu Personaje',
    description: 'Guia completa para crear un personaje memorable con trasfondo y personalidad.',
    icon: Users,
    readTime: '10 min',
    level: 'Principiante',
  },
  {
    slug: 'mejores-mundos',
    title: 'Los Mejores Mundos para Empezar',
    description: 'Comparativa de mundos disponibles. Encuentra tu aventura ideal.',
    icon: Map,
    readTime: '7 min',
    level: 'Principiante',
  },
  {
    slug: 'oneshot-vs-campana',
    title: 'One-shot vs Campana',
    description: 'Diferencias entre aventuras cortas y largas. Cual elegir segun tu tiempo.',
    icon: Zap,
    readTime: '5 min',
    level: 'Principiante',
  },
  {
    slug: 'dm-ia',
    title: 'Como Funciona el DM con IA',
    description: 'Entiende como el DM de inteligencia artificial narra y responde a tus acciones.',
    icon: Brain,
    readTime: '6 min',
    level: 'Principiante',
  },
  {
    slug: 'vocabulario',
    title: 'Vocabulario de Rol',
    description: 'Glosario completo con todos los terminos que necesitas conocer.',
    icon: MessageSquare,
    readTime: '10 min',
    level: 'Principiante',
  },
  {
    slug: 'errores-comunes',
    title: 'Errores Comunes de Principiantes',
    description: 'Los 10 errores mas frecuentes y como evitarlos desde el inicio.',
    icon: AlertTriangle,
    readTime: '8 min',
    level: 'Principiante',
  },
]

const skillGuides = [
  {
    slug: 'escribir-acciones',
    title: 'Como Escribir Buenas Acciones',
    description: 'Mejora tus descripciones para obtener mejores narraciones del DM.',
    icon: Pencil,
    readTime: '10 min',
    level: 'Intermedio',
  },
  {
    slug: 'roleplay-101',
    title: 'Roleplay 101',
    description: 'Aprende a meterte en el personaje y actuar como el lo haria.',
    icon: Theater,
    readTime: '12 min',
    level: 'Intermedio',
  },
  {
    slug: 'tension-dramatica',
    title: 'Como Crear Tension Dramatica',
    description: 'Tecnicas para crear momentos memorables y dramaticos en tus partidas.',
    icon: Flame,
    readTime: '10 min',
    level: 'Avanzado',
  },
  {
    slug: 'ser-buen-jugador',
    title: 'Como Ser un Buen Jugador',
    description: 'Consejos para mejorar tu roleplay y hacer la experiencia memorable.',
    icon: Sword,
    readTime: '8 min',
    level: 'Intermedio',
  },
]

const systemGuides = [
  {
    slug: 'sistemas-reglas',
    title: 'Sistemas de Reglas Explicados',
    description: 'Vision general de todos los motores de juego disponibles.',
    icon: Dice6,
    readTime: '12 min',
    level: 'Intermedio',
  },
  {
    slug: 'story-mode',
    title: 'Story Mode',
    description: 'Narrativa pura sin dados. El sistema perfecto para principiantes.',
    icon: BookOpen,
    readTime: '8 min',
    level: 'Principiante',
  },
  {
    slug: 'pbta',
    title: 'Powered by the Apocalypse',
    description: 'Sistema de 2d6 con exitos, exitos parciales y fallos dramaticos.',
    icon: Dice6,
    readTime: '10 min',
    level: 'Facil',
  },
  {
    slug: 'year-zero',
    title: 'Year Zero Engine',
    description: 'Pool de dados con sistema de empujar tiradas. Supervivencia brutal.',
    icon: Sword,
    readTime: '12 min',
    level: 'Moderado',
  },
  {
    slug: 'dnd-5e',
    title: 'D&D 5e Simplificado',
    description: 'El clasico d20 + modificador. El sistema de rol mas popular.',
    icon: Sword,
    readTime: '15 min',
    level: 'Moderado',
  },
]

const worldGuides = [
  {
    slug: 'mundo-tierra-media',
    title: 'Tierra Media',
    description: 'Fantasia epica estilo Tolkien. Elfos, enanos, hobbits y la lucha contra el mal.',
    icon: Sword,
    readTime: '10 min',
    level: 'Mundo',
    color: 'emerald',
  },
  {
    slug: 'mundo-zombies',
    title: 'Apocalipsis Zombie',
    description: 'Supervivencia post-apocaliptica. Recursos escasos y decisiones imposibles.',
    icon: Skull,
    readTime: '12 min',
    level: 'Mundo',
    color: 'blood',
  },
  {
    slug: 'mundo-isekai',
    title: 'Mundo Isekai',
    description: 'Fantasia anime con gremio de aventureros, niveles y dungeons.',
    icon: Star,
    readTime: '10 min',
    level: 'Mundo',
    color: 'gold',
  },
  {
    slug: 'mundo-vikingos',
    title: 'Saga Vikinga',
    description: 'Mitologia nordica y era vikinga. Dioses, honor y gloria en batalla.',
    icon: Anchor,
    readTime: '12 min',
    level: 'Mundo',
    color: 'stone',
  },
]

export default function GuiasPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Guias de Rol para Principiantes",
    "description": "Tutoriales completos para aprender juegos de rol desde cero.",
    "url": "https://rol-hub.com/guias",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": beginnerGuides.map((guide, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Article",
          "name": guide.title,
          "description": guide.description,
          "url": `https://rol-hub.com/guias/${guide.slug}`
        }
      }))
    }
  }

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
      }
    ]
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm font-ui text-parchment">
          <li><Link href="/" className="hover:text-gold-bright flex items-center gap-1"><Home className="h-3 w-3" /> Inicio</Link></li>
          <li className="text-parchment-dark">/</li>
          <li className="text-gold-bright font-semibold">Guias de Rol</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <header className="text-center mb-16">
        <h1 className="font-title text-4xl md:text-5xl text-gold-bright mb-4">
          Guias de Rol para Principiantes
        </h1>
        <p className="font-body text-xl text-parchment max-w-2xl mx-auto">
          Aprende a jugar juegos de rol desde cero. Tutoriales claros y simples
          para que empieces tu aventura hoy mismo.
        </p>
      </header>

      {/* Para Principiantes */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Para Principiantes
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {beginnerGuides.map((guide) => (
            <Link key={guide.slug} href={`/guias/${guide.slug}`}>
              <ParchmentPanel className="p-6 h-full hover:border-gold transition-all cursor-pointer group border border-gold-dim/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-stone text-gold-bright group-hover:bg-ink transition-colors">
                    <guide.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-ui font-bold text-white bg-emerald px-2 py-1 rounded">
                        {guide.level}
                      </span>
                      <span className="text-xs font-ui font-semibold text-ink/70">
                        {guide.readTime} lectura
                      </span>
                    </div>
                    <h3 className="font-heading text-xl text-ink group-hover:text-gold-dim transition-colors mb-2">
                      {guide.title}
                    </h3>
                    <p className="font-body text-ink/80 text-sm leading-relaxed">
                      {guide.description}
                    </p>
                  </div>
                </div>
              </ParchmentPanel>
            </Link>
          ))}
        </div>
      </section>

      {/* Guias de Mundos */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Map className="h-6 w-6" />
          Guias de Mundos
        </h2>
        <p className="font-body text-parchment mb-6">
          Todo lo que necesitas saber para sumergirte en cada universo de juego.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {worldGuides.map((guide) => (
            <Link key={guide.slug} href={`/guias/${guide.slug}`}>
              <ParchmentPanel className="p-6 h-full hover:border-gold transition-all cursor-pointer group border border-gold-dim/30">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg text-white group-hover:opacity-80 transition-colors ${
                    guide.color === 'blood' ? 'bg-blood' :
                    guide.color === 'gold' ? 'bg-gold text-shadow' :
                    guide.color === 'stone' ? 'bg-stone' :
                    'bg-emerald'
                  }`}>
                    <guide.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-ui font-bold text-white px-2 py-1 rounded ${
                        guide.color === 'blood' ? 'bg-blood' :
                        guide.color === 'gold' ? 'bg-gold-dim' :
                        guide.color === 'stone' ? 'bg-stone' :
                        'bg-emerald'
                      }`}>
                        {guide.level}
                      </span>
                      <span className="text-xs font-ui font-semibold text-ink/70">
                        {guide.readTime} lectura
                      </span>
                    </div>
                    <h3 className="font-heading text-xl text-ink group-hover:text-gold-dim transition-colors mb-2">
                      {guide.title}
                    </h3>
                    <p className="font-body text-ink/80 text-sm leading-relaxed">
                      {guide.description}
                    </p>
                  </div>
                </div>
              </ParchmentPanel>
            </Link>
          ))}
        </div>
      </section>

      {/* Guias de Habilidades */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Theater className="h-6 w-6" />
          Mejora tu Juego
        </h2>
        <p className="font-body text-parchment mb-6">
          Tecnicas y consejos para llevar tu roleplay al siguiente nivel.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {skillGuides.map((guide) => (
            <Link key={guide.slug} href={`/guias/${guide.slug}`}>
              <ParchmentPanel className="p-6 h-full hover:border-gold transition-all cursor-pointer group border border-gold-dim/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-stone text-gold-bright group-hover:bg-ink transition-colors">
                    <guide.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-ui font-bold text-white px-2 py-1 rounded ${
                        guide.level === 'Avanzado' ? 'bg-blood' : 'bg-gold-dim'
                      }`}>
                        {guide.level}
                      </span>
                      <span className="text-xs font-ui font-semibold text-ink/70">
                        {guide.readTime} lectura
                      </span>
                    </div>
                    <h3 className="font-heading text-xl text-ink group-hover:text-gold-dim transition-colors mb-2">
                      {guide.title}
                    </h3>
                    <p className="font-body text-ink/80 text-sm leading-relaxed">
                      {guide.description}
                    </p>
                  </div>
                </div>
              </ParchmentPanel>
            </Link>
          ))}
        </div>
      </section>

      {/* Guias de Sistemas */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Dice6 className="h-6 w-6" />
          Sistemas de Reglas
        </h2>
        <p className="font-body text-parchment mb-6">
          Guias detalladas de cada motor de juego disponible en RolHub.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {systemGuides.map((guide) => (
            <Link key={guide.slug} href={`/guias/${guide.slug}`}>
              <ParchmentPanel className="p-6 h-full hover:border-gold transition-all cursor-pointer group border border-gold-dim/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-stone text-gold-bright group-hover:bg-ink transition-colors">
                    <guide.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-ui font-bold text-white bg-gold-dim px-2 py-1 rounded">
                        {guide.level}
                      </span>
                      <span className="text-xs font-ui font-semibold text-ink/70">
                        {guide.readTime} lectura
                      </span>
                    </div>
                    <h3 className="font-heading text-xl text-ink group-hover:text-gold-dim transition-colors mb-2">
                      {guide.title}
                    </h3>
                    <p className="font-body text-ink/80 text-sm leading-relaxed">
                      {guide.description}
                    </p>
                  </div>
                </div>
              </ParchmentPanel>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <ParchmentPanel className="p-8 max-w-2xl mx-auto border-2 border-gold">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Listo para tu Primera Aventura?
          </h2>
          <p className="font-body text-ink mb-6 text-lg">
            No necesitas experiencia previa. Nuestro DM con inteligencia artificial
            te guiara paso a paso en tu primera aventura de rol.
          </p>
          <Link
            href="/onboarding"
            className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold"
          >
            Empezar a Jugar Gratis
          </Link>
        </ParchmentPanel>
      </section>

      {/* Schema.org for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </div>
  )
}
