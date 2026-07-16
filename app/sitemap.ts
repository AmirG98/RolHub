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
    'mundo-fantasia-epica',
    'mundo-zombies',
    'mundo-isekai',
    'mundo-vikingos',
    'mundo-space-opera',
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
    // LOTR
    'troll-de-las-cavernas', 'huargo', 'nazgul', 'balrog', 'araña-gigante-de-mirkwood',
    'orco-de-mordor', 'mumakil', 'espectro-del-pantano', 'guardian-del-agua', 'shelob',
    // Zombies
    'caminante', 'corredor', 'bloater', 'alfa',
    'rastreador', 'nino-infectado', 'demoledor', 'reina-de-colmena', 'perro-zombie',
    // Vikingos
    'draugr', 'fenrir', 'jormungandr',
    'kraken-nordico', 'berserker-maldito', 'valquiria-oscura', 'troll-de-hielo',
    // Isekai
    'slime-rey', 'dragon-anciano', 'goblin-bandido',
    'mimic', 'lich-del-bosque', 'grifo-real', 'elemental-de-fuego', 'orco-chaman',
    // space opera
    'rancor', 'sarlacc',
    'wampa', 'krayt-dragon', 'acklay', 'nexu',
    // Cyberpunk
    'cyberpsico', 'mech-corporativo',
    'drone-asesino', 'netrunner-fantasma', 'rata-mutante-gigante', 'borgs-de-gang',
    // Lovecraft
    'profundo', 'shoggoth',
    'mi-go', 'avatar-de-cthulhu', 'hombre-serpiente',
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

  // Items pages
  const itemSlugs = [
    'dardo','glamdring','cota-de-lunacero','frasco-de-galadriel','orbe vidente','pan del alba','capa-elfica','albahoja',
    'machete-reforzado','escopeta-recortada','botiquin-militar','chaleco-antibalas','molotov','walkie-talkie','trampa-de-alambre',
    'hacha-de-guerra-runica','escudo-de-madera-sagrada','hidromiel-de-odin','amuleto-de-thor','espada-ulfberht','mapa-de-las-estrellas','capa-de-piel-de-oso',
    'espada-del-heroe','bolsa-dimensional','pocion-de-curacion','grimorio-ancestral','anillo-de-invisibilidad','baston-del-archimago','amuleto-de-respawn','botas-de-velocidad',
    'plasma blade','blaster-dl-44','armadura-mandaloriana','holocron','bacta-tank-portatil','thermal-detonator','jetpack',
    'katana-monowire','mantis-blades','sandevistan','deck-de-netrunner','implante-ocular-kiroshi','nanobots-curativos','emp-grenade',
    'necronomicon','daga-de-plata-encantada','polvo-de-ibn-ghazi','espejo-de-nitocris','piedra-brillante','signo-antiguo',
  ]
  const itemPages = [
    { url: `${baseUrl}/compendio/items`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    ...itemSlugs.map(slug => ({ url: `${baseUrl}/compendio/items/${slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 })),
  ]

  // Spell pages
  const spellSlugs = [
    'palabra-de-mando','luz-de-earendil','cancion-de-poder','curacion-elfica','maldicion-de-morgul','escudo-runico','invocar-aguilas',
    'primeros-auxilios','adrenalina','camuflaje-improvisado','grito-de-alerta','reparacion-rapida','fortaleza-mental',
    'bendicion-de-odin','furia-del-berserker','runa-de-proteccion','invocar-tormenta','curar-con-seidr','ojo-del-cuervo','marca-de-tyr',
    'bola-de-fuego','curacion-mayor','teletransporte','barrera-magica','rayo-sagrado','invocacion-de-familiar','metamorfosis','resurreccion',
    'empujon-de-fuerza','truco-mental-vael','estrangulamiento','deflectar-blaster','vision-de-la-fuerza','curacion-con-la-fuerza','rayo-de-fuerza',
    'hackeo-rapido','cortocircuito','contagio-virus','reinicio-de-sistema','ping-de-red','sobrecarga-de-implante','camara-lenta-sandevistan','escudo-cibernetico',
    'invocar-entidad','senal-de-koth','contactar-sonador','polvo-del-sueno','destierro','barrera-mental','ritual-de-proteccion',
  ]
  const spellPages = [
    { url: `${baseUrl}/compendio/hechizos`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    ...spellSlugs.map(slug => ({ url: `${baseUrl}/compendio/hechizos/${slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 })),
  ]

  // Location pages
  const locationSlugs = [
    'la-comarca','bree','rivendel','moria','lothlorien','rohan','minas-tirith','mordor',
    'campamento-base','hospital-abandonado','centro-comercial','estacion-de-policia','puente-colapsado','granja-aislada','aeropuerto',
    'kattegat','templo-de-uppsala','mar-del-norte','lindisfarne','jotunheim','helheim','bosque-sagrado',
    'ciudad-inicial','bosque-de-los-principiantes','torre-del-mago','dungeon-del-rey-demonio','mercado-de-gremios','montana-del-dragon','pradera-elfica','puerto-de-los-piratas',
    'mos-eisley','coruscant','dagobah','hoth-base-echo','death-star','endor','jakku',
    'night-city-centro','afterlife-bar','arasaka-tower','badlands','pacifica','junk-city','orbital-station',
    'arkham','innsmouth','meseta-de-leng','rlyeh','biblioteca-de-miskatonic','dunwich',
  ]
  const locationPages = [
    { url: `${baseUrl}/compendio/locaciones`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    ...locationSlugs.map(slug => ({ url: `${baseUrl}/compendio/locaciones/${slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 })),
  ]

  return [...staticPages, ...guidePages, ...bestiaryPages, ...itemPages, ...spellPages, ...locationPages]
}
