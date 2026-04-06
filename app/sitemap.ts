import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://rol-hub.com'

  // Paginas publicas indexables
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/onboarding`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/play-guest`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dados`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/hoja-personaje`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  // All guide slugs
  const guideSlugs = [
    // Principiantes
    'que-es-rol',
    'como-jugar',
    'crear-personaje',
    'mejores-mundos',
    'oneshot-vs-campana',
    'dm-ia',
    'vocabulario',
    'errores-comunes',
    // Mundos
    'mundo-tierra-media',
    'mundo-zombies',
    'mundo-isekai',
    'mundo-vikingos',
    'mundo-star-wars',
    'mundo-cyberpunk',
    'mundo-lovecraft',
    // Game Masters
    'ser-buen-dm',
    'improvisar',
    'crear-npcs',
    'disenar-encuentros',
    // Mecanicas
    'combate',
    'exploracion',
    'interaccion-social',
    'entender-dados',
    // Desarrollo de Personaje
    'escribir-backstory',
    'arcos-personaje',
    'relaciones-pjs',
    // Mejora tu Juego
    'escribir-acciones',
    'roleplay-101',
    'tension-dramatica',
    'ser-buen-jugador',
    // Sistemas de Reglas
    'sistemas-reglas',
    'story-mode',
    'pbta',
    'year-zero',
    'dnd-5e',
    // Comunidad
    'etiqueta-mesa',
    'seguridad-juego',
    'faq',
    // Generos de Juego
    'genero-horror',
    'genero-misterio',
    'genero-comedia',
    'genero-romance',
    'genero-intriga',
    // Tipos de Sesiones
    'primera-sesion',
    'sesion-cero',
    'sesion-final',
    'sesiones-cortas',
    // One-Shots Tematicos
    'oneshot-heist',
    'oneshot-misterio',
    'oneshot-supervivencia',
    'oneshot-festival',
    // DM Avanzado
    'crear-campanas',
    'puzzles-acertijos',
    'musica-ambientacion',
    'jugadores-dificiles',
    // Tecnicas RolHub
    'tips-dm-ia',
    'personalizar-partida',
    'jugar-solo',
    // Arquetipos
    'arquetipos-guerrero',
    'arquetipos-mago',
    'arquetipos-picaro',
    'arquetipos-apoyo',
    // Comparativas
    'rol-vs-videojuegos',
    'tabla-sistemas',
    'glosario-extendido',
  ]

  // Guide pages
  const guidePages = [
    {
      url: `${baseUrl}/guias`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    ...guideSlugs.map(slug => ({
      url: `${baseUrl}/guias/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]

  // Bestiary pages
  const bestiarySlugs = [
    'troll-de-las-cavernas', 'huargo', 'nazgul', 'balrog', 'araña-gigante-de-mirkwood',
    'caminante', 'corredor', 'bloater', 'alfa',
    'draugr', 'fenrir', 'jormungandr',
    'slime-rey', 'dragon-anciano', 'goblin-bandido',
    'rancor', 'sarlacc',
    'cyberpsico', 'mech-corporativo',
    'profundo', 'shoggoth',
  ]

  const bestiaryPages = [
    {
      url: `${baseUrl}/compendio/bestias`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    ...bestiarySlugs.map(slug => ({
      url: `${baseUrl}/compendio/bestias/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]

  return [...staticPages, ...guidePages, ...bestiaryPages]
}
