export interface Item {
  slug: string
  name: string
  lore: string
  loreName: string
  type: 'weapon' | 'armor' | 'potion' | 'artifact' | 'tool' | 'consumable'
  rarity: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary'
  description: string
  properties: string[]
  damage?: string
  ac?: number
  weight: string
  value: string
  imagePrompt: string
  tags: string[]
}

// ============================================================
// TIERRA MEDIA (LOTR) — 8 items
// ============================================================

const LOTR_ITEMS: Item[] = [
  {
    slug: 'dardo', name: 'Dardo (Sting)', lore: 'LOTR', loreName: 'Tierra Media',
    type: 'weapon', rarity: 'rare',
    description: 'Espada corta élfica forjada en Gondolin durante la Primera Edad. Su hoja brilla con luz azul cuando los orcos están cerca, sirviendo como advertencia silenciosa. Fue portada por Bilbo y luego por Frodo.',
    properties: ['Detección de orcos: brilla azul a 60 pies', '+1 al ataque contra orcos y trasgos', 'Arma élfica: ignora resistencia a daño no-mágico'],
    damage: '1d6+1 perforante',
    weight: '1 lb', value: 'Incalculable',
    imagePrompt: 'elven short sword Sting glowing blue, intricate elvish runes on blade, leather wrapped hilt, dark cave background, tolkien fantasy oil painting style',
    tags: ['espada', 'élfico', 'orco', 'legendario'],
  },
  {
    slug: 'glamdring', name: 'Glamdring', lore: 'LOTR', loreName: 'Tierra Media',
    type: 'weapon', rarity: 'legendary',
    description: 'La Espada Martillo de Enemigos, forjada para el Rey Turgon de Gondolin. Brilla con fuego blanco en presencia del mal. Gandalf la portó durante la Guerra del Anillo y con ella enfrentó al Balrog.',
    properties: ['+3 al ataque contra orcos y demonios', 'Brilla con luz blanca a 30 pies del mal', 'Arma élfica ancestral: ignora toda resistencia a daño', 'Ventaja en tiradas de Intimidación con la espada desenvainada'],
    damage: '2d6+3 cortante + 1d6 radiante vs mal',
    weight: '4 lb', value: 'Incalculable',
    imagePrompt: 'glamdring elven longsword, white glowing blade with ancient runes, golden hilt with jewels, gandalf weapon, tolkien epic fantasy painting',
    tags: ['espada', 'élfico', 'gandalf', 'legendario'],
  },
  {
    slug: 'cota-de-mithril', name: 'Cota de Mithril', lore: 'LOTR', loreName: 'Tierra Media',
    type: 'armor', rarity: 'legendary',
    description: 'Cota de malla enana forjada en mithril puro, el metal más precioso de la Tierra Media. Ligera como una pluma pero más resistente que el acero de dragón. Fue un regalo del Rey Thorin a Bilbo.',
    properties: ['AC 18 (no requiere competencia)', 'No impone desventaja en Sigilo', 'Pesa como tela de seda', 'Resistencia a daño perforante y cortante'],
    ac: 18,
    weight: '2 lb', value: 'Más que todo el Condado junto',
    imagePrompt: 'mithril chainmail shirt, shimmering silver mesh, incredibly detailed dwarven craftsmanship, glowing faintly, tolkien fantasy painting',
    tags: ['armadura', 'enano', 'mithril', 'legendario'],
  },
  {
    slug: 'frasco-de-galadriel', name: 'Frasco de Galadriel', lore: 'LOTR', loreName: 'Tierra Media',
    type: 'artifact', rarity: 'very-rare',
    description: 'Un frasco de cristal que contiene la luz de Eärendil, la estrella más brillante del cielo. Dado por Galadriel a Frodo como luz en los lugares oscuros. Su resplandor ahuyenta a las criaturas de la sombra.',
    properties: ['Emite luz brillante a 30 pies y tenue a 60', 'Las criaturas del mal deben superar CD 16 WIS o huyen', 'Ventaja en salvaciones contra miedo y oscuridad mágica', 'Funciona donde toda otra luz falla'],
    weight: '0.5 lb', value: 'Incalculable',
    imagePrompt: 'phial of galadriel, crystal vial with brilliant white starlight, ethereal glow illuminating darkness, tolkien fantasy art, magical light painting',
    tags: ['artefacto', 'luz', 'élfico', 'protección'],
  },
  {
    slug: 'palantir', name: 'Palantír', lore: 'LOTR', loreName: 'Tierra Media',
    type: 'artifact', rarity: 'legendary',
    description: 'Una de las Piedras Videntes forjadas por Fëanor en Valinor. Permite ver lugares y personas distantes, y comunicarse con quien posea otra Palantír. Su uso conlleva el riesgo de ser detectado por Sauron.',
    properties: ['Visión remota: ver cualquier lugar a cualquier distancia', 'Comunicación telepática con otros portadores de Palantír', 'Riesgo: CD 18 WIS o Sauron detecta al usuario', 'Requiere 1 hora de concentración para activar'],
    weight: '8 lb', value: 'Incalculable',
    imagePrompt: 'palantir seeing stone, dark crystal orb with swirling mist inside, faint orange glow, hands reaching toward it, tolkien dark fantasy painting',
    tags: ['artefacto', 'visión', 'comunicación', 'peligroso'],
  },
  {
    slug: 'lembas', name: 'Lembas', lore: 'LOTR', loreName: 'Tierra Media',
    type: 'consumable', rarity: 'uncommon',
    description: 'El pan de viaje élfico, envuelto en hojas de mallorn. Un solo bocado puede alimentar a un hombre adulto durante un día entero de marcha. Se mantiene fresco durante meses si se conserva en sus hojas.',
    properties: ['Un bocado alimenta por 24 horas', 'Restaura 2d4+2 HP al consumir una ración completa', 'Se conserva fresco 3 meses en sus hojas', 'Incomestible para criaturas del mal'],
    weight: '0.1 lb', value: '50 monedas de oro',
    imagePrompt: 'lembas bread, golden wafer wrapped in green mallorn leaves, elvish food, soft warm light, tolkien fantasy still life painting',
    tags: ['comida', 'curación', 'élfico', 'viaje'],
  },
  {
    slug: 'capa-elfica', name: 'Capa Élfica', lore: 'LOTR', loreName: 'Tierra Media',
    type: 'armor', rarity: 'rare',
    description: 'Capa tejida por los elfos de Lórien con hilos que cambian de color según el entorno. Quien la porta se mimetiza con su alrededor, volviéndose casi invisible. Un broche en forma de hoja la sujeta.',
    properties: ['Ventaja en tiradas de Sigilo', 'Camufla al portador: +5 a CD para ser detectado', 'Protege contra frío y calor extremo', 'Broche de hoja: no puede perderse accidentalmente'],
    ac: 1,
    weight: '1 lb', value: '500 monedas de oro',
    imagePrompt: 'elven cloak lorien, shimmering grey-green fabric that blends with surroundings, leaf-shaped silver brooch, tolkien fantasy painting',
    tags: ['capa', 'sigilo', 'élfico', 'protección'],
  },
  {
    slug: 'athelas', name: 'Athelas (Hierba del Rey)', lore: 'LOTR', loreName: 'Tierra Media',
    type: 'consumable', rarity: 'rare',
    description: 'Planta curativa traída a la Tierra Media por los Númenóreanos. En manos de un verdadero sanador, puede curar heridas envenenadas y el Aliento Negro de los Nazgûl. Su fragancia purifica el aire.',
    properties: ['Cura veneno y enfermedad en manos de un sanador', 'Neutraliza el Aliento Negro de los Nazgûl', 'Restaura 4d4+4 HP cuando se prepara correctamente', 'Purifica el aire: bonus +2 a salvaciones en el área'],
    weight: '0.1 lb', value: '200 monedas de oro',
    imagePrompt: 'athelas kingsfoil herb, small white flowers with green leaves, mortar and pestle, healing light, tolkien botanical fantasy illustration',
    tags: ['hierba', 'curación', 'veneno', 'sanación'],
  },
]

// ============================================================
// APOCALIPSIS ZOMBIE — 7 items
// ============================================================

const ZOMBIE_ITEMS: Item[] = [
  {
    slug: 'machete-reforzado', name: 'Machete Reforzado', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie',
    type: 'weapon', rarity: 'common',
    description: 'Un machete de hoja ancha reforzado con cinta industrial y un mango envuelto en cuero. Silencioso, confiable y letal contra caminantes. El arma favorita de los supervivientes que saben que el ruido atrae hordas.',
    properties: ['Silencioso: no atrae zombies al usarse', '+2 al daño contra no-muertos', 'No requiere munición', 'Puede usarse para abrir camino en vegetación'],
    damage: '1d8+1 cortante',
    weight: '2 lb', value: '2 latas de conserva',
    imagePrompt: 'reinforced machete, wide blade wrapped with duct tape handle, bloodstained, post-apocalyptic gritty photography style, desaturated',
    tags: ['cuerpo-a-cuerpo', 'silencioso', 'confiable', 'zombie'],
  },
  {
    slug: 'escopeta-recortada', name: 'Escopeta Recortada', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie',
    type: 'weapon', rarity: 'uncommon',
    description: 'Una escopeta de doble cañón con los cañones recortados para mayor maniobrabilidad en espacios cerrados. Devastadora a corta distancia pero ruidosa. Cada disparo puede atraer caminantes en un radio amplio.',
    properties: ['Alcance corto: 15/30 pies', 'Ruidosa: atrae zombies en 300 pies', '2 disparos antes de recargar', 'Daño en área a 5 pies (cono)'],
    damage: '2d8 perforante (corto alcance) / 2d4 (largo)',
    weight: '5 lb', value: '20 balas de cualquier calibre',
    imagePrompt: 'sawed-off double barrel shotgun, worn wood stock, scratched metal, post-apocalyptic setting, gritty dark cinematic photography',
    tags: ['arma-de-fuego', 'ruidosa', 'potente', 'corto-alcance'],
  },
  {
    slug: 'botiquin-militar', name: 'Botiquín Militar', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie',
    type: 'tool', rarity: 'rare',
    description: 'Un kit médico táctico recuperado de una base militar abandonada. Contiene antibióticos, suturas, torniquetes y analgésicos. En un mundo sin hospitales, esto vale más que el oro.',
    properties: ['5 usos antes de agotarse', 'Cada uso restaura 3d8+3 HP', 'Puede estabilizar a un aliado a 0 HP automáticamente', 'Contiene antibióticos: cura infecciones no-zombie'],
    weight: '3 lb', value: 'Un arma de fuego con munición',
    imagePrompt: 'military first aid kit, olive green case with red cross, medical supplies scattered, abandoned military base, gritty cinematic photography',
    tags: ['médico', 'curación', 'militar', 'valioso'],
  },
  {
    slug: 'chaleco-antibalas', name: 'Chaleco Antibalas', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie',
    type: 'armor', rarity: 'uncommon',
    description: 'Chaleco táctico de kevlar nivel IIIA recuperado de un puesto de policía. Protege torso y espalda contra mordidas y proyectiles. Pesado e incómodo, pero puede ser la diferencia entre vivir y morir.',
    properties: ['Resistencia a daño perforante de proyectiles', 'Protege contra mordidas: +3 AC vs ataques de zombie', 'Desventaja en Sigilo por peso', 'Se degrada: pierde 1 AC por cada 10 impactos'],
    ac: 15,
    weight: '8 lb', value: '10 latas de conserva',
    imagePrompt: 'bulletproof vest kevlar, worn police tactical vest, scratches and dirt, post-apocalyptic gritty photography, dark desaturated',
    tags: ['armadura', 'protección', 'kevlar', 'pesado'],
  },
  {
    slug: 'molotov', name: 'Cóctel Molotov', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie',
    type: 'consumable', rarity: 'common',
    description: 'Una botella llena de gasolina con un trapo como mecha. Arma improvisada pero devastadora contra grupos de caminantes. El fuego los atrae primero y los destruye después. Úsalo con cuidado.',
    properties: ['Área de efecto: 10 pies de radio', '3d6 daño de fuego por turno durante 2 turnos', 'Atrae zombies al área de fuego', 'Un solo uso', 'Riesgo: CD 10 DEX o te quemas al lanzar'],
    damage: '3d6 fuego (área)',
    weight: '1 lb', value: '1 lata de conserva',
    imagePrompt: 'molotov cocktail, glass bottle with burning rag, gasoline sloshing inside, dark urban ruins background, gritty cinematic photo style',
    tags: ['explosivo', 'fuego', 'área', 'improvisado'],
  },
  {
    slug: 'walkie-talkie', name: 'Walkie-Talkie', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie',
    type: 'tool', rarity: 'uncommon',
    description: 'Un par de radios portátiles con baterías recargables mediante manivela. Permiten comunicación a distancia en un mundo sin celulares. Esencial para coordinar grupos de exploración y emboscadas.',
    properties: ['Alcance: 2 millas en terreno abierto', 'Batería: 8 horas de uso, recargable con manivela', 'Permite coordinar acciones a distancia', 'Riesgo: otros supervivientes pueden interceptar señales'],
    weight: '0.5 lb', value: '5 latas de conserva',
    imagePrompt: 'handheld walkie talkie radio, scratched black plastic, antenna extended, hand crank charger, post-apocalyptic setting, gritty photography',
    tags: ['comunicación', 'herramienta', 'coordinación', 'electrónico'],
  },
  {
    slug: 'trampa-de-alambre', name: 'Trampa de Alambre', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie',
    type: 'tool', rarity: 'common',
    description: 'Un kit de alambre de púas y latas vacías para crear perímetros defensivos. Las latas actúan como alarma improvisada y el alambre frena a los caminantes. Esencial para asegurar campamentos nocturnos.',
    properties: ['Cubre un perímetro de 30 pies', 'Alarma: las latas alertan de intrusos', 'Los zombies deben superar CD 12 FUE o quedan atrapados', '1d4 daño cortante al cruzar', 'Reutilizable 3 veces'],
    weight: '4 lb', value: '3 latas de conserva',
    imagePrompt: 'barbed wire trap with tin cans alarm, defensive perimeter at night camp, post-apocalyptic survival setup, dark gritty cinematic photography',
    tags: ['trampa', 'defensa', 'perímetro', 'improvisado'],
  },
]

// ============================================================
// SAGA VIKINGA — 7 items
// ============================================================

const VIKING_ITEMS: Item[] = [
  {
    slug: 'hacha-de-guerra-runica', name: 'Hacha de Guerra Rúnica', lore: 'VIKINGOS', loreName: 'Saga Vikinga',
    type: 'weapon', rarity: 'rare',
    description: 'Un hacha de guerra nórdica con runas grabadas por un gothi en su hoja de hierro oscuro. Las runas canalizan la furia del portador, haciendo cada golpe más devastador. Zumba al ser blandida.',
    properties: ['+2 al daño cuando HP < 50%', 'Runas de Furia: ventaja en el primer ataque de cada combate', 'Puede lanzarse a 20/60 pies', 'Requiere ofrenda de sangre mensual para mantener las runas activas'],
    damage: '1d10+2 cortante',
    weight: '4 lb', value: '3 brazaletes de plata',
    imagePrompt: 'norse runic war axe, dark iron blade with glowing red runes, leather wrapped handle, viking style, muted earth tones painterly epic',
    tags: ['hacha', 'runas', 'furia', 'nórdico'],
  },
  {
    slug: 'escudo-de-madera-sagrada', name: 'Escudo de Madera Sagrada', lore: 'VIKINGOS', loreName: 'Saga Vikinga',
    type: 'armor', rarity: 'uncommon',
    description: 'Escudo redondo tallado en roble de un bosque sagrado dedicado a Yggdrasil. Los espíritus del bosque protegen a su portador, y la madera resiste golpes que destrozarían el acero común.',
    properties: ['+2 AC mientras se empuña', 'Resistencia a daño mágico de origen oscuro', 'Puede usarse como arma improvisada: 1d4 contundente', 'Se repara solo: recupera 1 punto de durabilidad por día'],
    ac: 2,
    weight: '6 lb', value: '2 brazaletes de plata',
    imagePrompt: 'round viking shield, sacred oak wood with knotwork carvings, iron boss center, faint green glow, norse mythology art painterly',
    tags: ['escudo', 'madera', 'sagrado', 'protección'],
  },
  {
    slug: 'hidromiel-de-odin', name: 'Hidromiel de Odín', lore: 'VIKINGOS', loreName: 'Saga Vikinga',
    type: 'potion', rarity: 'very-rare',
    description: 'Un cuerno lleno de hidromiel bendecido en un ritual a Odín durante el solsticio de invierno. Quien lo bebe recibe visiones del Padre de Todos y una fuerza sobrehumana temporal. Solo los dignos pueden beberlo.',
    properties: ['+4 a FUE y CON durante 10 minutos', 'Otorga visión profética: una pregunta al DM respondida con verdad', 'Efecto secundario: CD 14 CON o inconsciente 1 hora al terminar', 'Un solo uso'],
    weight: '1 lb', value: '10 brazaletes de plata',
    imagePrompt: 'drinking horn filled with golden mead, runes carved on horn, mist and divine light, norse mythology art, epic painterly style',
    tags: ['poción', 'fuerza', 'visión', 'odín'],
  },
  {
    slug: 'amuleto-de-thor', name: 'Amuleto de Thor (Mjölnir)', lore: 'VIKINGOS', loreName: 'Saga Vikinga',
    type: 'artifact', rarity: 'rare',
    description: 'Un colgante de plata en forma del martillo de Thor. Protege contra las fuerzas del caos y los gigantes de hielo. En tormentas, el amuleto vibra y otorga resistencia al rayo.',
    properties: ['Resistencia a daño eléctrico', '+2 a salvaciones contra miedo', 'En tormentas: +1d6 daño eléctrico al cuerpo a cuerpo', 'Protección contra gigantes: +2 AC vs criaturas Grandes o mayores'],
    weight: '0.2 lb', value: '5 brazaletes de plata',
    imagePrompt: 'mjolnir pendant, silver thor hammer amulet, intricate norse knotwork, lightning crackling around it, norse mythology art painterly',
    tags: ['amuleto', 'thor', 'rayo', 'protección'],
  },
  {
    slug: 'espada-ulfberht', name: 'Espada Ulfberht', lore: 'VIKINGOS', loreName: 'Saga Vikinga',
    type: 'weapon', rarity: 'very-rare',
    description: 'Una espada vikinga forjada con acero crisol, tecnología muy superior a su época. La inscripción +ULFBERHT+ en su hoja indica al maestro herrero. Más ligera, afilada y resistente que cualquier espada común.',
    properties: ['+2 al ataque y daño', 'Crítico en 19-20', 'No se rompe ni se mella bajo circunstancias normales', 'Ventaja en tiradas de Intimidación cuando se muestra'],
    damage: '1d8+2 cortante',
    weight: '3 lb', value: '8 brazaletes de plata',
    imagePrompt: 'ulfberht viking sword, crucible steel blade with inscription, ornate pommel, dark background, norse historical art epic painterly',
    tags: ['espada', 'acero', 'élite', 'vikingo'],
  },
  {
    slug: 'mapa-de-las-estrellas', name: 'Mapa de las Estrellas', lore: 'VIKINGOS', loreName: 'Saga Vikinga',
    type: 'tool', rarity: 'uncommon',
    description: 'Un pergamino de piel de cabra con constelaciones nórdicas y rutas de navegación marcadas. Permite navegar por mar abierto sin perder el rumbo. Los mejores navegantes vikingos nunca zarpan sin uno.',
    properties: ['Ventaja en tiradas de Navegación y Supervivencia en el mar', 'Permite trazar rutas marítimas a territorios desconocidos', 'Funciona de noche con estrellas visibles', 'Incluye marcas de puertos seguros y peligros marinos'],
    weight: '0.5 lb', value: '3 brazaletes de plata',
    imagePrompt: 'norse star map on goatskin parchment, constellation drawings, runic annotations, navigation routes, candlelit table, viking art style',
    tags: ['navegación', 'mapa', 'mar', 'herramienta'],
  },
  {
    slug: 'capa-de-piel-de-oso', name: 'Capa de Piel de Oso', lore: 'VIKINGOS', loreName: 'Saga Vikinga',
    type: 'armor', rarity: 'uncommon',
    description: 'Una gruesa capa hecha de la piel de un oso pardo cazado en ritual berserker. Quien la viste canaliza el espíritu del oso, ganando resistencia sobrehumana al frío y una presencia intimidante.',
    properties: ['Inmunidad al frío natural', 'Resistencia a daño de frío mágico', '+2 a tiradas de Intimidación', 'Berserker: una vez por día, puede entrar en furia (+2 daño, -2 AC) por 3 turnos'],
    ac: 1,
    weight: '5 lb', value: '4 brazaletes de plata',
    imagePrompt: 'bear skin cloak, massive brown fur draped over shoulders, viking warrior wearing it, snow falling, norse epic painterly art style',
    tags: ['capa', 'oso', 'berserker', 'frío'],
  },
]

// ============================================================
// MUNDO ISEKAI — 8 items
// ============================================================

const ISEKAI_ITEMS: Item[] = [
  {
    slug: 'espada-del-heroe', name: 'Espada del Héroe', lore: 'ISEKAI', loreName: 'Mundo Isekai',
    type: 'weapon', rarity: 'legendary',
    description: 'La espada legendaria que solo puede empuñar el Héroe Invocado. Su hoja de luz se adapta al nivel de poder de su portador, creciendo junto a él. Dicen que en su máximo poder puede cortar dimensiones.',
    properties: ['El daño escala con el nivel del portador', 'Solo puede ser empuñada por el Héroe', 'Emite luz a 20 pies', 'Evoluciona: desbloquea habilidades cada 5 niveles', 'Habilidad final (nivel 20): Corte Dimensional'],
    damage: '2d6 + nivel del portador (radiante)',
    weight: '3 lb', value: 'No tiene precio — vinculada al alma del Héroe',
    imagePrompt: 'hero legendary sword, glowing white blade with golden runes, anime illustration style, vibrant colors, dramatic pose, studio ghibli inspired',
    tags: ['espada', 'héroe', 'evolutiva', 'legendaria'],
  },
  {
    slug: 'bolsa-dimensional', name: 'Bolsa Dimensional', lore: 'ISEKAI', loreName: 'Mundo Isekai',
    type: 'artifact', rarity: 'uncommon',
    description: 'Una bolsa de cuero que contiene un espacio dimensional en su interior, capaz de almacenar objetos que exceden su tamaño físico. Artículo estándar de los aventureros en este mundo. Muy conveniente para el loot.',
    properties: ['Almacena hasta 500 lb sin cambiar de peso', 'Peso de la bolsa: siempre 2 lb', 'Organización mental: piensa en el objeto y aparece', 'No almacena criaturas vivas ni otra bolsa dimensional'],
    weight: '2 lb', value: '5.000 monedas de oro',
    imagePrompt: 'dimensional bag, leather pouch with glowing purple interior, items floating inside pocket dimension, anime fantasy illustration vibrant',
    tags: ['almacenamiento', 'dimensional', 'utilidad', 'aventurero'],
  },
  {
    slug: 'pocion-de-curacion', name: 'Poción de Curación', lore: 'ISEKAI', loreName: 'Mundo Isekai',
    type: 'potion', rarity: 'common',
    description: 'Un frasco de cristal con líquido rojo brillante, el artículo más vendido en cualquier tienda de aventureros. Sabe a fresa con un toque metálico. Cura heridas menores instantáneamente al beberla.',
    properties: ['Restaura 2d4+2 HP al beber', 'Efecto instantáneo', 'Se puede usar en combate como acción bonus', 'Disponible en cualquier tienda de aventureros'],
    weight: '0.5 lb', value: '50 monedas de oro',
    imagePrompt: 'healing potion, red glowing liquid in crystal flask, bubbling, anime illustration style, item shop background, vibrant colorful',
    tags: ['poción', 'curación', 'básica', 'tienda'],
  },
  {
    slug: 'grimorio-ancestral', name: 'Grimorio Ancestral', lore: 'ISEKAI', loreName: 'Mundo Isekai',
    type: 'artifact', rarity: 'very-rare',
    description: 'Un tomo antiguo con conocimiento mágico acumulado durante mil años. Sus páginas se revelan gradualmente según el nivel arcano del lector. Contiene hechizos olvidados por el mundo moderno.',
    properties: ['Desbloquea 1 hechizo nuevo cada 3 niveles', 'Contiene 20 hechizos de nivel 1 a 9', '+2 al modificador de hechizos', 'Páginas protegidas: solo el dueño puede leerlas', 'Se vincula al primer mago que lo toca'],
    weight: '3 lb', value: '50.000 monedas de oro',
    imagePrompt: 'ancient grimoire, thick leather bound book with glowing runes, floating magical pages, anime fantasy illustration, mystical purple light',
    tags: ['libro', 'magia', 'hechizos', 'ancestral'],
  },
  {
    slug: 'anillo-de-invisibilidad', name: 'Anillo de Invisibilidad', lore: 'ISEKAI', loreName: 'Mundo Isekai',
    type: 'artifact', rarity: 'rare',
    description: 'Un anillo de plata con una gema transparente que otorga invisibilidad total al portador. Muy codiciado por ladrones y asesinos del gremio. El efecto se rompe al atacar o lanzar un hechizo.',
    properties: ['Invisibilidad total como acción', 'Duración: 10 minutos o hasta atacar/lanzar hechizo', '3 cargas por día, se recargan al amanecer', 'No oculta sonido ni olor'],
    weight: '0.1 lb', value: '25.000 monedas de oro',
    imagePrompt: 'invisibility ring, silver band with transparent gem, character fading to invisible, anime fantasy illustration, sparkle effects',
    tags: ['anillo', 'invisibilidad', 'sigilo', 'gremio'],
  },
  {
    slug: 'baston-del-archimago', name: 'Bastón del Archimago', lore: 'ISEKAI', loreName: 'Mundo Isekai',
    type: 'weapon', rarity: 'legendary',
    description: 'El bastón de cristal y madera de árbol mundo que perteneció al Archimago que selló al Rey Demonio hace 1000 años. Canaliza maná puro y amplifica cualquier hechizo lanzado a través de él.',
    properties: ['+3 al modificador de hechizos', 'Los hechizos cuestan 1 nivel de slot menos', 'Puede almacenar 1 hechizo para lanzarlo instantáneamente', 'Habilidad especial: Explosión Arcana — 8d6 daño de fuerza, 1 uso por día'],
    damage: '1d8 contundente + 2d6 fuerza (como arma)',
    weight: '4 lb', value: 'Tesoro nacional del reino',
    imagePrompt: 'archmage staff, crystal orb on twisted world-tree wood, glowing arcane energy, anime fantasy illustration, epic magical aura',
    tags: ['bastón', 'magia', 'archimago', 'legendario'],
  },
  {
    slug: 'amuleto-de-respawn', name: 'Amuleto de Respawn', lore: 'ISEKAI', loreName: 'Mundo Isekai',
    type: 'artifact', rarity: 'legendary',
    description: 'Un amuleto de cristal rojo que permite al portador revivir una vez si muere, reapareciendo en el último punto seguro visitado. El cristal se quiebra al usarse. Extremadamente raro y codiciado.',
    properties: ['Al morir, revive con 1 HP en el último punto seguro', 'Se destruye al activarse', 'Tarda 1 hora en hacer efecto (el cuerpo desaparece)', 'No funciona contra muerte por vejez', 'Solo puede portarse 1 a la vez'],
    weight: '0.2 lb', value: '100.000 monedas de oro',
    imagePrompt: 'respawn amulet, red crystal pendant with crack, glowing warmly, soul energy swirling, anime fantasy illustration, dramatic lighting',
    tags: ['amuleto', 'resurrección', 'único', 'vida-extra'],
  },
  {
    slug: 'botas-de-velocidad', name: 'Botas de Velocidad', lore: 'ISEKAI', loreName: 'Mundo Isekai',
    type: 'armor', rarity: 'rare',
    description: 'Botas de cuero encantadas con runas de viento que duplican la velocidad de movimiento del portador. Dejan estelas de luz al correr. Un must-have para scouts y mensajeros del gremio de aventureros.',
    properties: ['Velocidad de movimiento x2', 'Pueden activar un Dash gratuito 3 veces por día', 'No dejan huellas al caminar', 'Ventaja en tiradas de Acrobacia'],
    ac: 0,
    weight: '1 lb', value: '15.000 monedas de oro',
    imagePrompt: 'speed boots, leather boots with wind runes, light trails, character running fast, anime fantasy illustration, motion blur vibrant',
    tags: ['botas', 'velocidad', 'movimiento', 'viento'],
  },
]

// ============================================================
// STAR WARS — 7 items
// ============================================================

const STAR_WARS_ITEMS: Item[] = [
  {
    slug: 'lightsaber', name: 'Lightsaber', lore: 'STAR_WARS', loreName: 'Star Wars',
    type: 'weapon', rarity: 'very-rare',
    description: 'El arma elegante de una era más civilizada. Un sable de luz construido por un Jedi como parte de su entrenamiento. El cristal kyber en su interior define su color y sintoniza con la Fuerza de su creador.',
    properties: ['Corta casi cualquier material excepto beskar y cortosis', 'Puede deflectar disparos de blaster (requiere tirada)', 'Daño extra contra usuarios del Lado Oscuro', 'Requiere conexión con la Fuerza para máximo potencial'],
    damage: '2d10 radiante + modificador de Fuerza',
    weight: '1 lb', value: 'No tiene precio — se construye, no se compra',
    imagePrompt: 'lightsaber, glowing blue plasma blade, metallic hilt with crystal chamber, dark background, star wars cinematic lighting dramatic',
    tags: ['sable', 'jedi', 'fuerza', 'legendario'],
  },
  {
    slug: 'blaster-dl-44', name: 'Blaster DL-44', lore: 'STAR_WARS', loreName: 'Star Wars',
    type: 'weapon', rarity: 'uncommon',
    description: 'El blaster pesado favorito de contrabandistas y cazarrecompensas. Potente, compacto y fácil de ocultar. Técnicamente ilegal en la mayoría de los sistemas del Borde Interior, lo cual lo hace aún más popular.',
    properties: ['Alcance: 50/120 pies', 'Puede ocultarse bajo ropa: +2 a ocultamiento', 'Sobrecarga: puedes duplicar daño pero el blaster se recalienta 1 turno', '50 disparos por celda de energía'],
    damage: '2d6 energía',
    weight: '1 lb', value: '500 créditos',
    imagePrompt: 'DL-44 blaster pistol, worn metal finish, holster on belt, star wars cantina background, cinematic sci-fi lighting',
    tags: ['blaster', 'pistola', 'contrabandista', 'compacto'],
  },
  {
    slug: 'armadura-mandaloriana', name: 'Armadura Mandaloriana', lore: 'STAR_WARS', loreName: 'Star Wars',
    type: 'armor', rarity: 'legendary',
    description: 'Armadura completa forjada en beskar puro, el metal más resistente de la galaxia. Puede resistir impactos de lightsaber y blaster pesado. Para los Mandalorianos, la armadura es más que protección — es identidad.',
    properties: ['AC 20', 'Resistencia a daño de energía y radiante', 'Inmune al corte de lightsaber', 'Casco con HUD: visión nocturna + scanner térmico', 'Sellada: protección ambiental completa'],
    ac: 20,
    weight: '25 lb', value: 'Incalculable — patrimonio mandaloriano',
    imagePrompt: 'mandalorian beskar armor, full set with T-visor helmet, scratched silver metal, star wars cinematic epic dark lighting',
    tags: ['armadura', 'beskar', 'mandaloriano', 'legendario'],
  },
  {
    slug: 'holocron', name: 'Holocrón', lore: 'STAR_WARS', loreName: 'Star Wars',
    type: 'artifact', rarity: 'very-rare',
    description: 'Un dispositivo de almacenamiento de conocimiento Jedi o Sith en forma de cubo o pirámide. Contiene las enseñanzas holográficas de un maestro antiguo. Solo puede abrirlo un usuario de la Fuerza sensible.',
    properties: ['Contiene conocimiento de un maestro Jedi/Sith', 'Solo se abre con la Fuerza', 'Enseña 1 poder de la Fuerza nuevo al interactuar', 'Holocrón Sith: riesgo de corrupción del Lado Oscuro', 'Proyecta hologramas interactivos del maestro guardián'],
    weight: '1 lb', value: '50.000 créditos en el mercado negro',
    imagePrompt: 'jedi holocron, glowing blue crystalline cube, holographic figure emerging, ancient jedi temple, star wars mystical lighting',
    tags: ['holocrón', 'fuerza', 'conocimiento', 'jedi'],
  },
  {
    slug: 'bacta-tank-portatil', name: 'Bacta Tank Portátil', lore: 'STAR_WARS', loreName: 'Star Wars',
    type: 'tool', rarity: 'rare',
    description: 'Una versión compacta del tanque de bacta médico, del tamaño de una mochila grande. Contiene suficiente bacta concentrado para tratar heridas graves en el campo. Estándar en las fuerzas de élite de la República.',
    properties: ['3 dosis de bacta concentrado', 'Cada dosis restaura 6d8 HP en 10 minutos', 'Puede reattachar extremidades si se aplica dentro de 1 hora', 'Cura envenenamiento y enfermedades biológicas', 'Requiere reabastecimiento en estación médica'],
    weight: '10 lb', value: '2.000 créditos por recarga',
    imagePrompt: 'portable bacta tank, compact medical device with blue glowing fluid, star wars military medkit, sci-fi cinematic lighting',
    tags: ['médico', 'bacta', 'curación', 'militar'],
  },
  {
    slug: 'thermal-detonator', name: 'Detonador Termal', lore: 'STAR_WARS', loreName: 'Star Wars',
    type: 'consumable', rarity: 'rare',
    description: 'Un explosivo esférico capaz de desintegrar todo en un radio de 5 metros. Arma favorita de cazarrecompensas para negociaciones tensas. Su temporizador se activa con un botón de presión muerta.',
    properties: ['Radio de explosión: 20 pies', '8d6 daño de fuego + 4d6 de fuerza', 'Temporizador: 1-10 segundos configurable', 'Opción de presión muerta: explota si sueltas el botón', 'Un solo uso — obviamente'],
    damage: '8d6 fuego + 4d6 fuerza (área)',
    weight: '0.5 lb', value: '2.000 créditos',
    imagePrompt: 'thermal detonator, metallic sphere with red activation light, held in gloved hand, star wars cantina tense scene, cinematic lighting',
    tags: ['explosivo', 'área', 'devastador', 'negociación'],
  },
  {
    slug: 'jetpack', name: 'Jetpack', lore: 'STAR_WARS', loreName: 'Star Wars',
    type: 'tool', rarity: 'uncommon',
    description: 'Mochila propulsora mandaloriana que permite vuelo vertical y horizontal. Equipada con un lanzamisiles integrado en los modelos de combate. Requiere combustible de cohete y mantenimiento regular.',
    properties: ['Velocidad de vuelo: 60 pies por turno', 'Duración: 1 minuto continuo de vuelo', 'Misil integrado: 1 disparo, 4d6 fuego en 10 pies', 'Requiere recarga de combustible tras 10 usos', 'CD 12 DEX para aterrizar con gracia'],
    weight: '15 lb', value: '3.000 créditos',
    imagePrompt: 'mandalorian jetpack, worn metal with exhaust flames, flying above desert landscape, star wars cinematic action scene',
    tags: ['vuelo', 'mandaloriano', 'propulsión', 'combate'],
  },
]

// ============================================================
// CYBERPUNK — 7 items
// ============================================================

const CYBERPUNK_ITEMS: Item[] = [
  {
    slug: 'katana-monowire', name: 'Katana Monowire', lore: 'CYBERPUNK', loreName: 'Cyberpunk',
    type: 'weapon', rarity: 'rare',
    description: 'Una katana con filo de monofilamento molecular, capaz de cortar a nivel atómico. La hoja es tan fina que es casi invisible. Arma predilecta de los solos de élite en Night City.',
    properties: ['Ignora armadura no-reforzada', 'Crítico en 18-20', 'Filo invisible: ventaja en el primer ataque contra desprevenidos', 'Requiere mantenimiento cada 20 usos o pierde el filo mono'],
    damage: '2d8 cortante (ignora armadura ligera)',
    weight: '2 lb', value: '15.000 eurodólares',
    imagePrompt: 'monowire katana, ultra-thin glowing edge, cyberpunk neon city background, rain reflections, dark cinematic sci-fi photography',
    tags: ['katana', 'monofilamento', 'cuerpo-a-cuerpo', 'élite'],
  },
  {
    slug: 'mantis-blades', name: 'Mantis Blades', lore: 'CYBERPUNK', loreName: 'Cyberpunk',
    type: 'weapon', rarity: 'very-rare',
    description: 'Implantes cibernéticos que despliegan cuchillas retráctiles desde los antebrazos. Fabricadas en titanio-carbono con filo monomolecular. Están siempre contigo y siempre listas.',
    properties: ['Se despliegan como acción bonus', 'No pueden ser desarmadas', '+2 al ataque en espacios cerrados', 'Pueden usarse para escalar superficies', 'Requiere cirugía de implantación: 3 días de recuperación'],
    damage: '2d6+3 cortante',
    weight: '0 lb (implante)', value: '25.000 eurodólares + cirugía',
    imagePrompt: 'mantis blades extended from forearms, glowing red cybernetic arms, rain-soaked neon alley, cyberpunk cinematic dark photography',
    tags: ['implante', 'cuchillas', 'retráctil', 'cibernético'],
  },
  {
    slug: 'sandevistan', name: 'Sandevistan', lore: 'CYBERPUNK', loreName: 'Cyberpunk',
    type: 'artifact', rarity: 'legendary',
    description: 'Implante de médula espinal que acelera los reflejos del usuario a niveles sobrehumanos. El mundo parece moverse en cámara lenta durante su activación. El uso excesivo puede causar ciberpsicosis.',
    properties: ['Activa cámara lenta: 2 acciones extra por turno durante 3 turnos', 'Cooldown: 10 minutos entre usos', 'Ventaja en todas las tiradas de DEX mientras está activo', 'Riesgo: cada uso acumula 1 punto de ciberpsicosis (máx 10)', 'A 10 puntos: locura temporal — pierde control 1d4 turnos'],
    weight: '0 lb (implante)', value: '100.000 eurodólares + cirugía de élite',
    imagePrompt: 'sandevistan spinal implant, glowing blue spine cybernetics, slow motion effect, afterimages, cyberpunk neon dark cinematic',
    tags: ['implante', 'velocidad', 'reflejos', 'ciberpsicosis'],
  },
  {
    slug: 'deck-de-netrunner', name: 'Deck de Netrunner', lore: 'CYBERPUNK', loreName: 'Cyberpunk',
    type: 'tool', rarity: 'rare',
    description: 'Una computadora portátil de hackeo conectada directamente al sistema nervioso del usuario. Permite infiltrar redes, desactivar sistemas de seguridad y freír el cyberware enemigo. Herramienta esencial del netrunner.',
    properties: ['Hackeo de sistemas: tirada de INT + proficiencia', 'Puede desactivar cámaras, cerraduras electrónicas y torretas', 'Ataque de red: 3d6 daño eléctrico al cyberware enemigo', 'Riesgo: ICE negro puede dañar al netrunner — 2d8 daño psíquico', '3 programas activos simultáneamente'],
    weight: '1 lb', value: '20.000 eurodólares',
    imagePrompt: 'netrunner cyberdeck, compact hacking device with holographic interface, cables connected to wrist port, neon code, cyberpunk cinematic',
    tags: ['hackeo', 'netrunner', 'electrónico', 'red'],
  },
  {
    slug: 'implante-ocular-kiroshi', name: 'Implante Ocular Kiroshi', lore: 'CYBERPUNK', loreName: 'Cyberpunk',
    type: 'tool', rarity: 'uncommon',
    description: 'Ojos cibernéticos Kiroshi Optics modelo MK.3 con zoom óptico, visión nocturna y escáner integrado. Los implantes oculares más populares de Night City. Hacen que tus ojos brillen en la oscuridad.',
    properties: ['Visión nocturna perfecta', 'Zoom óptico x8', 'Escáner: identifica amenazas y debilidades enemigas', 'HUD: muestra HP, munición y minimap', 'Grabación de video integrada'],
    weight: '0 lb (implante)', value: '5.000 eurodólares',
    imagePrompt: 'kiroshi optics cybernetic eyes, glowing red iris, scanning interface overlay, close-up face, cyberpunk neon dark photography',
    tags: ['implante', 'ojos', 'escáner', 'visión'],
  },
  {
    slug: 'nanobots-curativos', name: 'Nanobots Curativos', lore: 'CYBERPUNK', loreName: 'Cyberpunk',
    type: 'consumable', rarity: 'uncommon',
    description: 'Un inyector desechable con nanobots médicos programados para reparar tejido dañado. Cierra heridas en minutos y estabiliza signos vitales. La versión corporativa de la medicina callejera.',
    properties: ['Restaura 4d6 HP en 1 minuto', 'Estabiliza a 0 HP automáticamente', 'Neutraliza toxinas biológicas', 'No funciona contra daño por EMP o ciberpsicosis', 'Un solo uso por inyector'],
    weight: '0.1 lb', value: '500 eurodólares',
    imagePrompt: 'nanobot medical injector, sleek syringe with glowing green nanobots, cyberpunk medical lab, neon lighting, sci-fi photography',
    tags: ['nanobots', 'curación', 'inyector', 'médico'],
  },
  {
    slug: 'emp-grenade', name: 'Granada EMP', lore: 'CYBERPUNK', loreName: 'Cyberpunk',
    type: 'consumable', rarity: 'rare',
    description: 'Granada de pulso electromagnético que desactiva todo dispositivo electrónico y cyberware en su radio. La pesadilla de cualquier persona con implantes. En Night City, eso es prácticamente todo el mundo.',
    properties: ['Radio: 30 pies', 'Desactiva todo cyberware y electrónica por 2 turnos', 'Contra enemigos con implantes: 4d6 daño eléctrico + aturdido 1 turno', 'Afecta aliados en el área', 'No afecta a orgánicos sin implantes'],
    damage: '4d6 eléctrico (solo vs cibernéticos)',
    weight: '0.5 lb', value: '3.000 eurodólares',
    imagePrompt: 'EMP grenade, sleek black sphere with blue electric arcs, cyberpunk neon dark alley, electromagnetic pulse wave, sci-fi photography',
    tags: ['granada', 'emp', 'electrónico', 'área'],
  },
]

// ============================================================
// HORRORES CÓSMICOS (LOVECRAFT) — 6 items
// ============================================================

const LOVECRAFT_ITEMS: Item[] = [
  {
    slug: 'necronomicon', name: 'Necronomicón', lore: 'LOVECRAFT_HORROR', loreName: 'Horrores Cósmicos',
    type: 'artifact', rarity: 'legendary',
    description: 'El libro maldito escrito por el árabe loco Abdul Alhazred. Contiene rituales para contactar a los Dioses Exteriores y abrir portales entre dimensiones. Leerlo erosiona la cordura de forma irreversible.',
    properties: ['Contiene 13 rituales de invocación de entidades cósmicas', 'Cada lectura: -1d4 puntos de Cordura permanente', 'Permite aprender 1 hechizo prohibido por lectura (máx 5)', 'Atrae la atención de entidades: +10% probabilidad de encuentro cósmico', 'No puede destruirse por medios normales'],
    weight: '5 lb', value: 'Tu cordura',
    imagePrompt: 'necronomicon, ancient leather-bound tome with human skin cover, eldritch symbols, dark tentacles emerging, cosmic horror art style grotesque',
    tags: ['libro', 'maldito', 'ritual', 'locura'],
  },
  {
    slug: 'daga-de-plata-encantada', name: 'Daga de Plata Encantada', lore: 'LOVECRAFT_HORROR', loreName: 'Horrores Cósmicos',
    type: 'weapon', rarity: 'rare',
    description: 'Una daga ritual forjada en plata pura con inscripciones protectoras de las Tierras del Sueño. Eficaz contra criaturas que normalmente son inmunes al daño físico. El arma de último recurso del investigador.',
    properties: ['Daño mágico: afecta a criaturas inmunes a daño normal', '+2 contra no-muertos y aberraciones', 'Protección parcial contra posesión: +2 a salvación de WIS', 'Brilla tenuemente en presencia de lo sobrenatural'],
    damage: '1d4+2 perforante (mágico)',
    weight: '1 lb', value: '2.000 dólares (antigüedades)',
    imagePrompt: 'enchanted silver dagger, ritual inscriptions on blade, faint eldritch glow, investigators desk with occult books, cosmic horror dark art',
    tags: ['daga', 'plata', 'ritual', 'protección'],
  },
  {
    slug: 'polvo-de-ibn-ghazi', name: 'Polvo de Ibn-Ghazi', lore: 'LOVECRAFT_HORROR', loreName: 'Horrores Cósmicos',
    type: 'consumable', rarity: 'very-rare',
    description: 'Un polvo alquímico de fórmula casi perdida que hace visible lo invisible. Revela criaturas ocultas entre dimensiones y muestra la verdadera forma de los seres disfrazados. Ver la verdad tiene un costo.',
    properties: ['Revela criaturas invisibles o interdimensionales en 30 pies', 'Duración: 3 turnos', 'El que mira lo revelado: CD 15 WIS o -1d4 Cordura', '3 usos por bolsa', 'No funciona contra ilusiones mundanas, solo contra lo sobrenatural'],
    weight: '0.2 lb', value: '5.000 dólares si encuentras quien lo venda',
    imagePrompt: 'powder of ibn-ghazi, shimmering iridescent dust in leather pouch, invisible creature becoming visible, cosmic horror art style, eerie',
    tags: ['polvo', 'revelación', 'invisible', 'alquimia'],
  },
  {
    slug: 'espejo-de-nitocris', name: 'Espejo de Nitocris', lore: 'LOVECRAFT_HORROR', loreName: 'Horrores Cósmicos',
    type: 'artifact', rarity: 'very-rare',
    description: 'Un espejo de obsidiana negra que perteneció a la reina ghoul Nitocris. Quien mira en su superficie puede ver otros tiempos y lugares, incluyendo las dimensiones donde habitan los Dioses Exteriores.',
    properties: ['Permite ver otros planos de existencia', 'Puede mostrar el pasado o el futuro (impreciso)', 'Cada uso: CD 14 WIS o visión perturbadora (-1d4 Cordura)', 'Una vez por semana puede abrir un portal temporal de 1 turno', 'Las entidades del otro lado también te ven a ti'],
    weight: '3 lb', value: 'Sin precio — los coleccionistas matan por él',
    imagePrompt: 'mirror of nitocris, black obsidian mirror with eldritch reflections, other dimension visible, tentacles at edges, cosmic horror dark art',
    tags: ['espejo', 'visión', 'portal', 'peligroso'],
  },
  {
    slug: 'piedra-brillante', name: 'Piedra Brillante', lore: 'LOVECRAFT_HORROR', loreName: 'Horrores Cósmicos',
    type: 'artifact', rarity: 'rare',
    description: 'Un cristal irregular que emite una luz propia imposible de describir en términos humanos. Encontrada en el lugar de impacto de un meteorito. Atrae a criaturas de otros mundos y corrompe lentamente su entorno.',
    properties: ['Emite luz alienígena a 20 pies (no es luz normal)', 'Las criaturas cósmicas se sienten atraídas a 1 milla', 'Exposición prolongada: -1 CON por semana', 'Puede usarse como catalizador para rituales (+2 al éxito)', 'Corrompe plantas y animales en 30 pies gradualmente'],
    weight: '1 lb', value: 'Imposible de tasar',
    imagePrompt: 'shining trapezohedron, irregular glowing crystal with impossible colors, dark room, alien light casting weird shadows, cosmic horror art',
    tags: ['cristal', 'alienígena', 'corrupción', 'ritual'],
  },
  {
    slug: 'signo-antiguo', name: 'Signo Antiguo (Elder Sign)', lore: 'LOVECRAFT_HORROR', loreName: 'Horrores Cósmicos',
    type: 'artifact', rarity: 'rare',
    description: 'Un símbolo tallado en piedra gris con forma de estrella ramificada. Repele a las criaturas de los Mitos y puede sellar portales entre dimensiones. La defensa más confiable contra los horrores cósmicos.',
    properties: ['Repele aberraciones y criaturas cósmicas en 15 pies', 'Puede sellar un portal dimensional (ritual de 1 hora)', '+4 a salvaciones contra efectos de locura en su presencia', 'Protege contra posesión mental', 'Se agrieta si la entidad repelida es de CR 15+'],
    weight: '2 lb', value: '3.000 dólares entre conocedores',
    imagePrompt: 'elder sign, grey stone with branching star symbol, protective ward glow, repelling dark tentacles, cosmic horror protective art style',
    tags: ['sello', 'protección', 'ward', 'antiguo'],
  },
]

// ============================================================
// EXPORTACIONES
// ============================================================

export const ALL_ITEMS: Item[] = [
  ...LOTR_ITEMS,
  ...ZOMBIE_ITEMS,
  ...VIKING_ITEMS,
  ...ISEKAI_ITEMS,
  ...STAR_WARS_ITEMS,
  ...CYBERPUNK_ITEMS,
  ...LOVECRAFT_ITEMS,
]

export function getItemBySlug(slug: string): Item | undefined {
  return ALL_ITEMS.find(i => i.slug === slug)
}

export function getItemsByLore(lore: string): Item[] {
  return ALL_ITEMS.filter(i => i.lore === lore)
}

export function getItemsByType(type: Item['type']): Item[] {
  return ALL_ITEMS.filter(i => i.type === type)
}

export function getItemsByRarity(rarity: Item['rarity']): Item[] {
  return ALL_ITEMS.filter(i => i.rarity === rarity)
}

export const RARITY_COLORS: Record<Item['rarity'], string> = {
  'common':    'text-stone',
  'uncommon':  'text-emerald',
  'rare':      'text-gold',
  'very-rare': 'text-neon-purple',
  'legendary': 'text-gold-bright',
}

export const TYPE_ICONS: Record<Item['type'], string> = {
  'weapon':     '⚔️',
  'armor':      '🛡️',
  'potion':     '🧪',
  'artifact':   '🔮',
  'tool':       '🔧',
  'consumable': '📦',
}
