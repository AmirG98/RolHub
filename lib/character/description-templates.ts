/**
 * Templates de descripcion de personajes por lore
 * Usados para generar descripciones aleatorias durante el onboarding
 */

import { type Lore } from '@/lib/types/lore'

interface DescriptionTemplate {
  builds: string[]       // complexion fisica
  features: string[]     // rasgos faciales/distintivos
  attitudes: string[]    // actitud/comportamiento
  accessories: string[]  // accesorios/detalles
}

const TEMPLATES: Record<string, DescriptionTemplate> = {
  LOTR: {
    builds: [
      'De complexion atletica y paso firme',
      'Alto y delgado, con porte elegante',
      'Robusto y de hombros anchos',
      'De estatura mediana pero fuerte',
      'Esbelto y agil como un elfo',
    ],
    features: [
      'ojos grises que reflejan sabiduria',
      'una barba trenzada al estilo enano',
      'una cicatriz que cruza su mejilla',
      'cabello oscuro y ondulado',
      'rasgos afilados y penetrantes',
      'una mirada que ha visto demasiado',
    ],
    attitudes: [
      'Camina con la determinacion de quien tiene un proposito',
      'Habla poco pero cada palabra tiene peso',
      'Siempre alerta, observando cada sombra',
      'Transmite una calma inquebrantable',
      'Lleva consigo el peso de antiguas memorias',
    ],
    accessories: [
      'Una capa gastada por incontables viajes',
      'Un anillo con inscripciones antiguas',
      'Una pipa de madera tallada',
      'Un broche con el simbolo de su casa',
      'Botas de cuero desgastadas pero resistentes',
    ],
  },

  ZOMBIES: {
    builds: [
      'De aspecto demacrado pero resistente',
      'Curtido por meses de supervivencia',
      'Delgado, con musculos tensos por la alerta constante',
      'Fuerte a pesar de la escasez',
      'Agil y nervioso, listo para correr',
    ],
    features: [
      'ojeras profundas de noches sin dormir',
      'cicatrices de encuentros cercanos',
      'tatuajes de una vida anterior',
      'una mirada que ya no se sorprende de nada',
      'el rostro manchado de polvo y sudor',
      'vendajes improvisados en los brazos',
    ],
    attitudes: [
      'Se mueve en silencio, cada paso calculado',
      'Nunca da la espalda a una puerta',
      'Revisa las salidas antes de entrar a cualquier lugar',
      'Habla en susurros, el ruido atrae a los muertos',
      'Confía poco, pero protege ferozmente a los suyos',
    ],
    accessories: [
      'Una mochila con lo esencial para sobrevivir',
      'Un cuchillo de caza siempre al alcance',
      'Ropa rasgada pero funcional',
      'Un walkie-talkie que ya no funciona',
      'Guantes de cuero sin dedos',
    ],
  },

  ISEKAI: {
    builds: [
      'De apariencia juvenil y energica',
      'Atletico, como si hubiera entrenado en secreto',
      'De complexion normal, pero con un aura especial',
      'Delgado con una gracia inesperada',
      'Robusto, destacando entre los habitantes locales',
    ],
    features: [
      'ojos que brillan con curiosidad por este nuevo mundo',
      'rasgos que delatan un origen distinto',
      'una sonrisa que desafia las adversidades',
      'cabello de un color inusual para estas tierras',
      'una marca brillante en la mano, senial de su invocacion',
    ],
    attitudes: [
      'Afronta cada reto como si fuera un nivel de videojuego',
      'Se sorprende constantemente con la magia de este mundo',
      'Habla de "stats" y "skills" sin que nadie lo entienda',
      'Mantiene un optimismo casi irritante',
      'Analiza todo buscando la "mecanica oculta"',
    ],
    accessories: [
      'Ropa de otro mundo debajo de su armadura',
      'Un smartphone sin bateria, recuerdo de su vida pasada',
      'Un grimorio que aparecio con el',
      'Un collar con un cristal brillante',
      'Zapatillas deportivas que nadie reconoce',
    ],
  },

  VIKINGOS: {
    builds: [
      'Alto y musculoso, forjado en batalla',
      'De complexion robusta como un oso',
      'Agil y fibroso como un lobo',
      'Imponente, con cicatrices de honor',
      'Fuerte como el roble de los bosques del norte',
    ],
    features: [
      'una barba trenzada con cuentas de hueso',
      'ojos azules frios como el hielo',
      'runas tatuadas en el cuello',
      'el cabello rapado a los lados',
      'cicatrices de guerra en el rostro',
      'una mirada que no conoce el miedo',
    ],
    attitudes: [
      'Rie ante el peligro, la muerte es solo un viaje',
      'Habla con la voz del trueno',
      'Valora el honor sobre la vida',
      'Cuenta historias de sus ancestros con orgullo',
      'Bebe hidromiel como si fuera agua',
    ],
    accessories: [
      'Un martillo de Thor colgando del cuello',
      'Pieles de lobo sobre los hombros',
      'Brazaletes de plata robados en incursiones',
      'Un cuerno para beber en el cinturon',
      'Botas forradas para el frio eterno',
    ],
  },

  STAR_WARS: {
    builds: [
      'De porte marcial, con movimientos precisos',
      'Agil y ligero, perfecto para el combate',
      'Robusto, curtido por mil batallas estelares',
      'De complexion normal pero con presencia imponente',
      'Delgado y rapido como un piloto experimentado',
    ],
    features: [
      'ojos que han visto la vastedad del espacio',
      'una cicatriz de un disparo de blaster',
      'rasgos endurecidos por la guerra',
      'una calma que solo da la conexion con la Fuerza',
      'tatuajes de su planeta natal',
    ],
    attitudes: [
      'Siente las perturbaciones en la Fuerza',
      'Siempre tiene un mal presentimiento sobre esto',
      'Actua primero, pregunta despues',
      'Habla de creditos y trabajos con naturalidad',
      'Desconfia del Imperio, o de la Republica, segun el dia',
    ],
    accessories: [
      'Un sable laser oculto bajo la tunica',
      'Una pistola blaster desgastada pero confiable',
      'Un comunicador holografico',
      'Guantes de piloto de la Alianza',
      'Un casco mandaloriano abolaldo',
    ],
  },

  CYBERPUNK: {
    builds: [
      'Cuerpo modificado con implantes visibles',
      'Atletico, mejorado con bioware',
      'Delgado y fibroso, optimizado para velocidad',
      'Robusto, con brazos cromaticos de acero',
      'De apariencia normal, pero lleno de mejoras ocultas',
    ],
    features: [
      'ojos ciberneticos que brillan en la oscuridad',
      'puertos de datos visibles en las sienes',
      'cabello neon que cambia de color',
      'tatuajes animados con LEDs subcutaneos',
      'cicatrices de cirugia de implantes',
      'una mandibula cromatica de acero',
    ],
    attitudes: [
      'Desconfia de las corporaciones mas que de los gangs',
      'Siempre busca la proxima mejora, el proximo upgrade',
      'Habla en jerga callejera mezclada con terminos tecnicos',
      'Vive al borde, cada trabajo puede ser el ultimo',
      'Nunca se desconecta de la Red, ni siquiera para dormir',
    ],
    accessories: [
      'Una chaqueta de cuero con logos de corps quemados',
      'Auriculares de realidad virtual siempre al cuello',
      'Un deck de hacking modificado',
      'Gafas de sol con HUD integrado',
      'Una katana plegable en la espalda',
    ],
  },

  LOVECRAFT_HORROR: {
    builds: [
      'De aspecto fragil, consumido por sus investigaciones',
      'De complexion normal, con una palidez enfermiza',
      'Delgado y nervioso, con ojeras permanentes',
      'Robusto pero con temblores en las manos',
      'De apariencia respetable pero mirada perturbada',
    ],
    features: [
      'ojos hundidos que han visto demasiado',
      'cabello prematuramente canoso',
      'manos manchadas de tinta de antiguos tomos',
      'una mirada que evita las sombras',
      'rasgos aristocraticos pero demacrados',
      'tics nerviosos que no puede controlar',
    ],
    attitudes: [
      'Murmura en lenguas que nadie deberia conocer',
      'Consulta libros incluso en los momentos mas criticos',
      'Teme la oscuridad pero no puede dejar de investigarla',
      'Habla de "Ellos" como si siempre estuvieran escuchando',
      'Sufre pesadillas que no distingue de la realidad',
    ],
    accessories: [
      'Un diario lleno de simbolos incomprensibles',
      'Un medallon con un sello arcano',
      'Gafas redondas para leer textos antiguos',
      'Un baston con empuniadura de plata',
      'Guantes blancos manchados de algo que no es tinta',
    ],
  },

  COZY_WITCH: {
    builds: [
      'De estatura mediana y manos curtidas por la jardinería',
      'Menud@ pero de presencia tranquila',
      'Robust@ de carne suave, brazos fuertes de amasar pan',
      'Alt@ y delgad@, con la postura de quien escucha mucho',
      'De porte sereno, como si nunca tuviera prisa',
    ],
    features: [
      'ojos amables con líneas de risa en los bordes',
      'cabello recogido con un pañuelo bordado',
      'manchas de tierra en las uñas que nunca terminan de irse',
      'una cicatriz pequeña en el pulgar de cuando aprendiste a usar el cuchillo curvo',
      'las pecas de quien pasó muchas tardes en el jardín',
      'una sonrisa que llega antes que las palabras',
    ],
    attitudes: [
      'Camina despacio y mira las plantas al pasar',
      'Habla en voz baja pero la gente la escucha',
      'Siempre tiene té recién hecho para ofrecer',
      'Se acuerda de los nombres de todos los gatos del pueblo',
      'Tiene la calma de quien sabe que las cosas llegan a su tiempo',
    ],
    accessories: [
      'Un delantal con bolsillos llenos de hierbas y un trozo de hilo',
      'Un saquito de tela con semillas para regalar',
      'Una taza de cerámica reparada con oro (kintsugi)',
      'Un pañuelo de cabeza bordado por una abuela',
      'Una llave vieja que abre cualquier puerta del pueblo',
    ],
  },

  ROMANTASY: {
    builds: [
      'De porte elegante y movimientos felinos',
      'Alta y esbelta como una nyfa cortesana',
      'De silueta sensual y andar deliberado',
      'Robust@ pero con gracia inesperada',
      'Etéreo y casi luminoso bajo la luz de las velas',
    ],
    features: [
      'ojos del color de un crepúsculo imposible',
      'una marca de nacimiento con forma de luna',
      'cabello que parece atrapar la luz como hilos de seda',
      'rasgos finos cincelados como por un escultor antiguo',
      'una cicatriz pequeña que solo realza su belleza',
      'una mirada que promete tanto deseo como peligro',
    ],
    attitudes: [
      'Camina como si todos los salones le pertenecieran',
      'Sonríe con la misma facilidad con la que oculta secretos',
      'Cada gesto parece coreografiado por la pasión',
      'Habla en susurros cargados de intención',
      'Lleva el porte de quien sabe ser amad@ y temid@ al mismo tiempo',
    ],
    accessories: [
      'Un anillo con una gema que cambia de color según la emoción',
      'Una capa de seda con bordados de hilo plateado',
      'Un colgante con un mechón de cabello de un amor pasado',
      'Una daga ceremonial siempre cerca, oculta entre los pliegues',
      'Un perfume embriagador con notas de jazmín nocturno',
    ],
  },

  CUSTOM: {
    builds: [
      'De complexion atletica y equilibrada',
      'Alto y de presencia imponente',
      'Agil y de movimientos fluidos',
      'Robusto y resistente',
      'De estatura mediana pero con gran carisma',
    ],
    features: [
      'rasgos distintivos dificiles de olvidar',
      'ojos que revelan una historia compleja',
      'cicatrices que cuentan batallas pasadas',
      'una sonrisa enigmatica',
      'una mirada penetrante',
    ],
    attitudes: [
      'Actua con determinacion y proposito',
      'Observa mas de lo que habla',
      'Inspira confianza en quienes le rodean',
      'Mantiene sus secretos bien guardados',
      'Enfrenta cada desafio con valentia',
    ],
    accessories: [
      'Un objeto personal de gran significado',
      'Ropa practica pero con estilo propio',
      'Un arma que ha visto muchas batallas',
      'Un simbolo de su afiliacion',
      'Accesorios que reflejan su personalidad',
    ],
  },
}

// Complexiones físicas por raza D&D 5e — sobreescriben las del lore
const RACE_BUILDS: Record<string, string[]> = {
  human: [
    'De complexion atletica y equilibrada',
    'De estatura media, con porte decidido',
    'Fuerte y adaptable, como todo humano',
  ],
  elf: [
    'Esbelto y de gracia sobrenatural',
    'Alto y delgado, con porte elegante y etéreo',
    'De movimientos fluidos como el agua',
  ],
  'high-elf': [
    'Alto y de porte aristocratico, con gracia elfica',
    'Esbelto y elegante, con un aura de sabiduria antigua',
  ],
  'wood-elf': [
    'Agil y fibroso, curtido por los bosques',
    'De complexion atletica y piel bronceada por el sol del bosque',
  ],
  dwarf: [
    'Bajo y macizo como la roca de la montaña',
    'Robusto y compacto, con brazos gruesos de herrero',
    'De poca estatura pero de fuerza inmensa',
  ],
  'hill-dwarf': [
    'Bajo y robusto, con una resistencia inquebrantable',
  ],
  'mountain-dwarf': [
    'Compacto como la piedra, con musculos de acero',
  ],
  halfling: [
    'Pequeño y agil, apenas llega a la cintura de un humano',
    'De estatura diminuta pero con una energia desbordante',
    'Menudo y de pies grandes, con una sonrisa picara',
  ],
  gnome: [
    'Pequeño y vivaz, apenas tres pies de alto',
    'Diminuto pero lleno de energia, con ojos curiosos y brillantes',
    'De estatura minuscula pero con una presencia sorprendente',
    'Compacto y nervioso, siempre en movimiento',
  ],
  'rock-gnome': [
    'Pequeño y de manos habiles, siempre toqueteando algun invento',
  ],
  'forest-gnome': [
    'Diminuto y silencioso, en armonia con la naturaleza',
  ],
  dragonborn: [
    'Alto e imponente, con escamas que brillan bajo la luz',
    'De complexion poderosa, con rasgos dracónicos intimidantes',
    'Musculoso y cubierto de escamas, con mandibula pronunciada',
  ],
  'half-elf': [
    'De complexion grácil pero con la solidez humana',
    'Con la elegancia elfica y la determinacion humana en su porte',
  ],
  'half-orc': [
    'Alto y musculoso, con mandibula prominente y colmillos asomando',
    'Imponente y fuerte, de piel verdosa y mirada fiera',
    'De complexion brutal, con cicatrices de innumerables peleas',
  ],
  tiefling: [
    'De porte orgulloso, con cuernos curvados y cola sinuosa',
    'Esbelto y de aspecto infernal, con ojos sin pupilas',
    'De belleza inquietante, con piel de tono carmesí',
  ],
}

// Actitudes por clase D&D 5e — complementan las del lore
const CLASS_ATTITUDES: Record<string, string[]> = {
  barbarian: [
    'Emana una furia contenida, lista para estallar',
    'Se mueve con la ferocidad de una bestia al acecho',
  ],
  bard: [
    'Gesticula al hablar como si cada palabra fuera una cancion',
    'Siempre tiene una sonrisa y una historia que contar',
  ],
  cleric: [
    'Irradia una serenidad que conforta a quienes le rodean',
    'Reza en silencio, sus labios siempre moviéndose en oracion',
  ],
  druid: [
    'Huele a tierra mojada y hojas frescas',
    'Observa la naturaleza con reverencia casi religiosa',
  ],
  fighter: [
    'Se mantiene erguido con disciplina militar',
    'Evalua cada habitacion buscando ventajas tacticas',
  ],
  monk: [
    'Se mueve con una economia de movimiento sobrenatural',
    'Transmite una paz interior que contrasta con su fuerza',
  ],
  paladin: [
    'Camina con la rectitud de quien sirve a un juramento sagrado',
    'Su presencia inspira coraje en los aliados y temor en los enemigos',
  ],
  ranger: [
    'Siempre alerta, leyendo las seniales del entorno',
    'Se mueve en silencio, como una sombra entre los arboles',
  ],
  rogue: [
    'Sus ojos danzan entre las sombras buscando oportunidades',
    'Se mueve con sigilo, sus manos nunca lejos de sus bolsillos',
  ],
  sorcerer: [
    'Un poder arcano vibra bajo su piel, a veces visible como chispas',
    'Sus ojos brillan con magia innata cuando se concentra',
  ],
  warlock: [
    'Lleva el peso de un pacto oscuro en su mirada',
    'Susurra a algo que nadie mas puede ver ni oir',
  ],
  wizard: [
    'Entrecierra los ojos analizando todo con mente analitica',
    'Siempre tiene un libro o pergamino entre las manos',
  ],
}

/**
 * Genera una descripcion aleatoria basada en el lore, raza y clase
 */
export function generateRandomDescription(
  lore: Lore,
  raceId?: string,
  classId?: string
): string {
  const template = TEMPLATES[lore] || TEMPLATES.CUSTOM
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

  // Complexion: usar la de la raza si existe, sino la del lore
  const raceBuilds = raceId ? (RACE_BUILDS[raceId] || RACE_BUILDS[raceId.split('-')[0]]) : null
  const build = raceBuilds ? pick(raceBuilds) : pick(template.builds)

  const feature = pick(template.features)

  // Actitud: usar la de la clase si existe, sino la del lore
  const classAttitudes = classId ? CLASS_ATTITUDES[classId] : null
  const attitude = classAttitudes ? pick(classAttitudes) : pick(template.attitudes)

  const accessory = pick(template.accessories)

  return `${build}, con ${feature}. ${attitude}. ${accessory}.`
}

/**
 * Obtiene los templates disponibles para un lore (para UI avanzada)
 */
export function getTemplatesForLore(lore: Lore): DescriptionTemplate {
  return TEMPLATES[lore] || TEMPLATES.CUSTOM
}
