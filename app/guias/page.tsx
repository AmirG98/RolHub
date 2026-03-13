import { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Users, Sparkles, Sword, Map, Dice6, Home, Pencil, Theater, Flame, Zap, MessageSquare, Brain, AlertTriangle, Skull, Star, Anchor, Rocket, Cpu, Eye, Crown, Wand2, Target, Swords, Compass, MessageCircle, TrendingUp, Heart, Shield, HelpCircle, Ghost, Search, Smile, Clock, Key, Mountain, PartyPopper, Music, UserX, Sliders, User, Gamepad2, Table, Play, Flag, Settings } from 'lucide-react'
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
  {
    slug: 'mundo-star-wars',
    title: 'Star Wars',
    description: 'La Fuerza, el Imperio, y la Rebelion. Aventuras en una galaxia muy lejana.',
    icon: Rocket,
    readTime: '12 min',
    level: 'Mundo',
    color: 'gold',
  },
  {
    slug: 'mundo-cyberpunk',
    title: 'Cyberpunk',
    description: 'Megacorporaciones, implantes y neon. Sobrevivir en un futuro distopico.',
    icon: Cpu,
    readTime: '12 min',
    level: 'Mundo',
    color: 'blood',
  },
  {
    slug: 'mundo-lovecraft',
    title: 'Horrores Cosmicos',
    description: 'Horror lovecraftiano. Investigar lo prohibido tiene un precio: tu cordura.',
    icon: Eye,
    readTime: '15 min',
    level: 'Mundo',
    color: 'stone',
  },
]

const dmGuides = [
  {
    slug: 'ser-buen-dm',
    title: 'Como Ser un Buen DM',
    description: 'Tips de narracion, improvisacion y manejo de mesa para narradores.',
    icon: Crown,
    readTime: '15 min',
    level: 'Game Master',
  },
  {
    slug: 'improvisar',
    title: 'Como Improvisar',
    description: 'Tecnicas "Si, y..." y como reaccionar cuando los jugadores hacen lo inesperado.',
    icon: Wand2,
    readTime: '12 min',
    level: 'Game Master',
  },
  {
    slug: 'crear-npcs',
    title: 'Crear NPCs Memorables',
    description: 'Personalidad, motivacion, voz y secretos para personajes inolvidables.',
    icon: Users,
    readTime: '12 min',
    level: 'Game Master',
  },
  {
    slug: 'disenar-encuentros',
    title: 'Disenar Encuentros',
    description: 'Balance, variedad, pacing y stakes para combates y escenas memorables.',
    icon: Target,
    readTime: '12 min',
    level: 'Game Master',
  },
]

const mechanicsGuides = [
  {
    slug: 'combate',
    title: 'Guia de Combate',
    description: 'Acciones, tacticas, posicionamiento y como describir ataques epicos.',
    icon: Swords,
    readTime: '10 min',
    level: 'Mecanicas',
  },
  {
    slug: 'exploracion',
    title: 'Guia de Exploracion',
    description: 'Investigar escenas, buscar pistas, viajar y descubrir secretos.',
    icon: Compass,
    readTime: '10 min',
    level: 'Mecanicas',
  },
  {
    slug: 'interaccion-social',
    title: 'Interaccion Social',
    description: 'Persuadir, negociar, intimidar y engañar. El arte de la conversacion.',
    icon: MessageCircle,
    readTime: '10 min',
    level: 'Mecanicas',
  },
  {
    slug: 'entender-dados',
    title: 'Entender los Dados',
    description: 'Probabilidades, tipos de dados, cuando tirar e interpretar resultados.',
    icon: Dice6,
    readTime: '8 min',
    level: 'Mecanicas',
  },
]

const characterGuides = [
  {
    slug: 'escribir-backstory',
    title: 'Escribir un Backstory',
    description: 'Crea la historia de tu personaje con ganchos para el DM.',
    icon: BookOpen,
    readTime: '12 min',
    level: 'Personaje',
  },
  {
    slug: 'arcos-personaje',
    title: 'Arcos de Personaje',
    description: 'Crecimiento, cambio y momentos definitorios durante la campana.',
    icon: TrendingUp,
    readTime: '10 min',
    level: 'Personaje',
  },
  {
    slug: 'relaciones-pjs',
    title: 'Relaciones entre PJs',
    description: 'Vinculos, dinamicas de grupo y como manejar conflicto sano.',
    icon: Heart,
    readTime: '10 min',
    level: 'Personaje',
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

const communityGuides = [
  {
    slug: 'etiqueta-mesa',
    title: 'Etiqueta de Mesa',
    description: 'Las reglas no escritas del rol. Puntualidad, atencion y respeto.',
    icon: Users,
    readTime: '8 min',
    level: 'Comunidad',
  },
  {
    slug: 'seguridad-juego',
    title: 'Seguridad en el Juego',
    description: 'Lineas, velos, Carta X y sesion cero. Jugar de forma segura.',
    icon: Shield,
    readTime: '10 min',
    level: 'Comunidad',
  },
  {
    slug: 'faq',
    title: 'Preguntas Frecuentes',
    description: 'Todo lo que necesitas saber sobre RolHub en un solo lugar.',
    icon: HelpCircle,
    readTime: '5 min',
    level: 'Comunidad',
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

const genreGuides = [
  {
    slug: 'genero-horror',
    title: 'Narrar Horror',
    description: 'Crear miedo, pacing de horror, uso de lo desconocido.',
    icon: Ghost,
    readTime: '12 min',
    level: 'Genero',
    color: 'stone',
  },
  {
    slug: 'genero-misterio',
    title: 'Narrar Misterio',
    description: 'Pistas, investigacion, revelar info gradualmente.',
    icon: Search,
    readTime: '12 min',
    level: 'Genero',
    color: 'gold',
  },
  {
    slug: 'genero-comedia',
    title: 'Narrar Comedia',
    description: 'Timing comico, absurdo, no romper la inmersion.',
    icon: Smile,
    readTime: '10 min',
    level: 'Genero',
    color: 'emerald',
  },
  {
    slug: 'genero-romance',
    title: 'Narrar Romance',
    description: 'Relaciones romanticas, consentimiento, fade to black.',
    icon: Heart,
    readTime: '10 min',
    level: 'Genero',
    color: 'blood',
  },
  {
    slug: 'genero-intriga',
    title: 'Narrar Intriga Politica',
    description: 'Facciones, traiciones, secretos y poder.',
    icon: Crown,
    readTime: '12 min',
    level: 'Genero',
    color: 'gold',
  },
]

const sessionGuides = [
  {
    slug: 'primera-sesion',
    title: 'La Primera Sesion',
    description: 'Como empezar bien una campana, ganchar a los jugadores.',
    icon: Play,
    readTime: '12 min',
    level: 'Sesiones',
  },
  {
    slug: 'sesion-cero',
    title: 'Session Zero',
    description: 'Establecer expectativas, crear personajes juntos.',
    icon: Settings,
    readTime: '10 min',
    level: 'Sesiones',
  },
  {
    slug: 'sesion-final',
    title: 'La Sesion Final',
    description: 'Cerrar arcos, climax satisfactorio, epilogo.',
    icon: Flag,
    readTime: '12 min',
    level: 'Sesiones',
  },
  {
    slug: 'sesiones-cortas',
    title: 'Sesiones de 30-45 min',
    description: 'Jugar con poco tiempo sin perder calidad.',
    icon: Clock,
    readTime: '10 min',
    level: 'Sesiones',
  },
]

const oneshotGuides = [
  {
    slug: 'oneshot-heist',
    title: 'One-Shot: Heist',
    description: 'Robos, planificacion, ejecucion, complicaciones.',
    icon: Key,
    readTime: '12 min',
    level: 'One-Shot',
    color: 'gold',
  },
  {
    slug: 'oneshot-misterio',
    title: 'One-Shot: Misterio',
    description: 'Asesinato, pistas, sospechosos, revelacion.',
    icon: Search,
    readTime: '12 min',
    level: 'One-Shot',
    color: 'stone',
  },
  {
    slug: 'oneshot-supervivencia',
    title: 'One-Shot: Supervivencia',
    description: 'Recursos limitados, tension, escapar.',
    icon: Mountain,
    readTime: '10 min',
    level: 'One-Shot',
    color: 'blood',
  },
  {
    slug: 'oneshot-festival',
    title: 'One-Shot: Festival',
    description: 'Competencias, juegos, roleplay ligero.',
    icon: PartyPopper,
    readTime: '10 min',
    level: 'One-Shot',
    color: 'emerald',
  },
]

const advancedDmGuides = [
  {
    slug: 'crear-campanas',
    title: 'Crear Campanas',
    description: 'Planificar arcos largos, milestones, finales.',
    icon: Map,
    readTime: '15 min',
    level: 'DM Avanzado',
  },
  {
    slug: 'puzzles-acertijos',
    title: 'Puzzles y Acertijos',
    description: 'Disenar puzzles justos y satisfactorios.',
    icon: Brain,
    readTime: '12 min',
    level: 'DM Avanzado',
  },
  {
    slug: 'musica-ambientacion',
    title: 'Musica y Ambientacion',
    description: 'Playlists, efectos de sonido, crear atmosfera.',
    icon: Music,
    readTime: '10 min',
    level: 'DM Avanzado',
  },
  {
    slug: 'jugadores-dificiles',
    title: 'Jugadores Dificiles',
    description: 'Manejar conflictos, jugadores problematicos.',
    icon: UserX,
    readTime: '12 min',
    level: 'DM Avanzado',
  },
]

const rolhubGuides = [
  {
    slug: 'tips-dm-ia',
    title: 'Tips para el DM IA',
    description: 'Trucos avanzados para obtener mejores respuestas.',
    icon: Sparkles,
    readTime: '10 min',
    level: 'RolHub',
  },
  {
    slug: 'personalizar-partida',
    title: 'Personalizar tu Partida',
    description: 'Ajustar tono, dificultad, preferencias.',
    icon: Sliders,
    readTime: '8 min',
    level: 'RolHub',
  },
  {
    slug: 'jugar-solo',
    title: 'Jugar Solo',
    description: 'Rol en solitario, journaling, el DM IA como companero.',
    icon: User,
    readTime: '12 min',
    level: 'RolHub',
  },
]

const archetypeGuides = [
  {
    slug: 'arquetipos-guerrero',
    title: 'Arquetipos: Guerrero',
    description: 'Variantes del luchador, mas alla del tanque.',
    icon: Sword,
    readTime: '12 min',
    level: 'Arquetipos',
    color: 'blood',
  },
  {
    slug: 'arquetipos-mago',
    title: 'Arquetipos: Mago',
    description: 'Tipos de usuario de magia, flavors.',
    icon: Wand2,
    readTime: '12 min',
    level: 'Arquetipos',
    color: 'emerald',
  },
  {
    slug: 'arquetipos-picaro',
    title: 'Arquetipos: Picaro',
    description: 'Ladrones, espias, caras, scouts.',
    icon: Eye,
    readTime: '12 min',
    level: 'Arquetipos',
    color: 'stone',
  },
  {
    slug: 'arquetipos-apoyo',
    title: 'Arquetipos: Apoyo',
    description: 'Sanadores, bardos, lideres, buffers.',
    icon: Shield,
    readTime: '12 min',
    level: 'Arquetipos',
    color: 'gold',
  },
]

const comparisonGuides = [
  {
    slug: 'rol-vs-videojuegos',
    title: 'Rol vs Videojuegos RPG',
    description: 'Diferencias con RPGs como Skyrim, BG3.',
    icon: Gamepad2,
    readTime: '10 min',
    level: 'Comparativas',
  },
  {
    slug: 'tabla-sistemas',
    title: 'Tabla de Sistemas',
    description: 'Comparativa rapida de todos los motores.',
    icon: Table,
    readTime: '8 min',
    level: 'Comparativas',
  },
  {
    slug: 'glosario-extendido',
    title: 'Glosario Extendido',
    description: 'Terminos avanzados mas alla del vocabulario basico.',
    icon: BookOpen,
    readTime: '15 min',
    level: 'Comparativas',
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        {guide.readTime}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg text-ink group-hover:text-gold-dim transition-colors mb-2">
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

      {/* Para Game Masters */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Crown className="h-6 w-6" />
          Para Game Masters
        </h2>
        <p className="font-body text-parchment mb-6">
          Guias para narradores que quieren mejorar sus partidas.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {dmGuides.map((guide) => (
            <Link key={guide.slug} href={`/guias/${guide.slug}`}>
              <ParchmentPanel className="p-6 h-full hover:border-gold transition-all cursor-pointer group border border-gold-dim/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gold text-shadow group-hover:bg-gold-bright transition-colors">
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

      {/* Mecanicas de Juego */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Swords className="h-6 w-6" />
          Mecanicas de Juego
        </h2>
        <p className="font-body text-parchment mb-6">
          Domina combate, exploracion, interaccion social y dados.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {mechanicsGuides.map((guide) => (
            <Link key={guide.slug} href={`/guias/${guide.slug}`}>
              <ParchmentPanel className="p-6 h-full hover:border-gold transition-all cursor-pointer group border border-gold-dim/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-blood text-white group-hover:opacity-80 transition-colors">
                    <guide.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-ui font-bold text-white bg-blood px-2 py-1 rounded">
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

      {/* Desarrollo de Personaje */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Desarrollo de Personaje
        </h2>
        <p className="font-body text-parchment mb-6">
          Backstories, arcos y relaciones para personajes memorables.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {characterGuides.map((guide) => (
            <Link key={guide.slug} href={`/guias/${guide.slug}`}>
              <ParchmentPanel className="p-6 h-full hover:border-gold transition-all cursor-pointer group border border-gold-dim/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-emerald text-white group-hover:opacity-80 transition-colors">
                    <guide.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-ui font-bold text-white bg-emerald px-2 py-1 rounded">
                        {guide.level}
                      </span>
                      <span className="text-xs font-ui font-semibold text-ink/70">
                        {guide.readTime}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg text-ink group-hover:text-gold-dim transition-colors mb-2">
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

      {/* Comunidad */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" />
          Comunidad
        </h2>
        <p className="font-body text-parchment mb-6">
          Normas sociales, seguridad y preguntas frecuentes.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {communityGuides.map((guide) => (
            <Link key={guide.slug} href={`/guias/${guide.slug}`}>
              <ParchmentPanel className="p-6 h-full hover:border-gold transition-all cursor-pointer group border border-gold-dim/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-stone text-parchment group-hover:bg-ink transition-colors">
                    <guide.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-ui font-bold text-white bg-stone px-2 py-1 rounded">
                        {guide.level}
                      </span>
                      <span className="text-xs font-ui font-semibold text-ink/70">
                        {guide.readTime}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg text-ink group-hover:text-gold-dim transition-colors mb-2">
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

      {/* Generos de Juego */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Theater className="h-6 w-6" />
          Generos de Juego
        </h2>
        <p className="font-body text-parchment mb-6">
          Como narrar y jugar diferentes generos narrativos.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {genreGuides.map((guide) => (
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
                        {guide.readTime}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg text-ink group-hover:text-gold-dim transition-colors mb-2">
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

      {/* Tipos de Sesiones */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Tipos de Sesiones
        </h2>
        <p className="font-body text-parchment mb-6">
          Guias especificas para cada tipo de sesion de juego.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {sessionGuides.map((guide) => (
            <Link key={guide.slug} href={`/guias/${guide.slug}`}>
              <ParchmentPanel className="p-6 h-full hover:border-gold transition-all cursor-pointer group border border-gold-dim/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-emerald text-white group-hover:opacity-80 transition-colors">
                    <guide.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-ui font-bold text-white bg-emerald px-2 py-1 rounded">
                        {guide.level}
                      </span>
                      <span className="text-xs font-ui font-semibold text-ink/70">
                        {guide.readTime}
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

      {/* One-Shots Tematicos */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6" />
          One-Shots Tematicos
        </h2>
        <p className="font-body text-parchment mb-6">
          Aventuras autoconclusivas con tematicas especificas.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {oneshotGuides.map((guide) => (
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
                        {guide.readTime}
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

      {/* DM Avanzado */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Crown className="h-6 w-6" />
          DM Avanzado
        </h2>
        <p className="font-body text-parchment mb-6">
          Tecnicas avanzadas para narradores experimentados.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {advancedDmGuides.map((guide) => (
            <Link key={guide.slug} href={`/guias/${guide.slug}`}>
              <ParchmentPanel className="p-6 h-full hover:border-gold transition-all cursor-pointer group border border-gold-dim/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gold text-shadow group-hover:bg-gold-bright transition-colors">
                    <guide.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-ui font-bold text-white bg-gold-dim px-2 py-1 rounded">
                        {guide.level}
                      </span>
                      <span className="text-xs font-ui font-semibold text-ink/70">
                        {guide.readTime}
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

      {/* Tecnicas RolHub */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          Tecnicas RolHub
        </h2>
        <p className="font-body text-parchment mb-6">
          Aprovecha al maximo las funciones especificas de RolHub.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {rolhubGuides.map((guide) => (
            <Link key={guide.slug} href={`/guias/${guide.slug}`}>
              <ParchmentPanel className="p-6 h-full hover:border-gold transition-all cursor-pointer group border border-gold-dim/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-emerald text-white group-hover:opacity-80 transition-colors">
                    <guide.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-ui font-bold text-white bg-emerald px-2 py-1 rounded">
                        {guide.level}
                      </span>
                      <span className="text-xs font-ui font-semibold text-ink/70">
                        {guide.readTime}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg text-ink group-hover:text-gold-dim transition-colors mb-2">
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

      {/* Arquetipos de Personaje */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" />
          Arquetipos de Personaje
        </h2>
        <p className="font-body text-parchment mb-6">
          Variantes y subtipos de los roles clasicos de aventurero.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {archetypeGuides.map((guide) => (
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
                        {guide.readTime}
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

      {/* Comparativas y Referencias */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Table className="h-6 w-6" />
          Comparativas y Referencias
        </h2>
        <p className="font-body text-parchment mb-6">
          Material de referencia rapida y comparaciones utiles.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {comparisonGuides.map((guide) => (
            <Link key={guide.slug} href={`/guias/${guide.slug}`}>
              <ParchmentPanel className="p-6 h-full hover:border-gold transition-all cursor-pointer group border border-gold-dim/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-stone text-gold-bright group-hover:bg-ink transition-colors">
                    <guide.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-ui font-bold text-white bg-stone px-2 py-1 rounded">
                        {guide.level}
                      </span>
                      <span className="text-xs font-ui font-semibold text-ink/70">
                        {guide.readTime}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg text-ink group-hover:text-gold-dim transition-colors mb-2">
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
