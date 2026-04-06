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

// === NUEVAS CRIATURAS (30 más) ===

const LOTR_BEASTS_2: Beast[] = [
  { slug: 'orco-de-mordor', name: 'Orco de Mordor', lore: 'LOTR', loreName: 'Tierra Media', cr: '1', type: 'Humanoide', hp: 15, ac: 13, speed: '30 pies',
    description: 'Soldados de a pie del ejército de Sauron. Cobardes solos pero letales en formación. Armados con cimitarras oxidadas y escudos de hierro negro. Su piel gris resiste el sol pero lo odian.',
    abilities: ['Agresión: puede moverse y atacar como acción bonus', 'Cobardía: desventaja si no hay aliados a 10 pies', 'Visión en la oscuridad 60 pies'],
    stats: { STR: 13, DEX: 12, CON: 12, INT: 7, WIS: 8, CHA: 6 }, imagePrompt: 'mordor orc soldier, dark armor, red eye symbol, dark fantasy tolkien painting', tags: ['humanoide', 'ejército', 'común', 'mordor'] },
  { slug: 'mumakil', name: 'Mûmakil (Oliphante)', lore: 'LOTR', loreName: 'Tierra Media', cr: '11', type: 'Bestia', hp: 157, ac: 14, speed: '40 pies',
    description: 'Elefantes gigantes del sur de la Tierra Media, usados como torres de guerra por los Haradrim. Su carga aplasta ejércitos enteros y su piel es casi impenetrable.',
    abilities: ['Carga Devastadora: si se mueve 20+ pies, 4d10+6 contundente', 'Pisotón: 3d8+6 a criaturas derribadas', 'Torre de Guerra: 4 arqueros disparan desde su lomo', 'Piel Gruesa: resistencia a perforante'],
    stats: { STR: 24, DEX: 9, CON: 20, INT: 3, WIS: 11, CHA: 6 }, imagePrompt: 'mumakil oliphaunt war elephant, massive with war tower on back, haradrim warriors, epic tolkien battle painting', tags: ['bestia', 'enorme', 'guerra', 'haradrim'] },
  { slug: 'espectro-del-pantano', name: 'Espectro del Pantano', lore: 'LOTR', loreName: 'Tierra Media', cr: '4', type: 'No-muerto', hp: 45, ac: 12, speed: '0 pies, flotar 30 pies',
    description: 'Espíritus de guerreros caídos que habitan los Pantanos de los Muertos. Sus luces espectrales atraen a los viajeros al agua donde se ahogan siguiendo sus rostros pálidos.',
    abilities: ['Luz Engañosa: CD 14 WIS o atraído 10 pies hacia el agua', 'Toque Gélido: 2d8 daño necrótico', 'Incorpóreo: resistencia a daño no-mágico', 'Inmune a veneno y encantamiento'],
    stats: { STR: 6, DEX: 14, CON: 10, INT: 10, WIS: 14, CHA: 16 }, imagePrompt: 'dead marshes spirit, pale ghostly face under water, eerie green light, tolkien dark fantasy watercolor', tags: ['no-muerto', 'agua', 'trampa', 'espíritu'] },
  { slug: 'guardian-del-agua', name: 'Guardián del Agua', lore: 'LOTR', loreName: 'Tierra Media', cr: '9', type: 'Aberración', hp: 126, ac: 14, speed: '10 pies, nadar 40 pies',
    description: 'Criatura tentacular que habita las aguas oscuras frente a las Puertas de Moria. Decenas de tentáculos viscosos emergen del lago negro para atrapar a cualquiera que se acerque.',
    abilities: ['Tentáculos Múltiples: 6 ataques por turno, alcance 20 pies', 'Agarrar: CD 15 STR para escapar', 'Arrastrar al Agua: arrastra 15 pies por turno a presas agarradas', 'Regenera tentáculos cortados en 1d4 turnos'],
    stats: { STR: 20, DEX: 10, CON: 18, INT: 4, WIS: 12, CHA: 4 }, imagePrompt: 'watcher in the water, massive tentacled creature in dark lake, doors of moria behind, tolkien dark fantasy', tags: ['aberración', 'agua', 'tentáculos', 'moria'] },
  { slug: 'shelob', name: 'Shelob', lore: 'LOTR', loreName: 'Tierra Media', cr: '12', type: 'Bestia', hp: 150, ac: 16, speed: '40 pies, trepar 40 pies',
    description: 'La última hija de Ungoliant, una araña ancestral del tamaño de un edificio. Habita los túneles de Cirith Ungol desde antes que Sauron existiera. Su veneno paraliza instantáneamente.',
    abilities: ['Mordida Venenosa: 3d10+5 + CD 17 CON o paralizado 1 hora', 'Telaraña Masiva: 30 pies, CD 16 STR o enredado', 'Aguijón Trasero: 2d8+5 perforante', 'Resistencia a magia: ventaja en salvaciones contra hechizos'],
    stats: { STR: 20, DEX: 18, CON: 18, INT: 8, WIS: 14, CHA: 4 }, imagePrompt: 'shelob giant spider, massive ancient spider in dark tunnel, glowing eyes, cirith ungol, tolkien horror fantasy painting', tags: ['bestia', 'veneno', 'jefe', 'legendario', 'araña'] },
]

const ZOMBIE_BEASTS_2: Beast[] = [
  { slug: 'rastreador', name: 'Rastreador', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie', cr: '2', type: 'No-muerto', hp: 30, ac: 13, speed: '35 pies, trepar 35 pies',
    description: 'Infectado que ha mutado para moverse en cuatro patas como un insecto. Trepa paredes y techos silenciosamente. Embosca desde arriba, cayendo sobre sus víctimas sin previo aviso.',
    abilities: ['Trepar: se mueve por cualquier superficie incluso techos', 'Emboscada Aérea: si cae sobre objetivo, derriba automáticamente', 'Sigilo Natural: ventaja en Stealth', 'Salto: salta 20 pies sin carrera'],
    stats: { STR: 14, DEX: 17, CON: 12, INT: 3, WIS: 14, CHA: 1 }, imagePrompt: 'crawler zombie on ceiling, contorted limbs, dark abandoned building, horror photography cinematic', tags: ['no-muerto', 'sigiloso', 'trepar', 'emboscada'] },
  { slug: 'nino-infectado', name: 'Niño Infectado', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie', cr: '1/2', type: 'No-muerto', hp: 10, ac: 12, speed: '25 pies',
    description: 'Lo más perturbador del apocalipsis. Pequeños, rápidos y emiten un llanto que atrae a otros infectados. Los supervivientes dudan en atacarlos, lo cual los hace más peligrosos.',
    abilities: ['Llanto: atrae zombies en radio de 200 pies', 'Hesitación: CD 12 WIS o no puede atacar en primer turno', 'Tamaño Pequeño: ventaja en esconderse'],
    stats: { STR: 6, DEX: 14, CON: 10, INT: 2, WIS: 6, CHA: 1 }, imagePrompt: 'infected child zombie, small figure in shadows, abandoned school hallway, disturbing horror art cinematic', tags: ['no-muerto', 'perturbador', 'señuelo', 'psicológico'] },
  { slug: 'demoledor', name: 'Demoledor', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie', cr: '7', type: 'No-muerto', hp: 120, ac: 12, speed: '25 pies',
    description: 'Mutación masiva de un infectado: 3 metros de alto, brazos desproporcionados como mazas de carne. Destruye barricadas, vehículos y muros como si fueran papel. Lento pero imparable.',
    abilities: ['Puño Demoledor: 3d10+6 contundente', 'Destruir Estructura: daño doble a objetos y barricadas', 'Imparable: inmune a derribo y empuje', 'Piel Endurecida: resistencia a cortante y perforante'],
    stats: { STR: 22, DEX: 6, CON: 20, INT: 1, WIS: 4, CHA: 1 }, imagePrompt: 'demolisher zombie, massive mutated undead with huge arms, smashing through wall, dark horror cinematic', tags: ['no-muerto', 'grande', 'fuerza', 'destructor'] },
  { slug: 'reina-de-colmena', name: 'Reina de Colmena', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie', cr: '10', type: 'No-muerto', hp: 140, ac: 15, speed: '20 pies',
    description: 'Infectada que ha desarrollado una conexión mental con otros zombies. Estática en su nido, controla telepáticamente a cientos de infectados. Destruirla desorienta a toda la horda local.',
    abilities: ['Mente Colmena: controla zombies en radio 1 km', 'Tentáculos Orgánicos: 4 ataques, alcance 15 pies', 'Grito Psíquico: 3d8 psíquico a 30 pies, CD 16 WIS', 'Al morir: todos los zombies en 1 km quedan aturdidos 1 minuto'],
    stats: { STR: 14, DEX: 8, CON: 18, INT: 14, WIS: 16, CHA: 4 }, imagePrompt: 'hive queen zombie, grotesque female figure merged with organic tendrils, dark nest, horror biomechanical art', tags: ['no-muerto', 'jefe', 'mente', 'colmena'] },
  { slug: 'perro-zombie', name: 'Perro Zombie', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie', cr: '1', type: 'No-muerto', hp: 18, ac: 12, speed: '40 pies',
    description: 'Perros infectados que cazan en jaurías. Más rápidos que los caminantes humanos y atacan las piernas para derribar. Su ladrido ronco anuncia problemas.',
    abilities: ['Mordida Derribadora: CD 11 STR o derribado', 'Jauría: +2 al ataque por cada aliado a 5 pies', 'Olfato: ventaja en rastrear por olor'],
    stats: { STR: 12, DEX: 14, CON: 12, INT: 2, WIS: 10, CHA: 1 }, imagePrompt: 'zombie dog pack, decaying dogs running through empty street, feral eyes, dark cinematic horror photography', tags: ['no-muerto', 'rápido', 'manada', 'animal'] },
]

const VIKING_BEASTS_2: Beast[] = [
  { slug: 'kraken-nordico', name: 'Kraken Nórdico', lore: 'VIKINGOS', loreName: 'Saga Vikinga', cr: '17', type: 'Bestia', hp: 230, ac: 18, speed: '20 pies, nadar 60 pies',
    description: 'Monstruo marino ancestral que hunde barcos enteros con sus tentáculos. Los marineros nórdicos le temen más que a cualquier tormenta. Se dice que duerme en el fondo del océano entre siglos.',
    abilities: ['Tentáculos: 8 ataques, alcance 30 pies, 2d8+8', 'Tragar Barco: puede engullir embarcaciones medianas', 'Tinta: nube de oscuridad 60 pies, dura 1 minuto', 'Regeneración Acuática: 10 HP/turno bajo el agua'],
    stats: { STR: 28, DEX: 12, CON: 24, INT: 8, WIS: 14, CHA: 10 }, imagePrompt: 'norse kraken attacking viking longship, massive tentacles, stormy ocean, dark norse mythology epic painting', tags: ['bestia', 'mar', 'legendario', 'tentáculos'] },
  { slug: 'berserker-maldito', name: 'Berserker Maldito', lore: 'VIKINGOS', loreName: 'Saga Vikinga', cr: '5', type: 'No-muerto', hp: 75, ac: 13, speed: '35 pies',
    description: 'Guerrero vikingo que murió en batalla frenética y fue maldecido a pelear eternamente. Su furia no conoce aliados ni enemigos. Ataca a todo lo que se mueve con ferocidad sobrenatural.',
    abilities: ['Furia Eterna: ataque extra cada turno', 'Inmune al miedo y encantamiento', 'Sin Armadura: su furia le da AC 13 natural', 'Al llegar a 0 HP: sigue peleando 1d4 turnos más'],
    stats: { STR: 18, DEX: 14, CON: 16, INT: 6, WIS: 6, CHA: 8 }, imagePrompt: 'cursed berserker viking, undead warrior with axes, glowing red eyes, blood-soaked battlefield, dark norse art', tags: ['no-muerto', 'guerrero', 'furia', 'maldición'] },
  { slug: 'valquiria-oscura', name: 'Valquiria Oscura', lore: 'VIKINGOS', loreName: 'Saga Vikinga', cr: '8', type: 'Celestial', hp: 105, ac: 17, speed: '30 pies, vuelo 60 pies',
    description: 'Una valquiria corrompida que en vez de llevar héroes al Valhalla, los atrapa entre la vida y la muerte. Sus alas negras oscurecen el cielo y su lanza drena el alma.',
    abilities: ['Lanza Drenadadora: 2d8+4 + 2d6 necrótico', 'Vuelo: 60 pies', 'Grito de Muerte: CD 15 WIS o paralizado 1 turno', 'Aura de Desesperanza: -2 a tiradas de salvación en 20 pies'],
    stats: { STR: 16, DEX: 18, CON: 14, INT: 14, WIS: 16, CHA: 18 }, imagePrompt: 'dark valkyrie with black wings, corrupted norse angel, black armor, draining spear, dark norse mythology painting', tags: ['celestial', 'vuelo', 'necrótico', 'jefe'] },
  { slug: 'troll-de-hielo', name: 'Troll de Hielo', lore: 'VIKINGOS', loreName: 'Saga Vikinga', cr: '6', type: 'Gigante', hp: 95, ac: 15, speed: '30 pies',
    description: 'Gigante de las montañas heladas de Jotunheim. Su piel es hielo vivo que congela todo lo que toca. Come vikingos como aperitivo y usa árboles como garrotes.',
    abilities: ['Garrote de Árbol: 3d8+5 contundente', 'Aliento Gélido: 4d6 frío en cono 15 pies', 'Piel de Hielo: inmune a frío, vulnerable a fuego', 'Regeneración: 5 HP/turno excepto por daño de fuego'],
    stats: { STR: 20, DEX: 8, CON: 18, INT: 6, WIS: 10, CHA: 6 }, imagePrompt: 'ice troll jotunheim, massive blue-skinned giant, frozen mountains, norse mythology dark fantasy painting', tags: ['gigante', 'hielo', 'montaña', 'jotunheim'] },
]

const ISEKAI_BEASTS_2: Beast[] = [
  { slug: 'mimic', name: 'Mimic', lore: 'ISEKAI', loreName: 'Mundo Isekai', cr: '3', type: 'Aberración', hp: 58, ac: 12, speed: '15 pies',
    description: 'Criatura que se disfraza de cofre del tesoro para atrapar aventureros desprevenidos. Cuando la víctima abre la tapa, una lengua pegajosa y dientes afilados la devoran.',
    abilities: ['Disfraz: indistinguible de un cofre, CD 15 Investigación', 'Adhesivo: al tocar, queda pegado (CD 13 STR)', 'Mordida: 2d8+3 perforante', 'Cambiar Forma: puede ser cofre, puerta o mueble'],
    stats: { STR: 16, DEX: 12, CON: 14, INT: 6, WIS: 12, CHA: 8 }, imagePrompt: 'mimic treasure chest monster, teeth and tongue emerging from chest, dungeon room, anime fantasy illustration vibrant', tags: ['aberración', 'trampa', 'disfraz', 'dungeon'] },
  { slug: 'lich-del-bosque', name: 'Lich del Bosque', lore: 'ISEKAI', loreName: 'Mundo Isekai', cr: '13', type: 'No-muerto', hp: 170, ac: 17, speed: '30 pies',
    description: 'Mago élfico que buscó la inmortalidad a través de magia prohibida. Ahora gobierna un bosque muerto desde su torre, animando árboles y bestias muertas para proteger su filacteria.',
    abilities: ['Hechizos: 3 hechizos de nivel 5/día', 'Rayo Necrótico: 6d8 necrótico, alcance 120 pies', 'Animar Muertos: levanta 4 esqueletos por turno', 'Filacteria: si muere, resucita en 1d10 días salvo que destruyan su filacteria'],
    stats: { STR: 10, DEX: 14, CON: 16, INT: 22, WIS: 16, CHA: 14 }, imagePrompt: 'forest lich isekai, skeletal elf mage with green necromantic energy, dead forest tower, anime dark fantasy illustration', tags: ['no-muerto', 'mago', 'jefe', 'inmortal'] },
  { slug: 'grifo-real', name: 'Grifo Real', lore: 'ISEKAI', loreName: 'Mundo Isekai', cr: '6', type: 'Bestia', hp: 85, ac: 14, speed: '30 pies, vuelo 80 pies',
    description: 'Majestuosa criatura mitad águila mitad león. Los grifos reales son monturas legendarias que solo aceptan jinetes dignos. Su graznido puede oírse a kilómetros de distancia.',
    abilities: ['Multiataques: pico (2d6+4) + garras (2d4+4)', 'Picada: si vuela 30+ pies y ataca, daño extra 2d6', 'Agarre Aéreo: puede cargar criaturas medianas en vuelo', 'Visión Aguda: ventaja en percepción visual'],
    stats: { STR: 18, DEX: 16, CON: 14, INT: 6, WIS: 14, CHA: 10 }, imagePrompt: 'royal griffin anime isekai, majestic eagle-lion creature, golden feathers, flying above fantasy kingdom, vibrant anime illustration', tags: ['bestia', 'vuelo', 'montura', 'noble'] },
  { slug: 'elemental-de-fuego', name: 'Elemental de Fuego', lore: 'ISEKAI', loreName: 'Mundo Isekai', cr: '5', type: 'Elemental', hp: 72, ac: 13, speed: '50 pies',
    description: 'Espíritu de fuego puro invocado por magos o que emerge de volcanes. Todo lo que toca arde. No puede ser dañado con fuego y el agua es su debilidad mortal.',
    abilities: ['Toque Ígneo: 2d6+4 fuego, inflama objetos', 'Forma de Fuego: pasa por espacios de 1 pulgada', 'Aura Ardiente: 1d6 fuego a criaturas a 5 pies', 'Inmune a fuego, vulnerable a frío'],
    stats: { STR: 14, DEX: 16, CON: 14, INT: 6, WIS: 10, CHA: 8 }, imagePrompt: 'fire elemental anime isekai, humanoid figure of pure flames, volcanic setting, vibrant anime fantasy illustration', tags: ['elemental', 'fuego', 'invocación', 'volcán'] },
  { slug: 'orco-chaman', name: 'Orco Chamán', lore: 'ISEKAI', loreName: 'Mundo Isekai', cr: '4', type: 'Humanoide', hp: 55, ac: 12, speed: '30 pies',
    description: 'Líder espiritual de las tribus orcas que combina fuerza bruta con magia tribal. Invoca espíritus ancestrales y fortalece a sus guerreros con encantamientos de sangre.',
    abilities: ['Rayo Espiritual: 3d6 daño de fuerza', 'Fortalecer: un aliado gana +2 ataque y daño por 3 turnos', 'Curar: restaura 2d8+3 HP a un aliado', 'Escudo Espiritual: +2 AC por 1 turno como reacción'],
    stats: { STR: 14, DEX: 10, CON: 14, INT: 12, WIS: 16, CHA: 12 }, imagePrompt: 'orc shaman anime isekai, green-skinned orc with spirit magic, tribal markings, anime fantasy illustration vibrant', tags: ['humanoide', 'mago', 'líder', 'tribal'] },
]

const STARWARS_BEASTS_2: Beast[] = [
  { slug: 'wampa', name: 'Wampa', lore: 'STAR_WARS', loreName: 'Star Wars', cr: '4', type: 'Bestia', hp: 68, ac: 13, speed: '40 pies',
    description: 'Depredador de las cuevas de hielo de Hoth. Bípedo, peludo y con garras capaces de derribar un tauntaun. Cuelga a sus presas del techo de su cueva para comerlas después.',
    abilities: ['Garras: 2d8+4 cortante', 'Agarrar: cuelga a la presa del techo (CD 14 STR)', 'Camuflaje en Nieve: ventaja en Stealth en terreno nevado', 'Resistencia al frío'],
    stats: { STR: 18, DEX: 12, CON: 16, INT: 4, WIS: 12, CHA: 5 }, imagePrompt: 'wampa ice creature star wars, white furred beast in ice cave, hoth, sci-fi horror illustration', tags: ['bestia', 'hielo', 'depredador', 'hoth'] },
  { slug: 'krayt-dragon', name: 'Dragón Krayt', lore: 'STAR_WARS', loreName: 'Star Wars', cr: '16', type: 'Bestia', hp: 250, ac: 18, speed: '40 pies, excavar 30 pies',
    description: 'El depredador más temido de Tatooine. Puede medir 100 metros de largo y se desplaza bajo la arena como un submarino. Su perla es el tesoro más valioso del planeta.',
    abilities: ['Embestida Subterránea: emerge causando 6d10 contundente en radio 20 pies', 'Mordida: 4d12+8 perforante', 'Tragar: criaturas grandes o menores (4d6 ácido/turno)', 'Perla del Krayt: vale una fortuna si se extrae'],
    stats: { STR: 28, DEX: 8, CON: 24, INT: 3, WIS: 12, CHA: 6 }, imagePrompt: 'krayt dragon star wars, massive sand dragon emerging from desert, tatooine twin suns, epic sci-fi fantasy', tags: ['bestia', 'enorme', 'legendario', 'tatooine'] },
  { slug: 'acklay', name: 'Acklay', lore: 'STAR_WARS', loreName: 'Star Wars', cr: '7', type: 'Bestia', hp: 105, ac: 15, speed: '40 pies',
    description: 'Depredador de seis patas con garras como lanzas, originario de Vendaxa. Usado en arenas gladiatorias de Geonosis. Extremadamente agresivo y difícil de matar.',
    abilities: ['Seis Garras: 3 ataques, 2d6+4 perforante cada uno', 'Carga: si se mueve 20+ pies, derriba automático', 'Exoesqueleto: resistencia a cortante', 'Frenético: +1 ataque extra bajo 50% HP'],
    stats: { STR: 20, DEX: 14, CON: 16, INT: 3, WIS: 10, CHA: 4 }, imagePrompt: 'acklay star wars, six-legged predator with claw-legs, geonosis arena, sci-fi creature illustration', tags: ['bestia', 'arena', 'garras', 'geonosis'] },
  { slug: 'nexu', name: 'Nexu', lore: 'STAR_WARS', loreName: 'Star Wars', cr: '3', type: 'Bestia', hp: 45, ac: 14, speed: '50 pies, trepar 30 pies',
    description: 'Felino de cuatro ojos con mandíbulas desproporcionadas y cola bifurcada. Rápido, sigiloso y mortal. Usado como bestia de arena en Geonosis.',
    abilities: ['Mordida: 2d6+3 perforante', 'Garras: 1d8+3 cortante', 'Cuatro Ojos: no puede ser sorprendido', 'Salto: salta 30 pies sin carrera'],
    stats: { STR: 14, DEX: 18, CON: 12, INT: 4, WIS: 14, CHA: 6 }, imagePrompt: 'nexu star wars, four-eyed feline predator, sharp teeth, geonosis arena, sci-fi creature art', tags: ['bestia', 'felino', 'rápido', 'arena'] },
]

const CYBERPUNK_BEASTS_2: Beast[] = [
  { slug: 'drone-asesino', name: 'Drone Asesino', lore: 'CYBERPUNK', loreName: 'Cyberpunk', cr: '4', type: 'Constructo', hp: 52, ac: 16, speed: 'vuelo 60 pies',
    description: 'Drone militar autónomo con IA de combate. Patrulla zonas corporativas y elimina intrusos sin aviso. Pequeño, rápido y equipado con láser de precisión.',
    abilities: ['Láser: 3d6 radiante, alcance 120 pies', 'Evasión: esquiva automáticamente un ataque/turno', 'Escáner: detecta invisibilidad y sigilo electrónico', 'Autodestrucción: al llegar a 0 HP, 3d6 fuego en 10 pies'],
    stats: { STR: 8, DEX: 20, CON: 10, INT: 14, WIS: 14, CHA: 1 }, imagePrompt: 'killer drone cyberpunk, small flying combat robot, red targeting laser, neon city night, dark sci-fi art', tags: ['constructo', 'vuelo', 'corporación', 'vigilancia'] },
  { slug: 'netrunner-fantasma', name: 'Netrunner Fantasma', lore: 'CYBERPUNK', loreName: 'Cyberpunk', cr: '7', type: 'Humanoide', hp: 65, ac: 12, speed: '30 pies',
    description: 'Hacker de élite que ha subido su consciencia a la red. Su cuerpo físico es frágil pero puede hackear cualquier sistema, desactivar implantes enemigos y freír cerebros a distancia.',
    abilities: ['Hackear Implantes: CD 16 INT o pierde 1 implante por 1 minuto', 'Cortocircuito Neural: 4d8 daño eléctrico, CD 16 CON', 'Invisibilidad Digital: indetectable por sensores electrónicos', 'ICEbreaker: desactiva sistemas de seguridad como acción'],
    stats: { STR: 8, DEX: 14, CON: 10, INT: 22, WIS: 14, CHA: 12 }, imagePrompt: 'ghost netrunner cyberpunk, hacker with glowing neural interface, holographic screens, dark neon alley, cyberpunk art', tags: ['humanoide', 'hacker', 'digital', 'élite'] },
  { slug: 'rata-mutante-gigante', name: 'Rata Mutante Gigante', lore: 'CYBERPUNK', loreName: 'Cyberpunk', cr: '2', type: 'Bestia', hp: 35, ac: 12, speed: '35 pies',
    description: 'Ratas del subsuelo urbano mutadas por residuos tóxicos corporativos. Del tamaño de un perro grande, sus mordidas transmiten enfermedades resistentes a antibióticos.',
    abilities: ['Mordida Infecciosa: 1d8+2 + CD 12 CON o enfermo', 'Enjambre: si hay 3+, ventaja en ataques', 'Escurrirse: pasa por espacios de 6 pulgadas', 'Visión en la oscuridad: 60 pies'],
    stats: { STR: 10, DEX: 16, CON: 14, INT: 3, WIS: 12, CHA: 2 }, imagePrompt: 'giant mutant rat cyberpunk, dog-sized rat with glowing eyes, toxic sewer, neon reflections, dark sci-fi horror', tags: ['bestia', 'mutante', 'alcantarilla', 'enfermedad'] },
  { slug: 'borgs-de-gang', name: 'Borgs de Gang', lore: 'CYBERPUNK', loreName: 'Cyberpunk', cr: '5', type: 'Humanoide', hp: 82, ac: 15, speed: '30 pies',
    description: 'Pandillero con implantes militares robados. Más metal que carne: brazo-arma, piernas hidráulicas y blindaje subdérmico. Impredecibles y violentos.',
    abilities: ['Brazo Ametralladora: 3d6 perforante, ráfaga', 'Salto Hidráulico: salta 20 pies', 'Blindaje: resistencia a daño perforante', 'Adrenalina Sintética: una vez, gana turno extra'],
    stats: { STR: 18, DEX: 14, CON: 16, INT: 8, WIS: 8, CHA: 6 }, imagePrompt: 'cyborg gang member, heavily augmented human with gun arm, neon gang tattoos, dark city street, cyberpunk art', tags: ['humanoide', 'cibernético', 'pandilla', 'implantes'] },
]

const LOVECRAFT_BEASTS_2: Beast[] = [
  { slug: 'mi-go', name: 'Mi-Go', lore: 'LOVECRAFT_HORROR', loreName: 'Horrores Cósmicos', cr: '5', type: 'Aberración', hp: 68, ac: 14, speed: '25 pies, vuelo 40 pies',
    description: 'Criaturas fungoides aladas de Yuggoth (Plutón). Científicos alienígenas que pueden extraer cerebros humanos y mantenerlos vivos en cilindros metálicos. Su zumbido enloquece.',
    abilities: ['Garras: 2d6+3 cortante', 'Extracción Cerebral: si tiene agarrada a la víctima 3 turnos, extrae el cerebro', 'Zumbido: CD 14 WIS o confundido 1 turno', 'Vuelo silencioso: no produce sonido al volar'],
    stats: { STR: 14, DEX: 16, CON: 12, INT: 20, WIS: 14, CHA: 8 }, imagePrompt: 'mi-go lovecraft, fungoid winged creature, brain cylinder, cosmic horror art style, detailed grotesque', tags: ['aberración', 'vuelo', 'ciencia', 'cerebro'] },
  { slug: 'avatar-de-cthulhu', name: 'Avatar de Cthulhu', lore: 'LOVECRAFT_HORROR', loreName: 'Horrores Cósmicos', cr: '20', type: 'Aberración', hp: 400, ac: 22, speed: '40 pies, nadar 80 pies, vuelo 60 pies',
    description: 'Una fracción del poder del Gran Cthulhu manifestada en el plano material. Su sola presencia quiebra la cordura de los mortales. Verlo directamente es perder la razón para siempre.',
    abilities: ['Presencia Enloquecedora: CD 20 WIS o locura permanente', 'Tentáculos: 6 ataques, 4d8+10 contundente', 'Regeneración: 30 HP/turno, solo se detiene con magia divina', 'Inmune a todo daño mundano', 'Llamada de Rlyeh: todos los seres en 1 km sienten terror'],
    stats: { STR: 30, DEX: 14, CON: 30, INT: 26, WIS: 22, CHA: 28 }, imagePrompt: 'avatar of cthulhu, massive tentacled god-creature rising from ocean, rlyeh ruins, cosmic horror epic dark art', tags: ['aberración', 'dios', 'legendario', 'jefe-final', 'locura'] },
  { slug: 'hombre-serpiente', name: 'Hombre Serpiente', lore: 'LOVECRAFT_HORROR', loreName: 'Horrores Cósmicos', cr: '3', type: 'Aberración', hp: 42, ac: 14, speed: '30 pies',
    description: 'Descendientes de una raza pre-humana que gobernó la Tierra. Se disfrazan de humanos usando magia ilusoria. Infiltran sociedades humanas para sus rituales oscuros.',
    abilities: ['Disfraz Ilusorio: aparenta ser humano, CD 16 Investigación', 'Mordida Venenosa: 1d6+2 + 2d6 veneno', 'Magia Serpentina: 2 hechizos nivel 2/día (sugestión, oscuridad)', 'Resistencia a veneno'],
    stats: { STR: 12, DEX: 16, CON: 12, INT: 16, WIS: 14, CHA: 16 }, imagePrompt: 'serpent man lovecraft, humanoid reptilian in dark robes, forked tongue, ancient temple, cosmic horror art', tags: ['aberración', 'disfraz', 'infiltrador', 'antiguo'] },
]

export const ALL_BEASTS: Beast[] = [
  ...LOTR_BEASTS, ...LOTR_BEASTS_2,
  ...ZOMBIE_BEASTS, ...ZOMBIE_BEASTS_2,
  ...VIKING_BEASTS, ...VIKING_BEASTS_2,
  ...ISEKAI_BEASTS, ...ISEKAI_BEASTS_2,
  ...STARWARS_BEASTS, ...STARWARS_BEASTS_2,
  ...CYBERPUNK_BEASTS, ...CYBERPUNK_BEASTS_2,
  ...LOVECRAFT_BEASTS, ...LOVECRAFT_BEASTS_2,
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
