import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Search } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Vocabulario de Rol: Glosario Completo de Terminos RPG | RolHub',
  description: 'Diccionario de terminos de juegos de rol. Que significa DM, NPC, tirada, campana, one-shot y mas. Glosario completo para principiantes.',
  keywords: [
    'vocabulario rol',
    'glosario RPG',
    'terminos D&D',
    'que significa DM',
    'que es un NPC',
    'jerga juegos de rol',
    'diccionario rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/vocabulario',
  },
  openGraph: {
    title: 'Vocabulario de Rol: Glosario Completo | RolHub',
    description: 'Todos los terminos que necesitas conocer para jugar rol.',
    type: 'article',
    publishedTime: '2024-01-15',
    authors: ['RolHub'],
  },
}

const terms = [
  // Basicos
  {
    term: 'Juego de Rol (RPG)',
    category: 'Basicos',
    definition: 'Juego donde los participantes asumen el papel de personajes ficticios y narran sus acciones en una historia colaborativa.',
  },
  {
    term: 'DM / Director de Juego',
    category: 'Basicos',
    definition: 'La persona (o IA en RolHub) que narra la historia, controla a los NPCs y arbitra las reglas. Tambien llamado Game Master (GM), Narrador, o Storyteller.',
  },
  {
    term: 'Jugador',
    category: 'Basicos',
    definition: 'Persona que controla a un personaje jugador (PJ) y toma decisiones por el dentro de la historia.',
  },
  {
    term: 'Personaje Jugador (PJ)',
    category: 'Basicos',
    definition: 'El personaje controlado por un jugador. Tu alter ego en el mundo de juego.',
  },
  {
    term: 'NPC (Personaje No Jugador)',
    category: 'Basicos',
    definition: 'Cualquier personaje controlado por el DM. Desde el tabernero hasta el villano principal.',
  },
  {
    term: 'Party / Grupo',
    category: 'Basicos',
    definition: 'El grupo de personajes jugadores que viajan y enfrentan aventuras juntos.',
  },

  // Sesiones
  {
    term: 'Sesion',
    category: 'Sesiones',
    definition: 'Una instancia de juego. Puede durar desde 30 minutos hasta varias horas.',
  },
  {
    term: 'Campana',
    category: 'Sesiones',
    definition: 'Una historia larga que se desarrolla a lo largo de multiples sesiones. Puede durar semanas o meses.',
  },
  {
    term: 'One-shot',
    category: 'Sesiones',
    definition: 'Una aventura autocontenida que se completa en una sola sesion. Ideal para probar el juego.',
  },
  {
    term: 'Arco',
    category: 'Sesiones',
    definition: 'Una seccion de la campana con su propia trama. Una campana puede tener varios arcos.',
  },

  // Mecanicas
  {
    term: 'Tirada',
    category: 'Mecanicas',
    definition: 'El acto de lanzar dados para determinar el resultado de una accion.',
  },
  {
    term: 'Modificador',
    category: 'Mecanicas',
    definition: 'Numero que se suma o resta al resultado de los dados, basado en las estadisticas del personaje.',
  },
  {
    term: 'CD / DC (Clase de Dificultad)',
    category: 'Mecanicas',
    definition: 'El numero que debes igualar o superar con tu tirada para tener exito.',
  },
  {
    term: 'Critico / Nat 20',
    category: 'Mecanicas',
    definition: 'Sacar el resultado maximo en el dado (20 en un d20). Generalmente significa exito automatico y efectos extra.',
  },
  {
    term: 'Pifia / Nat 1',
    category: 'Mecanicas',
    definition: 'Sacar 1 en el dado. Generalmente significa fallo automatico, a veces con consecuencias comicas o desastrosas.',
  },
  {
    term: 'Ventaja',
    category: 'Mecanicas',
    definition: 'Tirar dos dados y quedarse con el resultado mas alto. Representa circunstancias favorables.',
  },
  {
    term: 'Desventaja',
    category: 'Mecanicas',
    definition: 'Tirar dos dados y quedarse con el resultado mas bajo. Representa circunstancias desfavorables.',
  },
  {
    term: 'Pool de dados',
    category: 'Mecanicas',
    definition: 'Sistema donde tiras varios dados y contas exitos (ej: cantidad de 6s). Usado en Year Zero.',
  },
  {
    term: 'Empujar tirada',
    category: 'Mecanicas',
    definition: 'En Year Zero, re-tirar dados fallidos aceptando posibles consecuencias negativas.',
  },

  // Narrativa
  {
    term: 'Roleplay / RP',
    category: 'Narrativa',
    definition: 'Actuar y hablar como tu personaje. Tomar decisiones basadas en su personalidad, no la tuya.',
  },
  {
    term: 'In-character (IC)',
    category: 'Narrativa',
    definition: 'Cuando hablas o actuas como tu personaje, dentro de la ficcion.',
  },
  {
    term: 'Out-of-character (OOC)',
    category: 'Narrativa',
    definition: 'Cuando hablas como jugador, fuera de la ficcion. Ej: preguntar reglas.',
  },
  {
    term: 'Metagaming',
    category: 'Narrativa',
    definition: 'Usar informacion que vos como jugador sabes, pero tu personaje no. Generalmente mal visto.',
  },
  {
    term: 'Trasfondo / Backstory',
    category: 'Narrativa',
    definition: 'La historia pasada de tu personaje antes del inicio del juego.',
  },
  {
    term: 'Lore',
    category: 'Narrativa',
    definition: 'La historia, mitologia y detalles del mundo de juego.',
  },
  {
    term: 'Worldbuilding',
    category: 'Narrativa',
    definition: 'El proceso de crear y desarrollar el mundo donde transcurre la historia.',
  },

  // Personaje
  {
    term: 'Estadisticas / Stats',
    category: 'Personaje',
    definition: 'Numeros que representan las capacidades de tu personaje (Fuerza, Destreza, etc.).',
  },
  {
    term: 'Clase',
    category: 'Personaje',
    definition: 'El rol o profesion de tu personaje (Guerrero, Mago, Picaro, etc.).',
  },
  {
    term: 'Raza',
    category: 'Personaje',
    definition: 'La especie de tu personaje (Humano, Elfo, Enano, etc.).',
  },
  {
    term: 'Arquetipo',
    category: 'Personaje',
    definition: 'Un tipo de personaje predefinido con stats y trasfondo base. Util para empezar rapido.',
  },
  {
    term: 'Nivel',
    category: 'Personaje',
    definition: 'Medida del poder y experiencia de tu personaje. Sube al ganar XP.',
  },
  {
    term: 'XP (Puntos de Experiencia)',
    category: 'Personaje',
    definition: 'Puntos que se ganan al completar objetivos. Al acumular suficientes, subes de nivel.',
  },
  {
    term: 'HP (Puntos de Vida)',
    category: 'Personaje',
    definition: 'Cuanto daño puede recibir tu personaje antes de caer.',
  },
  {
    term: 'Inventario',
    category: 'Personaje',
    definition: 'Los objetos que tu personaje lleva consigo.',
  },
  {
    term: 'Habilidad',
    category: 'Personaje',
    definition: 'Capacidad especifica de tu personaje (Sigilo, Persuasion, Atletismo, etc.).',
  },

  // Combate
  {
    term: 'Iniciativa',
    category: 'Combate',
    definition: 'Tirada que determina el orden de turnos en combate. Mayor resultado = actuar primero.',
  },
  {
    term: 'Turno',
    category: 'Combate',
    definition: 'Tu momento para actuar en combate. Generalmente incluye movimiento y una accion.',
  },
  {
    term: 'Ronda',
    category: 'Combate',
    definition: 'Un ciclo completo donde todos los participantes del combate actuan una vez.',
  },
  {
    term: 'CA (Clase de Armadura)',
    category: 'Combate',
    definition: 'Que tan dificil es golpear a un personaje. El atacante debe igualar o superar la CA.',
  },
  {
    term: 'Dano',
    category: 'Combate',
    definition: 'Puntos de vida que se restan al objetivo cuando un ataque tiene exito.',
  },
  {
    term: 'Condicion',
    category: 'Combate',
    definition: 'Estado que afecta a un personaje (Envenenado, Paralizado, Cegado, etc.).',
  },

  // Extras
  {
    term: 'Homebrew',
    category: 'Extras',
    definition: 'Contenido creado por los jugadores, no oficial. Reglas caseras, mundos propios, etc.',
  },
  {
    term: 'RAW (Rules As Written)',
    category: 'Extras',
    definition: 'Jugar siguiendo las reglas exactamente como estan escritas, sin interpretaciones.',
  },
  {
    term: 'RAI (Rules As Intended)',
    category: 'Extras',
    definition: 'Interpretar las reglas segun la intencion del diseñador, aunque el texto sea ambiguo.',
  },
  {
    term: 'TPK (Total Party Kill)',
    category: 'Extras',
    definition: 'Cuando todo el grupo de personajes muere. Generalmente el fin de la campana.',
  },
  {
    term: 'Min-maxing',
    category: 'Extras',
    definition: 'Optimizar las estadisticas del personaje para maximizar efectividad en combate.',
  },
  {
    term: 'Murder hobo',
    category: 'Extras',
    definition: 'Jugador que ignora la historia y solo quiere matar y saquear. Generalmente mal visto.',
  },
]

const categories = ['Basicos', 'Sesiones', 'Mecanicas', 'Narrativa', 'Personaje', 'Combate', 'Extras']

export default function VocabularioPage() {
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
          <span className="text-xs font-ui font-bold text-white bg-emerald px-2 py-1 rounded">
            Referencia
          </span>
          <span className="text-xs font-ui font-semibold text-parchment">
            {terms.length} terminos
          </span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold">
            <BookOpen className="h-8 w-8 text-shadow" />
          </div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Vocabulario de Rol
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Todos los terminos que necesitas conocer para jugar rol.
          Desde lo mas basico hasta jerga avanzada.
        </p>
      </header>

      {/* Quick Jump */}
      <ParchmentPanel className="p-4 mb-12 border border-gold-dim">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <a
              key={cat}
              href={`#${cat.toLowerCase()}`}
              className="px-3 py-1 text-sm font-ui font-semibold text-ink bg-parchment-dark/50 rounded hover:bg-gold-dim hover:text-white transition-colors"
            >
              {cat}
            </a>
          ))}
        </div>
      </ParchmentPanel>

      {/* Terms by Category */}
      <div className="space-y-12">
        {categories.map((category) => (
          <section key={category} id={category.toLowerCase()}>
            <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
              {category}
            </h2>
            <div className="space-y-3">
              {terms
                .filter((t) => t.category === category)
                .map((t) => (
                  <ParchmentPanel key={t.term} className="p-4 border border-gold-dim/50">
                    <h3 className="font-heading text-lg text-ink mb-1">{t.term}</h3>
                    <p className="font-body text-ink">{t.definition}</p>
                  </ParchmentPanel>
                ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <section className="mt-16">
        <ParchmentPanel variant="ornate" className="p-8 text-center border-2 border-gold">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Listo para Usar Este Vocabulario?
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Ahora que conoces los terminos, es hora de ponerlos en practica.
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
        </div>
      </nav>

      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DefinedTermSet",
            "name": "Vocabulario de Juegos de Rol",
            "description": "Glosario completo de terminos de juegos de rol para principiantes.",
            "url": "https://rol-hub.com/guias/vocabulario",
            "hasDefinedTerm": terms.slice(0, 10).map((t) => ({
              "@type": "DefinedTerm",
              "name": t.term,
              "description": t.definition
            }))
          })
        }}
      />
    </article>
  )
}
