/**
 * Base de datos de armas D&D 5e SRD
 * Contenido del System Reference Document - legalmente libre
 */

export type DamageType =
  | 'slashing'
  | 'piercing'
  | 'bludgeoning'
  | 'fire'
  | 'cold'
  | 'lightning'
  | 'thunder'
  | 'poison'
  | 'acid'
  | 'necrotic'
  | 'radiant'
  | 'force'
  | 'psychic'

export type WeaponRange = 'melee' | 'ranged' | 'reach'

export type WeaponProperty =
  | 'finesse'      // Puede usar DEX en lugar de STR
  | 'heavy'        // Desventaja para criaturas pequeñas
  | 'light'        // Ideal para dual wielding
  | 'loading'      // Solo un ataque por turno
  | 'reach'        // +5 pies de alcance
  | 'thrown'       // Puede lanzarse
  | 'two-handed'   // Requiere dos manos
  | 'versatile'    // Puede usarse con una o dos manos
  | 'ammunition'   // Requiere munición
  | 'special'      // Reglas especiales

export interface Weapon {
  id: string
  name: string
  nameEs: string
  damage: string              // "1d8", "2d6", etc.
  damageType: DamageType
  range: WeaponRange
  rangeDistance?: {           // Para armas de rango o thrown
    normal: number
    long: number
  }
  properties: WeaponProperty[]
  attackBonus: number         // Bonus mágico (+1, +2, +3)
  category: 'simple' | 'martial'
  weight: number              // En libras
  cost: string                // "25 gp", etc.
  versatileDamage?: string    // Daño si se usa con dos manos
}

export interface Spell {
  id: string
  name: string
  nameEs: string
  level: number               // 0 = cantrip
  school: string
  castingTime: string
  range: string
  components: string          // "V, S, M (a pinch of salt)"
  duration: string
  damage?: string             // Si hace daño
  damageType?: DamageType
  savingThrow?: string        // "DEX", "WIS", etc.
  effect?: string             // Descripción breve del efecto
  concentration: boolean
}

export interface Ability {
  id: string
  name: string
  nameEs: string
  description: string
  uses?: number               // Usos por descanso
  recharge?: 'short' | 'long' // Tipo de descanso para recargar
  damage?: string
  damageType?: DamageType
  range?: string
  savingThrow?: string
}

// =====================================================
// BASE DE DATOS DE ARMAS D&D 5e SRD
// =====================================================

export const WEAPONS_DB: Record<string, Weapon> = {
  // === ARMAS SIMPLES CUERPO A CUERPO ===
  'club': {
    id: 'club',
    name: 'Club',
    nameEs: 'Garrote',
    damage: '1d4',
    damageType: 'bludgeoning',
    range: 'melee',
    properties: ['light'],
    attackBonus: 0,
    category: 'simple',
    weight: 2,
    cost: '1 sp',
  },
  'dagger': {
    id: 'dagger',
    name: 'Dagger',
    nameEs: 'Daga',
    damage: '1d4',
    damageType: 'piercing',
    range: 'melee',
    rangeDistance: { normal: 20, long: 60 },
    properties: ['finesse', 'light', 'thrown'],
    attackBonus: 0,
    category: 'simple',
    weight: 1,
    cost: '2 gp',
  },
  'greatclub': {
    id: 'greatclub',
    name: 'Greatclub',
    nameEs: 'Maza Grande',
    damage: '1d8',
    damageType: 'bludgeoning',
    range: 'melee',
    properties: ['two-handed'],
    attackBonus: 0,
    category: 'simple',
    weight: 10,
    cost: '2 sp',
  },
  'handaxe': {
    id: 'handaxe',
    name: 'Handaxe',
    nameEs: 'Hacha de Mano',
    damage: '1d6',
    damageType: 'slashing',
    range: 'melee',
    rangeDistance: { normal: 20, long: 60 },
    properties: ['light', 'thrown'],
    attackBonus: 0,
    category: 'simple',
    weight: 2,
    cost: '5 gp',
  },
  'javelin': {
    id: 'javelin',
    name: 'Javelin',
    nameEs: 'Jabalina',
    damage: '1d6',
    damageType: 'piercing',
    range: 'melee',
    rangeDistance: { normal: 30, long: 120 },
    properties: ['thrown'],
    attackBonus: 0,
    category: 'simple',
    weight: 2,
    cost: '5 sp',
  },
  'lighthammer': {
    id: 'lighthammer',
    name: 'Light Hammer',
    nameEs: 'Martillo Ligero',
    damage: '1d4',
    damageType: 'bludgeoning',
    range: 'melee',
    rangeDistance: { normal: 20, long: 60 },
    properties: ['light', 'thrown'],
    attackBonus: 0,
    category: 'simple',
    weight: 2,
    cost: '2 gp',
  },
  'mace': {
    id: 'mace',
    name: 'Mace',
    nameEs: 'Maza',
    damage: '1d6',
    damageType: 'bludgeoning',
    range: 'melee',
    properties: [],
    attackBonus: 0,
    category: 'simple',
    weight: 4,
    cost: '5 gp',
  },
  'quarterstaff': {
    id: 'quarterstaff',
    name: 'Quarterstaff',
    nameEs: 'Bastón',
    damage: '1d6',
    damageType: 'bludgeoning',
    range: 'melee',
    properties: ['versatile'],
    versatileDamage: '1d8',
    attackBonus: 0,
    category: 'simple',
    weight: 4,
    cost: '2 sp',
  },
  'sickle': {
    id: 'sickle',
    name: 'Sickle',
    nameEs: 'Hoz',
    damage: '1d4',
    damageType: 'slashing',
    range: 'melee',
    properties: ['light'],
    attackBonus: 0,
    category: 'simple',
    weight: 2,
    cost: '1 gp',
  },
  'spear': {
    id: 'spear',
    name: 'Spear',
    nameEs: 'Lanza',
    damage: '1d6',
    damageType: 'piercing',
    range: 'melee',
    rangeDistance: { normal: 20, long: 60 },
    properties: ['thrown', 'versatile'],
    versatileDamage: '1d8',
    attackBonus: 0,
    category: 'simple',
    weight: 3,
    cost: '1 gp',
  },

  // === ARMAS SIMPLES A DISTANCIA ===
  'crossbow_light': {
    id: 'crossbow_light',
    name: 'Light Crossbow',
    nameEs: 'Ballesta Ligera',
    damage: '1d8',
    damageType: 'piercing',
    range: 'ranged',
    rangeDistance: { normal: 80, long: 320 },
    properties: ['ammunition', 'loading', 'two-handed'],
    attackBonus: 0,
    category: 'simple',
    weight: 5,
    cost: '25 gp',
  },
  'dart': {
    id: 'dart',
    name: 'Dart',
    nameEs: 'Dardo',
    damage: '1d4',
    damageType: 'piercing',
    range: 'ranged',
    rangeDistance: { normal: 20, long: 60 },
    properties: ['finesse', 'thrown'],
    attackBonus: 0,
    category: 'simple',
    weight: 0.25,
    cost: '5 cp',
  },
  'shortbow': {
    id: 'shortbow',
    name: 'Shortbow',
    nameEs: 'Arco Corto',
    damage: '1d6',
    damageType: 'piercing',
    range: 'ranged',
    rangeDistance: { normal: 80, long: 320 },
    properties: ['ammunition', 'two-handed'],
    attackBonus: 0,
    category: 'simple',
    weight: 2,
    cost: '25 gp',
  },
  'sling': {
    id: 'sling',
    name: 'Sling',
    nameEs: 'Honda',
    damage: '1d4',
    damageType: 'bludgeoning',
    range: 'ranged',
    rangeDistance: { normal: 30, long: 120 },
    properties: ['ammunition'],
    attackBonus: 0,
    category: 'simple',
    weight: 0,
    cost: '1 sp',
  },

  // === ARMAS MARCIALES CUERPO A CUERPO ===
  'battleaxe': {
    id: 'battleaxe',
    name: 'Battleaxe',
    nameEs: 'Hacha de Batalla',
    damage: '1d8',
    damageType: 'slashing',
    range: 'melee',
    properties: ['versatile'],
    versatileDamage: '1d10',
    attackBonus: 0,
    category: 'martial',
    weight: 4,
    cost: '10 gp',
  },
  'flail': {
    id: 'flail',
    name: 'Flail',
    nameEs: 'Mangual',
    damage: '1d8',
    damageType: 'bludgeoning',
    range: 'melee',
    properties: [],
    attackBonus: 0,
    category: 'martial',
    weight: 2,
    cost: '10 gp',
  },
  'glaive': {
    id: 'glaive',
    name: 'Glaive',
    nameEs: 'Guja',
    damage: '1d10',
    damageType: 'slashing',
    range: 'reach',
    properties: ['heavy', 'reach', 'two-handed'],
    attackBonus: 0,
    category: 'martial',
    weight: 6,
    cost: '20 gp',
  },
  'greataxe': {
    id: 'greataxe',
    name: 'Greataxe',
    nameEs: 'Gran Hacha',
    damage: '1d12',
    damageType: 'slashing',
    range: 'melee',
    properties: ['heavy', 'two-handed'],
    attackBonus: 0,
    category: 'martial',
    weight: 7,
    cost: '30 gp',
  },
  'greatsword': {
    id: 'greatsword',
    name: 'Greatsword',
    nameEs: 'Espadón',
    damage: '2d6',
    damageType: 'slashing',
    range: 'melee',
    properties: ['heavy', 'two-handed'],
    attackBonus: 0,
    category: 'martial',
    weight: 6,
    cost: '50 gp',
  },
  'halberd': {
    id: 'halberd',
    name: 'Halberd',
    nameEs: 'Alabarda',
    damage: '1d10',
    damageType: 'slashing',
    range: 'reach',
    properties: ['heavy', 'reach', 'two-handed'],
    attackBonus: 0,
    category: 'martial',
    weight: 6,
    cost: '20 gp',
  },
  'lance': {
    id: 'lance',
    name: 'Lance',
    nameEs: 'Lanza de Caballería',
    damage: '1d12',
    damageType: 'piercing',
    range: 'reach',
    properties: ['reach', 'special'],
    attackBonus: 0,
    category: 'martial',
    weight: 6,
    cost: '10 gp',
  },
  'longsword': {
    id: 'longsword',
    name: 'Longsword',
    nameEs: 'Espada Larga',
    damage: '1d8',
    damageType: 'slashing',
    range: 'melee',
    properties: ['versatile'],
    versatileDamage: '1d10',
    attackBonus: 0,
    category: 'martial',
    weight: 3,
    cost: '15 gp',
  },
  'maul': {
    id: 'maul',
    name: 'Maul',
    nameEs: 'Mazo de Guerra',
    damage: '2d6',
    damageType: 'bludgeoning',
    range: 'melee',
    properties: ['heavy', 'two-handed'],
    attackBonus: 0,
    category: 'martial',
    weight: 10,
    cost: '10 gp',
  },
  'morningstar': {
    id: 'morningstar',
    name: 'Morningstar',
    nameEs: 'Lucero del Alba',
    damage: '1d8',
    damageType: 'piercing',
    range: 'melee',
    properties: [],
    attackBonus: 0,
    category: 'martial',
    weight: 4,
    cost: '15 gp',
  },
  'pike': {
    id: 'pike',
    name: 'Pike',
    nameEs: 'Pica',
    damage: '1d10',
    damageType: 'piercing',
    range: 'reach',
    properties: ['heavy', 'reach', 'two-handed'],
    attackBonus: 0,
    category: 'martial',
    weight: 18,
    cost: '5 gp',
  },
  'rapier': {
    id: 'rapier',
    name: 'Rapier',
    nameEs: 'Estoque',
    damage: '1d8',
    damageType: 'piercing',
    range: 'melee',
    properties: ['finesse'],
    attackBonus: 0,
    category: 'martial',
    weight: 2,
    cost: '25 gp',
  },
  'scimitar': {
    id: 'scimitar',
    name: 'Scimitar',
    nameEs: 'Cimitarra',
    damage: '1d6',
    damageType: 'slashing',
    range: 'melee',
    properties: ['finesse', 'light'],
    attackBonus: 0,
    category: 'martial',
    weight: 3,
    cost: '25 gp',
  },
  'shortsword': {
    id: 'shortsword',
    name: 'Shortsword',
    nameEs: 'Espada Corta',
    damage: '1d6',
    damageType: 'piercing',
    range: 'melee',
    properties: ['finesse', 'light'],
    attackBonus: 0,
    category: 'martial',
    weight: 2,
    cost: '10 gp',
  },
  'trident': {
    id: 'trident',
    name: 'Trident',
    nameEs: 'Tridente',
    damage: '1d6',
    damageType: 'piercing',
    range: 'melee',
    rangeDistance: { normal: 20, long: 60 },
    properties: ['thrown', 'versatile'],
    versatileDamage: '1d8',
    attackBonus: 0,
    category: 'martial',
    weight: 4,
    cost: '5 gp',
  },
  'warpick': {
    id: 'warpick',
    name: 'War Pick',
    nameEs: 'Pico de Guerra',
    damage: '1d8',
    damageType: 'piercing',
    range: 'melee',
    properties: [],
    attackBonus: 0,
    category: 'martial',
    weight: 2,
    cost: '5 gp',
  },
  'warhammer': {
    id: 'warhammer',
    name: 'Warhammer',
    nameEs: 'Martillo de Guerra',
    damage: '1d8',
    damageType: 'bludgeoning',
    range: 'melee',
    properties: ['versatile'],
    versatileDamage: '1d10',
    attackBonus: 0,
    category: 'martial',
    weight: 2,
    cost: '15 gp',
  },
  'whip': {
    id: 'whip',
    name: 'Whip',
    nameEs: 'Látigo',
    damage: '1d4',
    damageType: 'slashing',
    range: 'reach',
    properties: ['finesse', 'reach'],
    attackBonus: 0,
    category: 'martial',
    weight: 3,
    cost: '2 gp',
  },

  // === ARMAS MARCIALES A DISTANCIA ===
  'blowgun': {
    id: 'blowgun',
    name: 'Blowgun',
    nameEs: 'Cerbatana',
    damage: '1',
    damageType: 'piercing',
    range: 'ranged',
    rangeDistance: { normal: 25, long: 100 },
    properties: ['ammunition', 'loading'],
    attackBonus: 0,
    category: 'martial',
    weight: 1,
    cost: '10 gp',
  },
  'crossbow_hand': {
    id: 'crossbow_hand',
    name: 'Hand Crossbow',
    nameEs: 'Ballesta de Mano',
    damage: '1d6',
    damageType: 'piercing',
    range: 'ranged',
    rangeDistance: { normal: 30, long: 120 },
    properties: ['ammunition', 'light', 'loading'],
    attackBonus: 0,
    category: 'martial',
    weight: 3,
    cost: '75 gp',
  },
  'crossbow_heavy': {
    id: 'crossbow_heavy',
    name: 'Heavy Crossbow',
    nameEs: 'Ballesta Pesada',
    damage: '1d10',
    damageType: 'piercing',
    range: 'ranged',
    rangeDistance: { normal: 100, long: 400 },
    properties: ['ammunition', 'heavy', 'loading', 'two-handed'],
    attackBonus: 0,
    category: 'martial',
    weight: 18,
    cost: '50 gp',
  },
  'longbow': {
    id: 'longbow',
    name: 'Longbow',
    nameEs: 'Arco Largo',
    damage: '1d8',
    damageType: 'piercing',
    range: 'ranged',
    rangeDistance: { normal: 150, long: 600 },
    properties: ['ammunition', 'heavy', 'two-handed'],
    attackBonus: 0,
    category: 'martial',
    weight: 2,
    cost: '50 gp',
  },
  'net': {
    id: 'net',
    name: 'Net',
    nameEs: 'Red',
    damage: '0',
    damageType: 'bludgeoning',
    range: 'ranged',
    rangeDistance: { normal: 5, long: 15 },
    properties: ['special', 'thrown'],
    attackBonus: 0,
    category: 'martial',
    weight: 3,
    cost: '1 gp',
  },

  // === ARMAS ESPECIALES POR LORE ===
  // Estas son versiones con nombre específico que referencian armas base

  // Star Wars
  'blaster': {
    id: 'blaster',
    name: 'Blaster Pistol',
    nameEs: 'Pistola Blaster',
    damage: '2d6',
    damageType: 'fire',
    range: 'ranged',
    rangeDistance: { normal: 60, long: 180 },
    properties: ['ammunition'],
    attackBonus: 0,
    category: 'martial',
    weight: 2,
    cost: '500 credits',
  },
  'blaster_rifle': {
    id: 'blaster_rifle',
    name: 'Blaster Rifle',
    nameEs: 'Rifle Blaster',
    damage: '3d6',
    damageType: 'fire',
    range: 'ranged',
    rangeDistance: { normal: 100, long: 400 },
    properties: ['ammunition', 'two-handed'],
    attackBonus: 0,
    category: 'martial',
    weight: 4,
    cost: '1000 credits',
  },
  'lightsaber': {
    id: 'lightsaber',
    name: 'Lightsaber',
    nameEs: 'Sable de Luz',
    damage: '2d8',
    damageType: 'radiant',
    range: 'melee',
    properties: ['finesse', 'versatile'],
    versatileDamage: '2d10',
    attackBonus: 0,
    category: 'martial',
    weight: 1,
    cost: 'priceless',
  },

  // Cyberpunk
  'smartgun': {
    id: 'smartgun',
    name: 'Smart Gun',
    nameEs: 'Pistola Inteligente',
    damage: '2d6',
    damageType: 'piercing',
    range: 'ranged',
    rangeDistance: { normal: 60, long: 180 },
    properties: ['ammunition'],
    attackBonus: 1, // Bonus por targeting system
    category: 'martial',
    weight: 2,
    cost: '2000 eddies',
  },
  'mantis_blades': {
    id: 'mantis_blades',
    name: 'Mantis Blades',
    nameEs: 'Mantis Blades',
    damage: '2d6',
    damageType: 'slashing',
    range: 'melee',
    properties: ['finesse', 'light'],
    attackBonus: 0,
    category: 'martial',
    weight: 0, // Implante
    cost: '5000 eddies',
  },

  // Zombies
  'baseball_bat': {
    id: 'baseball_bat',
    name: 'Baseball Bat',
    nameEs: 'Bate de Béisbol',
    damage: '1d6',
    damageType: 'bludgeoning',
    range: 'melee',
    properties: [],
    attackBonus: 0,
    category: 'simple',
    weight: 2,
    cost: '5$',
  },
  'machete': {
    id: 'machete',
    name: 'Machete',
    nameEs: 'Machete',
    damage: '1d6',
    damageType: 'slashing',
    range: 'melee',
    properties: ['light'],
    attackBonus: 0,
    category: 'simple',
    weight: 2,
    cost: '20$',
  },
  'shotgun': {
    id: 'shotgun',
    name: 'Shotgun',
    nameEs: 'Escopeta',
    damage: '2d8',
    damageType: 'piercing',
    range: 'ranged',
    rangeDistance: { normal: 30, long: 90 },
    properties: ['ammunition', 'two-handed', 'loading'],
    attackBonus: 0,
    category: 'martial',
    weight: 7,
    cost: '300$',
  },
  'pistol': {
    id: 'pistol',
    name: 'Pistol',
    nameEs: 'Pistola',
    damage: '2d6',
    damageType: 'piercing',
    range: 'ranged',
    rangeDistance: { normal: 50, long: 150 },
    properties: ['ammunition'],
    attackBonus: 0,
    category: 'martial',
    weight: 3,
    cost: '250$',
  },

  // Lovecraft
  'revolver': {
    id: 'revolver',
    name: 'Revolver .38',
    nameEs: 'Revólver .38',
    damage: '2d6',
    damageType: 'piercing',
    range: 'ranged',
    rangeDistance: { normal: 40, long: 120 },
    properties: ['ammunition'],
    attackBonus: 0,
    category: 'martial',
    weight: 2,
    cost: '30$',
  },

  // Vikingos
  'viking_axe': {
    id: 'viking_axe',
    name: 'Viking Axe',
    nameEs: 'Hacha Vikinga',
    damage: '1d8',
    damageType: 'slashing',
    range: 'melee',
    rangeDistance: { normal: 20, long: 60 },
    properties: ['thrown', 'versatile'],
    versatileDamage: '1d10',
    attackBonus: 0,
    category: 'martial',
    weight: 4,
    cost: '10 gp',
  },
  'seax': {
    id: 'seax',
    name: 'Seax',
    nameEs: 'Seax (Cuchillo Vikingo)',
    damage: '1d6',
    damageType: 'slashing',
    range: 'melee',
    properties: ['finesse', 'light'],
    attackBonus: 0,
    category: 'simple',
    weight: 1,
    cost: '5 gp',
  },
}

// =====================================================
// HECHIZOS BÁSICOS D&D 5e SRD
// =====================================================

export const SPELLS_DB: Record<string, Spell> = {
  // Cantrips (nivel 0)
  'fire_bolt': {
    id: 'fire_bolt',
    name: 'Fire Bolt',
    nameEs: 'Descarga de Fuego',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    damage: '1d10',
    damageType: 'fire',
    concentration: false,
    effect: 'Lanza un rayo de fuego que impacta al objetivo.',
  },
  'ray_of_frost': {
    id: 'ray_of_frost',
    name: 'Ray of Frost',
    nameEs: 'Rayo de Escarcha',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    damage: '1d8',
    damageType: 'cold',
    concentration: false,
    effect: 'Rayo helado que reduce velocidad del objetivo.',
  },
  'sacred_flame': {
    id: 'sacred_flame',
    name: 'Sacred Flame',
    nameEs: 'Llama Sagrada',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    damage: '1d8',
    damageType: 'radiant',
    savingThrow: 'DEX',
    concentration: false,
    effect: 'Fuego divino desciende sobre el objetivo.',
  },
  'eldritch_blast': {
    id: 'eldritch_blast',
    name: 'Eldritch Blast',
    nameEs: 'Descarga Sobrenatural',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    damage: '1d10',
    damageType: 'force',
    concentration: false,
    effect: 'Rayo de energía arcana impacta al objetivo.',
  },

  // Nivel 1
  'magic_missile': {
    id: 'magic_missile',
    name: 'Magic Missile',
    nameEs: 'Proyectil Mágico',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    damage: '1d4+1',
    damageType: 'force',
    concentration: false,
    effect: 'Tres dardos de energía impactan automáticamente.',
  },
  'burning_hands': {
    id: 'burning_hands',
    name: 'Burning Hands',
    nameEs: 'Manos Ardientes',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: 'Self (15-foot cone)',
    components: 'V, S',
    duration: 'Instantaneous',
    damage: '3d6',
    damageType: 'fire',
    savingThrow: 'DEX',
    concentration: false,
    effect: 'Cono de fuego emerge de tus manos.',
  },
  'cure_wounds': {
    id: 'cure_wounds',
    name: 'Cure Wounds',
    nameEs: 'Curar Heridas',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S',
    duration: 'Instantaneous',
    concentration: false,
    effect: 'Cura 1d8 + modificador de hechizo HP.',
  },
  'shield': {
    id: 'shield',
    name: 'Shield',
    nameEs: 'Escudo',
    level: 1,
    school: 'Abjuration',
    castingTime: '1 reaction',
    range: 'Self',
    components: 'V, S',
    duration: '1 round',
    concentration: false,
    effect: '+5 a CA hasta tu siguiente turno.',
  },

  // Nivel 2
  'scorching_ray': {
    id: 'scorching_ray',
    name: 'Scorching Ray',
    nameEs: 'Rayo Abrasador',
    level: 2,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    damage: '2d6',
    damageType: 'fire',
    concentration: false,
    effect: 'Tres rayos de fuego, cada uno hace 2d6 de daño.',
  },
  'hold_person': {
    id: 'hold_person',
    name: 'Hold Person',
    nameEs: 'Retener Persona',
    level: 2,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 minute',
    savingThrow: 'WIS',
    concentration: true,
    effect: 'Paraliza a un humanoide.',
  },

  // Nivel 3
  'fireball': {
    id: 'fireball',
    name: 'Fireball',
    nameEs: 'Bola de Fuego',
    level: 3,
    school: 'Evocation',
    castingTime: '1 action',
    range: '150 feet',
    components: 'V, S, M',
    duration: 'Instantaneous',
    damage: '8d6',
    damageType: 'fire',
    savingThrow: 'DEX',
    concentration: false,
    effect: 'Explosión de fuego en radio de 20 pies.',
  },
  'lightning_bolt': {
    id: 'lightning_bolt',
    name: 'Lightning Bolt',
    nameEs: 'Relámpago',
    level: 3,
    school: 'Evocation',
    castingTime: '1 action',
    range: 'Self (100-foot line)',
    components: 'V, S, M',
    duration: 'Instantaneous',
    damage: '8d6',
    damageType: 'lightning',
    savingThrow: 'DEX',
    concentration: false,
    effect: 'Línea de electricidad de 100 pies.',
  },
}

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

/**
 * Busca armas en el inventario (strings) y devuelve objetos Weapon
 */
export function parseWeaponsFromInventory(inventory: string[]): Weapon[] {
  const weapons: Weapon[] = []

  // Mapeo de términos comunes a IDs de armas
  const weaponKeywords: Record<string, string> = {
    // Español
    'espada larga': 'longsword',
    'espada corta': 'shortsword',
    'daga': 'dagger',
    'arco corto': 'shortbow',
    'arco largo': 'longbow',
    'ballesta': 'crossbow_light',
    'ballesta ligera': 'crossbow_light',
    'ballesta pesada': 'crossbow_heavy',
    'hacha': 'battleaxe',
    'hacha de batalla': 'battleaxe',
    'hacha de mano': 'handaxe',
    'gran hacha': 'greataxe',
    'espadón': 'greatsword',
    'lanza': 'spear',
    'jabalina': 'javelin',
    'maza': 'mace',
    'martillo': 'warhammer',
    'martillo de guerra': 'warhammer',
    'bastón': 'quarterstaff',
    'estoque': 'rapier',
    'cimitarra': 'scimitar',
    'alabarda': 'halberd',
    'látigo': 'whip',
    'garrote': 'club',
    'honda': 'sling',
    'red': 'net',
    'tridente': 'trident',
    // Inglés
    'longsword': 'longsword',
    'shortsword': 'shortsword',
    'dagger': 'dagger',
    'shortbow': 'shortbow',
    'longbow': 'longbow',
    'crossbow': 'crossbow_light',
    'battleaxe': 'battleaxe',
    'handaxe': 'handaxe',
    'greataxe': 'greataxe',
    'greatsword': 'greatsword',
    'spear': 'spear',
    'javelin': 'javelin',
    'mace': 'mace',
    'warhammer': 'warhammer',
    'quarterstaff': 'quarterstaff',
    'rapier': 'rapier',
    'scimitar': 'scimitar',
    'halberd': 'halberd',
    'whip': 'whip',
    'club': 'club',
    'sling': 'sling',
    'net': 'net',
    'trident': 'trident',
    // Armas especiales por lore
    'blaster': 'blaster',
    'pistola blaster': 'blaster',
    'rifle blaster': 'blaster_rifle',
    'sable de luz': 'lightsaber',
    'lightsaber': 'lightsaber',
    'mantis blades': 'mantis_blades',
    'pistola inteligente': 'smartgun',
    'smart gun': 'smartgun',
    'bate': 'baseball_bat',
    'machete': 'machete',
    'escopeta': 'shotgun',
    'shotgun': 'shotgun',
    'pistola': 'pistol',
    'revólver': 'revolver',
    'revolver': 'revolver',
    'hacha vikinga': 'viking_axe',
    'seax': 'seax',
  }

  for (const item of inventory) {
    const itemLower = item.toLowerCase()

    // Buscar coincidencia de keywords
    for (const [keyword, weaponId] of Object.entries(weaponKeywords)) {
      if (itemLower.includes(keyword)) {
        const weapon = WEAPONS_DB[weaponId]
        if (weapon && !weapons.find(w => w.id === weapon.id)) {
          // Detectar si es mágica (+1, +2, +3)
          const magicMatch = item.match(/\+(\d)/)
          if (magicMatch) {
            weapons.push({
              ...weapon,
              name: `${weapon.name} +${magicMatch[1]}`,
              nameEs: `${weapon.nameEs} +${magicMatch[1]}`,
              attackBonus: parseInt(magicMatch[1]),
            })
          } else {
            weapons.push(weapon)
          }
        }
        break
      }
    }
  }

  return weapons
}

/**
 * Busca hechizos en el inventario/habilidades y devuelve objetos Spell
 */
export function parseSpellsFromInventory(inventory: string[]): Spell[] {
  const spells: Spell[] = []

  const spellKeywords: Record<string, string> = {
    'bola de fuego': 'fireball',
    'fireball': 'fireball',
    'rayo': 'lightning_bolt',
    'relámpago': 'lightning_bolt',
    'lightning bolt': 'lightning_bolt',
    'proyectil mágico': 'magic_missile',
    'magic missile': 'magic_missile',
    'escudo': 'shield',
    'shield': 'shield',
    'curar heridas': 'cure_wounds',
    'cure wounds': 'cure_wounds',
    'descarga de fuego': 'fire_bolt',
    'fire bolt': 'fire_bolt',
    'rayo de escarcha': 'ray_of_frost',
    'ray of frost': 'ray_of_frost',
    'llama sagrada': 'sacred_flame',
    'sacred flame': 'sacred_flame',
    'descarga sobrenatural': 'eldritch_blast',
    'eldritch blast': 'eldritch_blast',
    'manos ardientes': 'burning_hands',
    'burning hands': 'burning_hands',
    'rayo abrasador': 'scorching_ray',
    'scorching ray': 'scorching_ray',
    'retener persona': 'hold_person',
    'hold person': 'hold_person',
  }

  for (const item of inventory) {
    const itemLower = item.toLowerCase()

    for (const [keyword, spellId] of Object.entries(spellKeywords)) {
      if (itemLower.includes(keyword)) {
        const spell = SPELLS_DB[spellId]
        if (spell && !spells.find(s => s.id === spell.id)) {
          spells.push(spell)
        }
        break
      }
    }
  }

  return spells
}

/**
 * Obtiene la descripción formateada de un arma para el UI
 */
export function getWeaponDescription(weapon: Weapon): string {
  const parts: string[] = []
  parts.push(`${weapon.damage} ${getDamageTypeEs(weapon.damageType)}`)

  if (weapon.versatileDamage) {
    parts.push(`(${weapon.versatileDamage} a dos manos)`)
  }

  if (weapon.rangeDistance) {
    parts.push(`Alcance: ${weapon.rangeDistance.normal}/${weapon.rangeDistance.long} pies`)
  }

  if (weapon.properties.length > 0) {
    parts.push(`Props: ${weapon.properties.map(getPropertyEs).join(', ')}`)
  }

  return parts.join(' | ')
}

/**
 * Obtiene la descripción formateada de un hechizo para el UI
 */
export function getSpellDescription(spell: Spell): string {
  const parts: string[] = []

  if (spell.level === 0) {
    parts.push('Truco')
  } else {
    parts.push(`Nivel ${spell.level}`)
  }

  if (spell.damage) {
    parts.push(`${spell.damage} ${getDamageTypeEs(spell.damageType!)}`)
  }

  parts.push(`Alcance: ${spell.range}`)

  if (spell.concentration) {
    parts.push('Concentración')
  }

  return parts.join(' | ')
}

function getDamageTypeEs(type: DamageType): string {
  const types: Record<DamageType, string> = {
    slashing: 'cortante',
    piercing: 'perforante',
    bludgeoning: 'contundente',
    fire: 'fuego',
    cold: 'frío',
    lightning: 'eléctrico',
    thunder: 'trueno',
    poison: 'veneno',
    acid: 'ácido',
    necrotic: 'necrótico',
    radiant: 'radiante',
    force: 'fuerza',
    psychic: 'psíquico',
  }
  return types[type] || type
}

function getPropertyEs(prop: WeaponProperty): string {
  const props: Record<WeaponProperty, string> = {
    finesse: 'sutil',
    heavy: 'pesada',
    light: 'ligera',
    loading: 'recarga',
    reach: 'alcance',
    thrown: 'arrojadiza',
    'two-handed': 'dos manos',
    versatile: 'versátil',
    ammunition: 'munición',
    special: 'especial',
  }
  return props[prop] || prop
}
