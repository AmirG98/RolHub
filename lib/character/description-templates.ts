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

const TEMPLATES: Record<Lore, DescriptionTemplate> = {
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

/**
 * Genera una descripcion aleatoria basada en el lore
 */
export function generateRandomDescription(lore: Lore): string {
  const template = TEMPLATES[lore] || TEMPLATES.CUSTOM

  const build = template.builds[Math.floor(Math.random() * template.builds.length)]
  const feature = template.features[Math.floor(Math.random() * template.features.length)]
  const attitude = template.attitudes[Math.floor(Math.random() * template.attitudes.length)]
  const accessory = template.accessories[Math.floor(Math.random() * template.accessories.length)]

  // Combinar en una descripcion coherente
  return `${build}, con ${feature}. ${attitude}. ${accessory}.`
}

/**
 * Obtiene los templates disponibles para un lore (para UI avanzada)
 */
export function getTemplatesForLore(lore: Lore): DescriptionTemplate {
  return TEMPLATES[lore] || TEMPLATES.CUSTOM
}
