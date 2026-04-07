/**
 * Prompts de sonido ambiental por combinación de mood × lore
 * Usados para generar SFX con Fal.ai CassetteAI
 * Los sonidos se cachean en DB después de la primera generación
 */

export const AMBIENT_PROMPTS: Record<string, Record<string, string>> = {
  LOTR: {
    exploration: 'medieval fantasy forest ambience, birds chirping softly, gentle wind through ancient trees, distant stream flowing over rocks, peaceful nature sounds',
    tension: 'dark forest at night, distant wolves howling, wind picking up, creaking old trees, ominous atmosphere, subtle danger',
    combat: 'medieval battle ambience, distant sword clashing, war horns, shield impacts, intense action atmosphere',
    dramatic: 'epic orchestral tension, thunder rolling in distance, wind howling through mountains, dramatic atmosphere',
    peaceful: 'cozy tavern fireplace crackling, gentle rain outside, warm indoor ambience, distant laughter and murmur',
    horror: 'dark cave ambience, dripping water echoes, faint whispers, cold wind, unsettling underground atmosphere',
    victory: 'celebratory medieval atmosphere, distant cheering crowd, triumphant horns, bells ringing in celebration',
    ambient: 'medieval countryside ambience, gentle breeze, distant birds, peaceful rural sounds, rolling green hills',
  },

  ZOMBIES: {
    exploration: 'post apocalyptic urban ambience, wind through empty buildings, distant metal creaking, eerie silence, abandoned city',
    tension: 'zombie survival tension, distant groaning, footsteps on broken glass, creaking doors, danger approaching',
    combat: 'intense zombie combat, gunshots echoing, breaking barricades, urgent survival action sounds',
    dramatic: 'apocalyptic dramatic atmosphere, distant explosions, sirens fading, collapsing structures',
    peaceful: 'safe shelter ambience, rain on roof, gentle fire crackling, brief moment of calm in apocalypse',
    horror: 'horror zombie ambience, scratching on walls, distant screams, insects buzzing, darkness closing in',
    victory: 'relief after survival, rain stopping, birds returning briefly, hopeful post-danger atmosphere',
    ambient: 'abandoned city wind, distant echoes, empty streets, post apocalyptic desolation, lonely atmosphere',
  },

  COZY_WITCH: {
    exploration: 'cozy seaside village ambience, gentle waves in distance, birds chirping, wind through herb garden, peaceful slice of life atmosphere',
    tension: 'quiet emotional tension, fireplace crackling softly, distant waves, kettle starting to whistle, anticipation without danger',
    combat: 'rare moment of conflict, raised voices in a kitchen, plates rattling, emotional but not violent confrontation',
    dramatic: 'eclipse approaching ambience, stones humming faintly, wind picking up over cliff, ritual atmosphere, mystical anticipation',
    peaceful: 'witch cottage interior ambience, fireplace crackling, cat purring, herbs drying, kettle simmering, deep peace',
    horror: 'lighthouse fog ambience, distant foghorn that should not exist, eerie silence, something old waking up gently',
    victory: 'community celebration ambience, laughter in a small village square, accordion music, glasses clinking, warm shared joy',
    ambient: 'coastal village ambience, gentle breeze, distant seagulls, wooden shutters creaking, herbs swaying, pure tranquility',
  },

  ROMANTASY: {
    exploration: 'enchanted fae court ambience, distant harp music, gentle wind through rose gardens, magical chimes, ethereal atmosphere',
    tension: 'royal court intrigue tension, hushed whispers, silk rustling, footsteps on marble, dangerous social atmosphere',
    combat: 'fae duel ambience, blade against blade, magical energy crackling, intense romantic stakes, dramatic combat',
    dramatic: 'epic romantic moment, swelling orchestral strings, rain on stained glass, fateful meeting atmosphere',
    peaceful: 'cozy fae bedroom ambience, fireplace crackling softly, distant violin, silk on skin, intimate tranquility',
    horror: 'cursed castle ambience, tragic piano notes, cold draft through corridors, broken hearts atmosphere, mournful',
    victory: 'royal celebration ambience, distant trumpets, joyful murmur, glasses clinking in toast, triumphant strings',
    ambient: 'twilight rose garden ambience, gentle breeze, distant nightingale, magical sparkle, romantic dreamy mood',
  },

  DND_CLASSIC: {
    exploration: 'fantasy medieval city ambience, busy marketplace, distant blacksmith hammering, people chatting, medieval town sounds',
    tension: 'dungeon exploration ambience, dripping water in stone corridors, distant echoes, torches flickering, underground mystery',
    combat: 'fantasy combat sounds, sword and shield clashing, magic spell whooshes, dragon roar in distance, intense battle',
    dramatic: 'epic fantasy dramatic moment, arcane energy humming, church bells tolling, magical portal opening',
    peaceful: 'cozy fantasy tavern, lute playing softly, fire crackling, mugs clinking, warm medieval inn ambience',
    horror: 'dark dungeon horror, chains rattling, cold wind in crypt, faint ghostly moans, undead ambience',
    victory: 'fantasy victory celebration, tavern cheering, mugs clinking together, bard playing triumphant tune',
    ambient: 'medieval village ambience, gentle wind, distant church bells, chickens clucking, peaceful fantasy town',
  },
}

// Fallback para lores que no tienen prompts específicos
export const DEFAULT_AMBIENT_PROMPTS: Record<string, string> = {
  exploration: 'gentle exploration ambience, nature sounds, birds and wind, peaceful atmosphere',
  tension: 'tense atmospheric ambience, rising danger, ominous sounds',
  combat: 'intense battle ambience, action sounds, dramatic combat',
  dramatic: 'dramatic orchestral ambience, climactic moment, epic atmosphere',
  peaceful: 'peaceful calm ambience, fire crackling, gentle rain, safe haven',
  horror: 'dark horror ambience, unsettling atmosphere, creepy sounds',
  victory: 'celebration sounds, triumphant atmosphere, joyful ambience',
  ambient: 'gentle background ambience, neutral atmospheric sounds',
}

// Prompts por tipo de escena (detectado del nombre de la escena actual)
const SCENE_TYPE_PROMPTS: Record<string, string> = {
  tavern: 'cozy medieval tavern ambience, mugs clinking, people chatting softly, fire crackling, wooden creaks, warm atmosphere',
  inn: 'medieval inn ambience, distant laughter, fire crackling, wind outside, warm indoor sounds',
  forest: 'forest ambience, birds chirping, leaves rustling, gentle wind, distant stream, nature sounds',
  dungeon: 'dark dungeon ambience, dripping water echoes, distant chains rattling, torch flickering, stone corridors',
  city: 'medieval city ambience, market bustle, distant blacksmith, people walking, cart wheels on cobblestone',
  mountain: 'mountain wind ambience, howling gusts, distant eagle cry, rocks tumbling, high altitude atmosphere',
  sea: 'ocean port ambience, waves crashing, seagulls, creaking ship wood, distant sailor voices',
  cave: 'deep cave ambience, water drops echoing, bats fluttering, underground wind, mineral resonance',
  library: 'quiet library ambience, pages turning, quill writing, soft footsteps, ancient book dust atmosphere',
  camp: 'campfire ambience, fire crackling, crickets chirping, gentle night wind, outdoor camping sounds',
}

// Palabras clave para detectar tipo de escena del nombre
const SCENE_KEYWORDS: Record<string, string[]> = {
  tavern: ['taberna', 'posada', 'pony', 'tavern', 'inn', 'bar', 'cantina', 'afterlife'],
  inn: ['hospedaje', 'hostal', 'albergue'],
  forest: ['bosque', 'forest', 'arboleda', 'selva', 'grove', 'wood'],
  dungeon: ['dungeon', 'mazmorra', 'cripta', 'undermountain', 'criptas', 'subterráneo'],
  city: ['ciudad', 'city', 'waterdeep', 'baldur', 'neverwinter', 'bree', 'mercado', 'plaza', 'velaris', 'corte', 'cala', 'panaderia', 'panadería'],
  mountain: ['montaña', 'mountain', 'pico', 'cumbre', 'icewind', 'colina'],
  sea: ['puerto', 'port', 'costa', 'mar', 'océano', 'muelle', 'dock', 'barco'],
  cave: ['cueva', 'cave', 'caverna', 'gruta', 'mina'],
  library: ['biblioteca', 'library', 'candlekeep', 'archivo', 'academia'],
  camp: ['campamento', 'camp', 'refugio', 'base'],
}

/**
 * Detecta el tipo de escena basándose en el nombre
 */
function detectSceneType(sceneName: string): string | null {
  if (!sceneName) return null
  const lower = sceneName.toLowerCase()
  for (const [type, keywords] of Object.entries(SCENE_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return type
  }
  return null
}

/**
 * Obtiene el prompt de sonido ambiental — prioriza escena específica sobre mood genérico
 */
export function getAmbientPrompt(lore: string, mood: string, scene?: string): string {
  // Prioridad 1: prompt por tipo de escena (más específico, más inmersivo)
  if (scene) {
    const sceneType = detectSceneType(scene)
    if (sceneType && SCENE_TYPE_PROMPTS[sceneType]) {
      return SCENE_TYPE_PROMPTS[sceneType]
    }
  }

  // Prioridad 2: prompt por lore × mood
  const lorePrompts = AMBIENT_PROMPTS[lore]
  if (lorePrompts && lorePrompts[mood]) {
    return lorePrompts[mood]
  }

  // Fallback: mood genérico
  return DEFAULT_AMBIENT_PROMPTS[mood] || DEFAULT_AMBIENT_PROMPTS.ambient
}
