import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://rol-hub.com'

  // Static pages
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
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
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

  return [...staticPages, ...guidePages]
}
