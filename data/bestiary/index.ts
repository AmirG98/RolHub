export interface Beast {
  slug: string
  name: string
  lore: string
  loreName: string
  cr: string // Challenge Rating
  type: string // beast, undead, dragon, etc.
  hp: number
  ac: number
  speed: string
  description: string
  abilities: string[]
  stats: {
    STR: number
    DEX: number
    CON: number
    INT: number
    WIS: number
    CHA: number
  }
  imagePrompt: string
  tags: string[]
}

// Bestias de Tierra Media (LOTR)
const LOTR_BEASTS: Beast[] = [
  {
    slug: 'troll-de-las-cavernas', name: 'Troll de las Cavernas', lore: 'LOTR', loreName: 'Tierra Media',
    cr: '5', type: 'Gigante', hp: 84, ac: 15, speed: '30 pies',
    description: 'Enormes criaturas de piel gris que habitan en las profundidades de las montañas. Lentos pero devastadoramente fuertes, los trolls de las cavernas pueden destrozar armaduras con sus puños. Se convierten en piedra con la luz del sol.',
    abilities: ['Fuerza Brutal: +3 al daño cuerpo a cuerpo', 'Vulnerabilidad Solar: se petrifica con luz solar directa', 'Regeneración: recupera 5 HP por turno en la oscuridad'],
    stats: { STR: 18, DEX: 8, CON: 16, INT: 5, WIS: 9, CHA: 6 },
    imagePrompt: 'massive cave troll, grey rough skin, towering over adventurers, dark cave with torchlight, fantasy oil painting tolkien style',
    tags: ['gigante', 'oscuridad', 'montaña', 'peligroso'],
  },
  {
    slug: 'huargo', name: 'Huargo', lore: 'LOTR', loreName: 'Tierra Media',
    cr: '2', type: 'Bestia', hp: 37, ac: 13, speed: '50 pies',
    description: 'Lobos gigantes e inteligentes aliados de los orcos. Más grandes que un caballo, los huargos cazan en manadas y son monturas preferidas de los orcos de las montañas. Su aullido hiela la sangre.',
    abilities: ['Mordida Feroz: 2d6+3 daño perforante', 'Embestida en Manada: ventaja si un aliado está a 5 pies', 'Aullido Aterrador: CD 12 o aterrorizado 1 turno'],
    stats: { STR: 16, DEX: 14, CON: 14, INT: 7, WIS: 11, CHA: 8 },
    imagePrompt: 'giant warg wolf, dark fur, glowing yellow eyes, snarling teeth, orc rider in background, fantasy painting tolkien style',
    tags: ['bestia', 'manada', 'montura', 'orco'],
  },
  {
    slug: 'nazgul', name: 'Nazgûl', lore: 'LOTR', loreName: 'Tierra Media',
    cr: '10', type: 'No-muerto', hp: 112, ac: 18, speed: '40 pies, vuelo 60 pies',
    description: 'Los Nueve Espectros del Anillo, antiguos reyes de los hombres corrompidos por Sauron. Invisibles al ojo común, infunden un terror sobrenatural. Su grito paraliza a los más valientes.',
    abilities: ['Grito del Nazgûl: CD 16, todos a 30 pies aterroriz.', 'Espada Morgul: 3d8 daño necrótico + envenenado', 'Invisibilidad: solo visible con percepción mágica', 'Inmune a daño no-mágico'],
    stats: { STR: 16, DEX: 17, CON: 18, INT: 14, WIS: 16, CHA: 20 },
    imagePrompt: 'nazgul ringwraith, dark hooded figure on black horse, glowing sword, mist and darkness, tolkien fantasy epic painting',
    tags: ['no-muerto', 'jefe', 'terror', 'legendario'],
  },
  {
    slug: 'balrog', name: 'Balrog', lore: 'LOTR', loreName: 'Tierra Media',
    cr: '20', type: 'Demonio', hp: 262, ac: 19, speed: '40 pies, vuelo 80 pies',
    description: 'Espíritu maiar corrompido por Morgoth en la Primera Edad. Una criatura de fuego y sombra que porta un látigo de llamas y una espada ardiente. Solo los más poderosos pueden enfrentarlo.',
    abilities: ['Aura de Fuego: 3d6 daño de fuego a 10 pies', 'Látigo de Llamas: alcance 30 pies, 4d6 fuego', 'Espada Ardiente: 4d8 cortante + 2d6 fuego', 'Inmunidad al fuego', 'Resistencia a magia'],
    stats: { STR: 26, DEX: 15, CON: 22, INT: 18, WIS: 16, CHA: 22 },
    imagePrompt: 'balrog demon of fire and shadow, massive flaming whip, underground chasm, glowing orange eyes, epic tolkien dark fantasy',
    tags: ['demonio', 'fuego', 'legendario', 'jefe-final'],
  },
  {
    slug: 'araña-gigante-de-mirkwood', name: 'Araña Gigante de Mirkwood', lore: 'LOTR', loreName: 'Tierra Media',
    cr: '3', type: 'Bestia', hp: 52, ac: 14, speed: '30 pies, trepar 30 pies',
    description: 'Descendientes de Ungoliant, estas arañas del tamaño de un caballo tejen redes mortales en el Bosque Negro. Su veneno paraliza a las víctimas mientras las envuelven en seda.',
    abilities: ['Mordida Venenosa: 1d8+2 + CD 13 CON o paralizado', 'Telaraña: CD 12 DEX o enredado', 'Trepar muros y techos', 'Visión en la oscuridad 60 pies'],
    stats: { STR: 14, DEX: 16, CON: 12, INT: 4, WIS: 10, CHA: 3 },
    imagePrompt: 'giant spider in dark forest, mirkwood, web-covered trees, glowing eyes, dark fantasy tolkien illustration',
    tags: ['bestia', 'veneno', 'bosque', 'trampa'],
  },
]

// Bestias del Apocalipsis Zombie
const ZOMBIE_BEASTS: Beast[] = [
  {
    slug: 'caminante', name: 'Caminante', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie',
    cr: '1/4', type: 'No-muerto', hp: 12, ac: 8, speed: '20 pies',
    description: 'El infectado más común. Lento, torpe, pero implacable. Solo se detiene destruyendo el cerebro. Peligroso en grupos grandes donde rodean a los supervivientes.',
    abilities: ['Mordida Infecciosa: CD 10 CON o infectado en 24h', 'No siente dolor: inmune a daño no-letal', 'Detección por ruido y olor'],
    stats: { STR: 13, DEX: 6, CON: 16, INT: 2, WIS: 6, CHA: 1 },
    imagePrompt: 'zombie walker shambling through abandoned city street, torn clothes, decaying skin, gritty photorealistic horror',
    tags: ['no-muerto', 'horda', 'infección', 'común'],
  },
  {
    slug: 'corredor', name: 'Corredor', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie',
    cr: '1', type: 'No-muerto', hp: 22, ac: 11, speed: '40 pies',
    description: 'Infectados recientes cuyo cuerpo aún conserva reflejos musculares. Corren, saltan y trepan. Mucho más peligrosos que los caminantes, atacan en oleadas frenéticas.',
    abilities: ['Sprint: movimiento doble en línea recta', 'Salto: puede saltar 15 pies', 'Frenesí: +2 ataque si hay sangre fresca cerca'],
    stats: { STR: 14, DEX: 15, CON: 14, INT: 2, WIS: 8, CHA: 1 },
    imagePrompt: 'fast zombie runner sprinting through ruins, fresh blood, feral eyes, motion blur, dark cinematic horror photography',
    tags: ['no-muerto', 'rápido', 'infección', 'peligroso'],
  },
  {
    slug: 'bloater', name: 'Hinchado', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie',
    cr: '3', type: 'No-muerto', hp: 68, ac: 10, speed: '15 pies',
    description: 'Cadáver hinchado por gases de descomposición. Se mueve lentamente pero al morir explota en una nube tóxica que infecta a todos los cercanos. Nunca lo ataques cuerpo a cuerpo.',
    abilities: ['Explosión Tóxica: al morir, 3d6 veneno en 15 pies', 'Nube de Gas: aura 5 pies, CD 12 CON o náuseas', 'Resistencia a daño contundente'],
    stats: { STR: 16, DEX: 4, CON: 18, INT: 1, WIS: 4, CHA: 1 },
    imagePrompt: 'bloated zombie, swollen decomposing body, toxic green gas emanating, abandoned building, grotesque horror art',
    tags: ['no-muerto', 'explosivo', 'tóxico', 'peligroso'],
  },
  {
    slug: 'alfa', name: 'Alfa', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie',
    cr: '5', type: 'No-muerto', hp: 95, ac: 14, speed: '35 pies',
    description: 'Un infectado que ha mutado más allá de lo normal. Más grande, más fuerte, y con una inteligencia primitiva que le permite emboscar. Puede comandar hordas de caminantes.',
    abilities: ['Rugido de Mando: todos los zombies a 60 pies atacan al mismo objetivo', 'Garras Mutantes: 2d8+4 cortante', 'Resistencia a balas: daño reducido a la mitad', 'Regeneración lenta: 3 HP/turno'],
    stats: { STR: 20, DEX: 14, CON: 18, INT: 6, WIS: 12, CHA: 3 },
    imagePrompt: 'alpha zombie mutant, massive muscular undead, leading zombie horde, red glowing eyes, dark cinematic horror',
    tags: ['no-muerto', 'jefe', 'mutante', 'líder'],
  },
]

// Bestias Vikingas
const VIKING_BEASTS: Beast[] = [
  {
    slug: 'draugr', name: 'Draugr', lore: 'VIKINGOS', loreName: 'Saga Vikinga',
    cr: '3', type: 'No-muerto', hp: 52, ac: 14, speed: '25 pies',
    description: 'Guerrero nórdico muerto que se niega a descansar. Protege su tumba y sus tesoros con furia sobrenatural. Puede crecer de tamaño y emitir un hedor nauseabundo.',
    abilities: ['Fuerza Sobrenatural: puede crecer al doble', 'Hedor de Muerte: CD 12 CON o envenenado', 'Resistencia a armas no-mágicas', 'Visión en la oscuridad'],
    stats: { STR: 17, DEX: 10, CON: 16, INT: 8, WIS: 12, CHA: 6 },
    imagePrompt: 'draugr norse undead warrior, ancient armor, glowing blue eyes, viking tomb with treasure, dark norse mythology art',
    tags: ['no-muerto', 'guerrero', 'tumba', 'tesoro'],
  },
  {
    slug: 'fenrir', name: 'Fenrir', lore: 'VIKINGOS', loreName: 'Saga Vikinga',
    cr: '15', type: 'Celestial/Bestia', hp: 200, ac: 17, speed: '60 pies',
    description: 'El lobo gigante hijo de Loki, destinado a devorar a Odín en el Ragnarök. Encadenado por los dioses con Gleipnir, su liberación significaría el fin del mundo.',
    abilities: ['Mordida del Ragnarök: 6d10+8 perforante', 'Aullido Cósmico: CD 18, todos a 100 pies aterrorizado', 'Inmune a cadenas normales', 'Resistencia a toda magia mortal'],
    stats: { STR: 28, DEX: 16, CON: 24, INT: 12, WIS: 18, CHA: 16 },
    imagePrompt: 'fenrir giant wolf norse mythology, massive wolf bound by magical chains, ragnarok, epic norse dark fantasy painting',
    tags: ['bestia', 'legendario', 'jefe-final', 'mitológico'],
  },
  {
    slug: 'jormungandr', name: 'Jörmungandr', lore: 'VIKINGOS', loreName: 'Saga Vikinga',
    cr: '20', type: 'Dragón/Bestia', hp: 350, ac: 20, speed: '50 pies, nadar 80 pies',
    description: 'La Serpiente del Mundo que rodea Midgard mordiendo su propia cola. Su veneno puede matar dioses y su despertar causará tsunamis que engullirán continentes.',
    abilities: ['Aliento Venenoso: 8d8 veneno en cono de 60 pies', 'Constricción: 4d10+10 contundente', 'Maremoto: al emerger, ola de 30 pies de alto', 'Inmune a veneno y frío'],
    stats: { STR: 30, DEX: 12, CON: 28, INT: 14, WIS: 16, CHA: 18 },
    imagePrompt: 'jormungandr world serpent, massive sea serpent emerging from ocean, viking ships fleeing, norse mythology epic painting',
    tags: ['dragón', 'legendario', 'jefe-final', 'mitológico', 'mar'],
  },
]

// Bestias Isekai
const ISEKAI_BEASTS: Beast[] = [
  {
    slug: 'slime-rey', name: 'Rey Slime', lore: 'ISEKAI', loreName: 'Mundo Isekai',
    cr: '4', type: 'Ooze', hp: 75, ac: 12, speed: '20 pies',
    description: 'Un slime que ha absorbido tantas criaturas que ha desarrollado consciencia y corona propia. Puede dividirse en slimes menores y absorber ataques físicos.',
    abilities: ['Absorción: ataques físicos curan al slime', 'División: se divide en 2 slimes con la mitad de HP', 'Ácido: 2d6 ácido al contacto', 'Inmune a cortante y perforante'],
    stats: { STR: 14, DEX: 8, CON: 18, INT: 10, WIS: 8, CHA: 12 },
    imagePrompt: 'king slime anime fantasy, large blue slime with crown, cute but dangerous, vibrant anime illustration studio ghibli style',
    tags: ['ooze', 'jefe', 'anime', 'divertido'],
  },
  {
    slug: 'dragon-anciano', name: 'Dragón Anciano', lore: 'ISEKAI', loreName: 'Mundo Isekai',
    cr: '18', type: 'Dragón', hp: 280, ac: 20, speed: '40 pies, vuelo 80 pies',
    description: 'Un dragón milenario que ha acumulado un tesoro inmenso y sabiduría ancestral. Puede hablar todos los idiomas y su aliento de fuego derrite castillos enteros.',
    abilities: ['Aliento de Fuego: 12d6 fuego en cono 60 pies', 'Presencia Aterradora: CD 19 WIS', 'Garras: 3d8+8 cortante', 'Magia innata: 3 hechizos/día'],
    stats: { STR: 27, DEX: 12, CON: 25, INT: 20, WIS: 18, CHA: 22 },
    imagePrompt: 'ancient dragon isekai anime style, massive golden dragon on treasure hoard, epic vibrant anime fantasy illustration',
    tags: ['dragón', 'legendario', 'jefe-final', 'fuego'],
  },
  {
    slug: 'goblin-bandido', name: 'Goblin Bandido', lore: 'ISEKAI', loreName: 'Mundo Isekai',
    cr: '1/2', type: 'Humanoide', hp: 15, ac: 13, speed: '30 pies',
    description: 'Pequeños humanoides verdes que emboscan viajeros en los caminos. Cobardes individualmente, pero astutos en grupo. Usan trampas improvisadas y huyen si las cosas se ponen difíciles.',
    abilities: ['Emboscada: ventaja en primer turno si no fue detectado', 'Trampa: CD 12 DEX o 1d6 daño', 'Huida Cobarde: se desvincula sin ataque de oportunidad'],
    stats: { STR: 8, DEX: 14, CON: 10, INT: 10, WIS: 8, CHA: 6 },
    imagePrompt: 'goblin bandit anime style, small green creature with dagger, forest ambush, cute but menacing, vibrant anime illustration',
    tags: ['humanoide', 'común', 'emboscada', 'anime'],
  },
]

// Bestias Star Wars
const STARWARS_BEASTS: Beast[] = [
  {
    slug: 'rancor', name: 'Rancor', lore: 'STAR_WARS', loreName: 'Star Wars',
    cr: '8', type: 'Bestia', hp: 136, ac: 15, speed: '30 pies',
    description: 'Depredador reptiliano de 5 metros de altura originario de Dathomir. Usado como bestia de pelea por señores del crimen como Jabba el Hutt. Fuerza descomunal pero vulnerable en los ojos.',
    abilities: ['Agarrar: si golpea, agarra al objetivo (CD 16)', 'Aplastamiento: 3d10+6 contundente a objetivos agarrados', 'Piel Gruesa: resistencia a daño de blaster'],
    stats: { STR: 22, DEX: 9, CON: 18, INT: 4, WIS: 10, CHA: 5 },
    imagePrompt: 'rancor star wars, massive reptilian beast in dark pit, jabba palace, sci-fi dark fantasy illustration',
    tags: ['bestia', 'grande', 'pelea', 'sci-fi'],
  },
  {
    slug: 'sarlacc', name: 'Sarlacc', lore: 'STAR_WARS', loreName: 'Star Wars',
    cr: '12', type: 'Bestia', hp: 200, ac: 18, speed: '0 pies (inmóvil)',
    description: 'Criatura semienterrada en el desierto de Tatooine cuya boca de tentáculos atrapa a quien caiga en ella. Digiere a sus presas vivas durante mil años.',
    abilities: ['Tentáculos: alcance 20 pies, agarra automático', 'Digestión Lenta: 2d6 ácido por turno a presas tragadas', 'Inmóvil pero indestructible bajo tierra'],
    stats: { STR: 24, DEX: 2, CON: 26, INT: 3, WIS: 8, CHA: 1 },
    imagePrompt: 'sarlacc pit star wars, massive mouth with tentacles in desert sand, tatooine, sci-fi horror illustration',
    tags: ['bestia', 'trampa', 'desierto', 'legendario'],
  },
]

// Bestias Cyberpunk
const CYBERPUNK_BEASTS: Beast[] = [
  {
    slug: 'cyberpsico', name: 'Cyberpsicó', lore: 'CYBERPUNK', loreName: 'Cyberpunk',
    cr: '6', type: 'Humanoide', hp: 90, ac: 16, speed: '35 pies',
    description: 'Humano que perdió la cordura por exceso de implantes cibernéticos. Extremadamente peligroso: fuerza sobrehumana, reflejos de máquina y ningún instinto de autopreservación.',
    abilities: ['Reflejos Cibernéticos: +3 iniciativa', 'Brazo Cuchilla: 2d8+4 cortante', 'Blindaje Subdérmico: resistencia a daño de bala', 'Frenesí: ataque extra si baja del 50% HP'],
    stats: { STR: 18, DEX: 18, CON: 16, INT: 6, WIS: 4, CHA: 3 },
    imagePrompt: 'cyberpsycho cyberpunk, person with excessive cybernetic implants going berserk, neon city street, dark sci-fi art',
    tags: ['humanoide', 'locura', 'cibernético', 'peligroso'],
  },
  {
    slug: 'mech-corporativo', name: 'Mech Corporativo', lore: 'CYBERPUNK', loreName: 'Cyberpunk',
    cr: '10', type: 'Constructo', hp: 150, ac: 19, speed: '25 pies',
    description: 'Robot de combate pesado desplegado por megacorporaciones para proteger instalaciones. Armado con ametralladora y lanzacohetes, requiere armamento pesado o hackeo para derrotarlo.',
    abilities: ['Ametralladora: 4d6 perforante, ráfaga', 'Misil: 6d6 fuego en radio 15 pies, 1/día', 'Blindaje Pesado: inmune a daño menor de 10', 'Hackeable: CD 18 INT para desactivar'],
    stats: { STR: 22, DEX: 10, CON: 20, INT: 2, WIS: 8, CHA: 1 },
    imagePrompt: 'corporate mech robot cyberpunk, heavy combat robot with minigun, neon-lit corporate building, dark sci-fi military art',
    tags: ['constructo', 'jefe', 'corporación', 'blindado'],
  },
]

// Bestias Lovecraft
const LOVECRAFT_BEASTS: Beast[] = [
  {
    slug: 'profundo', name: 'Profundo', lore: 'LOVECRAFT_HORROR', loreName: 'Horrores Cósmicos',
    cr: '2', type: 'Aberración', hp: 32, ac: 13, speed: '25 pies, nadar 40 pies',
    description: 'Híbrido humano-pez que habita en ciudades sumergidas. Adoran a Dagon y a los Primigenios. Atacan pueblos costeros en la noche, arrastrando víctimas al océano.',
    abilities: ['Anfibio: respira aire y agua', 'Garras: 1d6+2 cortante', 'Canto Abisal: CD 12 WIS o confundido 1 turno', 'Resistencia al frío'],
    stats: { STR: 14, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 8 },
    imagePrompt: 'deep one lovecraft, fish-human hybrid creature emerging from dark ocean, innsmouth, cosmic horror art style',
    tags: ['aberración', 'agua', 'culto', 'horror'],
  },
  {
    slug: 'shoggoth', name: 'Shoggoth', lore: 'LOVECRAFT_HORROR', loreName: 'Horrores Cósmicos',
    cr: '14', type: 'Aberración', hp: 180, ac: 12, speed: '30 pies, trepar 30 pies',
    description: 'Masa proteoplásmica amorfa creada por los Antiguos como siervos. Puede formar ojos, bocas y tentáculos a voluntad. Su visión causa locura inmediata en mortales.',
    abilities: ['Amorfo: pasa por espacios de 1 pulgada', 'Pseudópodos: 4d8+5 contundente', 'Visión de Locura: CD 16 WIS o 2d6 daño psíquico', 'Absorber: engloba criaturas medianas o menores'],
    stats: { STR: 20, DEX: 8, CON: 22, INT: 6, WIS: 12, CHA: 1 },
    imagePrompt: 'shoggoth lovecraft, amorphous mass of eyes and mouths, dark underground ruins, cosmic horror art, detailed grotesque',
    tags: ['aberración', 'amorfo', 'legendario', 'locura'],
  },
]

export const ALL_BEASTS: Beast[] = [
  ...LOTR_BEASTS,
  ...ZOMBIE_BEASTS,
  ...VIKING_BEASTS,
  ...ISEKAI_BEASTS,
  ...STARWARS_BEASTS,
  ...CYBERPUNK_BEASTS,
  ...LOVECRAFT_BEASTS,
]

export function getBeastBySlug(slug: string): Beast | undefined {
  return ALL_BEASTS.find(b => b.slug === slug)
}

export function getBeastsByLore(lore: string): Beast[] {
  return ALL_BEASTS.filter(b => b.lore === lore)
}

export const LORE_COLORS: Record<string, string> = {
  LOTR: 'text-gold',
  ZOMBIES: 'text-blood',
  VIKINGOS: 'text-gold-dim',
  ISEKAI: 'text-neon-purple',
  STAR_WARS: 'text-gold-bright',
  CYBERPUNK: 'text-neon-green',
  LOVECRAFT_HORROR: 'text-neon-blue',
}
