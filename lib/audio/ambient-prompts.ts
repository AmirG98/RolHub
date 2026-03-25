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

/**
 * Obtiene el prompt de sonido ambiental para una combinación lore × mood
 */
export function getAmbientPrompt(lore: string, mood: string): string {
  const lorePrompts = AMBIENT_PROMPTS[lore]
  if (lorePrompts && lorePrompts[mood]) {
    return lorePrompts[mood]
  }
  return DEFAULT_AMBIENT_PROMPTS[mood] || DEFAULT_AMBIENT_PROMPTS.ambient
}
