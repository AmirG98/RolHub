import { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Users, Sparkles, Sword, Map, Dice6, Home } from 'lucide-react'
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
    canonical: 'https://rolhub.com/guias',
  },
  openGraph: {
    title: 'Guias de Rol para Principiantes | RolHub',
    description: 'Aprende a jugar juegos de rol desde cero con nuestros tutoriales gratuitos.',
    type: 'website',
    url: 'https://rolhub.com/guias',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guias de Rol para Principiantes',
    description: 'Tutoriales gratuitos para aprender a jugar RPG desde cero.',
  },
}

const guides = [
  {
    slug: 'que-es-rol',
    title: 'Que es el Juego de Rol',
    description: 'Descubre que son los juegos de rol, como funcionan y por que millones de personas los disfrutan. La guia definitiva para principiantes.',
    icon: BookOpen,
    readTime: '8 min',
    level: 'Principiante',
  },
  {
    slug: 'como-jugar',
    title: 'Como Jugar en RolHub',
    description: 'Tutorial paso a paso para empezar tu primera aventura. Desde crear una cuenta hasta completar tu primera mision.',
    icon: Sparkles,
    readTime: '5 min',
    level: 'Principiante',
  },
  {
    slug: 'crear-personaje',
    title: 'Como Crear tu Personaje',
    description: 'Guia completa para crear un personaje memorable. Elige raza, clase, trasfondo y dale vida a tu alter ego.',
    icon: Users,
    readTime: '10 min',
    level: 'Principiante',
  },
  {
    slug: 'mejores-mundos',
    title: 'Los Mejores Mundos para Empezar',
    description: 'Comparativa de mundos de fantasia disponibles. Desde la Tierra Media hasta apocalipsis zombie, encuentra tu aventura ideal.',
    icon: Map,
    readTime: '7 min',
    level: 'Principiante',
  },
]

const advancedGuides = [
  {
    slug: 'sistemas-reglas',
    title: 'Sistemas de Reglas Explicados',
    description: 'Entiende las diferencias entre Story Mode, PbtA, Year Zero y D&D 5e. Cual elegir segun tu estilo de juego.',
    icon: Dice6,
    readTime: '12 min',
    level: 'Intermedio',
    comingSoon: true,
  },
  {
    slug: 'ser-buen-jugador',
    title: 'Como Ser un Buen Jugador',
    description: 'Consejos para mejorar tu roleplay, trabajar en equipo y hacer que la experiencia sea memorable para todos.',
    icon: Sword,
    readTime: '8 min',
    level: 'Intermedio',
    comingSoon: true,
  },
]

export default function GuiasPage() {
  // Schema for collection page
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Guias de Rol para Principiantes",
    "description": "Tutoriales completos para aprender juegos de rol desde cero.",
    "url": "https://rolhub.com/guias",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": guides.map((guide, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Article",
          "name": guide.title,
          "description": guide.description,
          "url": `https://rolhub.com/guias/${guide.slug}`
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
        "item": "https://rolhub.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Guias de Rol",
        "item": "https://rolhub.com/guias"
      }
    ]
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm font-ui text-parchment/60">
          <li><Link href="/" className="hover:text-gold flex items-center gap-1"><Home className="h-3 w-3" /> Inicio</Link></li>
          <li>/</li>
          <li className="text-gold">Guias de Rol</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <header className="text-center mb-16">
        <h1 className="font-title text-4xl md:text-5xl text-gold mb-4">
          Guias de Rol para Principiantes
        </h1>
        <p className="font-body text-xl text-parchment/80 max-w-2xl mx-auto">
          Aprende a jugar juegos de rol desde cero. Tutoriales claros y simples
          para que empieces tu aventura hoy mismo.
        </p>
      </header>

      {/* Para Principiantes */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Para Principiantes
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {guides.map((guide) => (
            <Link key={guide.slug} href={`/guias/${guide.slug}`}>
              <ParchmentPanel className="p-6 h-full hover:border-gold/50 transition-all cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gold/10 text-gold group-hover:bg-gold/20 transition-colors">
                    <guide.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-ui text-emerald bg-emerald/20 px-2 py-0.5 rounded">
                        {guide.level}
                      </span>
                      <span className="text-xs font-ui text-parchment/50">
                        {guide.readTime} lectura
                      </span>
                    </div>
                    <h3 className="font-heading text-xl text-parchment group-hover:text-gold transition-colors mb-2">
                      {guide.title}
                    </h3>
                    <p className="font-body text-parchment/70 text-sm">
                      {guide.description}
                    </p>
                  </div>
                </div>
              </ParchmentPanel>
            </Link>
          ))}
        </div>
      </section>

      {/* Guias Avanzadas */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-2">
          <Sword className="h-6 w-6" />
          Guias Avanzadas
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {advancedGuides.map((guide) => (
            <div key={guide.slug} className="relative">
              <ParchmentPanel className="p-6 h-full opacity-60">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gold/10 text-gold/50">
                    <guide.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-ui text-gold/50 bg-gold/10 px-2 py-0.5 rounded">
                        {guide.level}
                      </span>
                      <span className="text-xs font-ui text-parchment/30">
                        {guide.readTime} lectura
                      </span>
                    </div>
                    <h3 className="font-heading text-xl text-parchment/50 mb-2">
                      {guide.title}
                    </h3>
                    <p className="font-body text-parchment/40 text-sm">
                      {guide.description}
                    </p>
                  </div>
                </div>
              </ParchmentPanel>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-heading text-gold bg-shadow/90 px-4 py-2 rounded-lg border border-gold/30">
                  Proximamente
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <ParchmentPanel className="p-8 max-w-2xl mx-auto">
          <h2 className="font-heading text-2xl text-gold mb-4">
            Listo para tu Primera Aventura?
          </h2>
          <p className="font-body text-parchment/80 mb-6">
            No necesitas experiencia previa. Nuestro DM con inteligencia artificial
            te guiara paso a paso en tu primera aventura de rol.
          </p>
          <Link
            href="/onboarding"
            className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors"
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
