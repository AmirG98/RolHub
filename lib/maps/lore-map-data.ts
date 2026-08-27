// Datos de mapa con coordenadas para cada lore
// Las coordenadas están diseñadas para crear mapas atractivos y temáticos

import { type Lore, type MapLocation } from './map-config'

// Tipo para locaciones del JSON de lore
interface LoreLocation {
  name: string
  description: string
  type: string
  danger_level: number
  detailed_description?: string
}

// Coordenadas predefinidas para LOTR (estilo mapa de fantasía clásica)
const LOTR_COORDINATES: Record<string, { x: number; y: number; connections: string[] }> = {
  'La Vega Mansa': { x: 150, y: 200, connections: ['Vado Viejo', 'Aelinar'] },
  'Aelinar': { x: 350, y: 180, connections: ['La Vega Mansa', 'Las Montañas Veladas', 'Aurelion'] },
  'Aurelion': { x: 450, y: 280, connections: ['Aelinar', 'Raizvieja', 'Profundia'] },
  'Profundia': { x: 380, y: 260, connections: ['Aurelion', 'Las Montañas Veladas'] },
  'Las Montañas Veladas': { x: 400, y: 200, connections: ['Aelinar', 'Profundia', 'Raizvieja'] },
  'Raizvieja': { x: 500, y: 320, connections: ['Aurelion', 'Torregrís', 'Estepia'] },
  'Estepia': { x: 520, y: 400, connections: ['Raizvieja', 'Meridonia', 'Torregrís'] },
  'Meridonia': { x: 600, y: 450, connections: ['Estepia', 'Cenizar'] },
  'Cenizar': { x: 700, y: 380, connections: ['Meridonia'] },
  'Torregrís': { x: 450, y: 360, connections: ['Raizvieja', 'Estepia'] },
  'Vado Viejo': { x: 220, y: 200, connections: ['La Vega Mansa', 'Aelinar'] },
}

// Coordenadas para ZOMBIES (ciudad post-apocalíptica)
const ZOMBIES_COORDINATES: Record<string, { x: number; y: number; connections: string[] }> = {
  'Centro Comercial Abandonado': { x: 400, y: 200, connections: ['Campamento Base', 'Hospital General'] },
  'Campamento Base': { x: 200, y: 300, connections: ['Centro Comercial Abandonado', 'Estación de Policía'] },
  'Hospital General': { x: 550, y: 180, connections: ['Centro Comercial Abandonado', 'Zona Residencial'] },
  'Estación de Policía': { x: 150, y: 400, connections: ['Campamento Base', 'Almacén Industrial'] },
  'Zona Residencial': { x: 600, y: 300, connections: ['Hospital General', 'La Horda'] },
  'Almacén Industrial': { x: 300, y: 480, connections: ['Estación de Policía', 'Puerto'] },
  'Puerto': { x: 500, y: 500, connections: ['Almacén Industrial', 'Zona Segura'] },
  'Zona Segura': { x: 100, y: 150, connections: ['Campamento Base'] },
  'La Horda': { x: 700, y: 350, connections: ['Zona Residencial'] },
}

// Coordenadas para ISEKAI (mundo fantasy JRPG)
const ISEKAI_COORDINATES: Record<string, { x: number; y: number; connections: string[] }> = {
  'Ciudad Capital': { x: 400, y: 300, connections: ['Bosque Inicial', 'Gremio de Aventureros', 'Torre del Mago'] },
  'Bosque Inicial': { x: 200, y: 200, connections: ['Ciudad Capital', 'Cueva de Slimes'] },
  'Cueva de Slimes': { x: 100, y: 300, connections: ['Bosque Inicial'] },
  'Gremio de Aventureros': { x: 450, y: 350, connections: ['Ciudad Capital', 'Dungeon del Dragón'] },
  'Torre del Mago': { x: 550, y: 200, connections: ['Ciudad Capital', 'Biblioteca Arcana'] },
  'Biblioteca Arcana': { x: 650, y: 150, connections: ['Torre del Mago'] },
  'Dungeon del Dragón': { x: 600, y: 450, connections: ['Gremio de Aventureros', 'Montaña del Rey Demonio'] },
  'Montaña del Rey Demonio': { x: 700, y: 350, connections: ['Dungeon del Dragón'] },
  'Aldea de Inicio': { x: 150, y: 400, connections: ['Bosque Inicial', 'Ciudad Capital'] },
}

// Coordenadas para VIKINGOS (mapa marítimo)
const VIKINGOS_COORDINATES: Record<string, { x: number; y: number; connections: string[] }> = {
  'Aldea de Inicio': { x: 400, y: 300, connections: ['Puerto Principal', 'Bosque Sagrado'] },
  'Puerto Principal': { x: 300, y: 200, connections: ['Aldea de Inicio', 'Islas del Este', 'Costa Sajona'] },
  'Islas del Este': { x: 550, y: 150, connections: ['Puerto Principal', 'Tierra de los Gigantes'] },
  'Costa Sajona': { x: 200, y: 350, connections: ['Puerto Principal', 'Monasterio'] },
  'Monasterio': { x: 100, y: 450, connections: ['Costa Sajona'] },
  'Bosque Sagrado': { x: 500, y: 350, connections: ['Aldea de Inicio', 'Templo de Odín'] },
  'Templo de Odín': { x: 600, y: 400, connections: ['Bosque Sagrado', 'Yggdrasil'] },
  'Yggdrasil': { x: 700, y: 300, connections: ['Templo de Odín'] },
  'Tierra de los Gigantes': { x: 650, y: 100, connections: ['Islas del Este'] },
}

// Coordenadas para STAR_WARS (mapa galáctico)
const STAR_WARS_COORDINATES: Record<string, { x: number; y: number; connections: string[] }> = {
  'Nexus Prime': { x: 400, y: 300, connections: ['Veridia', 'Caelora', 'Ruta Comercial Corelliana'] },
  'Karshaar': { x: 150, y: 200, connections: ['Puerto Zenna', 'Ruta Comercial Corelliana'] },
  'Puerto Zenna': { x: 100, y: 250, connections: ['Karshaar'] },
  'Veridia': { x: 350, y: 450, connections: ['Nexus Prime', 'Rannak'] },
  'Caelora': { x: 500, y: 200, connections: ['Nexus Prime', 'Veyra IV'] },
  'Veyra IV': { x: 650, y: 150, connections: ['Caelora', 'Sylphar'] },
  'Sylphar': { x: 700, y: 300, connections: ['Veyra IV', 'Estación Eclipse'] },
  'Estación Eclipse': { x: 600, y: 400, connections: ['Sylphar', 'Sistema Imperial'] },
  'Sistema Imperial': { x: 550, y: 350, connections: ['Nexus Prime', 'Estación Eclipse'] },
  'Rannak': { x: 250, y: 500, connections: ['Veridia'] },
  'Ruta Comercial Corelliana': { x: 300, y: 250, connections: ['Nexus Prime', 'Karshaar'] },
}

// Coordenadas para CYBERPUNK (ciudad vertical)
const CYBERPUNK_COORDINATES: Record<string, { x: number; y: number; connections: string[] }> = {
  'Downtown': { x: 400, y: 300, connections: ['Distrito Corpo', 'Mercado Negro', 'Suburbios'] },
  'Distrito Corpo': { x: 500, y: 150, connections: ['Downtown', 'Torre Kurotek'] },
  'Torre Kurotek': { x: 600, y: 100, connections: ['Distrito Corpo'] },
  'Mercado Negro': { x: 250, y: 350, connections: ['Downtown', 'Submundo'] },
  'Submundo': { x: 150, y: 450, connections: ['Mercado Negro', 'Alcantarillas'] },
  'Alcantarillas': { x: 200, y: 550, connections: ['Submundo'] },
  'Suburbios': { x: 550, y: 400, connections: ['Downtown', 'Zona Industrial'] },
  'Zona Industrial': { x: 650, y: 350, connections: ['Suburbios', 'Vertedero'] },
  'Vertedero': { x: 700, y: 450, connections: ['Zona Industrial'] },
  'Ripperdoc': { x: 350, y: 400, connections: ['Downtown', 'Mercado Negro'] },
  'Club Limbo': { x: 300, y: 250, connections: ['Downtown'] },
}

// Coordenadas para LOVECRAFT_HORROR (mapa de investigación)
const LOVECRAFT_HORROR_COORDINATES: Record<string, { x: number; y: number; connections: string[] }> = {
  'Arkham': { x: 400, y: 300, connections: ['Universidad Miskatonic', 'Barrio Mercante', 'Cementerio'] },
  'Universidad Miskatonic': { x: 450, y: 200, connections: ['Arkham', 'Biblioteca Orne'] },
  'Biblioteca Orne': { x: 550, y: 150, connections: ['Universidad Miskatonic'] },
  'Barrio Mercante': { x: 300, y: 350, connections: ['Arkham', 'Puerto'] },
  'Puerto': { x: 200, y: 450, connections: ['Barrio Mercante', 'Innsmouth'] },
  'Innsmouth': { x: 100, y: 400, connections: ['Puerto'] },
  'Cementerio': { x: 500, y: 350, connections: ['Arkham', 'Cripta Antigua'] },
  'Cripta Antigua': { x: 600, y: 400, connections: ['Cementerio', 'Templo Sumergido'] },
  'Templo Sumergido': { x: 700, y: 350, connections: ['Cripta Antigua'] },
  'Manicomio': { x: 350, y: 450, connections: ['Arkham'] },
}

// Coordenadas para DND_CLASSIC (Costa del Alba, Valdrun)
const DND_CLASSIC_COORDINATES: Record<string, { x: number; y: number; connections: string[] }> = {
  'Puerto Corona': { x: 400, y: 300, connections: ['Bajomonte', 'Puerta de Ámbar', 'Brasaeterna', 'Vadolar'] },
  'Bajomonte': { x: 420, y: 350, connections: ['Puerto Corona'] },
  'Puerta de Ámbar': { x: 200, y: 450, connections: ['Puerto Corona', 'Ciriotorre', 'Vadolar'] },
  'Brasaeterna': { x: 350, y: 150, connections: ['Puerto Corona', 'Bosque de Brasaeterna', 'Valle Ventisca'] },
  'Bosque de Brasaeterna': { x: 450, y: 100, connections: ['Brasaeterna'] },
  'Valle Ventisca': { x: 500, y: 50, connections: ['Brasaeterna'] },
  'Vadolar': { x: 300, y: 350, connections: ['Puerto Corona', 'Puerta de Ámbar'] },
  'Ciriotorre': { x: 100, y: 500, connections: ['Puerta de Ámbar'] },
}

// Coordenadas para COZY_WITCH (Cala Quieta)
const COZY_WITCH_COORDINATES: Record<string, { x: number; y: number; connections: string[] }> = {
  'La Casa de la Bruja': { x: 350, y: 280, connections: ['Plaza del Mercado', 'El Bosque Susurrante', 'Cala Quieta'] },
  'Plaza del Mercado': { x: 450, y: 350, connections: ['La Casa de la Bruja', 'La Panadería del Alba', 'Cala Quieta'] },
  'La Panadería del Alba': { x: 500, y: 320, connections: ['Plaza del Mercado', 'La Casa de la Bruja', 'Cala Quieta'] },
  'El Bosque Susurrante': { x: 220, y: 200, connections: ['La Casa de la Bruja', 'El Círculo de Piedras del Eclipse'] },
  'El Faro Viejo': { x: 600, y: 450, connections: ['Cala Quieta', 'El Círculo de Piedras del Eclipse', 'La Casa de la Bruja'] },
  'Cala Quieta': { x: 500, y: 480, connections: ['La Casa de la Bruja', 'El Faro Viejo', 'Plaza del Mercado'] },
  'El Círculo de Piedras del Eclipse': { x: 520, y: 120, connections: ['El Faro Viejo', 'El Bosque Susurrante'] },
}

// Coordenadas para ROMANTASY (Cortes feéricas de Lucerna)
const ROMANTASY_COORDINATES: Record<string, { x: number; y: number; connections: string[] }> = {
  'Corte de Primavera': { x: 300, y: 250, connections: ['Bosque de Espinas', 'Aldea Mortal de Sylvaria', 'Lucerna (Ciudad de las Mil Luces)'] },
  'Lucerna (Ciudad de las Mil Luces)': { x: 500, y: 200, connections: ['Corte de Primavera', 'Bosque de Espinas', 'Corte de Invierno'] },
  'Bosque de Espinas': { x: 400, y: 350, connections: ['Corte de Primavera', 'Lucerna (Ciudad de las Mil Luces)', 'Cuevas del Pacto', 'El Muro'] },
  'El Muro': { x: 250, y: 450, connections: ['Bosque de Espinas', 'Aldea Mortal de Sylvaria', 'Cuevas del Pacto'] },
  'Aldea Mortal de Sylvaria': { x: 150, y: 400, connections: ['Corte de Primavera', 'El Muro'] },
  'Corte de Invierno': { x: 650, y: 100, connections: ['Lucerna (Ciudad de las Mil Luces)'] },
  'Cuevas del Pacto': { x: 500, y: 500, connections: ['Bosque de Espinas', 'El Muro'] },
}

// Coordenadas para CUSTOM (genérico)
const CUSTOM_COORDINATES: Record<string, { x: number; y: number; connections: string[] }> = {
  'Ciudad Principal': { x: 400, y: 300, connections: ['Bosque', 'Montaña', 'Puerto'] },
  'Bosque': { x: 250, y: 200, connections: ['Ciudad Principal', 'Ruinas'] },
  'Montaña': { x: 550, y: 150, connections: ['Ciudad Principal', 'Cueva'] },
  'Puerto': { x: 300, y: 450, connections: ['Ciudad Principal'] },
  'Ruinas': { x: 150, y: 100, connections: ['Bosque'] },
  'Cueva': { x: 650, y: 250, connections: ['Montaña'] },
}

// Mapa de coordenadas por lore
const LORE_COORDINATES: Record<string, Record<string, { x: number; y: number; connections: string[] }>> = {
  LOTR: LOTR_COORDINATES,
  ZOMBIES: ZOMBIES_COORDINATES,
  ISEKAI: ISEKAI_COORDINATES,
  VIKINGOS: VIKINGOS_COORDINATES,
  STAR_WARS: STAR_WARS_COORDINATES,
  CYBERPUNK: CYBERPUNK_COORDINATES,
  LOVECRAFT_HORROR: LOVECRAFT_HORROR_COORDINATES,
  DND_CLASSIC: DND_CLASSIC_COORDINATES,
  ROMANTASY: ROMANTASY_COORDINATES,
  COZY_WITCH: COZY_WITCH_COORDINATES,
  CUSTOM: CUSTOM_COORDINATES,
}

// Mapear tipo de locación a tipo de MapLocation
function mapLocationType(type: string): MapLocation['type'] {
  const typeMap: Record<string, MapLocation['type']> = {
    'asentamiento': 'city',
    'ciudad': 'city',
    'refugio': 'safe',
    'mina': 'dungeon',
    'bosque': 'wilderness',
    'montaña': 'wilderness',
    'fortaleza': 'danger',
    'torre': 'landmark',
    'ruinas': 'dungeon',
    'planeta': 'city',
    'estación': 'landmark',
    'nave': 'landmark',
    'distrito': 'city',
    'mercado': 'safe',
    'club': 'safe',
    'mazmorra': 'dungeon',
    'biblioteca': 'landmark',
    'templo': 'mystery',
    'cementerio': 'danger',
    'manicomio': 'danger',
    'puerto': 'city',
    // Fallbacks
    'default': 'landmark',
  }

  const normalizedType = type.toLowerCase()
  return typeMap[normalizedType] || typeMap['default']
}

// Función para generar MapLocations a partir de datos del lore
export function generateMapLocations(
  lore: Lore,
  loreLocations: LoreLocation[],
  discoveredIds: string[] = [],
  visitedIds: string[] = []
): MapLocation[] {
  const coordinates = LORE_COORDINATES[lore] || {}

  return loreLocations.map((loc, index) => {
    const coordData = coordinates[loc.name] || generateFallbackCoordinates(index, loreLocations.length)

    // Generar ID desde el nombre
    const id = loc.name.toLowerCase().replace(/\s+/g, '-').replace(/[áéíóú]/g, c => {
      const map: Record<string, string> = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' }
      return map[c] || c
    })

    return {
      id,
      name: loc.name,
      description: loc.description,
      type: mapLocationType(loc.type),
      dangerLevel: loc.danger_level,
      coordinates: { x: coordData.x, y: coordData.y },
      connections: coordData.connections.map(name =>
        name.toLowerCase().replace(/\s+/g, '-').replace(/[áéíóú]/g, c => {
          const map: Record<string, string> = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' }
          return map[c] || c
        })
      ),
      icon: '',
      discovered: discoveredIds.length === 0 || discoveredIds.includes(id),
      visited: visitedIds.includes(id),
    }
  })
}

// Coordenadas de fallback en espiral
function generateFallbackCoordinates(index: number, total: number): { x: number; y: number; connections: string[] } {
  const angle = (index / total) * Math.PI * 2
  const radius = 150 + (index % 3) * 80
  return {
    x: 400 + Math.cos(angle) * radius,
    y: 300 + Math.sin(angle) * radius,
    connections: [],
  }
}

// Datos de mapa de ejemplo para cada lore (para usar cuando no hay datos de campaña)
export function getExampleMapData(lore: Lore): MapLocation[] {
  const exampleData: Record<string, MapLocation[]> = {
    LOTR: [
      { id: 'comarca', name: 'La Vega Mansa', description: 'Tierra pacífica de los medianos', type: 'safe', dangerLevel: 1, coordinates: { x: 150, y: 200 }, connections: ['bree', 'rivendel'], icon: '', discovered: true, visited: true },
      { id: 'bree', name: 'Vado Viejo', description: 'Cruce de caminos con la Posada del Jabalí Dorado', type: 'city', dangerLevel: 2, coordinates: { x: 220, y: 200 }, connections: ['comarca', 'rivendel'], icon: '', discovered: true, visited: false },
      { id: 'rivendel', name: 'Aelinar', description: 'Refugio élfico de Elandur', type: 'safe', dangerLevel: 1, coordinates: { x: 350, y: 180 }, connections: ['comarca', 'moria', 'lothlorien'], icon: '', discovered: true, visited: false },
      { id: 'moria', name: 'Profundia', description: 'Antiguo reino enano bajo las montañas', type: 'dungeon', dangerLevel: 5, coordinates: { x: 380, y: 260 }, connections: ['rivendel', 'lothlorien'], icon: '', discovered: false, visited: false },
      { id: 'lothlorien', name: 'Aurelion', description: 'Bosque dorado de los elfos de Ithariel', type: 'safe', dangerLevel: 1, coordinates: { x: 450, y: 280 }, connections: ['rivendel', 'moria', 'rohan'], icon: '', discovered: false, visited: false },
      { id: 'rohan', name: 'Estepia', description: 'Tierra de los señores de los caballos', type: 'city', dangerLevel: 3, coordinates: { x: 520, y: 400 }, connections: ['lothlorien', 'gondor', 'isengard'], icon: '', discovered: false, visited: false },
      { id: 'gondor', name: 'Meridonia', description: 'El reino de los hombres', type: 'city', dangerLevel: 4, coordinates: { x: 600, y: 450 }, connections: ['rohan', 'mordor'], icon: '', discovered: false, visited: false },
      { id: 'mordor', name: 'Cenizar', description: 'Tierra negra del enemigo', type: 'danger', dangerLevel: 5, coordinates: { x: 700, y: 380 }, connections: ['gondor'], icon: '', discovered: false, visited: false },
      { id: 'isengard', name: 'Torregrís', description: 'Torre de Velmoran', type: 'danger', dangerLevel: 4, coordinates: { x: 450, y: 360 }, connections: ['rohan'], icon: '', discovered: false, visited: false },
    ],
    ZOMBIES: [
      { id: 'campamento-base', name: 'Campamento Base', description: 'Tu refugio seguro... por ahora', type: 'safe', dangerLevel: 1, coordinates: { x: 200, y: 300 }, connections: ['centro-comercial', 'estacion-policia'], icon: '', discovered: true, visited: true },
      { id: 'centro-comercial', name: 'Centro Comercial', description: 'Infestado pero lleno de suministros', type: 'dungeon', dangerLevel: 4, coordinates: { x: 400, y: 200 }, connections: ['campamento-base', 'hospital'], icon: '', discovered: true, visited: false },
      { id: 'hospital', name: 'Hospital General', description: 'Medicinas... y horrores', type: 'danger', dangerLevel: 5, coordinates: { x: 550, y: 180 }, connections: ['centro-comercial', 'zona-residencial'], icon: '', discovered: false, visited: false },
      { id: 'estacion-policia', name: 'Estación de Policía', description: 'Armas y munición esperan dentro', type: 'dungeon', dangerLevel: 3, coordinates: { x: 150, y: 400 }, connections: ['campamento-base', 'almacen'], icon: '', discovered: true, visited: false },
      { id: 'zona-residencial', name: 'Zona Residencial', description: 'Casas vacías... o no tan vacías', type: 'wilderness', dangerLevel: 3, coordinates: { x: 600, y: 300 }, connections: ['hospital', 'la-horda'], icon: '', discovered: false, visited: false },
      { id: 'la-horda', name: 'La Horda', description: 'Concentración masiva de infectados', type: 'danger', dangerLevel: 5, coordinates: { x: 700, y: 350 }, connections: ['zona-residencial'], icon: '', discovered: false, visited: false },
      { id: 'almacen', name: 'Almacén Industrial', description: 'Suministros escondidos', type: 'landmark', dangerLevel: 2, coordinates: { x: 300, y: 480 }, connections: ['estacion-policia', 'puerto'], icon: '', discovered: false, visited: false },
      { id: 'puerto', name: 'Puerto', description: 'Posible ruta de escape', type: 'mystery', dangerLevel: 3, coordinates: { x: 500, y: 500 }, connections: ['almacen'], icon: '', discovered: false, visited: false },
    ],
    ISEKAI: [
      { id: 'aldea-inicio', name: 'Aldea de Inicio', description: 'Donde comenzó tu aventura', type: 'safe', dangerLevel: 1, coordinates: { x: 150, y: 400 }, connections: ['bosque-inicial', 'ciudad-capital'], icon: '', discovered: true, visited: true },
      { id: 'bosque-inicial', name: 'Bosque Inicial', description: 'Nivel F - Perfecto para principiantes', type: 'wilderness', dangerLevel: 1, coordinates: { x: 200, y: 200 }, connections: ['aldea-inicio', 'cueva-slimes'], icon: '', discovered: true, visited: true },
      { id: 'cueva-slimes', name: 'Cueva de Slimes', description: 'Nivel F - Tu primer dungeon', type: 'dungeon', dangerLevel: 1, coordinates: { x: 100, y: 300 }, connections: ['bosque-inicial'], icon: '', discovered: true, visited: false },
      { id: 'ciudad-capital', name: 'Ciudad Capital', description: 'Centro del reino con el Gremio', type: 'city', dangerLevel: 1, coordinates: { x: 400, y: 300 }, connections: ['aldea-inicio', 'gremio', 'torre-mago'], icon: '', discovered: true, visited: false },
      { id: 'gremio', name: 'Gremio de Aventureros', description: 'Misiones y recompensas te esperan', type: 'safe', dangerLevel: 1, coordinates: { x: 450, y: 350 }, connections: ['ciudad-capital', 'dungeon-dragon'], icon: '', discovered: true, visited: false },
      { id: 'torre-mago', name: 'Torre del Mago', description: 'Nivel B - Magia y misterios', type: 'landmark', dangerLevel: 3, coordinates: { x: 550, y: 200 }, connections: ['ciudad-capital', 'biblioteca'], icon: '', discovered: false, visited: false },
      { id: 'biblioteca', name: 'Biblioteca Arcana', description: 'Nivel A - Conocimiento prohibido', type: 'mystery', dangerLevel: 4, coordinates: { x: 650, y: 150 }, connections: ['torre-mago'], icon: '', discovered: false, visited: false },
      { id: 'dungeon-dragon', name: 'Dungeon del Dragón', description: 'Nivel S - Solo los más fuertes', type: 'dungeon', dangerLevel: 5, coordinates: { x: 600, y: 450 }, connections: ['gremio', 'rey-demonio'], icon: '', discovered: false, visited: false },
      { id: 'rey-demonio', name: 'Castillo del Rey Demonio', description: 'Nivel SSS - El jefe final', type: 'danger', dangerLevel: 5, coordinates: { x: 700, y: 350 }, connections: ['dungeon-dragon'], icon: '', discovered: false, visited: false },
    ],
    VIKINGOS: [
      { id: 'aldea', name: 'Tu Aldea', description: 'Hogar de tu clan vikingo', type: 'safe', dangerLevel: 1, coordinates: { x: 400, y: 300 }, connections: ['puerto', 'bosque-sagrado'], icon: '', discovered: true, visited: true },
      { id: 'puerto', name: 'Puerto del Norte', description: 'Donde esperan los drakkars', type: 'city', dangerLevel: 1, coordinates: { x: 300, y: 200 }, connections: ['aldea', 'islas-este', 'costa-sajona'], icon: '', discovered: true, visited: true },
      { id: 'islas-este', name: 'Islas del Este', description: 'Territorios por conquistar', type: 'wilderness', dangerLevel: 3, coordinates: { x: 550, y: 150 }, connections: ['puerto', 'jotunheim'], icon: '', discovered: true, visited: false },
      { id: 'costa-sajona', name: 'Costa Sajona', description: 'Tierras ricas para saquear', type: 'danger', dangerLevel: 3, coordinates: { x: 200, y: 350 }, connections: ['puerto', 'monasterio'], icon: '', discovered: true, visited: false },
      { id: 'monasterio', name: 'Monasterio de Lindisfarne', description: 'Oro y reliquias esperan', type: 'dungeon', dangerLevel: 4, coordinates: { x: 100, y: 450 }, connections: ['costa-sajona'], icon: '', discovered: false, visited: false },
      { id: 'bosque-sagrado', name: 'Bosque Sagrado', description: 'Lugar de los rituales antiguos', type: 'mystery', dangerLevel: 2, coordinates: { x: 500, y: 350 }, connections: ['aldea', 'templo-odin'], icon: '', discovered: true, visited: false },
      { id: 'templo-odin', name: 'Templo de Odín', description: 'El Padre de Todos te observa', type: 'landmark', dangerLevel: 3, coordinates: { x: 600, y: 400 }, connections: ['bosque-sagrado', 'yggdrasil'], icon: '', discovered: false, visited: false },
      { id: 'yggdrasil', name: 'Yggdrasil', description: 'El Árbol del Mundo', type: 'mystery', dangerLevel: 5, coordinates: { x: 700, y: 300 }, connections: ['templo-odin'], icon: '', discovered: false, visited: false },
      { id: 'jotunheim', name: 'Jötunheim', description: 'Tierra de los gigantes de hielo', type: 'danger', dangerLevel: 5, coordinates: { x: 650, y: 100 }, connections: ['islas-este'], icon: '', discovered: false, visited: false },
    ],
    STAR_WARS: [
      { id: 'tatooine', name: 'Karshaar', description: 'Planeta desértico del Borde Exterior', type: 'city', dangerLevel: 2, coordinates: { x: 150, y: 200 }, connections: ['mos-eisley', 'coruscant'], icon: '', discovered: true, visited: true },
      { id: 'mos-eisley', name: 'Puerto Zenna', description: 'Nido de contrabandistas y tratos turbios', type: 'safe', dangerLevel: 2, coordinates: { x: 100, y: 250 }, connections: ['tatooine'], icon: '', discovered: true, visited: true },
      { id: 'coruscant', name: 'Nexus Prime', description: 'Capital de la Galaxia', type: 'city', dangerLevel: 3, coordinates: { x: 400, y: 300 }, connections: ['tatooine', 'naboo', 'alderaan'], icon: '', discovered: true, visited: false },
      { id: 'naboo', name: 'Veridia', description: 'Mundo pacífico de praderas y ciudades', type: 'safe', dangerLevel: 1, coordinates: { x: 350, y: 450 }, connections: ['coruscant', 'kashyyyk'], icon: '', discovered: false, visited: false },
      { id: 'alderaan', name: 'Caelora', description: 'Mundo pacífico... por ahora', type: 'safe', dangerLevel: 1, coordinates: { x: 500, y: 200 }, connections: ['coruscant', 'yavin'], icon: '', discovered: false, visited: false },
      { id: 'yavin', name: 'Veyra IV', description: 'Luna selvática, base rebelde secreta', type: 'mystery', dangerLevel: 3, coordinates: { x: 650, y: 150 }, connections: ['alderaan', 'endor'], icon: '', discovered: false, visited: false },
      { id: 'endor', name: 'Sylphar', description: 'Luna boscosa de las tribus nativas', type: 'wilderness', dangerLevel: 2, coordinates: { x: 700, y: 300 }, connections: ['yavin', 'death-star'], icon: '', discovered: false, visited: false },
      { id: 'death-star', name: 'Estación Eclipse', description: 'Estación de batalla Imperial', type: 'danger', dangerLevel: 5, coordinates: { x: 600, y: 400 }, connections: ['endor'], icon: '', discovered: false, visited: false },
      { id: 'kashyyyk', name: 'Rannak', description: 'Mundo natal de los Ranakkis', type: 'wilderness', dangerLevel: 2, coordinates: { x: 250, y: 500 }, connections: ['naboo'], icon: '', discovered: false, visited: false },
    ],
    CYBERPUNK: [
      { id: 'tu-apartamento', name: 'Tu Apartamento', description: 'Un cubículo de 20m² que llamas hogar', type: 'safe', dangerLevel: 1, coordinates: { x: 350, y: 350 }, connections: ['downtown', 'afterlife'], icon: '', discovered: true, visited: true },
      { id: 'downtown', name: 'Downtown', description: 'El corazón de Neon City', type: 'city', dangerLevel: 3, coordinates: { x: 400, y: 300 }, connections: ['tu-apartamento', 'distrito-corpo', 'mercado-negro'], icon: '', discovered: true, visited: true },
      { id: 'afterlife', name: 'Club Limbo', description: 'Donde los mejores mercenarios hacen tratos', type: 'safe', dangerLevel: 2, coordinates: { x: 300, y: 250 }, connections: ['tu-apartamento', 'downtown'], icon: '', discovered: true, visited: false },
      { id: 'distrito-corpo', name: 'Distrito Corporativo', description: 'Torres de cristal y poder absoluto', type: 'city', dangerLevel: 4, coordinates: { x: 500, y: 150 }, connections: ['downtown', 'arasaka'], icon: '', discovered: true, visited: false },
      { id: 'arasaka', name: 'Torre Kurotek', description: 'El corazón del poder corporativo', type: 'danger', dangerLevel: 5, coordinates: { x: 600, y: 100 }, connections: ['distrito-corpo'], icon: '', discovered: false, visited: false },
      { id: 'mercado-negro', name: 'Mercado Negro', description: 'Todo tiene un precio aquí', type: 'landmark', dangerLevel: 3, coordinates: { x: 250, y: 350 }, connections: ['downtown', 'submundo'], icon: '', discovered: true, visited: false },
      { id: 'submundo', name: 'Submundo', description: 'Donde vive la escoria de Neon City', type: 'danger', dangerLevel: 4, coordinates: { x: 150, y: 450 }, connections: ['mercado-negro', 'alcantarillas'], icon: '', discovered: false, visited: false },
      { id: 'alcantarillas', name: 'Alcantarillas', description: 'Hogar de cyberpsicópatas y peor', type: 'dungeon', dangerLevel: 5, coordinates: { x: 200, y: 550 }, connections: ['submundo'], icon: '', discovered: false, visited: false },
      { id: 'ripperdoc', name: 'Clínica del Ripperdoc', description: 'Mejoras cromadas, sin preguntas', type: 'safe', dangerLevel: 2, coordinates: { x: 350, y: 400 }, connections: ['downtown'], icon: '', discovered: true, visited: false },
      { id: 'vertedero', name: 'El Vertedero', description: 'Chatarra tech y secretos enterrados', type: 'mystery', dangerLevel: 3, coordinates: { x: 700, y: 450 }, connections: ['zona-industrial'], icon: '', discovered: false, visited: false },
      { id: 'zona-industrial', name: 'Zona Industrial', description: 'Fábricas abandonadas y pandillas', type: 'wilderness', dangerLevel: 3, coordinates: { x: 650, y: 350 }, connections: ['downtown', 'vertedero'], icon: '', discovered: false, visited: false },
    ],
    LOVECRAFT_HORROR: [
      { id: 'tu-oficina', name: 'Tu Oficina', description: 'Investigador privado en tiempos oscuros', type: 'safe', dangerLevel: 1, coordinates: { x: 350, y: 350 }, connections: ['arkham', 'biblioteca'], icon: '', discovered: true, visited: true },
      { id: 'arkham', name: 'Arkham', description: 'Una ciudad con demasiados secretos', type: 'city', dangerLevel: 2, coordinates: { x: 400, y: 300 }, connections: ['tu-oficina', 'universidad', 'cementerio'], icon: '', discovered: true, visited: true },
      { id: 'universidad', name: 'Universidad Miskatonic', description: 'Conocimiento que mejor no saber', type: 'landmark', dangerLevel: 2, coordinates: { x: 450, y: 200 }, connections: ['arkham', 'biblioteca'], icon: '', discovered: true, visited: false },
      { id: 'biblioteca', name: 'Biblioteca Orne', description: 'El Necronomicón espera...', type: 'mystery', dangerLevel: 4, coordinates: { x: 550, y: 150 }, connections: ['universidad', 'tu-oficina'], icon: '', discovered: true, visited: false },
      { id: 'cementerio', name: 'Cementerio de Arkham', description: 'Los muertos no siempre descansan', type: 'danger', dangerLevel: 3, coordinates: { x: 500, y: 350 }, connections: ['arkham', 'cripta'], icon: '', discovered: true, visited: false },
      { id: 'cripta', name: 'Cripta Antigua', description: 'Símbolos que no deberían existir', type: 'dungeon', dangerLevel: 4, coordinates: { x: 600, y: 400 }, connections: ['cementerio', 'templo'], icon: '', discovered: false, visited: false },
      { id: 'puerto', name: 'Puerto de Arkham', description: 'Llegadas de tierras extrañas', type: 'city', dangerLevel: 2, coordinates: { x: 200, y: 450 }, connections: ['arkham', 'innsmouth'], icon: '', discovered: true, visited: false },
      { id: 'innsmouth', name: 'Innsmouth', description: 'La gente aquí... no parece normal', type: 'danger', dangerLevel: 4, coordinates: { x: 100, y: 400 }, connections: ['puerto'], icon: '', discovered: false, visited: false },
      { id: 'manicomio', name: 'Manicomio de Arkham', description: '¿Están locos... o han visto demasiado?', type: 'mystery', dangerLevel: 3, coordinates: { x: 350, y: 450 }, connections: ['arkham'], icon: '', discovered: true, visited: false },
      { id: 'templo', name: 'Templo Sumergido', description: 'Ph\'nglui mglw\'nafh...', type: 'danger', dangerLevel: 5, coordinates: { x: 700, y: 350 }, connections: ['cripta'], icon: '', discovered: false, visited: false },
    ],
    DND_CLASSIC: [
      { id: 'waterdeep', name: 'Puerto Corona', description: 'La Ciudad de los Esplendores, puerto y metrópolis', type: 'city', dangerLevel: 2, coordinates: { x: 400, y: 300 }, connections: ['undermountain', 'baldurs-gate', 'neverwinter', 'phandalin'], icon: '', discovered: true, visited: true },
      { id: 'undermountain', name: 'Bajomonte', description: 'El megadungeon bajo Puerto Corona', type: 'dungeon', dangerLevel: 5, coordinates: { x: 420, y: 350 }, connections: ['waterdeep'], icon: '', discovered: true, visited: false },
      { id: 'baldurs-gate', name: "Ambergate", description: 'Ciudad portuaria de comercio y crimen', type: 'city', dangerLevel: 3, coordinates: { x: 200, y: 450 }, connections: ['waterdeep', 'candlekeep', 'phandalin'], icon: '', discovered: true, visited: false },
      { id: 'neverwinter', name: 'Brasaeterna', description: 'La Joya del Norte en reconstrucción', type: 'city', dangerLevel: 3, coordinates: { x: 350, y: 150 }, connections: ['waterdeep', 'bosque-neverwinter', 'icewind-dale'], icon: '', discovered: false, visited: false },
      { id: 'bosque-neverwinter', name: 'Bosque de Brasaeterna', description: 'Bosque misterioso con ruinas élficas', type: 'wilderness', dangerLevel: 3, coordinates: { x: 450, y: 100 }, connections: ['neverwinter'], icon: '', discovered: false, visited: false },
      { id: 'icewind-dale', name: 'Valle Ventisca', description: 'Tundra helada del extremo norte', type: 'danger', dangerLevel: 4, coordinates: { x: 500, y: 50 }, connections: ['neverwinter'], icon: '', discovered: false, visited: false },
      { id: 'phandalin', name: 'Vadolar', description: 'Pequeño asentamiento minero con secretos', type: 'safe', dangerLevel: 2, coordinates: { x: 300, y: 350 }, connections: ['waterdeep', 'baldurs-gate'], icon: '', discovered: true, visited: false },
      { id: 'candlekeep', name: 'Ciriotorre', description: 'Biblioteca-fortaleza del conocimiento', type: 'landmark', dangerLevel: 1, coordinates: { x: 100, y: 500 }, connections: ['baldurs-gate'], icon: '', discovered: false, visited: false },
    ],
    COZY_WITCH: [
      { id: 'casa-bruja', name: 'La Casa de la Bruja', description: 'Cottage con jardín de hierbas, gato y chimenea siempre encendida', type: 'safe', dangerLevel: 1, coordinates: { x: 350, y: 280 }, connections: ['plaza-mercado', 'bosque-susurrante', 'cala-quieta'], icon: '', discovered: true, visited: true },
      { id: 'plaza-mercado', name: 'Plaza del Mercado', description: 'Corazón social del pueblo - los sábados huele a pan y a sal', type: 'safe', dangerLevel: 1, coordinates: { x: 450, y: 350 }, connections: ['casa-bruja', 'panaderia-alba', 'cala-quieta'], icon: '', discovered: true, visited: false },
      { id: 'panaderia-alba', name: 'La Panadería del Alba', description: 'Abre a las 4am - donde se intercambian secretos antes del sol', type: 'safe', dangerLevel: 1, coordinates: { x: 500, y: 320 }, connections: ['plaza-mercado', 'casa-bruja', 'cala-quieta'], icon: '', discovered: true, visited: false },
      { id: 'bosque-susurrante', name: 'El Bosque Susurrante', description: 'Pequeño bosque con hierbas raras - amistoso si lo escuchás', type: 'wilderness', dangerLevel: 1, coordinates: { x: 220, y: 200 }, connections: ['casa-bruja', 'circulo-piedras-eclipse'], icon: '', discovered: true, visited: false },
      { id: 'faro-viejo', name: 'El Faro Viejo', description: 'Extremo del acantilado - refugio de meditación, ya no enciende', type: 'landmark', dangerLevel: 1, coordinates: { x: 600, y: 450 }, connections: ['cala-quieta', 'circulo-piedras-eclipse', 'casa-bruja'], icon: '', discovered: false, visited: false },
      { id: 'cala-quieta', name: 'Cala Quieta', description: 'Playa de cantos rodados - donde el mar trae lo que el pueblo necesita', type: 'safe', dangerLevel: 1, coordinates: { x: 500, y: 480 }, connections: ['casa-bruja', 'faro-viejo', 'plaza-mercado'], icon: '', discovered: false, visited: false },
      { id: 'circulo-piedras-eclipse', name: 'El Círculo de Piedras del Eclipse', description: 'Claro en lo alto del acantilado - el ritual anual del aquelarre', type: 'mystery', dangerLevel: 2, coordinates: { x: 520, y: 120 }, connections: ['faro-viejo', 'bosque-susurrante'], icon: '', discovered: false, visited: false },
    ],
    ROMANTASY: [
      { id: 'corte-primavera', name: 'Corte de Primavera', description: 'Palacio de mármol blanco entre jardines de rosas eternas', type: 'city', dangerLevel: 3, coordinates: { x: 300, y: 250 }, connections: ['bosque-espinas', 'aldea-mortal-prythian', 'velaris'], icon: '', discovered: true, visited: true },
      { id: 'velaris', name: 'Lucerna (Ciudad de las Mil Luces)', description: 'Capital oculta de la Corte Velada', type: 'city', dangerLevel: 2, coordinates: { x: 500, y: 200 }, connections: ['corte-primavera', 'bosque-espinas', 'corte-invierno'], icon: '', discovered: true, visited: false },
      { id: 'bosque-espinas', name: 'Bosque de Espinas', description: 'Frontera salvaje entre cortes - peligro y magia ancestral', type: 'wilderness', dangerLevel: 4, coordinates: { x: 400, y: 350 }, connections: ['corte-primavera', 'velaris', 'cuevas-pacto', 'el-muro'], icon: '', discovered: true, visited: false },
      { id: 'el-muro', name: 'El Muro', description: 'Barrera mágica milenaria entre tierras fae y humanas', type: 'landmark', dangerLevel: 5, coordinates: { x: 250, y: 450 }, connections: ['bosque-espinas', 'aldea-mortal-prythian', 'cuevas-pacto'], icon: '', discovered: false, visited: false },
      { id: 'aldea-mortal-prythian', name: 'Aldea Mortal de Sylvaria', description: 'Pueblo humano en la frontera donde florece el comercio prohibido', type: 'safe', dangerLevel: 2, coordinates: { x: 150, y: 400 }, connections: ['corte-primavera', 'el-muro'], icon: '', discovered: true, visited: false },
      { id: 'corte-invierno', name: 'Corte de Invierno', description: 'Fortaleza de hielo eterno con guerreros de honor', type: 'city', dangerLevel: 3, coordinates: { x: 650, y: 100 }, connections: ['velaris'], icon: '', discovered: false, visited: false },
      { id: 'cuevas-pacto', name: 'Cuevas del Pacto', description: 'Lugar antiguo donde se firmó el Tratado - magia primordial', type: 'mystery', dangerLevel: 5, coordinates: { x: 500, y: 500 }, connections: ['bosque-espinas', 'el-muro'], icon: '', discovered: false, visited: false },
    ],
    CUSTOM: [
      { id: 'ciudad-principal', name: 'Ciudad Principal', description: 'El centro de la civilización', type: 'city', dangerLevel: 1, coordinates: { x: 400, y: 300 }, connections: ['bosque', 'montana'], icon: '', discovered: true, visited: true },
      { id: 'bosque', name: 'Bosque Oscuro', description: 'Un lugar de misterios', type: 'wilderness', dangerLevel: 2, coordinates: { x: 250, y: 200 }, connections: ['ciudad-principal', 'ruinas'], icon: '', discovered: true, visited: false },
      { id: 'montana', name: 'Montaña Sagrada', description: 'Picos que tocan el cielo', type: 'landmark', dangerLevel: 2, coordinates: { x: 550, y: 150 }, connections: ['ciudad-principal', 'cueva'], icon: '', discovered: true, visited: false },
      { id: 'ruinas', name: 'Ruinas Antiguas', description: 'Restos de una era olvidada', type: 'dungeon', dangerLevel: 3, coordinates: { x: 150, y: 100 }, connections: ['bosque'], icon: '', discovered: false, visited: false },
      { id: 'cueva', name: 'Cueva del Dragón', description: 'Un lugar de peligro y tesoros', type: 'danger', dangerLevel: 4, coordinates: { x: 650, y: 250 }, connections: ['montana'], icon: '', discovered: false, visited: false },
      { id: 'puerto', name: 'Puerto Comercial', description: 'Mercancías de tierras lejanas', type: 'safe', dangerLevel: 1, coordinates: { x: 300, y: 450 }, connections: ['ciudad-principal'], icon: '', discovered: true, visited: false },
    ],
  }

  return exampleData[lore] || []
}

// ─────────────────────────────────────────────────────────────────────────
// Traducciones EN para los nombres y descripciones de getExampleMapData.
// Keyed por id (canonical, en español). Se usa solo para display.
// El name canonical en MapLocation sigue siendo en español — todas las
// referencias internas (current_scene, world_state, IDs) lo asumen.
// ─────────────────────────────────────────────────────────────────────────
const MAP_LOCATION_EN: Record<string, { name: string; description: string }> = {
  // LOTR
  'comarca':         { name: 'The Vale',          description: 'Peaceful land of the halflings' },
  'bree':            { name: 'Oldford',               description: 'Crossroads with The Gilded Boar Inn' },
  'rivendel':        { name: 'Aelinar',          description: 'Elven refuge of Elandur' },
  'moria':           { name: 'Profundia',              description: 'Ancient dwarven kingdom under the mountains' },
  'lothlorien':      { name: 'Aurelion',         description: 'Golden forest of the elves of Ithariel' },
  'rohan':           { name: 'The Steppes',              description: 'Land of the horse-lords' },
  'gondor':          { name: 'Meridon',             description: 'The kingdom of men' },
  'mordor':          { name: 'Ashmoor',             description: 'Black land of the enemy' },
  'isengard':        { name: 'Greytower',           description: 'Tower of Velmoran' },
  // ZOMBIES
  'campamento-base':   { name: 'Base Camp',           description: 'Your safe shelter... for now' },
  'centro-comercial':  { name: 'Shopping Mall',       description: 'Infested but full of supplies' },
  'hospital':          { name: 'General Hospital',    description: 'Medicines... and horrors' },
  'estacion-policia':  { name: 'Police Station',      description: 'Guns and ammo wait inside' },
  'zona-residencial':  { name: 'Residential Area',    description: 'Empty houses... or not so empty' },
  'la-horda':          { name: 'The Horde',           description: 'Massive concentration of infected' },
  'almacen':           { name: 'Industrial Warehouse',description: 'Hidden supplies' },
  'puerto':            { name: 'Harbor',              description: 'A possible escape route' },
  // ISEKAI
  'aldea-inicio':      { name: 'Starting Village',    description: 'Where your adventure began' },
  'bosque-inicial':    { name: 'Beginner Forest',     description: 'Rank F — perfect for beginners' },
  'cueva-slimes':      { name: 'Slime Cave',          description: 'Rank F — your first dungeon' },
  'ciudad-capital':    { name: 'Capital City',        description: 'Center of the kingdom with the Guild' },
  'gremio':            { name: 'Adventurers Guild',   description: 'Quests and rewards await' },
  'torre-mago':        { name: "Mage's Tower",        description: 'Rank B — magic and mysteries' },
  'biblioteca':        { name: 'Arcane Library',      description: 'Rank A — forbidden knowledge' },
  'dungeon-dragon':    { name: 'Dragon Dungeon',      description: 'Rank S — only for the strongest' },
  'rey-demonio':       { name: "Demon King's Castle", description: 'Rank SSS — the final boss' },
  // VIKINGOS
  'aldea':           { name: 'Your Village',        description: 'Home of your viking clan' },
  'islas-este':      { name: 'Eastern Isles',       description: 'Territories yet to conquer' },
  'costa-sajona':    { name: 'Saxon Coast',         description: 'Rich lands ripe for plunder' },
  'monasterio':      { name: 'Lindisfarne Monastery',description: 'Gold and relics await' },
  'bosque-sagrado':  { name: 'Sacred Grove',        description: 'Place of the ancient rituals' },
  'templo-odin':     { name: 'Temple of Odin',      description: 'The Allfather watches you' },
  'yggdrasil':       { name: 'Yggdrasil',           description: 'The World Tree' },
  'jotunheim':       { name: 'Jötunheim',           description: 'Land of the frost giants' },
  // STAR_WARS
  'tatooine':   { name: 'Karshaar',          description: 'Desert planet on the Outer Rim' },
  'mos-eisley': { name: 'Port Zenna',        description: 'Den of smugglers and shady deals' },
  'coruscant':  { name: 'Nexus Prime',         description: 'Capital of the Galaxy' },
  'naboo':      { name: 'Veridia',             description: 'Peaceful world of meadows and cities' },
  'alderaan':   { name: 'Caelora',          description: 'A peaceful world... for now' },
  'yavin':      { name: 'Veyra IV',          description: 'Jungle moon, secret rebel base' },
  'endor':      { name: 'Sylphar',             description: 'Forest moon of the native tribes' },
  'death-star': { name: 'Eclipse Station',        description: 'Imperial battle station' },
  'kashyyyk':   { name: 'Rannak',          description: 'Homeworld of the Ranakkis' },
  // CYBERPUNK
  'tu-apartamento':   { name: 'Your Apartment',         description: 'A 20m² cubicle you call home' },
  'downtown':         { name: 'Downtown',               description: 'The heart of Neon City' },
  'afterlife':        { name: 'Club Limbo',         description: 'Where the best mercs make deals' },
  'distrito-corpo':   { name: 'Corporate District',     description: 'Glass towers and absolute power' },
  'arasaka':          { name: 'Kurotek Tower',          description: 'The heart of corporate power' },
  'mercado-negro':    { name: 'Black Market',           description: 'Everything has a price here' },
  'submundo':         { name: 'Underworld',             description: 'Where the scum of Neon City lives' },
  'alcantarillas':    { name: 'Sewers',                 description: 'Home of cyberpsychos and worse' },
  'ripperdoc':        { name: "Ripperdoc's Clinic",     description: 'Chrome upgrades, no questions asked' },
  'vertedero':        { name: 'The Dump',               description: 'Tech junk and buried secrets' },
  'zona-industrial':  { name: 'Industrial Zone',        description: 'Abandoned factories and gangs' },
  // LOVECRAFT
  'tu-oficina':   { name: 'Your Office',            description: 'Private investigator in dark times' },
  'arkham':       { name: 'Arkham',                 description: 'A town with too many secrets' },
  'universidad':  { name: 'Miskatonic University',  description: 'Knowledge best left unknown' },
  // 'biblioteca' already covered above for ISEKAI — Lovecraft uses same id
  'cementerio':   { name: 'Arkham Cemetery',        description: 'The dead do not always rest' },
  'cripta':       { name: 'Ancient Crypt',          description: 'Symbols that should not exist' },
  // 'puerto' already covered above for ZOMBIES — Lovecraft uses same id (ok, same EN works ish)
  'innsmouth':    { name: 'Innsmouth',              description: 'The people here... do not seem normal' },
  'manicomio':    { name: 'Arkham Asylum',          description: 'Are they mad... or have they seen too much?' },
  'templo':       { name: 'Sunken Temple',          description: "Ph'nglui mglw'nafh..." },
  // DND_CLASSIC
  'waterdeep':         { name: 'Crownport',           description: 'Grand port metropolis of the coast' },
  'undermountain':     { name: 'The Undervault',       description: 'The megadungeon beneath Crownport' },
  'baldurs-gate':      { name: "Ambergate",       description: 'Port city of trade and crime' },
  'neverwinter':       { name: 'Emberhold',         description: 'City of eternal embers, rebuilding' },
  'bosque-neverwinter':{ name: 'Emberhold Wood',    description: 'Mysterious forest with elven ruins' },
  'icewind-dale':      { name: 'Blizzard Vale',        description: 'Frozen tundra of the far north' },
  'phandalin':         { name: 'Vadolar',           description: 'Small mining settlement with secrets' },
  'candlekeep':        { name: 'Lorespire',          description: 'Library-fortress of knowledge' },
  // COZY_WITCH
  'casa-bruja':              { name: "The Witch's Cottage",   description: 'Cottage with herb garden, cat, and a hearth that never goes out' },
  'plaza-mercado':           { name: 'Market Square',         description: "Town's social heart — Saturdays smell of bread and salt" },
  'panaderia-alba':          { name: 'The Dawn Bakery',       description: 'Opens at 4am — where secrets are traded before sunrise' },
  'bosque-susurrante':       { name: 'The Whispering Wood',   description: 'A small wood with rare herbs — friendly if you listen' },
  'faro-viejo':              { name: 'The Old Lighthouse',    description: 'Cliff edge — meditation refuge, no longer lit' },
  'cala-quieta':             { name: 'Quiet Cove',            description: 'Pebble beach — where the sea brings what the village needs' },
  'circulo-piedras-eclipse': { name: 'The Eclipse Stone Circle',description: "Clearing on the cliff top — the coven's annual ritual" },
  // ROMANTASY
  'corte-primavera':        { name: 'Spring Court',         description: 'White marble palace among gardens of eternal roses' },
  'velaris':                { name: 'Lucerna (City of a Thousand Lights)',description: 'Hidden capital of the Veiled Court' },
  'bosque-espinas':         { name: 'Forest of Thorns',     description: 'Wild frontier between courts — danger and ancient magic' },
  'el-muro':                { name: 'The Wall',             description: 'Millennia-old magical barrier between fae and human lands' },
  'aldea-mortal-prythian':  { name: 'Mortal Village of Sylvaria',description: 'Border human village where forbidden trade thrives' },
  'corte-invierno':         { name: 'Winter Court',         description: 'Eternal-ice fortress with warriors of honor' },
  'cuevas-pacto':           { name: 'Caves of the Pact',    description: 'Ancient site where the Treaty was signed — primordial magic' },
  // CUSTOM
  'ciudad-principal': { name: 'Main City',       description: 'The center of civilization' },
  'bosque':           { name: 'Dark Forest',     description: 'A place of mysteries' },
  'montana':          { name: 'Sacred Mountain', description: 'Peaks that touch the sky' },
  'ruinas':           { name: 'Ancient Ruins',   description: 'Remnants of a forgotten era' },
  'cueva':            { name: "Dragon's Cave",   description: 'A place of danger and treasure' },
}

/**
 * Devuelve el nombre de display de un MapLocation según el locale.
 * Para EN, busca la traducción por id; si no existe, retorna el nombre canonical (es).
 */
export function getMapLocationName(loc: { id: string; name: string }, locale: 'es' | 'en'): string {
  if (locale === 'en' && MAP_LOCATION_EN[loc.id]) {
    return MAP_LOCATION_EN[loc.id].name
  }
  return loc.name
}

/**
 * Devuelve la descripción de display de un MapLocation según el locale.
 */
export function getMapLocationDescription(loc: { id: string; description: string }, locale: 'es' | 'en'): string {
  if (locale === 'en' && MAP_LOCATION_EN[loc.id]) {
    return MAP_LOCATION_EN[loc.id].description
  }
  return loc.description
}
