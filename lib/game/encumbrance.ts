/**
 * Sistema de Carga y Peso - D&D 5e Style
 *
 * Capacidad de carga = STR × 15 lb
 * Sistema de Encumbrance Variante:
 * - Normal: hasta STR × 5 lb
 * - Cargado: STR × 5 a STR × 10 lb (-10 pies velocidad)
 * - Muy cargado: STR × 10 a STR × 15 lb (-20 pies velocidad, desventaja en checks)
 */

// Tipos de item por categoría
export type ItemCategory =
  | 'weapon'
  | 'armor'
  | 'shield'
  | 'ammunition'
  | 'adventuring_gear'
  | 'tool'
  | 'consumable'
  | 'treasure'
  | 'container'
  | 'mount'
  | 'misc'

export interface ItemWeight {
  name: string
  nameEs: string
  weight: number  // en libras (lb)
  category: ItemCategory
  stackable?: boolean
  maxStack?: number
  notes?: string
}

// Base de datos de pesos de items D&D 5e SRD
export const ITEM_WEIGHTS: Record<string, ItemWeight> = {
  // ============================================
  // ARMAS SIMPLES CUERPO A CUERPO
  // ============================================
  'club': { name: 'Club', nameEs: 'Garrote', weight: 2, category: 'weapon' },
  'dagger': { name: 'Dagger', nameEs: 'Daga', weight: 1, category: 'weapon' },
  'greatclub': { name: 'Greatclub', nameEs: 'Gran garrote', weight: 10, category: 'weapon' },
  'handaxe': { name: 'Handaxe', nameEs: 'Hacha de mano', weight: 2, category: 'weapon' },
  'javelin': { name: 'Javelin', nameEs: 'Jabalina', weight: 2, category: 'weapon' },
  'light_hammer': { name: 'Light Hammer', nameEs: 'Martillo ligero', weight: 2, category: 'weapon' },
  'mace': { name: 'Mace', nameEs: 'Maza', weight: 4, category: 'weapon' },
  'quarterstaff': { name: 'Quarterstaff', nameEs: 'Bastón', weight: 4, category: 'weapon' },
  'sickle': { name: 'Sickle', nameEs: 'Hoz', weight: 2, category: 'weapon' },
  'spear': { name: 'Spear', nameEs: 'Lanza', weight: 3, category: 'weapon' },

  // ============================================
  // ARMAS SIMPLES A DISTANCIA
  // ============================================
  'light_crossbow': { name: 'Light Crossbow', nameEs: 'Ballesta ligera', weight: 5, category: 'weapon' },
  'dart': { name: 'Dart', nameEs: 'Dardo', weight: 0.25, category: 'weapon', stackable: true, maxStack: 20 },
  'shortbow': { name: 'Shortbow', nameEs: 'Arco corto', weight: 2, category: 'weapon' },
  'sling': { name: 'Sling', nameEs: 'Honda', weight: 0, category: 'weapon' },

  // ============================================
  // ARMAS MARCIALES CUERPO A CUERPO
  // ============================================
  'battleaxe': { name: 'Battleaxe', nameEs: 'Hacha de batalla', weight: 4, category: 'weapon' },
  'flail': { name: 'Flail', nameEs: 'Mangual', weight: 2, category: 'weapon' },
  'glaive': { name: 'Glaive', nameEs: 'Guja', weight: 6, category: 'weapon' },
  'greataxe': { name: 'Greataxe', nameEs: 'Gran hacha', weight: 7, category: 'weapon' },
  'greatsword': { name: 'Greatsword', nameEs: 'Espadón', weight: 6, category: 'weapon' },
  'halberd': { name: 'Halberd', nameEs: 'Alabarda', weight: 6, category: 'weapon' },
  'lance': { name: 'Lance', nameEs: 'Lanza de caballería', weight: 6, category: 'weapon' },
  'longsword': { name: 'Longsword', nameEs: 'Espada larga', weight: 3, category: 'weapon' },
  'maul': { name: 'Maul', nameEs: 'Mazo', weight: 10, category: 'weapon' },
  'morningstar': { name: 'Morningstar', nameEs: 'Lucero del alba', weight: 4, category: 'weapon' },
  'pike': { name: 'Pike', nameEs: 'Pica', weight: 18, category: 'weapon' },
  'rapier': { name: 'Rapier', nameEs: 'Estoque', weight: 2, category: 'weapon' },
  'scimitar': { name: 'Scimitar', nameEs: 'Cimitarra', weight: 3, category: 'weapon' },
  'shortsword': { name: 'Shortsword', nameEs: 'Espada corta', weight: 2, category: 'weapon' },
  'trident': { name: 'Trident', nameEs: 'Tridente', weight: 4, category: 'weapon' },
  'war_pick': { name: 'War Pick', nameEs: 'Pico de guerra', weight: 2, category: 'weapon' },
  'warhammer': { name: 'Warhammer', nameEs: 'Martillo de guerra', weight: 2, category: 'weapon' },
  'whip': { name: 'Whip', nameEs: 'Látigo', weight: 3, category: 'weapon' },

  // ============================================
  // ARMAS MARCIALES A DISTANCIA
  // ============================================
  'blowgun': { name: 'Blowgun', nameEs: 'Cerbatana', weight: 1, category: 'weapon' },
  'hand_crossbow': { name: 'Hand Crossbow', nameEs: 'Ballesta de mano', weight: 3, category: 'weapon' },
  'heavy_crossbow': { name: 'Heavy Crossbow', nameEs: 'Ballesta pesada', weight: 18, category: 'weapon' },
  'longbow': { name: 'Longbow', nameEs: 'Arco largo', weight: 2, category: 'weapon' },
  'net': { name: 'Net', nameEs: 'Red', weight: 3, category: 'weapon' },

  // ============================================
  // MUNICIÓN
  // ============================================
  'arrows': { name: 'Arrows (20)', nameEs: 'Flechas (20)', weight: 1, category: 'ammunition', stackable: true, maxStack: 20 },
  'bolts': { name: 'Crossbow Bolts (20)', nameEs: 'Virotes (20)', weight: 1.5, category: 'ammunition', stackable: true, maxStack: 20 },
  'bullets': { name: 'Sling Bullets (20)', nameEs: 'Balas de honda (20)', weight: 1.5, category: 'ammunition', stackable: true, maxStack: 20 },
  'needles': { name: 'Blowgun Needles (50)', nameEs: 'Agujas de cerbatana (50)', weight: 1, category: 'ammunition', stackable: true, maxStack: 50 },

  // ============================================
  // ARMADURAS
  // ============================================
  // Ligeras
  'padded_armor': { name: 'Padded', nameEs: 'Acolchada', weight: 8, category: 'armor' },
  'leather_armor': { name: 'Leather', nameEs: 'Cuero', weight: 10, category: 'armor' },
  'studded_leather': { name: 'Studded Leather', nameEs: 'Cuero tachonado', weight: 13, category: 'armor' },

  // Medias
  'hide_armor': { name: 'Hide', nameEs: 'Pieles', weight: 12, category: 'armor' },
  'chain_shirt': { name: 'Chain Shirt', nameEs: 'Camisote de mallas', weight: 20, category: 'armor' },
  'scale_mail': { name: 'Scale Mail', nameEs: 'Cota de escamas', weight: 45, category: 'armor' },
  'breastplate': { name: 'Breastplate', nameEs: 'Coraza', weight: 20, category: 'armor' },
  'half_plate': { name: 'Half Plate', nameEs: 'Media armadura', weight: 40, category: 'armor' },

  // Pesadas
  'ring_mail': { name: 'Ring Mail', nameEs: 'Cota de anillas', weight: 40, category: 'armor' },
  'chain_mail': { name: 'Chain Mail', nameEs: 'Cota de mallas', weight: 55, category: 'armor' },
  'splint_armor': { name: 'Splint', nameEs: 'Cota de placas', weight: 60, category: 'armor' },
  'plate_armor': { name: 'Plate', nameEs: 'Armadura completa', weight: 65, category: 'armor' },

  // Escudos
  'shield': { name: 'Shield', nameEs: 'Escudo', weight: 6, category: 'shield' },

  // ============================================
  // EQUIPO DE AVENTURERO
  // ============================================
  'backpack': { name: 'Backpack', nameEs: 'Mochila', weight: 5, category: 'container', notes: 'Capacidad: 30 lb' },
  'bedroll': { name: 'Bedroll', nameEs: 'Saco de dormir', weight: 7, category: 'adventuring_gear' },
  'blanket': { name: 'Blanket', nameEs: 'Manta', weight: 3, category: 'adventuring_gear' },
  'candle': { name: 'Candle', nameEs: 'Vela', weight: 0, category: 'adventuring_gear', stackable: true },
  'chest': { name: 'Chest', nameEs: 'Cofre', weight: 25, category: 'container' },
  'clothes_common': { name: 'Common Clothes', nameEs: 'Ropa común', weight: 3, category: 'adventuring_gear' },
  'clothes_costume': { name: 'Costume', nameEs: 'Disfraz', weight: 4, category: 'adventuring_gear' },
  'clothes_fine': { name: 'Fine Clothes', nameEs: 'Ropa fina', weight: 6, category: 'adventuring_gear' },
  'clothes_travelers': { name: "Traveler's Clothes", nameEs: 'Ropa de viajero', weight: 4, category: 'adventuring_gear' },
  'crowbar': { name: 'Crowbar', nameEs: 'Palanca', weight: 5, category: 'adventuring_gear' },
  'fishing_tackle': { name: 'Fishing Tackle', nameEs: 'Equipo de pesca', weight: 4, category: 'adventuring_gear' },
  'grappling_hook': { name: 'Grappling Hook', nameEs: 'Gancho de escalada', weight: 4, category: 'adventuring_gear' },
  'hammer': { name: 'Hammer', nameEs: 'Martillo', weight: 3, category: 'adventuring_gear' },
  'healers_kit': { name: "Healer's Kit", nameEs: 'Kit de sanador', weight: 3, category: 'adventuring_gear', notes: '10 usos' },
  'holy_symbol': { name: 'Holy Symbol', nameEs: 'Símbolo sagrado', weight: 1, category: 'adventuring_gear' },
  'hourglass': { name: 'Hourglass', nameEs: 'Reloj de arena', weight: 1, category: 'adventuring_gear' },
  'hunting_trap': { name: 'Hunting Trap', nameEs: 'Trampa de caza', weight: 25, category: 'adventuring_gear' },
  'ink': { name: 'Ink (1 oz)', nameEs: 'Tinta (30g)', weight: 0, category: 'adventuring_gear' },
  'ink_pen': { name: 'Ink Pen', nameEs: 'Pluma de tinta', weight: 0, category: 'adventuring_gear' },
  'ladder': { name: 'Ladder (10 ft)', nameEs: 'Escalera (3m)', weight: 25, category: 'adventuring_gear' },
  'lamp': { name: 'Lamp', nameEs: 'Lámpara', weight: 1, category: 'adventuring_gear' },
  'lantern_bullseye': { name: 'Bullseye Lantern', nameEs: 'Linterna con lente', weight: 2, category: 'adventuring_gear' },
  'lantern_hooded': { name: 'Hooded Lantern', nameEs: 'Linterna con capucha', weight: 2, category: 'adventuring_gear' },
  'lock': { name: 'Lock', nameEs: 'Candado', weight: 1, category: 'adventuring_gear' },
  'magnifying_glass': { name: 'Magnifying Glass', nameEs: 'Lupa', weight: 0, category: 'adventuring_gear' },
  'manacles': { name: 'Manacles', nameEs: 'Grilletes', weight: 6, category: 'adventuring_gear' },
  'mess_kit': { name: 'Mess Kit', nameEs: 'Kit de cocina', weight: 1, category: 'adventuring_gear' },
  'mirror_steel': { name: 'Steel Mirror', nameEs: 'Espejo de acero', weight: 0.5, category: 'adventuring_gear' },
  'oil_flask': { name: 'Oil Flask', nameEs: 'Frasco de aceite', weight: 1, category: 'consumable', stackable: true },
  'paper': { name: 'Paper (1 sheet)', nameEs: 'Papel (hoja)', weight: 0, category: 'adventuring_gear', stackable: true },
  'parchment': { name: 'Parchment (1 sheet)', nameEs: 'Pergamino (hoja)', weight: 0, category: 'adventuring_gear', stackable: true },
  'pick_miners': { name: "Miner's Pick", nameEs: 'Pico de minero', weight: 10, category: 'adventuring_gear' },
  'piton': { name: 'Piton', nameEs: 'Clavija', weight: 0.25, category: 'adventuring_gear', stackable: true },
  'pole': { name: 'Pole (10 ft)', nameEs: 'Pértiga (3m)', weight: 7, category: 'adventuring_gear' },
  'pot_iron': { name: 'Pot, Iron', nameEs: 'Olla de hierro', weight: 10, category: 'adventuring_gear' },
  'pouch': { name: 'Pouch', nameEs: 'Bolsa', weight: 1, category: 'container', notes: 'Capacidad: 6 lb' },
  'quiver': { name: 'Quiver', nameEs: 'Carcaj', weight: 1, category: 'container', notes: 'Capacidad: 20 flechas' },
  'rations': { name: 'Rations (1 day)', nameEs: 'Raciones (1 día)', weight: 2, category: 'consumable', stackable: true },
  'rope_hempen': { name: 'Hemp Rope (50 ft)', nameEs: 'Cuerda de cáñamo (15m)', weight: 10, category: 'adventuring_gear' },
  'rope_silk': { name: 'Silk Rope (50 ft)', nameEs: 'Cuerda de seda (15m)', weight: 5, category: 'adventuring_gear' },
  'sack': { name: 'Sack', nameEs: 'Saco', weight: 0.5, category: 'container', notes: 'Capacidad: 30 lb' },
  'scale_merchant': { name: "Merchant's Scale", nameEs: 'Balanza de mercader', weight: 3, category: 'adventuring_gear' },
  'shovel': { name: 'Shovel', nameEs: 'Pala', weight: 5, category: 'adventuring_gear' },
  'signal_whistle': { name: 'Signal Whistle', nameEs: 'Silbato', weight: 0, category: 'adventuring_gear' },
  'spellbook': { name: 'Spellbook', nameEs: 'Libro de conjuros', weight: 3, category: 'adventuring_gear' },
  'spyglass': { name: 'Spyglass', nameEs: 'Catalejo', weight: 1, category: 'adventuring_gear' },
  'tent': { name: 'Tent (2 person)', nameEs: 'Tienda (2 personas)', weight: 20, category: 'adventuring_gear' },
  'tinderbox': { name: 'Tinderbox', nameEs: 'Yesca y pedernal', weight: 1, category: 'adventuring_gear' },
  'torch': { name: 'Torch', nameEs: 'Antorcha', weight: 1, category: 'adventuring_gear', stackable: true },
  'waterskin': { name: 'Waterskin', nameEs: 'Odre', weight: 5, category: 'adventuring_gear', notes: 'Lleno: 5 lb' },
  'whetstone': { name: 'Whetstone', nameEs: 'Piedra de afilar', weight: 1, category: 'adventuring_gear' },

  // ============================================
  // HERRAMIENTAS
  // ============================================
  'alchemists_supplies': { name: "Alchemist's Supplies", nameEs: 'Útiles de alquimista', weight: 8, category: 'tool' },
  'brewers_supplies': { name: "Brewer's Supplies", nameEs: 'Útiles de cervecero', weight: 9, category: 'tool' },
  'calligraphers_supplies': { name: "Calligrapher's Supplies", nameEs: 'Útiles de calígrafo', weight: 5, category: 'tool' },
  'carpenters_tools': { name: "Carpenter's Tools", nameEs: 'Herramientas de carpintero', weight: 6, category: 'tool' },
  'cartographers_tools': { name: "Cartographer's Tools", nameEs: 'Herramientas de cartógrafo', weight: 6, category: 'tool' },
  'cobblers_tools': { name: "Cobbler's Tools", nameEs: 'Herramientas de zapatero', weight: 5, category: 'tool' },
  'cooks_utensils': { name: "Cook's Utensils", nameEs: 'Utensilios de cocinero', weight: 8, category: 'tool' },
  'disguise_kit': { name: 'Disguise Kit', nameEs: 'Kit de disfraz', weight: 3, category: 'tool' },
  'forgery_kit': { name: 'Forgery Kit', nameEs: 'Kit de falsificación', weight: 5, category: 'tool' },
  'gaming_set': { name: 'Gaming Set', nameEs: 'Juego de mesa', weight: 0.5, category: 'tool' },
  'glassblowers_tools': { name: "Glassblower's Tools", nameEs: 'Herramientas de vidriero', weight: 5, category: 'tool' },
  'herbalism_kit': { name: 'Herbalism Kit', nameEs: 'Kit de herboristería', weight: 3, category: 'tool' },
  'jewelers_tools': { name: "Jeweler's Tools", nameEs: 'Herramientas de joyero', weight: 2, category: 'tool' },
  'leatherworkers_tools': { name: "Leatherworker's Tools", nameEs: 'Herramientas de curtidor', weight: 5, category: 'tool' },
  'masons_tools': { name: "Mason's Tools", nameEs: 'Herramientas de albañil', weight: 8, category: 'tool' },
  'navigators_tools': { name: "Navigator's Tools", nameEs: 'Herramientas de navegante', weight: 2, category: 'tool' },
  'painters_supplies': { name: "Painter's Supplies", nameEs: 'Útiles de pintor', weight: 5, category: 'tool' },
  'poisoners_kit': { name: "Poisoner's Kit", nameEs: 'Kit de envenenador', weight: 2, category: 'tool' },
  'potters_tools': { name: "Potter's Tools", nameEs: 'Herramientas de alfarero', weight: 3, category: 'tool' },
  'smiths_tools': { name: "Smith's Tools", nameEs: 'Herramientas de herrero', weight: 8, category: 'tool' },
  'thieves_tools': { name: "Thieves' Tools", nameEs: 'Herramientas de ladrón', weight: 1, category: 'tool' },
  'tinkers_tools': { name: "Tinker's Tools", nameEs: 'Herramientas de hojalatero', weight: 10, category: 'tool' },
  'weavers_tools': { name: "Weaver's Tools", nameEs: 'Herramientas de tejedor', weight: 5, category: 'tool' },
  'woodcarvers_tools': { name: "Woodcarver's Tools", nameEs: 'Herramientas de tallador', weight: 5, category: 'tool' },

  // ============================================
  // POCIONES Y CONSUMIBLES
  // ============================================
  'potion_healing': { name: 'Potion of Healing', nameEs: 'Poción de curación', weight: 0.5, category: 'consumable' },
  'potion_greater_healing': { name: 'Potion of Greater Healing', nameEs: 'Poción de curación mayor', weight: 0.5, category: 'consumable' },
  'antitoxin': { name: 'Antitoxin (vial)', nameEs: 'Antitoxina (vial)', weight: 0, category: 'consumable' },
  'holy_water': { name: 'Holy Water (flask)', nameEs: 'Agua bendita (frasco)', weight: 1, category: 'consumable' },
  'acid_vial': { name: 'Acid (vial)', nameEs: 'Ácido (vial)', weight: 1, category: 'consumable' },
  'alchemists_fire': { name: "Alchemist's Fire (flask)", nameEs: 'Fuego de alquimista (frasco)', weight: 1, category: 'consumable' },

  // ============================================
  // TESORO Y MONEDAS
  // ============================================
  'gold_coins': { name: 'Gold (50 coins)', nameEs: 'Oro (50 monedas)', weight: 1, category: 'treasure', stackable: true },
  'silver_coins': { name: 'Silver (50 coins)', nameEs: 'Plata (50 monedas)', weight: 1, category: 'treasure', stackable: true },
  'copper_coins': { name: 'Copper (50 coins)', nameEs: 'Cobre (50 monedas)', weight: 1, category: 'treasure', stackable: true },
  'gem': { name: 'Gem', nameEs: 'Gema', weight: 0, category: 'treasure' },

  // ============================================
  // PAQUETES DE EQUIPO
  // ============================================
  'explorers_pack': { name: "Explorer's Pack", nameEs: 'Pack de explorador', weight: 59, category: 'container', notes: 'Mochila, saco, raciones, odre, cuerda, etc.' },
  'dungeoneers_pack': { name: "Dungeoneer's Pack", nameEs: 'Pack de dungeonero', weight: 61.5, category: 'container' },
  'burglars_pack': { name: "Burglar's Pack", nameEs: 'Pack de ladrón', weight: 44.5, category: 'container' },
  'diplomats_pack': { name: "Diplomat's Pack", nameEs: 'Pack de diplomático', weight: 36, category: 'container' },
  'entertainers_pack': { name: "Entertainer's Pack", nameEs: 'Pack de artista', weight: 38, category: 'container' },
  'priests_pack': { name: "Priest's Pack", nameEs: 'Pack de sacerdote', weight: 24, category: 'container' },
  'scholars_pack': { name: "Scholar's Pack", nameEs: 'Pack de erudito', weight: 10, category: 'container' },

  // ============================================
  // INSTRUMENTOS MUSICALES
  // ============================================
  'bagpipes': { name: 'Bagpipes', nameEs: 'Gaita', weight: 6, category: 'tool' },
  'drum': { name: 'Drum', nameEs: 'Tambor', weight: 3, category: 'tool' },
  'dulcimer': { name: 'Dulcimer', nameEs: 'Dulcémele', weight: 10, category: 'tool' },
  'flute': { name: 'Flute', nameEs: 'Flauta', weight: 1, category: 'tool' },
  'horn': { name: 'Horn', nameEs: 'Cuerno', weight: 2, category: 'tool' },
  'lute': { name: 'Lute', nameEs: 'Laúd', weight: 2, category: 'tool' },
  'lyre': { name: 'Lyre', nameEs: 'Lira', weight: 2, category: 'tool' },
  'pan_flute': { name: 'Pan Flute', nameEs: 'Flauta de pan', weight: 2, category: 'tool' },
  'shawm': { name: 'Shawm', nameEs: 'Chirimía', weight: 1, category: 'tool' },
  'viol': { name: 'Viol', nameEs: 'Viola', weight: 1, category: 'tool' },
}

// ============================================
// TIPOS DE ENCUMBRANCE
// ============================================

export type EncumbranceLevel = 'normal' | 'encumbered' | 'heavily_encumbered' | 'over_capacity'

export interface EncumbranceStatus {
  currentWeight: number       // Peso actual en lb
  carryCapacity: number       // Capacidad máxima (STR × 15)
  encumberedThreshold: number // Umbral de cargado (STR × 5)
  heavyThreshold: number      // Umbral de muy cargado (STR × 10)
  level: EncumbranceLevel
  speedPenalty: number        // Penalización a la velocidad
  hasDisadvantage: boolean    // Desventaja en checks físicos
  percentFull: number         // Porcentaje de capacidad usada
}

// ============================================
// FUNCIONES DE CÁLCULO
// ============================================

/**
 * Calcula la capacidad de carga basada en STR
 */
export function calculateCarryCapacity(strength: number): {
  carryCapacity: number
  encumberedThreshold: number
  heavyThreshold: number
} {
  return {
    carryCapacity: strength * 15,        // Máximo
    encumberedThreshold: strength * 5,   // Empieza a estar cargado
    heavyThreshold: strength * 10,       // Muy cargado
  }
}

/**
 * Obtiene el peso de un item por su nombre
 * Busca en la base de datos y también intenta parsear cantidades
 */
export function getItemWeight(itemName: string): number {
  // Normalizar el nombre
  const normalizedName = itemName.toLowerCase().trim()

  // Buscar coincidencia directa en la DB
  const itemKey = Object.keys(ITEM_WEIGHTS).find(key => {
    const item = ITEM_WEIGHTS[key]
    return key === normalizedName ||
           item.name.toLowerCase() === normalizedName ||
           item.nameEs.toLowerCase() === normalizedName
  })

  if (itemKey) {
    return ITEM_WEIGHTS[itemKey].weight
  }

  // Intentar parsear cantidad (ej: "5 daggers", "3 torches")
  const quantityMatch = normalizedName.match(/^(\d+)\s*[x×]?\s*(.+)$/)
  if (quantityMatch) {
    const quantity = parseInt(quantityMatch[1])
    const baseItem = quantityMatch[2].trim()
    const baseWeight = getItemWeight(baseItem)
    return baseWeight * quantity
  }

  // Intentar buscar por coincidencia parcial
  const partialMatch = Object.keys(ITEM_WEIGHTS).find(key => {
    const item = ITEM_WEIGHTS[key]
    return normalizedName.includes(key) ||
           normalizedName.includes(item.name.toLowerCase()) ||
           normalizedName.includes(item.nameEs.toLowerCase())
  })

  if (partialMatch) {
    return ITEM_WEIGHTS[partialMatch].weight
  }

  // Peso por defecto para items desconocidos
  // Estimamos basado en categorías comunes
  if (normalizedName.includes('armor') || normalizedName.includes('armadura')) {
    return 20
  }
  if (normalizedName.includes('weapon') || normalizedName.includes('arma') ||
      normalizedName.includes('sword') || normalizedName.includes('espada')) {
    return 3
  }
  if (normalizedName.includes('potion') || normalizedName.includes('poción')) {
    return 0.5
  }
  if (normalizedName.includes('gold') || normalizedName.includes('oro') ||
      normalizedName.includes('moneda')) {
    return 0.02 // 50 monedas = 1 lb
  }

  // Peso genérico para items misceláneos
  return 1
}

/**
 * Calcula el peso total del inventario
 */
export function calculateInventoryWeight(inventory: string[]): number {
  return inventory.reduce((total, item) => {
    return total + getItemWeight(item)
  }, 0)
}

/**
 * Calcula el estado de carga completo
 */
export function calculateEncumbrance(
  inventory: string[],
  strength: number
): EncumbranceStatus {
  const currentWeight = calculateInventoryWeight(inventory)
  const { carryCapacity, encumberedThreshold, heavyThreshold } = calculateCarryCapacity(strength)

  let level: EncumbranceLevel = 'normal'
  let speedPenalty = 0
  let hasDisadvantage = false

  if (currentWeight > carryCapacity) {
    level = 'over_capacity'
    speedPenalty = -20
    hasDisadvantage = true
  } else if (currentWeight > heavyThreshold) {
    level = 'heavily_encumbered'
    speedPenalty = -20
    hasDisadvantage = true
  } else if (currentWeight > encumberedThreshold) {
    level = 'encumbered'
    speedPenalty = -10
    hasDisadvantage = false
  }

  return {
    currentWeight: Math.round(currentWeight * 10) / 10, // Redondear a 1 decimal
    carryCapacity,
    encumberedThreshold,
    heavyThreshold,
    level,
    speedPenalty,
    hasDisadvantage,
    percentFull: Math.round((currentWeight / carryCapacity) * 100)
  }
}

/**
 * Formatea el peso para mostrar
 */
export function formatWeight(weight: number): string {
  if (weight === 0) return '-'
  if (weight < 1) return `${Math.round(weight * 16)} oz`
  return `${Math.round(weight * 10) / 10} lb`
}

/**
 * Obtiene el color de UI según el nivel de carga
 */
export function getEncumbranceColor(level: EncumbranceLevel): string {
  switch (level) {
    case 'normal':
      return 'text-emerald-400'
    case 'encumbered':
      return 'text-yellow-400'
    case 'heavily_encumbered':
      return 'text-orange-400'
    case 'over_capacity':
      return 'text-red-500'
  }
}

/**
 * Obtiene el mensaje de estado según el nivel de carga
 */
export function getEncumbranceMessage(level: EncumbranceLevel): string {
  switch (level) {
    case 'normal':
      return 'Carga normal'
    case 'encumbered':
      return 'Cargado (-10 pies velocidad)'
    case 'heavily_encumbered':
      return 'Muy cargado (-20 pies, desventaja)'
    case 'over_capacity':
      return '¡Sobrecargado! No puedes moverte'
  }
}

/**
 * Obtiene información detallada de un item
 */
export function getItemInfo(itemName: string): ItemWeight | null {
  const normalizedName = itemName.toLowerCase().trim()

  const itemKey = Object.keys(ITEM_WEIGHTS).find(key => {
    const item = ITEM_WEIGHTS[key]
    return key === normalizedName ||
           item.name.toLowerCase() === normalizedName ||
           item.nameEs.toLowerCase() === normalizedName ||
           normalizedName.includes(key)
  })

  return itemKey ? ITEM_WEIGHTS[itemKey] : null
}

/**
 * Verifica si se puede añadir un item sin exceder la capacidad
 */
export function canAddItem(
  currentInventory: string[],
  newItem: string,
  strength: number
): { canAdd: boolean; newStatus: EncumbranceStatus } {
  const newInventory = [...currentInventory, newItem]
  const newStatus = calculateEncumbrance(newInventory, strength)

  return {
    canAdd: newStatus.level !== 'over_capacity',
    newStatus
  }
}
